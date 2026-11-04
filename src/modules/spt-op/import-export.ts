import { catalog, row, row as newRow, type Draft, type Row, type Values } from './model';
import { errors, numeric, rowValue } from './engine';
export interface Worksheet {
    name: string;
    rows: string[][];
    date1904?: boolean;
}
export function excelDate(value: string, date1904 = false): string { if (!/^\d{1,6}(\.\d+)?$/.test(value))
    return value; const serial = Math.floor(Number(value)); if (serial < 1 || (!date1904 && serial === 60))
    return value; const date = new Date(Date.UTC(date1904 ? 1904 : 1899, date1904 ? 0 : 11, date1904 ? 1 : 31) + (serial - (date1904 || serial < 60 ? 0 : 1)) * 86400000); return date.toISOString().slice(0, 10); }
export async function readWorkbook(file: File): Promise<Worksheet[]> { if (file.size > 25 * 1024 * 1024)
    throw Error('Batas file 25 MB. Pisahkan file menjadi beberapa bagian.'); const XLSX = await import('xlsx'); const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false, cellNF: true }); const date1904 = !!wb.Workbook?.WBProps?.date1904; return wb.SheetNames.map(name => { const sheet = wb.Sheets[name]; const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '', range: 0 }); for (const [address, cell] of Object.entries(sheet)) {
    if (address.startsWith('!') || cell.t !== 'n' || !cell.z || !XLSX.SSF.is_date(cell.z))
        continue;
    const { r, c } = XLSX.utils.decode_cell(address);
    if (rows[r])
        rows[r][c] = excelDate(String(cell.v), date1904);
} return { name, rows, date1904 }; }); }
export function parseCSV(text: string): string[][] { const first = text.split(/\r?\n/)[0], delimiter = first.includes('\t') ? '\t' : first.includes(';') ? ';' : ','; const result: string[][] = []; let row: string[] = [], value = '', quoted = false; for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
        if (quoted && text[i + 1] === '"') {
            value += '"';
            i++;
        }
        else
            quoted = !quoted;
    }
    else if (!quoted && c === delimiter) {
        row.push(value);
        value = '';
    }
    else if (!quoted && (c === '\n' || c === '\r')) {
        if (c === '\r' && text[i + 1] === '\n')
            i++;
        row.push(value);
        if (row.some(Boolean))
            result.push(row);
        row = [];
        value = '';
    }
    else
        value += c;
} if (quoted)
    throw Error('Tanda kutip CSV tidak berpasangan.'); row.push(value); if (row.some(Boolean))
    result.push(row); if (result[0]?.[0])
    result[0][0] = result[0][0].replace(/^\uFEFF/, ''); return result; }
export interface Candidate {
    line: number;
    row: Row;
    errors: string[];
    duplicate: boolean;
}
export function fingerprint(r: Row, key?: string) { const fields = key ? catalog.tables[key].columns : []; return JSON.stringify(Object.entries(r.values).filter(([k, v]) => v.trim() && fields.find(f => f.key === k)?.type !== 'computed').map(([k, v]) => { const type = fields.find(f => f.key === k)?.type; return [k, ['money', 'number'].includes(type || '') && Number.isFinite(numeric(v)) ? String(numeric(v)) : v.trim()]; }).sort(([a], [b]) => a.localeCompare(b))); }
export function previewImport(sheet: Worksheet, header: number, key: string, map: Record<string, string>, existing: Row[]): Candidate[] { const fields = catalog.tables[key]?.columns; if (!fields || !Number.isInteger(header) || header < 0 || header >= sheet.rows.length)
    throw Error('Tabel atau baris header tidak valid.'); if (!fields.some(f => f.type !== 'computed' && map[f.key] !== undefined && map[f.key] !== ''))
    throw Error('Pilih pemetaan kolom sebelum impor.'); const seen = new Set(existing.map(r => fingerprint(r, key))); return sheet.rows.slice(header + 1).flatMap((cells, i) => { if (cells.every(v => !v.trim()))
    return []; const values: Values = {}; for (const f of fields) {
    if (f.type === 'computed')
        continue;
    const col = map[f.key];
    if (col !== undefined && col !== '')
        values[f.key] = String(cells[Number(col)] || '').trim();
    if (f.type === 'date' && values[f.key]) {
        values[f.key] = excelDate(values[f.key], sheet.date1904);
        const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(values[f.key]);
        if (m)
            values[f.key] = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
} const r = row(values, `import:${sheet.name}:${header + i + 2}`); const f = fingerprint(r, key), duplicate = seen.has(f); seen.add(f); return [{ line: header + i + 2, row: r, errors: errors(fields, r), duplicate }]; }); }
export function csv(d: Draft, k: string) { const fields = catalog.tables[k].columns; return '\uFEFF' + [fields.map(f => f.label), ...(d.tables[k] || []).map(r => fields.map(f => rowValue(k, r, f.key)))].map(cells => cells.map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\r\n'); }
export function download(name: string, text: string, type = 'application/json') { const u = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
export function copyAssets(source: Draft, target: Draft): Draft { const next = structuredClone(target); for (const k of ['cash', 'receivables', 'investments', 'movable', 'immovable', 'otherassets', 'debts']) {
    const copied = (source.tables[k] || []).filter(r => !r.disposed).map(r => ({ ...newRow({ ...r.values }, `copy:${source.profile.year}:${r.id}`), review: true }));
    next.tables[k] = [...(next.tables[k] || []), ...copied];
} return next; }
