"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import styles from "./makalah-generator.module.css";

type View = "import" | "editor" | "preview" | "xml";
type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string; breakBefore?: boolean }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; caption: string; rows: string[][] }
  | { type: "pagebreak" };

type DocumentState = {
  title: string;
  subtitle: string;
  course: string;
  lecturer: string;
  institution: string;
  city: string;
  year: string;
  author: string;
  studentId: string;
  logoSrc: string;
  fontSize: string;
  lineHeight: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  blocks: Block[];
};

const sample: DocumentState = {
  title: "ANALISIS PENGELOLAAN KEUANGAN PADA UMKM KULINER",
  subtitle: "Makalah Akademik",
  course: "Pengantar Manajemen Keuangan",
  lecturer: "Dr. Rina Wulandari, S.E., M.M.",
  institution: "Sekolah Tinggi Ilmu Ekonomi Nusantara",
  city: "Surabaya",
  year: "2026",
  author: "Aulia Pratama",
  studentId: "202600123",
  logoSrc: "",
  fontSize: "12",
  lineHeight: "1.5",
  marginTop: "30",
  marginRight: "30",
  marginBottom: "30",
  marginLeft: "40",
  blocks: [
    { type: "heading", level: 1, text: "BAB I PENDAHULUAN" },
    { type: "heading", level: 2, text: "1.1 Latar Belakang" },
    { type: "paragraph", text: "Usaha mikro, kecil, dan menengah (UMKM) menjadi salah satu penggerak ekonomi lokal. Namun, banyak pelaku UMKM masih mencampurkan uang usaha dan uang pribadi sehingga pencatatan arus kas serta pengambilan keputusan belum dilakukan secara terukur." },
    { type: "heading", level: 2, text: "1.2 Rumusan Masalah" },
    { type: "list", items: ["Bagaimana kondisi pencatatan keuangan pada UMKM kuliner?", "Langkah apa yang dapat membantu pelaku usaha mengelola arus kas secara lebih tertib?"] },
    { type: "heading", level: 1, text: "BAB II PEMBAHASAN", breakBefore: true },
    { type: "heading", level: 2, text: "2.1 Gambaran Pengelolaan Keuangan" },
    { type: "paragraph", text: "Pencatatan sederhana dapat dimulai dari pemisahan rekening usaha, rekap penjualan harian, dan pencatatan seluruh biaya bahan baku. Data tersebut membantu pemilik usaha melihat apakah penjualan yang meningkat juga menghasilkan laba yang sehat." },
    { type: "table", caption: "Tabel 1. Ringkasan Penjualan UMKM Kuliner", rows: [["Keterangan", "Januari 2026", "Februari 2026"], ["Penjualan", "Rp12.500.000", "Rp14.200.000"], ["Biaya operasional", "Rp8.100.000", "Rp8.750.000"], ["Laba bersih", "Rp4.400.000", "Rp5.450.000"]] },
    { type: "heading", level: 2, text: "2.2 Rekomendasi" },
    { type: "paragraph", text: "UMKM dapat menggunakan format kas harian dan laporan laba rugi sederhana setiap akhir bulan. Kebiasaan ini membuat pemilik usaha mampu mengidentifikasi biaya yang meningkat, menetapkan harga jual yang lebih tepat, dan merencanakan kebutuhan modal kerja." },
    { type: "heading", level: 1, text: "BAB III PENUTUP", breakBefore: true },
    { type: "heading", level: 2, text: "3.1 Kesimpulan" },
    { type: "paragraph", text: "Pengelolaan keuangan yang disiplin membantu UMKM memahami kondisi usahanya secara nyata. Pencatatan yang konsisten dapat menjadi dasar bagi keputusan usaha yang lebih sehat dan berkelanjutan." },
    { type: "heading", level: 1, text: "DAFTAR PUSTAKA", breakBefore: true },
    { type: "paragraph", text: "Kasmir. (2021). Analisis Laporan Keuangan. Depok: Rajawali Pers." },
  ],
};

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
const textOf = (parent: Element | Document, selector: string, fallback = "") => parent.querySelector(selector)?.textContent?.trim() || fallback;

