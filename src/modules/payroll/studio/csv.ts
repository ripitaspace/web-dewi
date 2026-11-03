import { COMPONENTS, DOCUMENT_TYPES } from "./catalog.js";
import { adaptEntry, entryDefault } from "./data";
import type { Entry, Studio } from "./model";
export const CSV_FIELDS = ["recipientTin", "recipientName", "month", "comp", "amount", "description", "documentType", "documentNo", "documentDate", "withholdingDate", "days", "equalDaily", "excludedLabor", "excludedMaterial", "proof"] as const;
function escape(v: unknown) { const s = String(v ?? ""); return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
export function exportCSV(s: Studio) { return "\ufeff" + [CSV_FIELDS, ...s.entries.map(e => { const r = s.recipients.find(p => p.id === e.recipientId); return [r?.tin || r?.foreignTin || "", r?.name || "", ...CSV_FIELDS.slice(2).map(k => e[k as keyof Entry])]; })].map(r => r.map(escape).join(";")).join("\r\n"); }
export function parseCSV(text: string) {
    const rows: string[][] = [];
    let row: string[] = [], value = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            if (quoted && text[i + 1] === '"') {
                value += '"';
                i++;
            }
            else
                quoted = !quoted;
        }
        else if (c === ";" && !quoted) {
            row.push(value);
            value = "";
        }
        else if ((c === "\n" || c === "\r") && !quoted) {
            if (c === "\r" && text[i + 1] === "\n")
                i++;
            row.push(value);
            if (row.some(Boolean))
                rows.push(row);
            row = [];
            value = "";
        }
        else
            value += c;
    }
    if (quoted)
        throw Error("Tanda kutip CSV belum ditutup.");
    row.push(value);
    if (row.some(Boolean))
        rows.push(row);
    return rows;
}
function fingerprint(e: Entry) { return JSON.stringify([e.recipientId, e.month, e.comp, e.amount, e.documentNo, e.documentDate, e.description]); }
export function importCSV(s: Studio, text: string) {
    const rows = parseCSV(text.replace(/^\ufeff/, "")), head = rows.shift() || [];
    if (!CSV_FIELDS.every(k => head.includes(k)))
        throw Error("Header CSV tidak cocok. Gunakan CSV ekspor RIPITAX.");
    const existing = new Set(s.entries.map(fingerprint));
    const errors: string[] = [];
    let count = 0, duplicates = 0;
    rows.forEach((row, i) => {
        const d = Object.fromEntries(head.map((k, j) => [k, row[j] ?? ""]));
        const ident = d.recipientTin.trim(), name = d.recipientName.trim();
        const matches = s.recipients.filter(p => ident ? p.tin === ident || p.foreignTin === ident : !!name && p.name.trim() === name);
        if (matches.length !== 1) {
            errors.push(`Baris ${i + 2}: penerima tidak ditemukan atau ambigu.`);
            return;
        }
        if (!Object.hasOwn(COMPONENTS, d.comp) || !Object.hasOwn(DOCUMENT_TYPES, d.documentType) || !["amount", "excludedLabor", "excludedMaterial"].every(k => Number.isFinite(Number(d[k])) && Number(d[k]) >= 0) || !Number.isInteger(Number(d.month)) || Number(d.month) < 1 || Number(d.month) > 12 || !Number.isInteger(Number(d.days)) || Number(d.days) < 1 || !["equalDaily", "proof"].every(k => ["true", "false"].includes(d[k]))) {
            errors.push(`Baris ${i + 2}: komponen, bulan, hari, atau nominal tidak valid.`);
            return;
        }
        const e = entryDefault(s, matches[0].id);
        Object.assign(e, { month: Number(d.month), comp: d.comp, amount: Number(d.amount), description: d.description, documentType: d.documentType, documentNo: d.documentNo, documentDate: d.documentDate, withholdingDate: d.withholdingDate, days: Number(d.days), equalDaily: d.equalDaily === "true", excludedLabor: Number(d.excludedLabor), excludedMaterial: Number(d.excludedMaterial), proof: d.proof === "true" });
        adaptEntry(e, s);
        const key = fingerprint(e);
        if (existing.has(key)) {
            duplicates++;
            return;
        }
        existing.add(key);
        s.entries.push(e);
        count++;
    });
    return { count, duplicates, errors };
}
