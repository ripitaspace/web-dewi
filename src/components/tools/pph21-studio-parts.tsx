"use client";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createEngine, rupi } from "@/modules/payroll/studio/engine.js";
import { COMPONENTS, KINDS, MONTHS } from "@/modules/payroll/studio/catalog.js";
import type { Recipient, Studio } from "@/modules/payroll/studio/model";
import { autoFitTableColumns, type AutoFitColumn } from "./auto-fit-table-columns";
import styles from "./pph21-payroll-studio.module.css";
export type Options = readonly string[] | Record<string, string> | readonly (readonly string[])[];
export function Field({ label, value, onChange, options, type = "text", compact = false }: {
    label: string;
    value: string | number | boolean;
    onChange: (v: string | number | boolean) => void;
    options?: Options;
    type?: string;
    compact?: boolean;
}) {
    const opts = options ? (Array.isArray(options) ? options.map(o => typeof o === "string" ? [o, o] : o) : Object.entries(options)) : null;
    const selectedLabel = opts?.find(([optionValue]) => optionValue === String(value))?.[1] || String(value);
    const input = opts ? <select aria-label={label} title={selectedLabel} value={String(value)} onChange={e => onChange(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select> : type === "checkbox" ? <input aria-label={label} type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}/> : <input aria-label={label} title={String(value)} type={type} value={typeof value === "boolean" ? "" : value} min={type === "number" ? 0 : undefined} step={type === "number" ? "any" : undefined} onChange={e => onChange(type === "number" ? Math.max(0, Number(e.target.value) || 0) : e.target.value)}/>;
    return <label className={compact ? styles.cellField : styles.field}>{!compact && <span>{label}</span>}{input}</label>;
}
export function Table({ head, children, empty, compact, autoFitColumns }: {
    head: string[];
    children: ReactNode;
    empty?: string;
    compact?: boolean;
    autoFitColumns?: readonly AutoFitColumn[];
}) {
    const tableRef = useRef<HTMLTableElement>(null);
    useLayoutEffect(() => {
        if (!autoFitColumns || !tableRef.current) return;
        const frame = requestAnimationFrame(() => { if (tableRef.current) autoFitTableColumns(tableRef.current); });
        return () => cancelAnimationFrame(frame);
    });
    return <div className={styles.tableScroll}><table ref={tableRef} className={compact ? styles.compactTable : undefined}><colgroup>{autoFitColumns?.map((column, index) => <col key={head[index]} data-autofit-min={column.min} data-autofit-max={column.max}/>)}</colgroup><thead><tr>{head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{empty ? <tr><td colSpan={head.length}><div className={styles.empty}>{empty}</div></td></tr> : children}</tbody></table></div>;
}
export function Drawer({ title, children, onClose }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const trigger = document.activeElement as HTMLElement | null; const dialog = ref.current; const overflow = document.body.style.overflow; dialog?.showModal(); document.body.style.overflow = "hidden"; return () => { dialog?.close(); document.body.style.overflow = overflow; trigger?.focus(); }; }, []);
    return createPortal(<dialog ref={ref} className={styles.drawer} aria-labelledby="studio-detail-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right)
            onClose();
    } }}><header><div><span className={styles.eyebrow}>RIPITAX · DETAIL</span><h2 id="studio-detail-title">{title}</h2></div><button type="button" onClick={onClose} aria-label="Tutup detail">✕</button></header><div className={styles.detailBody}>{children}</div><footer><button type="button" onClick={onClose}>Selesai</button></footer></dialog>, document.body);
}
export function Slip({ state, recipient, logo }: {
    state: Studio;
    recipient: Recipient;
    logo?: string;
}) {
    const engine = createEngine(state), m = state.company.month, result = engine.taxMonthSummary(recipient, m), parts = engine.periodParts(recipient, m);
    const earnings = Object.entries(parts.parts).filter(([key, value]) => value > 0 && COMPONENTS[key as keyof typeof COMPONENTS]?.cash !== -1);
    const deductions = Object.entries(parts.parts).filter(([key, value]) => value > 0 && COMPONENTS[key as keyof typeof COMPONENTS]?.cash === -1);
    const title = engine.isPayroll(recipient) ? "Slip Gaji" : "Rincian Pembayaran";
    const identifier = recipient.residency === "SPLN" ? "TIN" : "NIK / NPWP";
    const documentNo = `RPTX/${state.company.year}/${String(m).padStart(2, "0")}/${recipient.employeeId || recipient.id}`;
    const taxMethod = result.rows.map(row => row.method).filter(Boolean).join(" · ");
    return <article className={styles.slip}>
      <header className={styles.slipHeader}>
        <div className={styles.slipMark} aria-hidden="true">{logo ? <img src={logo} alt=""/> : <span>R/</span>}</div>
        <div className={styles.slipCompany}><span>RIPITAX · DOKUMEN INTERNAL</span><strong>{state.company.name || "Perusahaan belum diisi"}</strong><small>Payroll & PPh 21 Studio · Data diproses di perangkatmu</small></div>
      </header>
      <div className={styles.slipTitleRow}><div><h2>{title}</h2><p>Masa pajak {MONTHS[m - 1]} {state.company.year}</p></div><div className={styles.slipDocument}><span>No. dokumen</span><strong>{documentNo}</strong><small>Tanggal potong {state.company.withholdingDate || "—"}</small></div></div>
      <section className={styles.slipPerson} aria-label="Identitas penerima">{[["Nama penerima", recipient.name || "—"], ["ID pegawai", recipient.employeeId || recipient.id], [identifier, (recipient.residency === "SPLN" ? recipient.foreignTin : recipient.tin) || "—"], ["Jabatan / profesi", recipient.position || "—"], ["Kategori", KINDS[recipient.kind as keyof typeof KINDS] || "—"], ["Status PTKP", recipient.ptkp || "—"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
      <section className={styles.slipSection}><h3>Penghasilan / imbalan</h3><table className={styles.slipTable}><tbody>{earnings.length ? earnings.map(([key, value]) => <tr key={key}><td>{COMPONENTS[key as keyof typeof COMPONENTS]?.label || key}</td><td>{rupi(value)}</td></tr>) : <tr><td colSpan={2}>Belum ada komponen penghasilan pada masa ini.</td></tr>}<tr className={styles.slipSubtotal}><td>Penghasilan tunai</td><td>{rupi(result.cash)}</td></tr></tbody></table></section>
      <section className={styles.slipSection}><h3>Potongan & pajak</h3><table className={styles.slipTable}><tbody>{deductions.map(([key, value]) => <tr key={key}><td>{COMPONENTS[key as keyof typeof COMPONENTS]?.label || key}</td><td>− {rupi(value)}</td></tr>)}<tr><td>PPh 21/26 <small>{taxMethod ? `· ${taxMethod}` : ""}</small></td><td>− {rupi(result.tax)}</td></tr><tr className={styles.slipSubtotal}><td>Total potongan</td><td>− {rupi(result.deductions + result.tax)}</td></tr></tbody></table></section>
      <section className={styles.slipTakeHome}><span>Bersih dibayarkan</span><strong>{rupi(result.netCash)}</strong><small>Setelah potongan PPh dan potongan pegawai pada masa ini.</small></section>
      <section className={styles.slipTax}><h3>Ringkasan pajak</h3><dl><div><dt>Bruto pajak</dt><dd>{rupi(result.gross)}</dd></div><div><dt>Metode perhitungan</dt><dd>{taxMethod || "Belum tersedia"}</dd></div><div><dt>PPh 21/26 dipotong</dt><dd>{rupi(result.tax)}</dd></div></dl></section>
      <footer className={styles.slipFooter}><span>Dokumen internal dari data pengguna. Bukan bukti potong resmi atau bukti pembayaran bank.</span><span>RIPITAX · PuspitaCore</span></footer>
    </article>;
}
