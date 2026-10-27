/** Paginate already-rendered, trusted document nodes in a real A4 content box. */
export type PaperPage = { html: string; headings: { index: number; text: string; level: number }[] };

const heading = (node: Element) => /^H[1-5]$/.test(node.tagName);
const shallow = (node: HTMLElement) => node.cloneNode(false) as HTMLElement;

// Split at a text boundary, retaining inline markup and every character.
function textParts(node: HTMLElement, offset: number): [HTMLElement, HTMLElement] {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let text = walker.nextNode();
  while (text && offset > (text.textContent?.length || 0)) {
    offset -= text.textContent?.length || 0;
    text = walker.nextNode();
  }
  const head = shallow(node), tail = shallow(node);
  if (!text) { head.append(...Array.from(node.cloneNode(true).childNodes)); return [head, tail]; }
  const before = document.createRange(); before.selectNodeContents(node); before.setEnd(text, offset);
  const after = document.createRange(); after.selectNodeContents(node); after.setStart(text, offset);
  head.append(before.cloneContents()); tail.append(after.cloneContents());
  tail.dataset.continuation = "true";
  // A continuation must not repeat a heading in the table of contents.
  delete tail.dataset.headingIndex;
  return [head, tail];
}

export function paginatePaper(source: HTMLElement, probe: HTMLElement): PaperPage[] {
  probe.replaceChildren();
  const capacity = probe.getBoundingClientRect().height - 2; // rounding safety, in CSS pixels
  if (capacity < 80 || probe.getBoundingClientRect().width < 80) throw new Error("Margin terlalu besar untuk halaman A4.");
  const pages: PaperPage[] = [];
  const fits = () => {
    const start = probe.getBoundingClientRect().top;
    return Array.from(probe.children).every((child) => child.getBoundingClientRect().bottom + parseFloat(getComputedStyle(child).marginBottom || "0") - start <= capacity);
  };
  const fitsNode = (node: HTMLElement) => { probe.append(node); const result = fits(); node.remove(); return result; };
  const finish = () => {
    if (!probe.children.length) return;
    pages.push({ html: probe.innerHTML, headings: Array.from(probe.querySelectorAll<HTMLElement>("[data-heading-index]")).map((node) => ({ index: Number(node.dataset.headingIndex), text: node.textContent || "", level: Number(node.tagName.slice(1)) })) });
    probe.replaceChildren();
  };

  function splitText(node: HTMLElement): [HTMLElement, HTMLElement] | null {
    const text = node.textContent || "";
    const boundaries = Array.from(text.matchAll(/\s+/g), (match) => match.index! + match[0].length).filter((end) => end < text.length);
    // Long URLs/words can also wrap without losing any characters.
    const search = (ends: number[]) => {
      let low = 0, high = ends.length - 1, found = -1;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (fitsNode(textParts(node, ends[middle])[0])) { found = middle; low = middle + 1; } else high = middle - 1;
      }
      return found < 0 ? null : textParts(node, ends[found]);
    };
    return search(boundaries) || search(Array.from({ length: Math.max(0, text.length - 1) }, (_, index) => index + 1));
  }

  function place(node: HTMLElement) {
    if (fitsNode(node)) { probe.append(node); return; }
    // Keep short blocks whole, but make room by moving trailing headings too.
    const pending: HTMLElement[] = [];
    while (probe.lastElementChild && heading(probe.lastElementChild)) pending.unshift(probe.removeChild(probe.lastElementChild) as HTMLElement);
    if (probe.children.length) finish();
    pending.forEach((item) => probe.append(item));
    if (fitsNode(node)) { probe.append(node); return; }

    if (node.tagName === "FIGURE" && node.querySelector("table")) {
      const table = node.querySelector("table")!;
      const rows = Array.from(table.rows);
      const columns = Math.max(1, ...rows.map((row) => row.cells.length));
      const make = (row: HTMLTableRowElement, caption?: HTMLElement) => {
        const figure = shallow(node);
        if (caption) figure.append(caption.cloneNode(true));
        const grid = table.cloneNode(false) as HTMLTableElement;
        const colgroup = document.createElement("colgroup");
        for (let i = 0; i < columns; i++) { const col = document.createElement("col"); col.style.width = `${100 / columns}%`; colgroup.append(col); }
        const body = document.createElement("tbody"); body.append(row); grid.append(colgroup, body); figure.append(grid);
        return figure;
      };
      rows.forEach((row, index) => {
        let remaining = row.cloneNode(true) as HTMLTableRowElement;
        let caption = index === 0 ? node.querySelector<HTMLElement>("figcaption") || undefined : undefined;
        while (true) {
          const whole = make(remaining.cloneNode(true) as HTMLTableRowElement, caption);
          if (fitsNode(whole)) { probe.append(whole); break; }
          if (probe.children.length) finish();
          if (fitsNode(whole)) { probe.append(whole); break; }
          // An individual row can itself exceed A4: split each cell at its own text boundary.
          const head = remaining.cloneNode(false) as HTMLTableRowElement;
          const tail = remaining.cloneNode(false) as HTMLTableRowElement;
          let progress = false;
          Array.from(remaining.cells).forEach((cell) => {
            const length = cell.textContent?.length || 0;
            let low = 0, high = length, count = 0;
            const testRow = (part: HTMLElement) => {
              const trial = remaining.cloneNode(false) as HTMLTableRowElement;
              Array.from(remaining.cells).forEach((other) => trial.append(other === cell ? part : other.cloneNode(false)));
              return make(trial, caption);
            };
            while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              if (fitsNode(testRow(textParts(cell, mid)[0]))) { count = mid; low = mid + 1; } else high = mid - 1;
            }
            const boundary = (cell.textContent || "").slice(0, count).search(/\s+\S*$/);
            if (count < length && boundary > 0) count = boundary + 1;
            const [first, rest] = textParts(cell, count); head.append(first); tail.append(rest); progress ||= count > 0;
          });
          if (!progress) throw new Error("Baris tabel tidak dapat dimuat. Perkecil ukuran teks atau margin.");
          probe.append(make(head, caption)); finish(); remaining = tail; caption = undefined;
          if (!(remaining.textContent || "").length) break;
        }
      });
      return;
    }
    if ((node.tagName === "UL" || node.tagName === "OL") && node.children.length > 1) {
      for (const child of Array.from(node.children)) { const list = shallow(node); list.append(child.cloneNode(true)); place(list); }
      return;
    }
    let remaining = node;
    while (!fitsNode(remaining)) {
      const parts = splitText(remaining);
      if (!parts) {
        if (probe.children.length) { finish(); continue; }
        throw new Error("Satu elemen melebihi ruang A4. Perkecil ukuran teks atau margin.");
      }
      probe.append(parts[0]); finish(); remaining = parts[1];
    }
    probe.append(remaining);
  }

  for (const original of Array.from(source.children) as HTMLElement[]) {
    if (original.dataset.pageBreak !== undefined) { finish(); continue; }
    if (original.dataset.breakBefore === "true") finish();
    place(original.cloneNode(true) as HTMLElement);
  }
  finish();
  return pages;
}
