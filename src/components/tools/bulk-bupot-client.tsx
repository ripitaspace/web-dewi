"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import styles from "./bulk-bupot-client.module.css";

type BupotRow = {
  id: string;
  period: string;
  number: string;
  status: string;
  nitku: string;
  tax: string;
  code: string;
  taxpayerId: string;
  name: string;
  base: number;
  withheld: number;
  facility: string;
};

type CompanyDetails = { name: string; id: string; signer: string; date: string };
type FormCode = "BP21" | "BP23" | "BP26";

const fields: Record<keyof Omit<BupotRow, "id" | "base" | "withheld">, string[]> = {
  period: ["Masa Pajak"],
  number: ["Nomor Pemotongan", "Nomor Bukti Pemotongan"],
  status: ["Status"],
  nitku: ["NITKU/Nomor Identitas Sub Unit Organisasi", "NITKU"],
  tax: ["Jenis Pajak"],
  code: ["Kode Objek Pajak"],
  taxpayerId: ["Nomor Identitas WP", "NIK/NPWP"],
  name: ["Nama", "Nama WP"],
  facility: ["Fasilitas Pajak"],
};
const amountFields = {
  base: ["Dasar Pengenaan Pajak (Rp)", "DPP", "Dasar Pengenaan Pajak"],
  withheld: ["Pajak Penghasilan (Rp)", "PPh Dipotong"],
};
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const generatorUrl = "https://www.puspitacore.com/karya/tools/cetak-bupot";
const generatorQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=svg&data=${encodeURIComponent(generatorUrl)}`;
const formOptions: { code: FormCode; label: string; title: string }[] = [
  { code: "BP21", label: "BP21 · PPh Pasal 21", title: "PAJAK PENGHASILAN PASAL 21 YANG TIDAK BERSIFAT FINAL DAN PAJAK PENGHASILAN PASAL 21 YANG BERSIFAT FINAL" },
  { code: "BP23", label: "BP23 · PPh Pasal 23", title: "PAJAK PENGHASILAN PASAL 23" },
  { code: "BP26", label: "BP26 · PPh Pasal 26", title: "PAJAK PENGHASILAN PASAL 26" },
];

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

function escapeXmlText(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function columnIndex(reference: string) {
  const letters = reference.match(/^[A-Z]+/)?.[0] ?? "";
  return letters.split("").reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

async function unzipText(bytes: Uint8Array, view: DataView, entry: { method: number; size: number; offset: number }) {
  const start = entry.offset;
  if (view.getUint32(start, true) !== 0x04034b50) throw new Error("Berkas XLSX tidak valid.");
  const nameLength = view.getUint16(start + 26, true);
  const extraLength = view.getUint16(start + 28, true);
  const compressed = bytes.slice(start + 30 + nameLength + extraLength, start + 30 + nameLength + extraLength + entry.size);
  if (entry.method === 0) return new TextDecoder().decode(compressed);
  if (entry.method !== 8 || typeof DecompressionStream === "undefined") throw new Error("Browser ini belum mendukung pembacaan XLSX lokal. Gunakan Chrome atau Edge terbaru.");
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
}

async function readWorkbook(file: File): Promise<BupotRow[]> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error("Pilih file Excel berformat .xlsx.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Ukuran file melebihi batas 20 MB.");
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (let cursor = bytes.length - 22; cursor >= Math.max(0, bytes.length - 65557); cursor -= 1) {
    if (view.getUint32(cursor, true) === 0x06054b50) { eocd = cursor; break; }
  }
  if (eocd < 0) throw new Error("Struktur XLSX tidak dapat dibaca.");
  const count = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const entries = new Map<string, { method: number; size: number; offset: number }>();
  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error("Direktori XLSX tidak valid.");
    const method = view.getUint16(cursor + 10, true);
    const size = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const name = new TextDecoder().decode(bytes.slice(cursor + 46, cursor + 46 + nameLength));
    entries.set(name, { method, size, offset: view.getUint32(cursor + 42, true) });
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  const read = async (path: string) => {
    const entry = entries.get(path);
    return entry ? unzipText(bytes, view, entry) : null;
  };
  const sharedXml = await read("xl/sharedStrings.xml");
  const shared = sharedXml ? [...new DOMParser().parseFromString(sharedXml, "application/xml").querySelectorAll("si")].map((item) => [...item.querySelectorAll("t")].map((text) => text.textContent ?? "").join("")) : [];
  const sheets = [...entries.keys()].filter((path) => /^xl\/worksheets\/[^/]+\.xml$/.test(path)).sort();
  for (const sheet of sheets) {
    const xml = await read(sheet);
    if (!xml) continue;
    const document = new DOMParser().parseFromString(xml, "application/xml");
    const table = [...document.querySelectorAll("row")].map((row) => {
      const values: string[] = [];
      row.querySelectorAll("c").forEach((cell) => {
        const type = cell.getAttribute("t");
        const raw = cell.querySelector("v")?.textContent ?? "";
        const inline = [...cell.querySelectorAll("is t")].map((node) => node.textContent ?? "").join("");
        const value = type === "s" ? shared[Number(raw)] ?? "" : type === "inlineStr" ? inline : type === "b" ? (raw === "1" ? "Ya" : "Tidak") : escapeXmlText(raw);
        values[columnIndex(cell.getAttribute("r") ?? "")] = value;
      });
      return values;
    });
    const headers = table[0] ?? [];
    const headerMap = new Map(headers.map((header, index) => [normalize(header), index]));
    const findColumn = (labels: string[]) => labels.map(normalize).map((label) => headerMap.get(label)).find((index): index is number => index !== undefined);
    const numberColumn = findColumn(fields.number);
    const nameColumn = findColumn(fields.name);
    const periodColumn = findColumn(fields.period);
    const baseColumn = findColumn(amountFields.base);
    if ([numberColumn, nameColumn, periodColumn, baseColumn].some((column) => column === undefined)) continue;
    const get = (row: string[], labels: string[]) => {
      const column = findColumn(labels);
      return column === undefined ? "" : row[column] ?? "";
    };
    return table.slice(1).map((row, index) => ({
      id: `${index}-${get(row, fields.number)}`,
      period: get(row, fields.period), number: get(row, fields.number), status: get(row, fields.status), nitku: get(row, fields.nitku),
      tax: get(row, fields.tax), code: get(row, fields.code), taxpayerId: get(row, fields.taxpayerId), name: get(row, fields.name),
      base: Number(get(row, amountFields.base)) || 0, withheld: Number(get(row, amountFields.withheld)) || 0, facility: get(row, fields.facility),
    })).filter((row) => row.number || row.name);
  }
  throw new Error("Kolom Coretax tidak ditemukan. Pastikan ada Masa Pajak, Nomor Pemotongan, Nama, dan Dasar Pengenaan Pajak.");
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function BupotDocument({ row, company, sourceName, formCode, printable = false }: { row: BupotRow; company: CompanyDetails; sourceName: string; formCode: FormCode; printable?: boolean }) {
  const form = formOptions.find((option) => option.code === formCode) ?? formOptions[0];
  return (
    <article className={`${styles.document} ${printable ? styles.documentPrint : ""}`}>
      <header className={styles.documentHeader}>
        <div className={styles.government}>
          <img className={styles.seal} src="/images/branding/kemenkeu-seal.webp" alt="Lambang Kementerian Keuangan Republik Indonesia" />
          <div><span>KEMENTERIAN KEUANGAN</span><span>REPUBLIK INDONESIA</span><strong>DIREKTORAT JENDERAL PAJAK</strong></div>
        </div>
        <div className={styles.documentTitle}><strong>BUKTI PEMOTONGAN</strong><strong>{form.title}</strong></div>
        <div className={styles.formCode}>{form.code}</div>
      </header>
      <div className={styles.metaGrid}>
        <div><span>Nomor Bukti Pemotongan</span><b>{row.number || "-"}</b></div><div><span>Masa Pajak</span><b>{row.period || "-"}</b></div><div><span>Sifat Pemotongan</span><b>{row.tax.toUpperCase().includes("FINAL") ? "FINAL" : "TIDAK FINAL"}</b></div><div><span>Status Bukti Pemotongan</span><b>{row.status || "NORMAL"}</b></div>
      </div>
      <section><h2>A. IDENTITAS PENERIMA PENGHASILAN</h2><dl className={styles.identity}><dt>A.1</dt><dd>NIK/NPWP</dd><i>:</i><dd>{row.taxpayerId || "-"}</dd><dt>A.2</dt><dd>Nama</dd><i>:</i><dd>{row.name || "-"}</dd><dt>A.3</dt><dd>NITKU</dd><i>:</i><dd>{row.nitku || "-"}</dd></dl></section>
      <section><h2>B. PENGHASILAN YANG DIPOTONG</h2><table><thead><tr><th>Kode Objek Pajak<small>B.2</small></th><th>Objek Pajak<small>B.3</small></th><th>Penghasilan Bruto (Rp)<small>B.4</small></th><th>DPP (%)<small>B.5</small></th><th>Tarif (%)<small>B.6</small></th><th>PPh Dipotong (Rp)<small>B.7</small></th></tr></thead><tbody><tr><td>{row.code || "-"}</td><td>{row.tax || "Penghasilan sesuai ekspor Coretax"}</td><td className={styles.number}>{money.format(row.base)}</td><td className={styles.number}>-</td><td className={styles.number}>-</td><td className={styles.number}>{money.format(row.withheld)}</td></tr></tbody></table><dl className={styles.references}><dt>B.8 Dokumen Referensi</dt><dd>: Ekspor Excel Coretax</dd><dt>B.9 Nomor Dokumen</dt><dd>: {row.number || "-"}</dd></dl></section>
      <section className={styles.payerSection}><h2>C. IDENTITAS PEMOTONG PPh</h2><dl className={styles.identity}><dt>C.1</dt><dd>NPWP/NIK</dd><i>:</i><dd>{company.id || "-"}</dd><dt>C.2</dt><dd>Nama Pemotong</dd><i>:</i><dd>{company.name || "-"}</dd><dt>C.3</dt><dd>Tanggal</dd><i>:</i><dd>{formatDate(company.date)}</dd><dt>C.4</dt><dd>Nama Penandatangan</dd><i>:</i><dd>{company.signer || "-"}</dd></dl><div className={styles.signatureRow}><a className={styles.qr} href={generatorUrl} target="_blank" rel="noreferrer" aria-label="Buka generator Cetak BUPOT RIPITA"><img src={generatorQrUrl} alt="QR untuk membuka generator Cetak BUPOT RIPITA" /></a><p><b>RIPITA · NONRESMI.</b> Dokumen acuan internal dari data Excel yang diimpor pengguna; bukan bukti potong resmi DJP dan bukan tanda tangan elektronik.</p><aside className={styles.stamp}><small>CAP SISTEM · BUKAN TTE</small><strong>RIPITA</strong><small>GENERATED · NONRESMI</small></aside></div></section>
      <div className={styles.documentFooter}><span>Sumber impor: {sourceName || "-"}</span><span>Diproses lokal di browser · Bukan dokumen resmi DJP</span></div>
    </article>
  );
}

export function BulkBupotClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BupotRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printIds, setPrintIds] = useState<string[]>([]);
  const [preview, setPreview] = useState(0);
  const [sourceName, setSourceName] = useState("");
  const [message, setMessage] = useState("Pilih file Excel ekspor Coretax. Data tidak diunggah atau disimpan.");
  const [company, setCompany] = useState<CompanyDetails>({ name: "", id: "", signer: "", date: "" });
  const [formCode, setFormCode] = useState<FormCode>("BP21");
  const totals = useMemo(() => rows.reduce((total, row) => ({ base: total.base + row.base, withheld: total.withheld + row.withheld }), { base: 0, withheld: 0 }), [rows]);

  async function importFile(file?: File) {
    if (!file) return;
    setMessage(`Membaca ${file.name} di perangkat ini...`);
    try {
      const imported = await readWorkbook(file);
      setRows(imported); setSelected(new Set(imported.map((row) => row.id))); setPreview(0); setSourceName(file.name);
      setMessage(`${imported.length} bukti potong terdeteksi. Pilih data untuk melihat atau mencetak dokumen.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "File tidak dapat dibaca."); }
  }
  function handleFile(event: ChangeEvent<HTMLInputElement>) { void importFile(event.target.files?.[0]); }
  function handleDrop(event: DragEvent<HTMLButtonElement>) { event.preventDefault(); void importFile(event.dataTransfer.files?.[0]); }
  function updateCompany(field: keyof CompanyDetails, value: string) { setCompany((current) => ({ ...current, [field]: value })); }
  function toggleRow(id: string) { setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function printRows(ids: string[]) {
    if (!ids.length) { setMessage("Pilih setidaknya satu bukti potong untuk dicetak."); return; }
    flushSync(() => setPrintIds(ids));
    window.addEventListener("afterprint", () => {
      setPrintIds([]);
    }, { once: true });
    window.print();
  }
  const current = rows[preview];
  const selectedRows = rows.filter((row) => selected.has(row.id));
  const queuedRows = rows.filter((row) => printIds.includes(row.id));

  return <>
  <main id="main-content" className={styles.page} style={{ paddingTop: "var(--nav-height)" }}>
    <section className={`page-hero ${styles.hero}`}><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><a href="/karya">Karya</a><span>/</span><span>Cetak BUPOT</span></nav><span className="eyebrow text-rempah">CORETAX · CETAK BUPOT</span><h1 className="display-lg">BUPOT rapi, siap dicetak.</h1><p className="lead muted">Impor ekspor Excel Coretax, cek datanya, lalu cetak dokumen acuan A4 dengan cap RIPITA yang jelas.</p></div></section>
    <section className={`section-tight ${styles.workspace}`}><div className="container">
      <div className={styles.notice}><b>Catatan penting:</b> tampilan ini adalah dokumen acuan internal, bukan bukti potong resmi DJP. Semua file diproses lokal di browser.</div>
      <div className={styles.setupGrid}><section className="card"><h2>01 / Impor Excel Coretax</h2><button type="button" className={styles.dropzone} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}><span aria-hidden="true">↑</span><b>Klik atau seret file .xlsx ke sini</b><small>Maksimum 20 MB · tanpa unggah ke server</small></button><input ref={inputRef} type="file" accept=".xlsx" onChange={handleFile} hidden /><p className={styles.message} role="status">{message}</p></section>
      <section className="card"><h2>02 / Identitas pemotong</h2><div className={styles.fieldGrid}><label>Jenis formulir<select value={formCode} onChange={(event) => setFormCode(event.target.value as FormCode)}>{formOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label><label>Nama perusahaan<input value={company.name} onChange={(event) => updateCompany("name", event.target.value)} placeholder="Nama pemotong / perusahaan" /></label><label>NPWP/NIK pemotong<input value={company.id} onChange={(event) => updateCompany("id", event.target.value)} placeholder="Opsional" /></label><label>Penandatangan<input value={company.signer} onChange={(event) => updateCompany("signer", event.target.value)} placeholder="Opsional" /></label><label>Tanggal dokumen<input type="date" value={company.date} onChange={(event) => updateCompany("date", event.target.value)} /></label></div></section></div>
      {rows.length > 0 && <><div className={styles.kpis}><div><b>{rows.length}</b><span>Bukti potong</span></div><div><b>{money.format(totals.base)}</b><span>Total DPP</span></div><div><b>{money.format(totals.withheld)}</b><span>Total PPh</span></div><div><b>{selected.size}</b><span>Dipilih cetak</span></div></div><div className={styles.actions}><button className="btn primary" type="button" onClick={() => printRows(selectedRows.map((row) => row.id))}>Cetak pilihan / Simpan PDF</button><button className="btn" type="button" onClick={() => { setSelected(new Set(rows.map((row) => row.id))); }}>Pilih semua</button></div><p className={styles.printHint}>Di dialog print, pilih <b>A4</b>, skala <b>100%</b>, lalu nonaktifkan <b>Headers and footers</b> agar tanggal, URL, dan nomor halaman browser tidak ikut tercetak.</p><div className={styles.contentGrid}><section className="card"><div className={styles.sectionHead}><h2>03 / Data bukti potong</h2><span>{rows.length} data</span></div><div className={styles.tableWrap}><table className={styles.dataTable}><thead><tr><th>Pilih</th><th>Nama</th><th>Nomor</th><th>Kode</th><th>DPP</th><th>PPh</th><th /></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id}><td><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} aria-label={`Pilih ${row.name}`} /></td><td><b>{row.name}</b><small>{row.period}</small></td><td>{row.number}</td><td>{row.code}</td><td>{money.format(row.base)}</td><td>{money.format(row.withheld)}</td><td><div className={styles.rowActions}><button className="btn btn-small" type="button" onClick={() => setPreview(index)}>Lihat</button><button className="btn btn-small" type="button" onClick={() => printRows([row.id])}>Cetak</button></div></td></tr>)}</tbody></table></div></section><section className="card"><div className={styles.sectionHead}><h2>04 / Pratinjau A4</h2><span>RIPITA · NONRESMI</span></div><div className={styles.preview}>{current && <BupotDocument row={current} company={company} sourceName={sourceName} formCode={formCode} />}</div></section></div></>}
    </div></section>
  </main>
  <div className={styles.printArea} data-bupot-print-area aria-hidden="true">{queuedRows.map((row) => <BupotDocument key={row.id} row={row} company={company} sourceName={sourceName} formCode={formCode} printable />)}</div>
  </>;
}
