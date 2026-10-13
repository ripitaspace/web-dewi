"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";

type Item = { name: string; qty: string; unit: string; unitPrice: string; productId: string };
type Invoice = { id: string; filename: string; number: string; seller: string; status: "PARSED" | "REVIEW" | "ERROR"; message: string; items: Item[]; raw: string };

declare global {
  interface Window {
    pdfjsLib?: { GlobalWorkerOptions: { workerSrc: string }; getDocument: (source: { data: Uint8Array }) => { promise: Promise<PdfDocument> } };
    JSZip?: { loadAsync: (input: File) => Promise<{ files: Record<string, { dir: boolean; async: (type: "arraybuffer") => Promise<ArrayBuffer> }> }> };
    XLSX?: { utils: { book_new: () => unknown; json_to_sheet: (rows: Record<string, string>[]) => unknown; book_append_sheet: (workbook: unknown, sheet: unknown, title: string) => void }; writeFile: (workbook: unknown, filename: string) => void };
  }
}
type PdfDocument = { numPages: number; getPage: (page: number) => Promise<{ getTextContent: () => Promise<{ items: Array<{ str: string }> }> }>; destroy: () => Promise<void> };

const scripts = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const element = document.createElement("script");
    element.src = src; element.async = true; element.onload = () => resolve(); element.onerror = () => reject(new Error("Library tidak dapat dimuat"));
    document.head.appendChild(element);
  });
}

