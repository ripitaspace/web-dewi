import type { PtkpStatus, RecipientType, TaxMode } from "./types";

export type ImportedPayrollRow = {
  row: number;
  name: string;
  employeeId: string;
  recipientType: RecipientType;
  taxMode: TaxMode;
  ptkp: PtkpStatus;
  salary: number;
  allowance: number;
  bonus: number;
  overtime: number;
  natura: number;
  pension: number;
  jht: number;
  jp: number;
  health: number;
  otherDeductions: number;
};
export type ImportIssue = { row: number; message: string };
export type ImportPreview = { rows: ImportedPayrollRow[]; issues: ImportIssue[] };

const RECIPIENTS: RecipientType[] = ["permanent", "temporary-monthly", "temporary-daily", "pensioner", "non-employee", "event-participant", "former-employee", "foreign"];
const PTKP: PtkpStatus[] = ["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"];
const normalized = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const number = (value: unknown) => Math.max(0, Number(String(value ?? "").replace(/[^0-9,-]/g, "").replace(",", ".")) || 0);

function valuesToPreview(table: string[][]): ImportPreview {
  const headers = table[0]?.map(normalized) ?? [];
  const col = (name: string) => headers.indexOf(normalized(name));
  const get = (row: string[], name: string) => { const index = col(name); return index < 0 ? "" : row[index] ?? ""; };
  const required = ["name", "employee_id", "recipient_type", "tax_mode", "ptkp"];
  const missing = required.filter((header) => col(header) < 0);
  if (missing.length) return { rows: [], issues: [{ row: 1, message: `Kolom wajib tidak ditemukan: ${missing.join(", ")}.` }] };
  const rows: ImportedPayrollRow[] = []; const issues: ImportIssue[] = [];
  table.slice(1).forEach((cells, index) => {
    const row = index + 2; const name = get(cells, "name").trim(); const employeeId = get(cells, "employee_id").trim();
    const recipientType = get(cells, "recipient_type").trim() as RecipientType; const taxMode = get(cells, "tax_mode").trim() as TaxMode; const ptkp = get(cells, "ptkp").trim() as PtkpStatus;
    if (!cells.some((value) => value.trim())) return;
    if (!name || !employeeId) { issues.push({ row, message: "name dan employee_id wajib diisi." }); return; }
    if (!RECIPIENTS.includes(recipientType)) { issues.push({ row, message: `recipient_type tidak valid: ${recipientType || "kosong"}.` }); return; }
    if (taxMode !== "deducted" && taxMode !== "gross-up") { issues.push({ row, message: "tax_mode harus deducted atau gross-up." }); return; }
    if (!PTKP.includes(ptkp)) { issues.push({ row, message: `ptkp tidak valid: ${ptkp || "kosong"}.` }); return; }
    rows.push({ row, name, employeeId, recipientType, taxMode, ptkp, salary: number(get(cells, "salary")), allowance: number(get(cells, "allowance")), bonus: number(get(cells, "bonus")), overtime: number(get(cells, "overtime")), natura: number(get(cells, "natura")), pension: number(get(cells, "pension")), jht: number(get(cells, "jht")), jp: number(get(cells, "jp")), health: number(get(cells, "health")), otherDeductions: number(get(cells, "other_deductions")) });
  });
  return { rows, issues };
}

function csvTable(text: string) {
  const delimiter = text.includes(";") ? ";" : ",";
  return text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim()).map((line) => line.split(delimiter).map((value) => value.trim().replace(/^"|"$/g, "")));
}
function colIndex(reference: string) { return (reference.match(/^[A-Z]+/)?.[0] ?? "").split("").reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1; }
async function unzip(bytes: Uint8Array, view: DataView, entry: { method: number; size: number; offset: number }) {
  const start = entry.offset; if (view.getUint32(start, true) !== 0x04034b50) throw new Error("Berkas XLSX tidak valid.");
  const nameLength = view.getUint16(start + 26, true); const extraLength = view.getUint16(start + 28, true); const compressed = bytes.slice(start + 30 + nameLength + extraLength, start + 30 + nameLength + extraLength + entry.size);
  if (entry.method === 0) return new TextDecoder().decode(compressed);
  if (entry.method !== 8 || typeof DecompressionStream === "undefined") throw new Error("Browser ini belum mendukung pembacaan XLSX lokal.");
  return new TextDecoder().decode(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
}
async function xlsxTable(file: File) {
  const buffer = await file.arrayBuffer(); const bytes = new Uint8Array(buffer); const view = new DataView(buffer); let end = -1;
  for (let cursor = bytes.length - 22; cursor >= Math.max(0, bytes.length - 65_557); cursor -= 1) if (view.getUint32(cursor, true) === 0x06054b50) { end = cursor; break; }
  if (end < 0) throw new Error("Struktur XLSX tidak dapat dibaca.");
  const entries = new Map<string, { method: number; size: number; offset: number }>(); let cursor = view.getUint32(end + 16, true);
  for (let index = 0; index < view.getUint16(end + 10, true); index += 1) { if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error("Direktori XLSX tidak valid."); const method = view.getUint16(cursor + 10, true); const size = view.getUint32(cursor + 20, true); const nameLength = view.getUint16(cursor + 28, true); const extraLength = view.getUint16(cursor + 30, true); const commentLength = view.getUint16(cursor + 32, true); const path = new TextDecoder().decode(bytes.slice(cursor + 46, cursor + 46 + nameLength)); entries.set(path, { method, size, offset: view.getUint32(cursor + 42, true) }); cursor += 46 + nameLength + extraLength + commentLength; }
  const read = async (path: string) => { const entry = entries.get(path); return entry ? unzip(bytes, view, entry) : null; };
  const sharedXml = await read("xl/sharedStrings.xml"); const shared = sharedXml ? [...new DOMParser().parseFromString(sharedXml, "application/xml").querySelectorAll("si")].map((item) => [...item.querySelectorAll("t")].map((node) => node.textContent ?? "").join("")) : [];
  const path = [...entries.keys()].find((candidate) => /^xl\/worksheets\/[^/]+\.xml$/.test(candidate)); const xml = path ? await read(path) : null; if (!xml) throw new Error("Sheet XLSX tidak ditemukan.");
  return [...new DOMParser().parseFromString(xml, "application/xml").querySelectorAll("row")].map((row) => { const values: string[] = []; row.querySelectorAll("c").forEach((cell) => { const type = cell.getAttribute("t"); const raw = cell.querySelector("v")?.textContent ?? ""; const inline = [...cell.querySelectorAll("is t")].map((node) => node.textContent ?? "").join(""); values[colIndex(cell.getAttribute("r") ?? "")] = type === "s" ? shared[Number(raw)] ?? "" : type === "inlineStr" ? inline : raw; }); return values; });
}

export async function readPayrollImport(file: File): Promise<ImportPreview> {
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran file melebihi batas 5 MB.");
  const table = file.name.toLowerCase().endsWith(".xlsx") ? await xlsxTable(file) : csvTable(await file.text());
  return valuesToPreview(table);
}

export const PAYROLL_IMPORT_TEMPLATE = "name,employee_id,recipient_type,tax_mode,ptkp,salary,allowance,bonus,overtime,natura,pension,jht,jp,health,other_deductions\nTuan R,EMP-001,permanent,deducted,K/0,10000000,0,0,0,0,0,0,0,0,0\nNyonya S,VENDOR-001,non-employee,deducted,TK/0,5000000,0,0,0,0,0,0,0,0,0\n";