function readXml(source: string, fallback: DocumentState): DocumentState {
  const xml = new DOMParser().parseFromString(source, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("XML tidak dapat dibaca. Periksa tag yang belum ditutup.");
  const root = xml.documentElement;
  if (!root || !["paper", "ripidoc"].includes(root.tagName.toLowerCase())) throw new Error("Root XML harus menggunakan <paper> atau <ripidoc>.");
  const content = root.querySelector("content") || root;
  const blocks: Block[] = Array.from(content.children).flatMap((item): Block[] => {
    const tag = item.tagName.toLowerCase();
    if (tag === "heading") {
      const level = Number(item.getAttribute("level"));
      return [{ type: "heading", level: level === 2 || level === 3 ? level : 1, text: item.textContent?.trim() || "Judul", breakBefore: item.getAttribute("breakBefore") === "true" }];
    }
    if (tag === "paragraph") return [{ type: "paragraph", text: item.textContent?.trim() || "" }];
    if (tag === "list") return [{ type: "list", items: Array.from(item.querySelectorAll(":scope > item")).map((entry) => entry.textContent?.trim() || "") }];
    if (tag === "table") {
      const rows = Array.from(item.querySelectorAll("row")).map((row) => Array.from(row.querySelectorAll(":scope > cell")).map((cell) => cell.textContent?.trim() || ""));
      return [{ type: "table", caption: item.getAttribute("caption") || "Judul Tabel", rows: rows.length ? rows : [["Kolom 1", "Kolom 2"], ["Data", "Data"]] }];
    }
    if (tag === "pagebreak") return [{ type: "pagebreak" }];
    return [];
  });
  const bodyStyle = root.querySelector("styles > body");
  const pageStyle = root.querySelector("styles > page");
  return {
    ...fallback,
    title: textOf(root, "meta > title", fallback.title), subtitle: textOf(root, "meta > subtitle", fallback.subtitle),
    course: textOf(root, "meta > course", fallback.course), lecturer: textOf(root, "meta > lecturer", fallback.lecturer),
    institution: textOf(root, "meta > institution", fallback.institution), city: textOf(root, "meta > city", fallback.city),
    year: textOf(root, "meta > year", fallback.year), author: textOf(root, "meta > authors > author > name", fallback.author),
    studentId: textOf(root, "meta > authors > author > id", fallback.studentId),
    logoSrc: root.querySelector("assets > asset[id='institution_logo']")?.getAttribute("src") || fallback.logoSrc,
    fontSize: bodyStyle?.getAttribute("fontSize")?.replace("pt", "") || fallback.fontSize,
    lineHeight: bodyStyle?.getAttribute("lineHeight") || fallback.lineHeight,
    marginTop: pageStyle?.getAttribute("marginTop")?.replace("mm", "") || fallback.marginTop,
    marginRight: pageStyle?.getAttribute("marginRight")?.replace("mm", "") || fallback.marginRight,
    marginBottom: pageStyle?.getAttribute("marginBottom")?.replace("mm", "") || fallback.marginBottom,
    marginLeft: pageStyle?.getAttribute("marginLeft")?.replace("mm", "") || fallback.marginLeft,
    blocks: blocks.length ? blocks : fallback.blocks,
  };
}

function toXml(doc: DocumentState) {
  const content = doc.blocks.map((block) => {
    if (block.type === "heading") return `    <heading level="${block.level}"${block.breakBefore ? " breakBefore=\"true\"" : ""}>${escapeXml(block.text)}</heading>`;
    if (block.type === "paragraph") return `    <paragraph>${escapeXml(block.text)}</paragraph>`;
    if (block.type === "list") return `    <list type="bullet">\n${block.items.map((item) => `      <item>${escapeXml(item)}</item>`).join("\n")}\n    </list>`;
    if (block.type === "table") return `    <table caption="${escapeXml(block.caption)}">\n${block.rows.map((row, rowIndex) => `      <row${rowIndex === 0 ? " header=\"true\"" : ""}>${row.map((cell) => `<cell>${escapeXml(cell)}</cell>`).join("")}</row>`).join("\n")}\n    </table>`;
    return "    <pagebreak />";
  }).join("\n\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<paper>\n  <meta>\n    <title>${escapeXml(doc.title)}</title>\n    <subtitle>${escapeXml(doc.subtitle)}</subtitle>\n    <course>${escapeXml(doc.course)}</course>\n    <lecturer>${escapeXml(doc.lecturer)}</lecturer>\n    <institution>${escapeXml(doc.institution)}</institution>\n    <city>${escapeXml(doc.city)}</city>\n    <year>${escapeXml(doc.year)}</year>\n    <authors><author><id>${escapeXml(doc.studentId)}</id><name>${escapeXml(doc.author)}</name></author></authors>\n  </meta>\n  <assets>\n    <asset id="institution_logo" type="logo" src="${escapeXml(doc.logoSrc)}" />\n  </assets>\n  <styles>\n    <page size="A4" marginTop="${doc.marginTop}mm" marginRight="${doc.marginRight}mm" marginBottom="${doc.marginBottom}mm" marginLeft="${doc.marginLeft}mm" />\n    <body fontFamily="Times New Roman" fontSize="${doc.fontSize}pt" lineHeight="${doc.lineHeight}" align="justify" firstLineIndent="1.25cm" />\n  </styles>\n  <content>\n${content}\n  </content>\n</paper>\n`;
}

function downloadXml(xml: string) {
  const href = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
  const link = document.createElement("a"); link.href = href; link.download = "makalah.xml"; link.click(); URL.revokeObjectURL(href);
}

export function MakalahGeneratorClient() {
  const [view, setView] = useState<View>("import");
  const [doc, setDoc] = useState<DocumentState>(sample);
  const [paste, setPaste] = useState("");
  const [notice, setNotice] = useState("Mulai dari contoh, unggah file XML, atau tempel XML dari AI.");
  const fileInput = useRef<HTMLInputElement>(null);
  const xml = useMemo(() => toXml(doc), [doc]);
  const update = <K extends keyof DocumentState>(key: K, value: DocumentState[K]) => setDoc((current) => ({ ...current, [key]: value }));
  const updateBlock = (index: number, value: Block) => setDoc((current) => ({ ...current, blocks: current.blocks.map((block, position) => position === index ? value : block) }));
  const addBlock = (type: Block["type"]) => setDoc((current) => ({ ...current, blocks: [...current.blocks, type === "heading" ? { type, level: 2, text: "Subbab Baru" } : type === "paragraph" ? { type, text: "Tulis paragraf di sini." } : type === "list" ? { type, items: ["Poin baru"] } : type === "table" ? { type, caption: "Judul Tabel", rows: [["Kolom 1", "Kolom 2"], ["Data", "Data"]] } : { type }] }));
  const removeBlock = (index: number) => setDoc((current) => ({ ...current, blocks: current.blocks.filter((_, position) => position !== index) }));
  const moveBlock = (index: number, direction: -1 | 1) => setDoc((current) => {
    const next = [...current.blocks]; const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return { ...current, blocks: next };
  });
  const importXml = (source: string) => {
    try { setDoc((current) => readXml(source, current)); setNotice("XML berhasil diimpor. Periksa hasilnya pada Editor atau Preview A4."); setView("editor"); }
    catch (error) { setNotice(error instanceof Error ? error.message : "XML tidak dapat diimpor."); }
  };
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => importXml(String(reader.result || "")); reader.readAsText(file); event.target.value = "";
  };
  const headings: Record<View, [string, string]> = {
    import: ["Import XML & Style", "Masukkan struktur makalah, lalu atur identitas dan format halaman."], editor: ["Structured Editor", "Edit isi makalah tanpa perlu menulis kode XML secara manual."],
    preview: ["Preview A4", "Tinjau hasil akhir makalah sebelum dicetak atau disimpan sebagai PDF."], xml: ["XML Output", "Salin atau unduh XML hasil penyusunan makalah."],
  };
  return <div className={styles.studio}>
    <header className={styles.topbar}><div><span className={styles.kicker}>RIPITA · DOCUMENT ESSENTIALS</span><h2>{headings[view][0]}</h2><p>{headings[view][1]}</p></div><div className={styles.topActions}><button type="button" className={styles.button} onClick={() => downloadXml(xml)}>Export XML</button><button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => window.print()}>Print / PDF</button></div></header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}><div className={styles.brand}><span aria-hidden="true">✦</span><div><strong>Makalah Generator</strong><small>RIPITA Studio</small></div></div><p className={styles.sidebarLabel}>RUANG KERJA</p><nav aria-label="Tahap penyusunan makalah">{(["import", "editor", "preview", "xml"] as View[]).map((item, index) => <button key={item} type="button" className={view === item ? styles.active : ""} onClick={() => setView(item)}><b>{index + 1}</b>{headings[item][0]}</button>)}</nav><p className={styles.sidebarFoot}>Data makalah diproses di perangkatmu dan tidak disimpan ke server.</p></aside>
      <section className={styles.workspace}>
        {view === "import" && <><div className={styles.importGrid}><section className={styles.card}><h3>Unggah file XML</h3><p>Gunakan XML dari studio sebelumnya atau template yang sesuai struktur makalah.</p><div className={styles.dropzone} onClick={() => fileInput.current?.click()}><strong>Pilih file XML</strong><span>Klik untuk memilih file dari perangkatmu.</span><input ref={fileInput} type="file" accept=".xml,text/xml,application/xml" onChange={onFile} /></div><div className={styles.actions}><button className={styles.button} type="button" onClick={() => { setDoc(sample); setNotice("Contoh makalah dimuat."); setView("editor"); }}>Muat Contoh</button><button className={styles.button} type="button" onClick={() => { setDoc(sample); setPaste(""); setNotice("Dokumen direset ke contoh awal."); }}>Reset</button></div><p className={styles.notice}>{notice}</p></section><section className={styles.card}><h3>Paste XML</h3><p>Tempel struktur XML dari AI atau dokumen sebelumnya.</p><textarea value={paste} onChange={(event) => setPaste(event.target.value)} placeholder="Paste XML di sini..." /><div className={styles.actions}><button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => importXml(paste)}>Import XML dari teks</button><button className={styles.button} type="button" onClick={() => { try { readXml(paste, doc); setNotice("Struktur XML valid dan siap diimpor."); } catch (error) { setNotice(error instanceof Error ? error.message : "XML tidak valid."); } }}>Validasi XML</button></div></section></div><DocumentSettings doc={doc} update={update} /></>}
        {view === "editor" && <><div className={styles.editorActions}>{(["heading", "paragraph", "list", "table", "pagebreak"] as Block["type"][]).map((type) => <button className={styles.button} type="button" key={type} onClick={() => addBlock(type)}>+ {type === "heading" ? "Subbab" : type === "paragraph" ? "Paragraf" : type === "list" ? "Daftar" : type === "table" ? "Tabel" : "Page Break"}</button>)}</div><div className={styles.editor}>{doc.blocks.map((block, index) => <BlockEditor key={`${block.type}-${index}`} block={block} index={index} onChange={updateBlock} onRemove={removeBlock} onMove={moveBlock} />)}</div></>}
        {view === "preview" && <><div className={styles.previewActions}><button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => window.print()}>Print / Save PDF</button><button className={styles.button} type="button" onClick={() => setView("editor")}>Kembali ke Editor</button></div><PaperPreview doc={doc} /></>}
        {view === "xml" && <section className={styles.xmlCard}><div className={styles.actions}><button className={styles.button} type="button" onClick={() => navigator.clipboard?.writeText(xml).then(() => setNotice("XML disalin ke clipboard."))}>Copy XML</button><button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => downloadXml(xml)}>Download XML</button></div><textarea aria-label="XML output" readOnly value={xml} /></section>}
      </section>
    </div>
  </div>;
}

