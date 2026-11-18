"use client";

import { type ChangeEvent, type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import styles from "./hand-writing-b5-client.module.css";

const LINE_COUNT = 26;
const WRAP_LENGTH = 42;
const DEFAULT_CONTENT = "Halaman ini adalah dokumentasi gaya Puspita Hand. Bentuknya terinspirasi dari tulisan tegak, ramping, dan ritme pena pada catatan asli.\n\nGunakan ruang ini untuk menampilkan catatan proses, rangkuman ide, atau contoh pembelajaran yang ingin dibagikan di PuspitaCore.";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] || character);
}

function readWritingXml(source: string) {
  const xml = new DOMParser().parseFromString(source, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("XML tidak dapat dibaca. Periksa tag yang belum ditutup.");

  const root = xml.documentElement;
  const rootName = root?.tagName.toLowerCase();
  if (!root || !["handwriting", "paper", "ripidoc"].includes(rootName)) {
    throw new Error("Root XML harus menggunakan <handwriting>, <paper>, atau <ripidoc>.");
  }

  const title = root.querySelector("meta > title, title")?.textContent?.trim() || "Catatan tanpa judul";
  const contentNodes = rootName === "handwriting"
    ? Array.from(root.querySelectorAll("content > paragraph, content > p"))
    : Array.from(root.querySelectorAll("content > heading, content > paragraph, content > list > item, content > table > row"));
  const paragraphs = contentNodes
    .map((node) => node.textContent?.trim() || "")
    .filter(Boolean);

  if (paragraphs.length === 0) throw new Error("XML belum memiliki isi. Tambahkan <paragraph> di dalam <content>.");
  return { title, content: paragraphs.join("\n\n") };
}

function toWritingXml(title: string, content: string) {
  const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<handwriting version="1.0">\n  <meta>\n    <title>${escapeXml(title || "Catatan tanpa judul")}</title>\n  </meta>\n  <content>\n${paragraphs.map((paragraph) => `    <paragraph>${escapeXml(paragraph)}</paragraph>`).join("\n")}\n  </content>\n</handwriting>\n`;
}

function downloadXml(xml: string, filename = "catatan-puspita-hand.xml") {
  const href = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

function wrapParagraph(paragraph: string) {
  const words = paragraph.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > WRAP_LENGTH && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  lines.push(line);
  return lines;
}

function paginateWriting(content: string) {
  const lines = content
    .split(/\n\s*\n/)
    .flatMap((paragraph, index, paragraphs) => [
      ...wrapParagraph(paragraph),
      ...(index < paragraphs.length - 1 ? [""] : []),
    ]);

  const visibleLines = lines.some(Boolean) ? lines : [""];
  const pages: string[][] = [];
  for (let start = 0; start < visibleLines.length; start += LINE_COUNT) {
    pages.push(visibleLines.slice(start, start + LINE_COUNT));
  }
  return pages.length ? pages : [[""]];
}

export function HandWritingB5Client() {
  const [title, setTitle] = useState("Catatan Proses");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [lineSpacing, setLineSpacing] = useState<"6" | "8">("8");
  const [showMargin, setShowMargin] = useState(true);
  const [notice, setNotice] = useState("XML diproses langsung di browser dan tidak diunggah ke server.");
  const fileInput = useRef<HTMLInputElement>(null);

  const pages = useMemo(() => paginateWriting(content), [content]);
  const summary = useMemo(() => `${pages.length} halaman · ${LINE_COUNT} baris · jarak ${lineSpacing} mm · B5`, [lineSpacing, pages.length]);
  const paperStyle = useMemo(() => ({
    "--line-spacing": `${lineSpacing}mm`,
    "--writing-size": lineSpacing === "6" ? "3.05mm" : "3.55mm",
  }) as CSSProperties, [lineSpacing]);

  const onXmlFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = readWritingXml(await file.text());
      setTitle(imported.title);
      setContent(imported.content);
      setNotice(`“${file.name}” berhasil diimpor menjadi ${imported.content.split(/\s+/).filter(Boolean).length} kata.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "XML tidak dapat diimpor.");
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    const finishPrinting = () => document.body.classList.remove("handWritingPrinting");
    window.addEventListener("afterprint", finishPrinting);
    return () => {
      window.removeEventListener("afterprint", finishPrinting);
      finishPrinting();
    };
  }, []);

  const handlePrint = () => {
    document.body.classList.add("handWritingPrinting");
    window.print();
  };

  return (
    <div className={styles.workspace} id="hand-writing-print-root">
      <aside className={`${styles.controls} card`} aria-label="Pengaturan lembar tulisan">
        <div>
          <span className="topic-pill">HAND WRITING · DRAFT</span>
          <h2>Catatan personal, dalam bentuk cetak.</h2>
          <p>Gaya ini mengambil arah dari tulisan Puspita: tegak, ramping, dengan ritme pena yang tenang. Seluruh teks diproses hanya di browser.</p>
        </div>

        <div className={styles.specimen} aria-label="Contoh gaya Puspita Hand">
          <span>Puspita Hand</span>
          <strong>Rasa menjadi rupa.</strong>
          <small>ABCDEFGHIJKLMNOPQRSTUVWXYZ · 0123456789</small>
        </div>

        <label className={styles.field}>
          <span>Judul catatan</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={76} placeholder="Contoh: Catatan Pertemuan 6" />
        </label>

        <label className={styles.field}>
          <span>Isi dokumentasi</span>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} placeholder="Tempel catatan atau dokumentasi di sini…" />
        </label>

        <div className={styles.xmlControls}>
          <input ref={fileInput} className={styles.visuallyHidden} type="file" accept=".xml,text/xml,application/xml" onChange={onXmlFile} />
          <button className="btn btn-secondary" type="button" onClick={() => fileInput.current?.click()}>Import XML</button>
          <button className="btn btn-secondary" type="button" onClick={() => downloadXml(toWritingXml(title, content))}>Unduh XML</button>
          <small>{notice}</small>
        </div>

        <fieldset className={styles.fieldset}>
          <legend>Jarak antarbaris</legend>
          <div className={styles.optionRow}>
            <label><input type="radio" name="lineSpacing" value="6" checked={lineSpacing === "6"} onChange={() => setLineSpacing("6")} /> 6 mm</label>
            <label><input type="radio" name="lineSpacing" value="8" checked={lineSpacing === "8"} onChange={() => setLineSpacing("8")} /> 8 mm</label>
          </div>
          <small>8 mm mengikuti proporsi buku contoh. Setiap halaman selalu memiliki 26 baris.</small>
        </fieldset>

        <label className={styles.checkbox}><input type="checkbox" checked={showMargin} onChange={(event) => setShowMargin(event.target.checked)} /> Tampilkan margin merah</label>

        <div className={styles.actions}>
          <button className="btn primary" type="button" onClick={handlePrint}>Cetak / Simpan PDF</button>
          <span>{summary}</span>
        </div>
      </aside>

      <section className={styles.previewPanel} aria-label="Pratinjau halaman B5">
        <div className={styles.previewHint}>Pratinjau proporsional · cetak memakai B5 asli pada skala 100%</div>
        <div className={styles.paperPages}>
          {pages.map((pageLines, pageIndex) => (
            <article className={styles.paper} style={paperStyle} key={pageIndex}>
              <header className={styles.paperHeader}>
                <div className={styles.titleBlock}>
                  <span>{pageIndex === 0 ? "DOKUMENTASI" : `LANJUTAN · ${pageIndex + 1}`}</span>
                  <strong>{title || "Catatan tanpa judul"}</strong>
                </div>
                <div className={styles.pageNumber}>{String(pageIndex + 1).padStart(2, "0")}</div>
              </header>
              <div className={`${styles.ruledArea} ${showMargin ? styles.withMargin : ""}`}>
                {Array.from({ length: LINE_COUNT }, (_, index) => (
                  <p className={styles.writingLine} key={index}>{pageLines[index] || "\u00a0"}</p>
                ))}
              </div>
              <footer className={styles.paperFooter}>B5 · {LINE_COUNT} baris · PuspitaCore</footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
