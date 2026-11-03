"use client";
import { useEffect, useRef, useState } from "react";
import { COMPONENTS, DOCUMENT_TYPES, KINDS, MONTHS, OBJECT_OPTIONS, PTKP } from "@/modules/payroll/studio/catalog.js";
import { createEngine, rupi } from "@/modules/payroll/studio/engine.js";
import { adaptEntry, checkBackup, componentsFor, copySalary, dateFor, demo, entryDefault, fresh, nextId, recipientDefault } from "@/modules/payroll/studio/data";
import { exportCSV, importCSV } from "@/modules/payroll/studio/csv";
import { importPayrollWorkbook } from "@/modules/payroll/studio/xlsx";
import type { Entry, Recipient, Studio } from "@/modules/payroll/studio/model";
import { Drawer, Field, Table, type Options } from "./pph21-studio-parts";
import styles from "./pph21-payroll-studio.module.css";
import { Pph21DocumentWorkspace } from "./pph21-document-workspace";
const TABS = ["Penerima", "Penghasilan", "Perhitungan", "Slip & XML"];
const months = MONTHS.map((m, i) => [String(i + 1), m] as [
    string,
    string
]);
const yesNo: [
    string,
    string
][] = [["No", "Tidak"], ["Yes", "Ya — perlu review"]];
function recipientLabel(r: Recipient) { return `${r.employeeId || r.id} · ${r.name || "Tanpa nama"}`; }
function download(name: string, content: string | Blob, mime = "application/json") { const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type: mime })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 3000); }
function ToolbarIcon({ name }: { name: "download" | "upload" | "database" | "settings-2" }) {
    const paths = {
        download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></>,
        upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></>,
        database: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></>,
        "settings-2": <><path d="M20 7h-9"/><path d="M14 17H3"/><circle cx="17" cy="7" r="3"/><circle cx="6" cy="17" r="3"/></>,
    } as const;
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
export function Pph21PayrollStudio() {
    const [state, setState] = useState<Studio>(fresh), [ready, setReady] = useState(false), [tab, setTab] = useState(0), [notice, setNotice] = useState("");
    const [settings, setSettings] = useState(false), [filter, setFilter] = useState("period"), [personFilter, setPersonFilter] = useState(""), [chosenCalc, setChosenCalc] = useState(""), [logo, setLogo] = useState(""), [payrollDragging, setPayrollDragging] = useState(false);
    const [drawer, setDrawer] = useState<{
        mode: "recipient" | "entry";
        id: string;
    } | null>(null), [importErrors, setImportErrors] = useState<string[]>([]);
    const restoreRef = useRef<HTMLInputElement>(null), csvRef = useRef<HTMLInputElement>(null), payrollRef = useRef<HTMLInputElement>(null), logoRef = useRef<HTMLInputElement>(null);
    useEffect(() => { let active = true; queueMicrotask(() => { if (!active)
        return;
        localStorage.removeItem("ripitax-payroll-v1");
        setReady(true); }); return () => { active = false; }; }, []);
    const [documentSession, setDocumentSession] = useState(0);
    function replace(next: Studio, resetDocuments = false) { setState(next); if (resetDocuments) setDocumentSession(n => n + 1); }
    function mutate(fn: (s: Studio) => void) { const next = structuredClone(state); fn(next); replace(next); }
    const engine = createEngine(state), docs = engine.documentsForPeriod();
    const summaries = state.recipients.map(r => ({ r, ...engine.taxMonthSummary(r, state.company.month) }));
    const totals = summaries.reduce((a, s) => ({ gross: a.gross + s.gross, tax: a.tax + s.tax, net: a.net + s.netCash }), { gross: 0, tax: 0, net: 0 });
    const currentCalc = state.recipients.find(r => r.id === chosenCalc) || state.recipients[0];
    const detailPerson = drawer?.mode === "recipient" ? state.recipients.find(r => r.id === drawer.id) : null, detailEntry = drawer?.mode === "entry" ? state.entries.find(e => e.id === drawer.id) : null;
    function updateRecipient(id: string, key: keyof Recipient, value: string | number | boolean) { mutate(s => { const r = s.recipients.find(r => r.id === id)!; Object.assign(r, { [key]: ["startMonth", "endMonth"].includes(key) ? Math.max(1, Math.min(12, Number(value))) : value }); if (key === "startMonth" && r.startMonth > r.endMonth)
        r.endMonth = r.startMonth; if (key === "endMonth" && r.endMonth < r.startMonth)
        r.startMonth = r.endMonth; if (key === "kind") {
        r.taxObject = "";
        s.entries.filter(e => e.recipientId === id).forEach(e => adaptEntry(e, s));
    } if (key === "residency")
        r.taxObject = ""; }); }
    function updateEntry(id: string, key: keyof Entry, value: string | number | boolean) { mutate(s => { const e = s.entries.find(e => e.id === id)!; Object.assign(e, { [key]: ["month", "days"].includes(key) ? Math.max(1, Math.floor(Number(value))) : value }); if (key === "recipientId")
        adaptEntry(e, s); }); }
    function rf(r: Recipient, key: keyof Recipient, label: string, options?: Options, type = "text", compact = false) { return <Field key={key} label={label} value={r[key]} options={options} type={type} compact={compact} onChange={v => updateRecipient(r.id, key, v)}/>; }
    function ef(e: Entry, key: keyof Entry, label: string, options?: Options, type = "text", compact = false) { return <Field key={key} label={label} value={e[key]} options={options} type={type} compact={compact} onChange={v => updateEntry(e.id, key, v)}/>; }
    function confirmReplace(message: string) { return !(state.recipients.length || state.entries.length || state.company.name || state.company.tin) || window.confirm(message); }
    function company(key: keyof Studio["company"], value: string | number | boolean) {
        if (key === "year" && (state.entries.length || state.recipients.length) && !window.confirm("Mengubah tahun memberi tahun baru pada seluruh data workspace ini. Backup dahulu. Lanjutkan?"))
            return;
        mutate(s => { const old = dateFor(s.company.year, s.company.month); Object.assign(s.company, { [key]: ["year", "month"].includes(key) ? Number(value) : value }); if (["year", "month"].includes(key) && s.company.withholdingDate === old)
            s.company.withholdingDate = dateFor(s.company.year, s.company.month); });
    }
    async function restore(file?: File) { if (!file)
        return; try {
        const v: unknown = JSON.parse(await file.text());
        checkBackup(v);
        if (!confirmReplace("Restore mengganti seluruh data v2. Sudah backup dan lanjutkan?"))
            return;
        replace(v, true);
        setDrawer(null);
        setImportErrors([]);
        setNotice("Backup v2 berhasil dipulihkan.");
    }
    catch (e) {
        setNotice("Restore gagal: " + (e instanceof Error ? e.message : "Berkas tidak valid."));
    } }
    async function csv(file?: File) { if (!file)
        return; try {
        const next = structuredClone(state), result = importCSV(next, await file.text());
        replace(next);
        setImportErrors(result.errors);
        setNotice(`${result.count} baris diimpor; ${result.duplicates} duplikat dilewati; ${result.errors.length} ditolak.`);
    }
    catch (e) {
        setNotice(e instanceof Error ? e.message : "CSV tidak dapat dibaca.");
    } }
    async function payroll(file?: File) { if (!file)
        return; if (!file.name.toLowerCase().endsWith(".xlsx")) {
        setNotice("Gunakan file .xlsx dari Template payroll.");
        return;
    } try {
        const imported = await importPayrollWorkbook(file);
        if (!confirmReplace("Impor Template payroll mengganti seluruh data sesi ini. Lanjutkan?"))
            return;
        replace(imported.studio, true);
        setDrawer(null);
        setImportErrors(imported.errors);
        setNotice(imported.recipients + " penerima dan " + imported.entries + " komponen diimpor; " + imported.errors.length + " baris ditolak.");
    }
    catch (e) {
        setNotice("Impor Template payroll gagal: " + (e instanceof Error ? e.message : "berkas tidak valid."));
    } }
    function uploadLogo(file?: File) { if (!file)
        return; if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        setNotice("Logo harus berupa PNG, JPG, atau WEBP.");
        return;
    } if (file.size > 800000) {
        setNotice("Ukuran logo maksimal 800 KB.");
        return;
    } const reader = new FileReader();
    reader.onload = () => { setLogo(String(reader.result || "")); setNotice("Logo perusahaan siap dipakai pada slip sesi ini."); };
    reader.onerror = () => setNotice("Logo tidak dapat dibaca.");
    reader.readAsDataURL(file); }
    function tku(id?: string) { const tin = id ? engine.person(id)?.tin : state.company.tin; if (!/^\d{16}$/.test(tin || "")) {
        setNotice("Isi NIK/NPWP 16 digit dahulu.");
        return;
    } if (id)
        updateRecipient(id, "tku", tin + "000000");
    else
        company("tku", tin + "000000"); setNotice("Usulan ID TKU diisi. Cocokkan dengan Coretax."); }
    function remove(id: string, recipient: boolean) { if (!window.confirm(recipient ? "Hapus penerima beserta seluruh penghasilannya?" : "Hapus baris penghasilan ini?"))
        return; mutate(s => { if (recipient) {
        s.recipients = s.recipients.filter(r => r.id !== id);
        s.entries = s.entries.filter(e => e.recipientId !== id);
    }
    else
        s.entries = s.entries.filter(e => e.id !== id); }); }
    function duplicate(id: string, recipient: boolean) { mutate(s => { if (recipient) {
        const r = s.recipients.find(r => r.id === id)!;
        const newId = nextId(s, "P");
        s.recipients.push({ ...r, id: newId, employeeId: newId, name: r.name + " (salinan)", tin: "", tku: "", foreignTin: "", annualComplete: false });
    }
    else
        s.entries.push({ ...s.entries.find(e => e.id === id)!, id: nextId(s, "T") }); }); }
    function repair(id: string, message: string) {
        if (engine.companyErrors().includes(message)) {
            const label = message.includes("NPWP") ? "NPWP 16 digit pemotong" : message.includes("TKU") ? "ID TKU pemotong (22 digit)" : message.includes("Tahun pajak") ? "Tahun pajak" : "Tanggal pemotongan";
            document.querySelector<HTMLElement>(`[aria-label="${label}"]`)?.focus();
            setNotice(message);
            return;
        }
        const doc = docs.find(d => d.recipientId === id && d.errors.includes(message));
        if (doc?.entry && !engine.personError(engine.person(id)!, doc.type).includes(message)) {
            setTab(1);
            setDrawer({ mode: "entry", id: doc.entry.id });
        }
        else {
            setTab(0);
            setDrawer({ mode: "recipient", id });
        }
    }
    const filtered = state.entries.filter(e => (filter === "all" || e.month === state.company.month) && (!personFilter || e.recipientId === personFilter));
    if (!ready)
        return <div className={styles.studio}>Memuat ruang kerja lokal…</div>;
    return <div className={styles.studio}>
  <header className={styles.topbar}><div><span className={styles.eyebrow}>RIPITAX · STUDIO V2</span><h2>Satu ruang untuk payroll-mu.</h2><p>Penerima, penghasilan, perhitungan, sampai dokumen.</p><span className={styles.localBadge}>● Data hanya ada selama sesi ini</span></div><div className={styles.toolbar} role="group" aria-label="Aksi data RIPITAX"><button type="button" className={styles.iconButton} aria-label="Backup JSON" title="Backup JSON" data-tooltip="Backup JSON" onClick={() => download(`RIPITAX_BACKUP_${state.company.year}.json`, JSON.stringify(state, null, 2))}><ToolbarIcon name="download"/></button><button type="button" className={styles.iconButton} aria-label="Restore JSON" title="Restore JSON" data-tooltip="Restore JSON" onClick={() => restoreRef.current?.click()}><ToolbarIcon name="upload"/></button><button type="button" className={styles.iconButton} aria-label="Muat contoh" title="Muat contoh" data-tooltip="Muat contoh" onClick={() => { if (confirmReplace("Muat contoh mengganti seluruh data sesi ini. Lanjutkan?")) {
        replace(demo(), true);
        setDrawer(null);
        setNotice("");
    } }}><ToolbarIcon name="database"/></button><button type="button" className={styles.iconButton} aria-label="Pengaturan" title="Pengaturan" data-tooltip="Pengaturan" aria-expanded={settings} onClick={() => setSettings(!settings)}><ToolbarIcon name="settings-2"/></button></div></header>
  <input hidden ref={restoreRef} type="file" accept=".json,application/json" onChange={e => { void restore(e.target.files?.[0]); e.target.value = ""; }}/><input hidden ref={csvRef} type="file" accept=".csv,text/csv" onChange={e => { void csv(e.target.files?.[0]); e.target.value = ""; }}/><input hidden ref={payrollRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e => { void payroll(e.target.files?.[0]); e.target.value = ""; }}/><input hidden ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { uploadLogo(e.target.files?.[0]); e.target.value = ""; }}/>
  {notice && <p className={styles.notice} role="status">{notice}</p>}
  <section className={styles.config} aria-label="Perusahaan dan masa pajak">{([["name", "Pemotong / Perusahaan"], ["tin", "NPWP 16 digit pemotong"], ["tku", "ID TKU pemotong (22 digit)"]] as const).map(([k, l]) => <Field key={k} label={l} value={state.company[k]} onChange={v => company(k, v)}/>)}<Field label="Tahun pajak" value={state.company.year} options={["2024", "2025", "2026", "2027", "2028"]} onChange={v => company("year", v)}/><Field label="Masa pajak" value={state.company.month} options={months} onChange={v => company("month", v)}/><Field label="Tanggal pemotongan" type="date" value={state.company.withholdingDate} onChange={v => company("withholdingDate", v)}/><section className={styles.payrollTools} aria-label="RIPITAX PAYROLL"><div><span className={styles.eyebrow}>RIPITAX PAYROLL</span><h3>Template payroll</h3><p>Unduh format kerja, isi datanya, lalu impor kembali ke studio.</p><a className={styles.templateDownload} href="/tools/payroll/RIPITAX_PAYROLL.xlsx" download="RIPITAX_PAYROLL.xlsx">Unduh RIPITAX PAYROLL</a></div><button type="button" className={[styles.payrollDropzone, payrollDragging && styles.payrollDropzoneActive].filter(Boolean).join(" ")} onClick={() => payrollRef.current?.click()} onDragOver={e => { e.preventDefault(); setPayrollDragging(true); }} onDragLeave={() => setPayrollDragging(false)} onDrop={e => { e.preventDefault(); setPayrollDragging(false); void payroll(e.dataTransfer.files?.[0]); }}><strong>Seret Template payroll ke sini</strong><span>atau klik untuk memilih file .xlsx</span></button><div className={styles.logoUpload}><div className={styles.logoPreview}>{logo ? <img src={logo} alt="Logo perusahaan"/> : <span>LOGO<br/>PERUSAHAAN</span>}</div><div><strong>Logo perusahaan</strong><p>PNG, JPG, atau WEBP · maks. 800 KB · hanya sesi ini.</p><button type="button" onClick={() => logoRef.current?.click()}>Unggah logo</button>{logo && <button type="button" className={styles.logoRemove} onClick={() => setLogo("")}>Hapus</button>}</div></div></section></section>
  {settings && <section className={styles.card}><h3>Pengaturan sesi</h3><p className={styles.help}>Data tidak disimpan di browser dan hilang saat halaman dimuat ulang. Gunakan Backup JSON untuk memindahkan data; CSV hanya berisi penghasilan dan memerlukan penerima terlebih dahulu.</p><div className={styles.actions}><button onClick={() => tku()}>Usulkan ID TKU dari NPWP</button><button onClick={() => download("RIPITAX_penghasilan.csv", exportCSV(state), "text/csv;charset=utf-8")}>Unduh CSV penghasilan</button><button onClick={() => csvRef.current?.click()}>Impor CSV penghasilan</button></div><p className={styles.help}>PP 58/2023 · PMK 168/2023. Gross-up otomatis, fasilitas khusus, dan kondisi disetahunkan memerlukan review. <a href="https://www.pajak.go.id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml" target="_blank" rel="noreferrer">Referensi template XML DJP ↗</a></p></section>}
  {importErrors.length > 0 && <details className={styles.warning}><summary>{importErrors.length} baris CSV ditolak</summary>{importErrors.map((e, i) => <p key={i}>{e}</p>)}</details>}
  <div className={styles.tabs} role="tablist" aria-label="Tahap payroll">{TABS.map((t, i) => <button key={t} id={"studio-tab-" + i} role="tab" aria-selected={tab === i} aria-controls={"studio-panel-" + i} tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)} onKeyDown={e => { let n = i; if (e.key === "ArrowRight")
        n = (i + 1) % 4;
    else if (e.key === "ArrowLeft")
        n = (i + 3) % 4;
    else if (e.key === "Home")
        n = 0;
    else if (e.key === "End")
        n = 3;
    else
        return; e.preventDefault(); setTab(n); document.getElementById("studio-tab-" + n)?.focus(); }}><span>0{i + 1}</span>{t}</button>)}</div>
  <section className={styles.kpis}>{[["Bruto pajak", rupi(totals.gross)], ["PPh 21/26", rupi(totals.tax)], ["Bersih dibayarkan", rupi(totals.net)], ["Penerima", String(state.recipients.length)]].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</section>
  <section role="tabpanel" id={"studio-panel-" + tab} aria-labelledby={"studio-tab-" + tab} className={styles.workspace}>
  {tab === 0 && <section className={styles.card}><div className={styles.sectionHead}><div><h3>Daftar penerima penghasilan</h3><p>Satu orang, satu baris. Lengkapi informasi lanjutan melalui Detail.</p></div><button className={styles.primary} onClick={() => mutate(s => s.recipients.push(recipientDefault(s)))}>+ Tambah penerima</button></div><Table head={["ID pegawai", "Nama", "NIK / NPWP / TIN", "Jenis penerima", "Subjek", "PTKP", "Sektor", "Mulai", "Akhir", "Tujuan XML", "Aksi"]} compact autoFitColumns={[{ min: 120, max: 260 }, { min: 200, max: 420 }, { min: 200, max: 320 }, { min: 230, max: 340 }, { min: 110, max: 180 }, { min: 90, max: 140 }, { min: 130, max: 200 }, { min: 130, max: 180 }, { min: 130, max: 180 }, { min: 100, max: 180 }, { min: 190, max: 260 }]} empty={!state.recipients.length ? "Belum ada penerima. Tambahkan penerima atau muat contoh." : undefined}>{state.recipients.map(r => <tr key={r.id}><td>{rf(r, "employeeId", "ID pegawai", undefined, "text", true)}</td><td>{rf(r, "name", "Nama penerima", undefined, "text", true)}</td><td>{rf(r, r.residency === "SPLN" ? "foreignTin" : "tin", "NIK / NPWP / TIN", undefined, "text", true)}</td><td>{rf(r, "kind", "Jenis penerima", KINDS, "text", true)}</td><td>{rf(r, "residency", "Subjek pajak", ["SPDN", "SPLN"], "text", true)}</td><td>{rf(r, "ptkp", "PTKP", PTKP, "text", true)}</td><td>{rf(r, "sector", "Sektor", [["private", "Swasta"], ["government", "Pemerintah"]], "text", true)}</td><td>{rf(r, "startMonth", "Mulai", months, "text", true)}</td><td>{rf(r, "endMonth", "Akhir", months, "text", true)}</td><td><span className={styles.badge}>{engine.documentKind(r, state.company.month)}</span></td><td><div className={styles.rowActions}><button onClick={() => setDrawer({ mode: "recipient", id: r.id })}>Detail</button><button onClick={() => duplicate(r.id, true)}>Salin</button><button className={styles.danger} onClick={() => remove(r.id, true)}>Hapus</button></div></td></tr>)}</Table></section>}
  {tab === 1 && <section className={styles.card}><div className={styles.sectionHead}><div><h3>Penghasilan & potongan</h3><p>Satu baris untuk satu komponen payroll atau pembayaran jasa.</p></div><div className={styles.actions}><button className={styles.primary} onClick={() => { if (!state.recipients.length) {
        setNotice("Tambahkan penerima dahulu.");
        return;
    } mutate(s => { const e = entryDefault(s, personFilter || s.recipients[0].id); adaptEntry(e, s); s.entries.push(e); }); }}>+ Tambah baris</button><button onClick={() => { try {
        const s = structuredClone(state), eligible = s.recipients.filter(r => engine.isPayroll(r)), id = personFilter || (eligible.length === 1 ? eligible[0].id : ""), count = copySalary(s, id);
        replace(s);
        setFilter("all");
        setNotice(count + " baris gaji ditambahkan; bulan yang terisi tidak ditimpa.");
    }
    catch (e) {
        setNotice((e as Error).message);
    } }}>Salin gaji ke bulan aktif lain</button></div></div><div className={styles.filters}><Field label="Lihat baris" value={filter} options={[["period", "Masa terpilih"], ["all", "Seluruh tahun"]]} onChange={v => setFilter(String(v))}/><Field label="Filter penerima" value={personFilter} options={[["", "Semua penerima"], ...state.recipients.map(r => [r.id, recipientLabel(r)] as [
            string,
            string
        ])]} onChange={v => setPersonFilter(String(v))}/></div><Table head={["Penerima", "Bulan", "Komponen", "Nominal (Rp)", "Keterangan", "Perlakuan", "Aksi"]} empty={!filtered.length ? "Belum ada penghasilan pada filter ini." : undefined}>{filtered.map(e => <tr key={e.id}><td>{ef(e, "recipientId", "Penerima", state.recipients.map(r => [r.id, recipientLabel(r)]), "text", true)}</td><td>{ef(e, "month", "Bulan", months, "text", true)}</td><td>{ef(e, "comp", "Komponen", componentsFor(engine.person(e.recipientId)?.kind || "fixed").map(k => [k, COMPONENTS[k as keyof typeof COMPONENTS].label]), "text", true)}</td><td>{ef(e, "amount", "Nominal (Rp)", undefined, "number", true)}</td><td>{ef(e, "description", "Keterangan", undefined, "text", true)}</td><td>{COMPONENTS[e.comp as keyof typeof COMPONENTS]?.tax ? "Bruto pajak" : "Potongan"}{COMPONENTS[e.comp as keyof typeof COMPONENTS]?.cash === 0 ? " · Non-tunai" : ""}</td><td><div className={styles.rowActions}><button onClick={() => setDrawer({ mode: "entry", id: e.id })}>Detail</button><button onClick={() => duplicate(e.id, false)}>Salin</button><button className={styles.danger} onClick={() => remove(e.id, false)}>Hapus</button></div></td></tr>)}</Table></section>}
  {tab === 2 && <><section className={styles.card}><div className={styles.sectionHead}><div><h3>Hasil perhitungan masa pajak</h3><p>Otomatis mengikuti data. Buka Rincian untuk menelusuri formula.</p></div><button onClick={() => setNotice("Perhitungan diperbarui dari data aktif.")}>Hitung ulang</button></div><Table head={["Penerima", "Kategori", "Bruto pajak", "Penghasilan tunai", "Metode", "PPh 21/26", "Bersih dibayarkan", "Validasi", "Aksi"]} empty={!summaries.length ? "Belum ada penerima untuk dihitung." : undefined}>{summaries.map(s => { const errors = docs.filter(d => d.recipientId === s.r.id).flatMap(d => d.errors); return <tr key={s.r.id}><td>{recipientLabel(s.r)}</td><td>{KINDS[s.r.kind as keyof typeof KINDS]}</td><td>{rupi(s.gross)}</td><td>{rupi(s.cash)}</td><td>{[...new Set(s.rows.map(r => r.method))].join("; ") || "—"}</td><td>{rupi(s.tax)}</td><td><strong>{rupi(s.netCash)}</strong></td><td>{errors.length ? errors.length + " masalah" : s.rows.length ? "OK" : "Belum ada hasil"}</td><td><button onClick={() => setChosenCalc(s.r.id)}>Rincian</button></td></tr>; })}</Table></section><div className={styles.twoCol}><section className={styles.card}><h3>Jejak perhitungan</h3><p className={styles.help}>{currentCalc ? recipientLabel(currentCalc) : ""}</p><div className={styles.trace}>{currentCalc ? engine.monthResults(currentCalc, state.company.month).map((r, i) => <div key={i}><strong>{r.method}</strong>{r.trace.map((t, j) => <p key={j}>{t}</p>)}{r.issues.map(t => <p className={styles.warning} key={t}>{t}</p>)}</div>) : "Pilih penerima untuk melihat cara hitung."}</div></section><section className={styles.card}><h3>Ringkasan & kontrol</h3><p className={styles.help}>Perhitungan masa terakhir membutuhkan seluruh penghasilan sejak masa awal. Konfirmasikan riwayat melalui Detail Penerima sebelum ekspor A1/A2.</p><dl className={styles.summary}>{[["Bruto pajak", totals.gross], ["PPh 21/26", totals.tax], ["Bersih dibayarkan", totals.net]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{rupi(Number(v))}</dd></div>)}</dl></section></div></>}
  <Pph21DocumentWorkspace key={documentSession} state={state} logo={logo} visible={tab === 3} repair={repair}/>
  </section><p className={styles.footnote}>RIPITAX · Data tidak disimpan dan hilang saat halaman dimuat ulang · Tidak terhubung ke Coretax</p>
  {drawer && <Drawer title={drawer.mode === "recipient" ? "Detail penerima" : "Detail penghasilan"} onClose={() => setDrawer(null)}>
   {detailPerson && <><div className={styles.detailGrid}>
    {rf(detailPerson, "employeeId", "ID pegawai")}{rf(detailPerson, "name", "Nama penerima")}{rf(detailPerson, detailPerson.residency === "SPLN" ? "foreignTin" : "tin", "NIK / NPWP / TIN")}{rf(detailPerson, "position", "Jabatan / posisi")}{rf(detailPerson, "citizenship", "Kewarganegaraan", [["Resident", "WNI"], ["Foreign", "WNA"]])}
    {rf(detailPerson, "facility", "Fasilitas pajak", [["N/A", "Tidak ada"], ["DTP", "Ditanggung pemerintah"], ["ETC", "Fasilitas lain"], ["COD", "SKD / Treaty"], ["TaxExAr21", "Pengecualian Pasal 21"]])}
    {rf(detailPerson, "taxObject", "Kode objek pajak", [["", "Otomatis"], ...(detailPerson.residency === "SPLN" ? [["27-100-99", "PPh 26 — jasa / kegiatan"]] : OBJECT_OPTIONS[detailPerson.kind as keyof typeof OBJECT_OPTIONS] || [])] as [
                string,
                string
            ][])}
    {rf(detailPerson, "tku", "ID TKU penerima (BP21)")}<button onClick={() => tku(detailPerson.id)}>Usulkan ID TKU dari NPWP</button>
    {rf(detailPerson, "subject", "Status kewajiban subjektif", [["existing", "Sudah SPDN sejak awal tahun"], ["changed", "Dimulai / berakhir tahun berjalan"]])}
    {rf(detailPerson, "whStatus", "Status perhitungan tahunan", [["auto", "Otomatis"], ["FullYear", "FullYear"], ["PartialYear", "PartialYear"], ["Annualized", "Annualized — review manual"]])}
    {rf(detailPerson, "grossUp", "Opsi gross-up", yesNo)}{rf(detailPerson, "workForSecondEmployer", "Pemberi kerja berikutnya", yesNo)}{rf(detailPerson, "previousSlip", "Nomor bukti potong sebelumnya")}
    {rf(detailPerson, "annualComplete", "Riwayat penghasilan selama masa kerja sudah diperiksa lengkap", undefined, "checkbox")}
    {([["nip", "NIP / NRP (A2)"], ["rank", "Pangkat / golongan (A2)"], ["passport", "Paspor"], ["kitas", "KITAS"], ["foreignTin", "TIN luar negeri"], ["receiptNo", "Nomor SKD WPLN"], ["country", "Kode negara ISO-3"], ["dob", "Tanggal lahir"], ["birthCity", "Tempat lahir"], ["address", "Alamat luar negeri"], ["note", "Catatan"]] as const).map(([k, l]) => rf(detailPerson, k, l, undefined, k === "dob" ? "date" : "text"))}
   </div><p className={styles.help}>Gross-up otomatis belum tersedia. Opsi khusus memerlukan review.</p><button className={styles.primary} onClick={() => { setChosenCalc(detailPerson.id); setTab(2); setDrawer(null); }}>Lihat perhitungan</button></>}
   {detailEntry && <div className={styles.detailGrid}>{ef(detailEntry, "documentType", "Jenis dokumen referensi", DOCUMENT_TYPES)}{ef(detailEntry, "documentNo", "Nomor dokumen referensi")}{ef(detailEntry, "documentDate", "Tanggal dokumen referensi", undefined, "date")}{ef(detailEntry, "withholdingDate", "Tanggal pemotongan (kosong = default)", undefined, "date")}{ef(detailEntry, "days", "Jumlah hari upah", undefined, "number")}{ef(detailEntry, "equalDaily", "Upah sama setiap hari", undefined, "checkbox")}{ef(detailEntry, "excludedLabor", "Upah pihak ketiga yang dikecualikan", undefined, "number")}{ef(detailEntry, "excludedMaterial", "Material yang dikecualikan", undefined, "number")}{ef(detailEntry, "proof", "Ada kontrak dan bukti biaya", undefined, "checkbox")}{ef(detailEntry, "description", "Keterangan")}<p className={styles.help}>Transaksi dengan pengecualian biaya memerlukan review pemetaan XML.</p></div>}
  </Drawer>}
 </div>;
}