function DocumentSettings({ doc, update }: { doc: DocumentState; update: <K extends keyof DocumentState>(key: K, value: DocumentState[K]) => void }) {
  const logoInput = useRef<HTMLInputElement>(null);
  const metadataKeys = ["title", "subtitle", "course", "lecturer", "institution", "city", "year", "author", "studentId"] as const;
  const marginKeys = ["marginTop", "marginRight", "marginBottom", "marginLeft"] as const;
  const labels: Record<(typeof metadataKeys)[number] | (typeof marginKeys)[number], string> = {
    title: "Judul", subtitle: "Subjudul", course: "Mata kuliah", lecturer: "Dosen", institution: "Institusi", city: "Kota", year: "Tahun", author: "Nama mahasiswa", studentId: "NIM",
    marginTop: "Margin atas (mm)", marginRight: "Margin kanan (mm)", marginBottom: "Margin bawah (mm)", marginLeft: "Margin kiri (mm)",
  };
  const onLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => update("logoSrc", String(reader.result || ""));
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  return <section className={styles.settings} aria-label="Pengaturan dokumen dan halaman"><div className={styles.settingsHeading}><span>01B · PENGATURAN</span><h3>Dokumen & Halaman</h3><p>Atur identitas makalah dan format A4 sebelum masuk ke editor.</p></div><div className={styles.card}><h3>Metadata Makalah</h3><div className={styles.fieldGrid}>{metadataKeys.map((key) => <label key={key}>{labels[key]}<input value={doc[key]} onChange={(event) => update(key, event.target.value)} /></label>)}</div></div><div className={styles.card}><h3>Logo Institusi</h3><p className={styles.logoHelp}>Logo akan muncul pada cover makalah dan tersimpan bersama XML.</p><div className={styles.logoUpload}><div className={styles.logoPreview}>{doc.logoSrc ? <img src={doc.logoSrc} alt="Preview logo institusi" /> : <span>Belum ada logo</span>}</div><div><input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogoChange} className={styles.visuallyHidden} /><div className={styles.actions}><button className={styles.button} type="button" onClick={() => logoInput.current?.click()}>Pilih Logo</button><button className={styles.button} type="button" onClick={() => update("logoSrc", "")} disabled={!doc.logoSrc}>Hapus Logo</button></div><p className={styles.logoHelp}>Gunakan PNG, JPG, WebP, atau SVG. File diproses di browser.</p></div></div></div><div className={styles.card}><h3>Tipografi & Margin</h3><div className={styles.fieldGrid}><label>Ukuran teks<select value={doc.fontSize} onChange={(event) => update("fontSize", event.target.value)}><option value="11">11 pt</option><option value="12">12 pt</option><option value="13">13 pt</option></select></label><label>Spasi baris<select value={doc.lineHeight} onChange={(event) => update("lineHeight", event.target.value)}><option value="1.15">1.15</option><option value="1.5">1.5</option><option value="2">2.0</option></select></label>{marginKeys.map((key) => <label key={key}>{labels[key]}<input type="number" min="10" value={doc[key]} onChange={(event) => update(key, event.target.value)} /></label>)}</div></div></section>;
}

