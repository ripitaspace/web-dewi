import * as XLSX from "xlsx";
import { adaptEntry, dateFor, entryDefault, fresh, recipientDefault } from "./data";
import type { Recipient } from "./model";
import payrollTemplate from "./payroll-template-contract.json";

export const PAYROLL_HEADERS = payrollTemplate.headers;

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
function yes(value: Cell) { return ["ya", "yes", "true", "1"].includes(text(value).toLocaleLowerCase("id-ID")); }
function whStatus(value: Cell) { return ({ "penuh tahun": "FullYear", "masa sebagian": "PartialYear", disetahunkan: "Annualized" }[text(value).toLocaleLowerCase("id-ID")] || "auto") as Recipient["whStatus"]; }
function findHeaderRow(sheet: XLSX.WorkSheet) {
    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
    for (let row = range.s.r; row <= range.e.r; row++) {
        const headers = new Set<string>();
        for (let column = range.s.c; column <= range.e.c; column++) headers.add(text(sheet[XLSX.utils.encode_cell({ r: row, c: column })]?.v));
        if (PAYROLL_HEADERS.every(header => headers.has(header))) return row;
    }
    return -1;
}

export async function importPayrollWorkbook(file: File) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const sheet = workbook.Sheets[payrollTemplate.sheetName];
    if (!sheet) throw Error("Sheet PAYROLL tidak ditemukan.");
    const headerRow = findHeaderRow(sheet);
    if (headerRow < 0) throw Error("Header Excel payroll tidak cocok. Unduh template terbaru atau cocokkan semua nama kolom.");
    const rows = XLSX.utils.sheet_to_json<Row>(sheet, { range: headerRow, defval: "", raw: false });
    const year = Number(text(sheet.AA5?.v)) || new Date().getFullYear();
    const defaultMonth = month(sheet.AE5?.v, new Date().getMonth() + 1);
    const draft = fresh();
    draft.company = { name: text(sheet.C5?.v), tin: text(sheet.K5?.v), tku: text(sheet.S5?.v), year, month: defaultMonth, withholdingDate: date(sheet, "AI5", dateFor(year, defaultMonth)) };
    const people = new Map<string, Recipient>(), errors: string[] = [];
    let entries = 0;
    const usedEntryIds = new Set<string>();
    rows.forEach((row, index) => {
        const line = index + headerRow + 2, employeeId = text(row["ID Penerima"]), name = text(row["Nama Penerima"]), tin = text(row["NIK / NPWP / TIN"]);
        if (!employeeId && !name && !tin) return;
        const kind = kinds[text(row["Jenis Penerima"])];
        if (!employeeId || !name || !kind) { errors.push(`Baris ${line}: ID penerima, nama, atau jenis penerima belum valid.`); return; }
        let person = people.get(employeeId);
        if (!person) {
            person = recipientDefault(draft);
            Object.assign(person, { employeeId, name, tin: text(row["Subjek Pajak"]) === "SPLN" ? "" : tin, foreignTin: text(row["Subjek Pajak"]) === "SPLN" ? tin : "", kind, residency: text(row["Subjek Pajak"]) === "SPLN" ? "SPLN" : "SPDN", citizenship: text(row["Subjek Pajak"]) === "SPLN" ? "Foreign" : "Resident", ptkp: text(row.PTKP) || "TK/0", sector: text(row.Sektor) === "Pemerintah" ? "government" : "private", startMonth: month(row["Mulai Kerja"], 1), endMonth: month(row["Akhir Kerja"], 12), tku: text(row["ID TKU Penerima"]), country: text(row["Negara Penerima"]), position: text(row.Jabatan), rank: text(row["Pangkat / Golongan"]), passport: text(row.Paspor), kitas: text(row.KITAS), address: text(row["Alamat SPLN"]), dob: text(row["Tanggal Lahir"]), birthCity: text(row["Tempat Lahir"]), subject: text(row["Status Kewajiban Subjek"]) === "Berubah" ? "changed" : "existing", annualComplete: yes(row["Riwayat Tahunan Lengkap"]), workForSecondEmployer: yes(row["Pemberi Kerja Kedua"]) ? "Yes" : "No", previousSlip: text(row["Bukti Potong Sebelumnya"]), whStatus: whStatus(row["Status Masa"]), nip: text(row["NIP / NRP"]), receiptNo: text(row["Nomor SKD"]), note: text(row.Catatan), taxObject: text(row["Kode Objek"]), facility: text(row["Fasilitas Pajak"]) === "DTP" ? "DTP" : text(row["Fasilitas Pajak"]) === "SKD/P3B" ? "COD" : text(row["Fasilitas Pajak"]) === "Normal" || !text(row["Fasilitas Pajak"]) ? "N/A" : "ETC", grossUp: ["Gross-up", "Ditanggung perusahaan"].includes(text(row["Metode Pajak"])) ? "Yes" : "No" });
            draft.recipients.push(person); people.set(employeeId, person);
        }
        const rowMonth = month(row.Bulan, draft.company.month);
        for (const [header, comp] of components) {
            const value = amount(row[header]);
            if (value <= 0) continue;
            const entry = entryDefault(draft, person.id), reference = text(row["ID Transaksi"]);
            const sourceId = reference ? `${reference}-${comp}` : entry.id;
            if (!usedEntryIds.has(sourceId)) { entry.id = sourceId; usedEntryIds.add(sourceId); }
            Object.assign(entry, { month: rowMonth, comp, amount: value, description: text(row.Catatan), documentType: documentTypes[text(row["Jenis Dokumen"])] || "Other", documentNo: text(row["Nomor Dokumen"]), documentDate: text(row["Tanggal Dokumen"]), withholdingDate: text(row["Tanggal Potong"]), days: Math.max(1, Math.trunc(amount(row["Jumlah Hari Upah"]) || 1)), equalDaily: yes(row["Upah Harian Sama"]), excludedLabor: amount(row["Pengurang Upah Tenaga Kerja"]), excludedMaterial: amount(row["Pengurang Material"]), proof: yes(row["Bukti Biaya / Kontrak"]) });
            adaptEntry(entry, draft);
            draft.entries.push(entry); entries++;
        }
    });
    if (!draft.recipients.length) throw Error("Tidak ada penerima valid yang dapat diimpor dari template.");
    return { studio: draft, recipients: draft.recipients.length, entries, errors };
}
