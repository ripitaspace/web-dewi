import { COMPONENTS, KINDS, PTKP, DOCUMENT_TYPES } from "./catalog.js";
import type { Entry, Recipient, Studio } from "./model";
export function dateFor(year: number, month: number) { return `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`; }
export function fresh(): Studio { return { schema: "ripitax-pph21-local-v2", company: { name: "", tin: "", tku: "", year: 2026, month: 10, withholdingDate: dateFor(2026, 10) }, recipients: [], entries: [], nextId: 1 }; }
export function nextId(s: Studio, prefix: string) {
    const used = new Set([...s.recipients, ...s.entries].map(x => x.id));
    let id: string;
    do {
        id = `${prefix}-${String(s.nextId++).padStart(5, "0")}`;
    } while (used.has(id));
    return id;
}
export function recipientDefault(s: Studio): Recipient { const id = nextId(s, "P"); return { id, employeeId: id, name: "", tin: "", tku: "", kind: "fixed", residency: "SPDN", citizenship: "Resident", ptkp: "TK/0", sector: "private", startMonth: 1, endMonth: 12, subject: "existing", position: "", rank: "", nip: "", passport: "", kitas: "", country: "", address: "", dob: "", birthCity: "", foreignTin: "", receiptNo: "", facility: "N/A", taxObject: "", grossUp: "No", workForSecondEmployer: "No", previousSlip: "", annualComplete: false, whStatus: "auto", note: "" }; }
export function entryDefault(s: Studio, recipientId = s.recipients[0]?.id || ""): Entry { return { id: nextId(s, "T"), recipientId, month: s.company.month, comp: "salary", amount: 0, description: "", documentType: "CommercialInvoice", documentNo: "", documentDate: "", withholdingDate: "", days: 1, equalDaily: false, excludedLabor: 0, excludedMaterial: 0, proof: false }; }
export function componentsFor(kind: string) { return ["fixed", "pension"].includes(kind) ? Object.keys(COMPONENTS).filter(k => k !== "fee") : ["fee"]; }
export function adaptEntry(e: Entry, s: Studio) { const r = s.recipients.find(r => r.id === e.recipientId); if (r && !componentsFor(r.kind).includes(e.comp))
    e.comp = componentsFor(r.kind)[0]; }
