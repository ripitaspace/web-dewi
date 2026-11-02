(function (root) {
  "use strict";
  const normalize = value => String(value || "").normalize("NFKC")
    .replace(/\bN\s+a\s+m\s+a\b/gi, "Nama")
    .replace(/\bA\s+l\s+a\s+m\s+a\s+t\b/gi, "Alamat")
    .replace(/\bN\s+P\s+W\s+P\b/gi, "NPWP")
    .replace(/\bN\s+O\s+T\s+A\s+R\s+E\s+T\s+U\s+R\b/gi, "NOTA RETUR")
    .replace(/[\t ]+/g, " ").trim();
  const totalStart = line => /^(Jumlah\s+(?:Harga\s+)?(?:Jual\s+)?(?:BKP|PKP)|Dikurangi\s+Potongan|Pajak\s+Pertambahan|PPN\b|PPnBM\b)/i.test(line);
  function amount(value) {
    const s = String(value ?? "").replace(/\s|Rp|#/gi, "");
    if (s === "-") return 0;
    if (!/^\d[\d.,]*$/.test(s)) return null;
    const separators = s.match(/[.,]/g) || [];
    const last = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
    const tail = last < 0 ? 0 : s.length - last - 1;
    // A single long fractional tail is a PDF floating point serialization, not thousands.
    const decimal = last >= 0 && (tail < 3 || (separators.length === 1 && tail > 3));
    const n = Number(decimal ? s.slice(0, last).replace(/[.,]/g, "") + "." + s.slice(last + 1) : s.replace(/[.,]/g, ""));
    return Number.isFinite(n) ? Math.round((n + Number.EPSILON) * 100) / 100 : null;
  }
  function quantity(s, unit) {
    if (/^(pcs?|unit|btl|botol|box|karton)$/i.test(unit) && /^[1-9]\d{0,2}(?:[,.]\d{3})+$/.test(s)) return Number(s.replace(/[,.]/g, ""));
    const n = Number(s.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  function layout(content) {
    const spans = content.items.filter(p => p.str.trim()).map(p => ({ text: p.str, x: p.transform[4], y: p.transform[5], width: p.width, height: Math.abs(p.height || p.transform[3]) || 10 }));
    const rows = [];
    spans.sort((a, b) => b.y - a.y || a.x - b.x).forEach(p => {
      let row = rows.find(r => Math.abs(r.y - p.y) <= Math.min(r.height, p.height) * .42);
      if (!row) { row = { y: p.y, height: p.height, parts: [] }; rows.push(row); }
      row.parts.push(p);
    });
    rows.forEach(r => { r.parts.sort((a, b) => a.x - b.x); r.text = normalize(r.parts.map(p => p.text).join(" ")); });
    return { spans, rows, text: rows.map(r => r.text).join("\n") };
  }
  function number(text) {
    const m = normalize(text).match(/(?:^|\n)\s*(?:Nomor|No\.)\s*[:.]?\s*([A-Za-z0-9][A-Za-z0-9/]*(?:\s*[-–]\s*[A-Za-z0-9]+)*)/im);
    return m && /\d/.test(m[1]) ? m[1].replace(/\s/g, "").replace(/–/g, "-") : "";
  }
  function party(text, seller) {
    const lines = normalize(text).split("\n");
    const start = lines.findIndex(l => seller ? /^Kepada\s+Penjual\b/i.test(l) : /^Pembeli\b/i.test(l));
    if (start < 0) return { name: "", address: "", npwp: "" };
    const block = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (/^(Kepada\s+Penjual|No\.?\s*(?:Urut|Macam|Harga|$)|Macam\s+dan|Harga\s+Satuan)/i.test(lines[i])) break;
      block.push(lines[i]);
    }
    const s = block.join("\n");
    const field = re => (s.match(re) || [])[1] || "";
    const companyName = value => String(value || "").replace(/\s+/g, " ").trim().replace(/^P\s*T\.?\s*/i, "PT. ");
    const npwps = field(/NPWP\s*[:.]\s*([^\n]+)/i).split("/").map(v => v.replace(/\D/g, "")).filter(Boolean);
    const buyerNpwp = (npwps[0] || "").padStart(16, "0");
    return {
      name: companyName(field(/Nama\s*[:.]\s*([^\n]+)/i)),
      address: field(/Alamat\s*[:.]\s*([\s\S]*?)(?:\nNPWP|$)/i).replace(/\s+/g, " ").trim(),
      npwp: seller ? npwps.join(" / ") : buyerNpwp.length === 16 ? buyerNpwp : ""
    };
  }
  function group(pages) {
    const groups = [];
    pages.forEach(page => {
      const n = number(page.text), seller = party(page.text, true), buyer = party(page.text, false);
      const identity = [seller.npwp || seller.name, buyer.npwp || buyer.name].join("|");
      const current = groups[groups.length - 1];
      const sameIdentity = current && identity !== "|" && current.identity === identity;
      if (current && sameIdentity && (!n || n === current.number)) current.pages.push(page);
      else groups.push({ number: n, identity, pages: [page], uncertain: !n });
    });
    return groups;
  }
  function tableItems(pages) {
    const items = [];
    let active = false;
    pages.forEach(page => {
      const lines = normalize(page.text).split("\n").filter(Boolean);
      const header = lines.findIndex(l => /Macam\s+dan\s+Jenis/i.test(l));
      if (header >= 0) active = true;
      if (!active) return;
      const end = lines.findIndex((l, i) => i > header && totalStart(l));
      const block = lines.slice(header + 1, end < 0 ? undefined : end);
      let parsed = [];
      // Identify item anchors in the sequence-number column. Cell fragments stay
      // within their row band, including wrapped amounts above/below the baseline.
      if (page.layout) {
        const rows = page.layout.rows;
        const hr = rows.find(r => /Macam\s+dan\s+Jenis/i.test(r.text));
        const bottom = rows.find(r => totalStart(r.text));
        const candidates = rows.filter(r => (!hr || r.y < hr.y) && (!bottom || r.y > bottom.y) && /^\d+[.)]?\s+\S/.test(r.text));
        const anchors = candidates.filter(r => /^\d+[.)]?$/.test(r.parts[0].text.trim()) && r.parts[0].x < Math.min(...page.layout.spans.map(p => p.x)) + 40);
        // The column boundary comes from table header positions, not font names.
        const headerParts = hr ? page.layout.spans.filter(p => p.y >= hr.y - 22 && p.y <= hr.y + 22) : [];
        const moneyHeaders = headerParts.filter(p => /^Harga(?:\s|$)/i.test(p.text));
        const grossX = moneyHeaders.length >= 2 ? Math.max(...moneyHeaders.map(p => p.x)) - 5 : null;
        anchors.forEach((r, i) => {
          const top = i ? (anchors[i - 1].y + r.y) / 2 : r.y + r.height * 1.5;
          const low = i + 1 < anchors.length ? (anchors[i + 1].y + r.y) / 2 : r.y - r.height * 1.5;
          const parts = page.layout.spans.filter(p => p.y < top && p.y > low);
          if (grossX == null) { parsed.push(r.text); return; }
          const left = parts.filter(p => p.x < grossX).sort((a, b) => a.x - b.x || b.y - a.y);
          const right = parts.filter(p => p.x >= grossX).sort((a, b) => b.y - a.y || a.x - b.x);
          parsed.push(normalize(left.map(p => p.text).join(" ")) + " " + right.map(p => p.text.trim()).join(""));
        });
      }
      if (!parsed.length) parsed = block;
      parsed.forEach(line => {
        const m = line.replace(/##/g, " ").match(/^(\d+)[.)]?\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+([A-Za-z]{2,12})\s+([\d.,]+)\s+([\d.,]+)\s*$/);
        if (!m) return;
        const gross = amount(m[6]);
        items.push({ no: Number(m[1]), code: "", name: m[2].trim(), qty: quantity(m[3], m[4]), unit: m[4], rawUnit: m[4], unitPrice: amount(m[5]), gross, returnedValue: gross, discount: 0, ppnbmRate: null, ppnbm: null, page: page.sourcePage, sourcePage: page.sourcePage });
      });
      if (end >= 0) active = false;
    });
    return { foundTable: items.length > 0, items };
  }
  function date(s) {
    const m = s.match(/\b(\d{1,2})[- /]([A-Za-z]+|\d{1,2})[- /](\d{4})\b/);
    if (!m) return "";
    const months = { jan:1, feb:2, mar:3, apr:4, may:5, mei:5, jun:6, jul:7, aug:8, agu:8, agt:8, sep:9, oct:10, okt:10, nov:11, dec:12, des:12 };
    const month = Number(m[2]) || months[m[2].slice(0, 3).toLowerCase()];
    const d = new Date(Date.UTC(Number(m[3]), month - 1, Number(m[1])));
    if (!month || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== Number(m[1])) return "";
    return m[1].padStart(2, "0") + "-" + String(month).padStart(2, "0") + "-" + m[3];
  }
  function taxInvoiceNumber(value) {
    const candidates = String(value || "").match(/\d(?:[\d.\- ]*\d)?/g) || [];
    for (const candidate of candidates) {
      const digits = candidate.replace(/\D/g, "");
      if (digits.length === 16) return digits;
    }
    return "";
  }
  function parse(pages, filename, path) {
    const raw = pages.map(p => p.text).join("\n"), text = normalize(raw), lines = text.split("\n");
    const seller = party(text, true), buyer = party(text, false), n = number(text);
    const referenceLine = lines.find(l => /Atas\s+Faktur\s+Pajak/i.test(l)) || "";
    const reference = taxInvoiceNumber(referenceLine);
    const signing = [...lines].reverse().find(l => /,\s*\d{1,2}[- /]/.test(l)) || "";
    const total = re => { const l = lines.find(l => re.test(l)); if (!l) return null; return amount(l.replace(re, "").replace(/^\s*[:=]?\s*/, "").trim()); };
    const items = tableItems(pages).items;
    return { key: (seller.npwp || seller.name || path) + "|" + n, filename, path, number:n, returnNoteNumber:n,
      originalInvoiceNumber:reference, originalInvoiceDate:date(referenceLine), date:date(signing), place:signing.split(",")[0],
      seller:seller.name, sellerNPWP:seller.npwp, sellerAddress:seller.address, buyer:buyer.name, buyerNPWP:buyer.npwp, buyerAddress:buyer.address,
      grossTotal:total(/^Jumlah\s+(?:Harga\s+)?(?:Jual\s+)?(?:BKP|PKP)\s+yang\s+dikembalikan/i),
      discountTotal:total(/^Dikurangi\s+Potongan\s+Harga/i), dpp:total(/^Jumlah\s+(?:Harga\s+)?(?:BKP|PKP)\s+Netto\s+yang\s+dikembalikan/i),
      ppn:total(/^(?:PPN|Pajak\s+Pertambahan\s+Nilai)\s+yang\s+diminta\s+kembali/i),
      ppnbm:total(/^(?:PPnBM|Pajak\s+Penjualan\s+Atas\s+Barang\s+Mewah)\s+yang\s+diminta\s+kembali/i),
      reference, signatory:"", pages:pages.length, items, raw, unmapped:"", format:/BINA SAN PRIMA/i.test(text)?"BSP":"GENERIC",
      status:!n?"ERROR":!items.length?"REVIEW":"PARSED", message:!n?"Nomor nota retur tidak ditemukan":!items.length?"Barang retur tidak terdeteksi":"Nota retur berhasil dibaca", imported:new Date().toISOString() };
  }
  const api = { layout, number, group, tableItems, parse, amount, quantity, taxInvoiceNumber, normalize };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ReturnNoteParser = api;
}(typeof window !== "undefined" ? window : globalThis));
