import * as XLSX from "xlsx";
import { adaptEntry, dateFor, entryDefault, fresh, nextId, recipientDefault } from "./data";
import type { Recipient } from "./model";

export const PAYROLL_HEADERS = ["ID Transaksi", "ID Penerima", "Nama Penerima", "NIK / NPWP / TIN", "Jenis Penerima", "Subjek Pajak", "PTKP", "Sektor", "Bulan", "Status Masa", "Mulai Kerja", "Akhir Kerja", "Gaji / Pensiun", "Tunjangan", "Lembur", "THR", "Bonus", "Honorarium / Jasa", "JKK/JKM Perusahaan", "Natura Kena Pajak", "Tunjangan PPh", "Iuran Pensiun/JHT", "BPJS Potongan Lain", "Zakat Wajib", "Potongan Lain", "Metode Pajak", "Fasilitas Pajak", "Kode Objek", "Tanggal Potong", "Jenis Dokumen", "Nomor Dokumen", "Tanggal Dokumen", "ID TKU Penerima", "Negara Penerima", "Jabatan", "NIP / NRP", "Nomor SKD", "Catatan"] as const;

type Cell = string | number | Date | null | undefined;
type Row = Record<string, Cell>;
const months: Record<string, number> = { Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6, Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12 };
const kinds: Record<string, string> = { "Pegawai tetap": "fixed", "Pensiun berkala": "pension", "Tidak tetap / bulanan": "casual_month", "Tidak tetap / harian": "casual_daily", "Bukan pegawai / jasa": "nonemployee", "Peserta kegiatan": "participant", "Komisaris tidak teratur": "commissioner", "Mantan pegawai": "former" };
const documentTypes: Record<string, string> = { "Tagihan / Invoice": "CommercialInvoice", Kontrak: "Contract", "Bukti pembayaran": "PaymentProof", "Faktur Pajak": "TaxInvoice", Lainnya: "Other" };
const components: [string, string][] = [["Gaji / Pensiun", "salary"], ["Tunjangan", "allowance"], ["Lembur", "overtime"], ["THR", "thr"], ["Bonus", "bonus"], ["Honorarium / Jasa", "fee"], ["JKK/JKM Perusahaan", "employerInsurance"], ["Natura Kena Pajak", "natura"], ["Tunjangan PPh", "taxAllowance"], ["Iuran Pensiun/JHT", "pensionContribution"], ["BPJS Potongan Lain", "bpjsDeduction"], ["Zakat Wajib", "zakat"], ["Potongan Lain", "otherDeduction"]];

function text(value: Cell) { return String(value ?? "").trim(); }
function amount(value: Cell) { const number = typeof value === "number" ? value : Number(text(value).replace(/[^0-9,-]/g, "").replace(",", ".")); return Number.isFinite(number) ? number : 0; }
function month(value: Cell, fallback: number) { return months[text(value)] || fallback; }
function date(sheet: XLSX.WorkSheet, address: string, fallback = "") { const cell = sheet[address]; return cell ? XLSX.utils.format_cell(cell).trim() : fallback; }

export async function importPayrollWorkbook(file: File) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const sheet = workbook.Sheets.PAYROLL;
    if (!sheet) throw Error("Sheet PAYROLL tidak ditemukan.");
    const headerRow = (XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, range: 10, defval: "" })[0] || []).map(String);
    const rows = XLSX.utils.sheet_to_json<Row>(sheet, { range: 10, defval: "", raw: false });
    const headers = headerRow;
    if (!PAYROLL_HEADERS.every(header => headers.includes(header))) throw Error("Header Template payroll tidak cocok. Gunakan file RIPITAX PAYROLL yang diunduh dari sini.");
    const year = Number(text(sheet.AA5?.v)) || new Date().getFullYear();
    const defaultMonth = month(sheet.AE5?.v, new Date().getMonth() + 1);
    const draft = fresh();
    draft.company = { name: text(sheet.C5?.v), tin: text(sheet.K5?.v), tku: text(sheet.S5?.v), year, month: defaultMonth, withholdingDate: date(sheet, "AI5", dateFor(year, defaultMonth)) };
    const people = new Map<string, Recipient>(), errors: string[] = [];
    let entries = 0;
    rows.forEach((row, index) => {
        const line = index + 12, employeeId = text(row["ID Penerima"]), name = text(row["Nama Penerima"]), tin = text(row["NIK / NPWP / TIN"]);
        if (!employeeId && !name && !tin) return;
        const kind = kinds[text(row["Jenis Penerima"])];
        if (!employeeId || !name || !kind) { errors.push(`Baris ${line}: ID penerima, nama, atau jenis penerima belum valid.`); return; }
        let person = people.get(employeeId);
        if (!person) {
            person = recipientDefault(draft);
            Object.assign(person, { employeeId, name, tin: text(row["Subjek Pajak"]) === "SPLN" ? "" : tin, foreignTin: text(row["Subjek Pajak"]) === "SPLN" ? tin : "", kind, residency: text(row["Subjek Pajak"]) === "SPLN" ? "SPLN" : "SPDN", citizenship: text(row["Subjek Pajak"]) === "SPLN" ? "Foreign" : "Resident", ptkp: text(row.PTKP) || "TK/0", sector: text(row.Sektor) === "Pemerintah" ? "government" : "private", startMonth: month(row["Mulai Kerja"], 1), endMonth: month(row["Akhir Kerja"], 12), tku: text(row["ID TKU Penerima"]), country: text(row["Negara Penerima"]), position: text(row.Jabatan), nip: text(row["NIP / NRP"]), receiptNo: text(row["Nomor SKD"]), note: text(row.Catatan), taxObject: text(row["Kode Objek"]), facility: text(row["Fasilitas Pajak"]) === "DTP" ? "DTP" : text(row["Fasilitas Pajak"]) === "SKD/P3B" ? "COD" : text(row["Fasilitas Pajak"]) === "Normal" || !text(row["Fasilitas Pajak"]) ? "N/A" : "ETC", grossUp: ["Gross-up", "Ditanggung perusahaan"].includes(text(row["Metode Pajak"])) ? "Yes" : "No" });
            draft.recipients.push(person); people.set(employeeId, person);
        }
        const rowMonth = month(row.Bulan, draft.company.month);
        for (const [header, comp] of components) {
            const value = amount(row[header]);
            if (value <= 0) continue;
            const entry = entryDefault(draft, person.id);
            Object.assign(entry, { id: nextId(draft, "T"), month: rowMonth, comp, amount: value, description: text(row.Catatan), documentType: documentTypes[text(row["Jenis Dokumen"])] || "Other", documentNo: text(row["Nomor Dokumen"]), documentDate: text(row["Tanggal Dokumen"]), withholdingDate: text(row["Tanggal Potong"]) });
            adaptEntry(entry, draft);
            draft.entries.push(entry); entries++;
        }
    });
    if (!draft.recipients.length) throw Error("Tidak ada penerima valid yang dapat diimpor dari template.");
    return { studio: draft, recipients: draft.recipients.length, entries, errors };
}