function BlockEditor({ block, index, onChange, onRemove, onMove }: { block: Block; index: number; onChange: (index: number, block: Block) => void; onRemove: (index: number) => void; onMove: (index: number, direction: -1 | 1) => void }) {
  const controls = <div className={styles.blockControls}><button type="button" onClick={() => onMove(index, -1)} aria-label="Naikkan blok">↑</button><button type="button" onClick={() => onMove(index, 1)} aria-label="Turunkan blok">↓</button><button type="button" onClick={() => onRemove(index)} aria-label="Hapus blok">×</button></div>;
  if (block.type === "heading") return <article className={styles.block}><div className={styles.blockTop}><span>HEADING {block.level}</span>{controls}</div><div className={styles.inlineFields}><select value={block.level} onChange={(event) => onChange(index, { ...block, level: Number(event.target.value) as 1 | 2 | 3 })}><option value="1">BAB</option><option value="2">Subbab</option><option value="3">Sub-subbab</option></select><label><input type="checkbox" checked={Boolean(block.breakBefore)} onChange={(event) => onChange(index, { ...block, breakBefore: event.target.checked })} /> Halaman baru</label></div><input value={block.text} onChange={(event) => onChange(index, { ...block, text: event.target.value })} /></article>;
  if (block.type === "paragraph") return <article className={styles.block}><div className={styles.blockTop}><span>PARAGRAF</span>{controls}</div><textarea value={block.text} onChange={(event) => onChange(index, { ...block, text: event.target.value })} /></article>;
  if (block.type === "list") return <article className={styles.block}><div className={styles.blockTop}><span>DAFTAR</span>{controls}</div>{block.items.map((item, itemIndex) => <div className={styles.listRow} key={itemIndex}><span>•</span><input value={item} onChange={(event) => onChange(index, { ...block, items: block.items.map((current, position) => position === itemIndex ? event.target.value : current) })} /><button type="button" onClick={() => onChange(index, { ...block, items: block.items.filter((_, position) => position !== itemIndex) })}>×</button></div>)}<button className={styles.textButton} type="button" onClick={() => onChange(index, { ...block, items: [...block.items, "Poin baru"] })}>+ Tambah poin</button></article>;
  if (block.type === "table") return <article className={styles.block}><div className={styles.blockTop}><span>TABEL</span>{controls}</div><input value={block.caption} onChange={(event) => onChange(index, { ...block, caption: event.target.value })} aria-label="Judul tabel" /><div className={styles.tableEditor}>{block.rows.map((row, rowIndex) => <div key={rowIndex}>{row.map((cell, cellIndex) => <input key={cellIndex} value={cell} onChange={(event) => onChange(index, { ...block, rows: block.rows.map((existing, position) => position === rowIndex ? existing.map((value, cellPosition) => cellPosition === cellIndex ? event.target.value : value) : existing) })} />)}</div>)}</div><button className={styles.textButton} type="button" onClick={() => onChange(index, { ...block, rows: [...block.rows, block.rows[0]?.map(() => "Data") || ["Data"]] })}>+ Tambah baris</button></article>;
  return <article className={`${styles.block} ${styles.pageBreak}`}><div className={styles.blockTop}><span>PAGE BREAK</span>{controls}</div><p>Halaman berikutnya dimulai setelah blok ini.</p></article>;
}

