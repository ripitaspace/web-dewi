"use client";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createEngine, rupi } from "@/modules/payroll/studio/engine.js";
import { COMPONENTS, KINDS } from "@/modules/payroll/studio/catalog.js";
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
export function Slip({ state, recipient }: {
    state: Studio;
    recipient: Recipient;
}) {
    const engine = createEngine(state), m = state.company.month, result = engine.taxMonthSummary(recipient, m), parts = engine.periodParts(recipient, m);
    return <article className={styles.slip}><header><span>RIPITAX · DOKUMEN INTERNAL</span><h2>{engine.isPayroll(recipient) ? "Slip gaji" : "Rincian pembayaran"}</h2><strong>{state.company.name || "Perusahaan belum diisi"}</strong><p>{String(m).padStart(2, "0")} / {state.company.year}</p></header><dl>{[["Nama", recipient.name], ["NIK / NPWP / TIN", recipient.residency === "SPLN" ? recipient.foreignTin : recipient.tin], ["Kategori", KINDS[recipient.kind as keyof typeof KINDS]], ["Jabatan", recipient.position || "—"]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><h3>Komponen pembayaran</h3><dl>{Object.entries(parts.parts).filter(([, v]) => v > 0).map(([k, v]) => <div key={k}><dt>{COMPONENTS[k as keyof typeof COMPONENTS]?.label || k}</dt><dd>{rupi(v)}</dd></div>)}</dl><h3>Ringkasan</h3><dl>{[["Penghasilan tunai", result.cash], ["Bruto pajak (termasuk non-tunai)", result.gross], ["Potongan selain pajak", result.deductions], ["PPh 21/26", result.tax], ["Bersih dibayarkan", result.netCash]].map(([k, v]) => <div key={String(k)}><dt>{k}</dt><dd>{rupi(Number(v))}</dd></div>)}</dl><p className={styles.help}>Dokumen internal dari data pengguna. Bukan bukti potong resmi atau bukti pembayaran bank.</p></article>;
}