export function demo(): Studio {
    const s = fresh();
    s.company = { ...s.company, name: "PT RIPITAX DEMO — BUKAN DATA NYATA", tin: "0000000000000000", tku: "0000000000000000000000" };
    const recipient = (values: Partial<Recipient>) => {
        const r = recipientDefault(s);
        const tin = String(s.recipients.length + 1).padStart(16, "0");
        Object.assign(r, {
            tin,
            tku: tin + "000000",
            residency: "SPDN",
            citizenship: "Resident",
            ptkp: "TK/0",
            sector: "private",
            startMonth: 1,
            endMonth: 12,
            subject: "existing",
            position: "Staf",
            facility: "N/A",
            grossUp: "No",
            workForSecondEmployer: "No",
            annualComplete: true,
            whStatus: "FullYear",
            note: "Data latihan fiktif RIPITAX — bukan data wajib pajak nyata.",
        }, values);
        s.recipients.push(r);
        return r;
    };
    const income = (r: Recipient, values: Partial<Entry>) => {
        s.entries.push({ ...entryDefault(s, r.id), description: "Data latihan fiktif", withholdingDate: s.company.withholdingDate, ...values });
    };
    const a = recipient({ employeeId: "EMP-001", name: "Nadia Pramesti", position: "Analis Keuangan", ptkp: "K/0" });
    const b = recipient({ employeeId: "EMP-002", name: "Raka Mahendra", kind: "nonemployee", position: "Konsultan Pajak", taxObject: "21-100-07" });
    const pension = recipient({ employeeId: "EMP-003", name: "Sekar Lestari", kind: "pension", position: "Penerima Pensiun", ptkp: "TK/1" });
    const monthly = recipient({ employeeId: "EMP-004", name: "Dion Pratama", kind: "casual_month", position: "Pekerja Kontrak Bulanan", taxObject: "21-100-35" });
    const daily = recipient({ employeeId: "EMP-005", name: "Maya Anindita", kind: "casual_daily", position: "Pekerja Harian", taxObject: "21-100-24" });
    const participant = recipient({ employeeId: "EMP-006", name: "Farhan Nugraha", kind: "participant", position: "Peserta Kegiatan", taxObject: "21-100-14" });
    const commissioner = recipient({ employeeId: "EMP-007", name: "Intan Kurnia", kind: "commissioner", position: "Komisaris", taxObject: "21-100-10" });
    const former = recipient({ employeeId: "EMP-008", name: "Bagas Wiratama", kind: "former", position: "Mantan Pegawai", taxObject: "21-100-99", note: "Data latihan fiktif. Kode objek mantan pegawai tetap perlu review manual sebelum ekspor." });
    const foreign = recipient({ employeeId: "EXT-001", name: "Oliver Hart", kind: "nonemployee", residency: "SPLN", citizenship: "Foreign", tin: "", tku: "", foreignTin: "AUS-DEMO-2026-001", country: "AUS", address: "12 Example Street, Melbourne VIC 3000", dob: "1987-06-14", birthCity: "Melbourne", passport: "PA1234567", kitas: "KITAS-DEMO-01", receiptNo: "RCPT-EXT-001", position: "Foreign Consultant", taxObject: "27-100-99" });
    const government = recipient({ employeeId: "ASN-001", name: "Tania Wulandari", kind: "fixed", sector: "government", position: "Analis Kebijakan", rank: "III/a", nip: "198905102015032001", ptkp: "K/1" });
    for (let month = 1; month <= 12; month++)
        income(a, { month, comp: "salary", amount: 10000000, description: "Gaji bulanan Nadia Pramesti" });
    income(b, { comp: "fee", amount: 5000000, description: "Jasa konsultasi Oktober", documentNo: "INV-RM-2026-10", documentDate: "2026-10-15" });
    for (let month = 1; month <= 12; month++)
        income(pension, { month, comp: "salary", amount: 6500000, description: "Pensiun bulanan Sekar Lestari" });
    income(monthly, { comp: "fee", amount: 7200000, description: "Upah kontrak bulanan Oktober", documentNo: "KONTRAK-DP-10", documentDate: "2026-10-01" });
    income(daily, { comp: "fee", amount: 1800000, days: 3, equalDaily: true, description: "Upah kerja harian 3 hari", documentNo: "BP-MA-10", documentDate: "2026-10-18" });
    income(participant, { comp: "fee", amount: 2500000, description: "Honor peserta konferensi", documentNo: "ACARA-FN-10", documentDate: "2026-10-20" });
    income(commissioner, { comp: "fee", amount: 9000000, description: "Honorarium komisaris tidak teratur", documentNo: "KOM-IK-10", documentDate: "2026-10-25" });
    income(former, { comp: "fee", amount: 3500000, description: "Pembayaran pasca-kerja", documentNo: "PP-BW-10", documentDate: "2026-10-28" });
    income(foreign, { comp: "fee", amount: 8000000, description: "Foreign consulting service", documentNo: "AUS-OH-10", documentDate: "2026-10-22" });
    for (let month = 1; month <= 12; month++) {
        income(government, { month, comp: "salary", amount: 8500000, description: "Gaji bulanan Tania Wulandari" });
        if (month === 10) {
            income(government, { month, comp: "pensionContribution", amount: 200000, description: "Iuran JHT/pensiun pegawai" });
            income(government, { month, comp: "bpjsDeduction", amount: 150000, description: "Potongan BPJS pegawai" });
        }
    }
    return s;
}
function record(v: unknown): v is Record<string, unknown> { return !!v && typeof v === "object" && !Array.isArray(v); }
function month(v: unknown) { return Number.isInteger(v) && Number(v) >= 1 && Number(v) <= 12; }
export function checkBackup(value: unknown): asserts value is Studio {
    if (!record(value) || value.schema !== "ripitax-pph21-local-v2" || !record(value.company) || !Array.isArray(value.recipients) || !Array.isArray(value.entries) || !Number.isSafeInteger(value.nextId) || Number(value.nextId) < 1)
        throw Error("Struktur backup tidak sesuai versi v2.");
    const c = value.company;
    if (!["name", "tin", "tku", "withholdingDate"].every(k => typeof c[k] === "string") || !Number.isInteger(c.year) || Number(c.year) < 2024 || Number(c.year) > 2028 || !month(c.month))
        throw Error("Profil perusahaan atau masa pajak tidak valid.");
    if (value.recipients.length > 30000 || value.entries.length > 150000)
        throw Error("Jumlah baris melebihi batas.");
    const ids = new Set<string>();
    const s = fresh(), defaults = recipientDefault(s);
    for (const r of value.recipients) {
        if (!record(r) || typeof r.id !== "string" || !r.id || ids.has(r.id))
            throw Error("ID penerima kosong atau duplikat.");
        // Backup v2 sebelum kolom ID pegawai diperkenalkan tetap dapat dipulihkan.
        if (!Object.hasOwn(r, "employeeId")) r.employeeId = r.id;
        ids.add(r.id);
        if (!Object.entries(defaults).every(([k, v]) => typeof r[k] === typeof v) || !Object.hasOwn(KINDS, String(r.kind)) || !PTKP.includes(String(r.ptkp)) || !["SPDN", "SPLN"].includes(String(r.residency)) || !["Resident", "Foreign"].includes(String(r.citizenship)) || !["private", "government"].includes(String(r.sector)) || !["existing", "changed"].includes(String(r.subject)) || !["auto", "FullYear", "PartialYear", "Annualized"].includes(String(r.whStatus)) || !["No", "Yes"].includes(String(r.grossUp)) || !["No", "Yes"].includes(String(r.workForSecondEmployer)) || !["N/A", "DTP", "ETC", "COD", "TaxExAr21"].includes(String(r.facility)) || !month(r.startMonth) || !month(r.endMonth) || Number(r.startMonth) > Number(r.endMonth))
            throw Error("Data penerima tidak lengkap atau tidak valid.");
    }
    const entryIds = new Set<string>();
    const ed = entryDefault(s);
    for (const e of value.entries) {
        if (!record(e) || typeof e.id !== "string" || !e.id || ids.has(e.id) || entryIds.has(e.id) || !ids.has(String(e.recipientId)))
            throw Error("ID transaksi duplikat atau penerima tidak ditemukan.");
        entryIds.add(e.id);
        if (!Object.entries(ed).every(([k, v]) => typeof e[k] === typeof v) || !month(e.month) || !Object.hasOwn(COMPONENTS, String(e.comp)) || !Object.hasOwn(DOCUMENT_TYPES, String(e.documentType)) || !["amount", "excludedLabor", "excludedMaterial"].every(k => Number.isFinite(e[k]) && Number(e[k]) >= 0) || !Number.isSafeInteger(e.days) || Number(e.days) < 1)
            throw Error("Data penghasilan tidak valid.");
    }
}
export function copySalary(s: Studio, id: string): number {
    const r = s.recipients.find(r => r.id === id);
    if (!r || !["fixed", "pension"].includes(r.kind))
        throw Error("Pilih satu pegawai tetap atau penerima pensiun.");
    const original = s.entries.find(e => e.recipientId === id && e.month === s.company.month && e.comp === "salary");
    if (!original || original.amount <= 0)
        throw Error("Isi gaji di masa terpilih dahulu.");
    let count = 0;
    for (let m = r.startMonth; m <= r.endMonth; m++)
        if (!s.entries.some(e => e.recipientId === id && e.month === m && e.comp === "salary")) {
            s.entries.push({ ...entryDefault(s, id), month: m, amount: original.amount, description: "Salin gaji dari bulan " + s.company.month });
            count++;
        }
    return count;
}