function PaperPreview({ doc }: { doc: DocumentState }) {
  const paperStyle = { "--paper-font-size": `${doc.fontSize}pt`, "--paper-line-height": doc.lineHeight, "--paper-top": `${doc.marginTop}mm`, "--paper-right": `${doc.marginRight}mm`, "--paper-bottom": `${doc.marginBottom}mm`, "--paper-left": `${doc.marginLeft}mm` } as React.CSSProperties;
  return <article className={styles.paper} style={paperStyle}><section className={styles.cover}>{doc.logoSrc ? <img className={styles.coverLogo} src={doc.logoSrc} alt={`Logo ${doc.institution}`} /> : <span>PUSPITA × RIPITA</span>}<h1>{doc.title}</h1><p>{doc.subtitle}</p><div><b>{doc.author}</b><small>{doc.studentId}</small><small>{doc.course}</small><small>{doc.lecturer}</small></div><footer>{doc.institution}<br />{doc.city} · {doc.year}</footer></section><section className={styles.paperContent}>{doc.blocks.map((block, index) => {
    if (block.type === "heading") { const Tag = `h${block.level}` as "h1" | "h2" | "h3"; return <Tag key={index} className={block.breakBefore ? styles.pageStart : ""}>{block.text}</Tag>; }
    if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
    if (block.type === "list") return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>;
    if (block.type === "table") return <figure key={index}><figcaption>{block.caption}</figcaption><table><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => rowIndex === 0 ? <th key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></figure>;
    return <div key={index} className={styles.manualBreak} />;
  })}</section></article>;
}