function parseText(raw: string, filename: string): Invoice {
  const invoiceNumber = raw.match(/Kode dan Nomor Seri Faktur Pajak\s*:?\s*(\d+)/i)?.[1] ?? "";
  const seller = raw.match(/Pengusaha Kena Pajak\s*:\s*([\s\S]{0,500}?)(?:Pembeli Barang|NPWP\s*:)/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  const itemMatches = [...raw.matchAll(/(?:^|\n)\s*\d+\s+\d{6}\s+([^\n]+?)(?:\s+Rp\s*|$)/gim)];
  const items = itemMatches.map((match, index) => ({ name: match[1].trim(), qty: "", unit: "", unitPrice: "", productId: `PRD-${String(index + 1).padStart(4, "0")}` }));
  return {
    id: `${filename}-${Date.now()}-${Math.random()}`,
    filename, number: invoiceNumber, seller, raw,
    status: invoiceNumber && items.length ? "PARSED" : "REVIEW",
    message: invoiceNumber && items.length ? "Data siap diperiksa" : "Periksa nomor faktur dan detail barang sebelum ekspor",
    items: items.length ? items : [{ name: "", qty: "", unit: "", unitPrice: "", productId: "" }],
  };
}

export function CoretaxInvoiceScraper() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeView, setActiveView] = useState<"inbox" | "items">("inbox");
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [notice, setNotice] = useState("Menyiapkan pembaca dokumen…");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all(scripts.map(loadScript)).then(() => {
      if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setIsReady(true); setNotice("Siap menerima faktur PDF atau ZIP.");
    }).catch(() => setNotice("Library pembaca belum tersedia. Periksa koneksi internet lalu muat ulang halaman."));
  }, []);

  const allItems = useMemo(() => invoices.flatMap((invoice) => invoice.items.map((item) => ({ invoice, item }))), [invoices]);
  const reviewCount = invoices.filter((invoice) => invoice.status !== "PARSED").length;

  async function extractPdf(bytes: ArrayBuffer, filename: string) {
    if (!window.pdfjsLib) throw new Error("Pembaca PDF belum siap");
    const documentPdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= documentPdf.numPages; pageNumber += 1) {
      const page = await documentPdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((part) => part.str).join("\n"));
    }
    await documentPdf.destroy();
    return parseText(pages.join("\n"), filename);
  }

  async function importFiles(files: File[]) {
    if (!isReady) return;
    const entries: Array<{ name: string; getBytes: () => Promise<ArrayBuffer> }> = [];
    for (const file of files) {
      if (/\.pdf$/i.test(file.name)) entries.push({ name: file.name, getBytes: () => file.arrayBuffer() });
      if (/\.zip$/i.test(file.name) && window.JSZip) {
        const archive = await window.JSZip.loadAsync(file);
        Object.entries(archive.files).forEach(([path, entry]) => { if (!entry.dir && /\.pdf$/i.test(path)) entries.push({ name: path.split("/").pop() ?? path, getBytes: () => entry.async("arraybuffer") }); });
      }
    }
    if (!entries.length) { setNotice("Pilih PDF atau ZIP yang berisi PDF."); return; }
    setNotice(`Memproses ${entries.length} dokumen…`);
    const results: Invoice[] = [];
    for (const entry of entries) {
      try { results.push(await extractPdf(await entry.getBytes(), entry.name)); }
      catch (error) { results.push({ id: `${entry.name}-${Date.now()}`, filename: entry.name, number: "", seller: "", raw: "", items: [], status: "ERROR", message: error instanceof Error ? error.message : "PDF tidak dapat dibaca" }); }
    }
    setInvoices((current) => [...current, ...results]);
    setNotice(`${results.length} dokumen masuk ke antrean. Periksa yang berstatus Review.`);
  }

  function onFiles(event: ChangeEvent<HTMLInputElement>) { void importFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }
  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setIsDragging(false); void importFiles(Array.from(event.dataTransfer.files)); }
  function updateItem(invoiceId: string, itemIndex: number, key: keyof Item, value: string) {
    setInvoices((current) => current.map((invoice) => invoice.id !== invoiceId ? invoice : { ...invoice, status: "REVIEW", items: invoice.items.map((item, index) => index === itemIndex ? { ...item, [key]: value } : item) }));
  }
  function exportExcel() {
    if (!invoices.length || !window.XLSX) return;
    const rows = allItems.map(({ invoice, item }, index) => ({ "Item ID": `ITEM-${String(index + 1).padStart(4, "0")}`, "Nomor Faktur": invoice.number, "Nama File PDF": invoice.filename, "Nama Penjual": invoice.seller, "Product ID": item.productId, "Nama Barang/Jasa": item.name, Qty: item.qty, Satuan: item.unit, "Harga Satuan": item.unitPrice, "Status Parsing": invoice.status, "Pesan Validasi": invoice.message }));
    const workbook = window.XLSX.utils.book_new(); const sheet = window.XLSX.utils.json_to_sheet(rows);
    window.XLSX.utils.book_append_sheet(workbook, sheet, "Invoice Data"); window.XLSX.writeFile(workbook, "RIPITA_Invoice_Extraction.xlsx");
  }

  return <>
    <SiteHeader currentKey="karya" />
    <main id="main-content" className="coretax-page" style={{ paddingTop: "var(--nav-height)" }}>
      <section className="coretax-hero"><div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/karya">Karya</Link><span>/</span><Link href="/karya/pajak">Pajak</Link><span>/</span><span>Coretax</span></nav>
        <span className="eyebrow text-rempah">CORETAX · RIPITAX</span><h1 className="display-md">Invoice Scraper</h1>
        <p className="lead muted">Tarik faktur pajak PDF, periksa data barang, lalu bawa hasilnya ke Excel. Semua pemrosesan berjalan di browser ini.</p>
      </div></section>
      <section className="section-tight"><div className="container coretax-shell">
        <div className="coretax-tabs" role="tablist"><button className={activeView === "inbox" ? "active" : ""} onClick={() => setActiveView("inbox")}>Antrean & Impor</button><button className={activeView === "items" ? "active" : ""} onClick={() => setActiveView("items")}>Semua Barang <span>{allItems.length}</span></button><button className="coretax-export" onClick={exportExcel} disabled={!invoices.length}>Unduh Excel ↗</button></div>
        {activeView === "inbox" ? <>
          <div className="coretax-drop card" onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} data-dragging={isDragging}>
            <span className="coretax-upload-mark">↑</span><h2>Masukkan faktur pajak</h2><p>Tarik PDF atau ZIP ke sini. Folder ZIP dengan beberapa PDF juga didukung.</p>
            <button className="btn primary" onClick={() => fileInput.current?.click()} disabled={!isReady}>Pilih PDF / ZIP</button><input ref={fileInput} type="file" accept=".pdf,.zip" multiple hidden onChange={onFiles} />
            <small>{notice}</small>
          </div>
          <div className="coretax-stats"><div><span>Dokumen</span><strong>{invoices.length}</strong></div><div><span>Barang</span><strong>{allItems.length}</strong></div><div><span>Perlu review</span><strong>{reviewCount}</strong></div></div>
          <div className="coretax-table-card card"><div className="coretax-panel-head"><div><span className="eyebrow text-rempah">Antrean</span><h2>Faktur yang diimpor</h2></div>{invoices.length > 0 && <button className="text-button" onClick={() => setInvoices([])}>Kosongkan batch</button>}</div>
            {invoices.length ? <div className="coretax-table-wrap"><table><thead><tr><th>File</th><th>Nomor faktur</th><th>Penjual</th><th>Barang</th><th>Status</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.filename}</td><td>{invoice.number || "—"}</td><td>{invoice.seller || "—"}</td><td>{invoice.items.length}</td><td><span className={`coretax-status ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td></tr>)}</tbody></table></div> : <p className="muted">Belum ada dokumen dalam antrean.</p>}</div>
        </> : <div className="coretax-table-card card"><div className="coretax-panel-head"><div><span className="eyebrow text-rempah">Review</span><h2>Semua barang</h2></div><span className="muted">Sunting nilai sebelum ekspor.</span></div>
          {allItems.length ? <div className="coretax-table-wrap"><table><thead><tr><th>Faktur</th><th>Nama barang / jasa</th><th>Qty</th><th>Satuan</th><th>Harga satuan</th><th>Product ID</th></tr></thead><tbody>{allItems.map(({ invoice, item }) => { const itemIndex = invoice.items.indexOf(item); return <tr key={`${invoice.id}-${itemIndex}`}><td>{invoice.number || invoice.filename}</td>{(["name", "qty", "unit", "unitPrice", "productId"] as const).map((key) => <td key={key}><input aria-label={key} value={item[key]} onChange={(event) => updateItem(invoice.id, itemIndex, key, event.target.value)} /></td>)}</tr>; })}</tbody></table></div> : <p className="muted">Impor faktur terlebih dahulu untuk melihat barang.</p>}</div>}
      </div></section>
    </main><SiteFooter />
  </>;
}
