import { describe, it, expect } from "vitest";
import { createEngine } from "./engine.js";
import { checkBackup, copySalary, dateFor, demo, entryDefault, fresh, nextId, recipientDefault } from "./data";
import { exportCSV, importCSV, parseCSV } from "./csv";
import { KINDS, RULES, XML_META } from "./catalog.js";
import { zipStore } from "./zip.js";
import { importPayrollWorkbook, PAYROLL_HEADERS } from "./xlsx";
import * as XLSX from "xlsx";
import { readFile } from "node:fs/promises";
import shapes from "./official-xml-shapes.json";
function valid(kind = "fixed", month = 10, foreign = false, government = false) {
    const s = fresh();
    s.company = { ...s.company, name: "TEST ONLY", tin: "0".repeat(16), tku: "0".repeat(22), month, withholdingDate: dateFor(2026, month) };
    const r = recipientDefault(s);
    Object.assign(r, { name: "Test", tin: "1".repeat(16), tku: "1".repeat(22), position: "Staf", kind, annualComplete: true, sector: government ? "government" : "private", nip: "TEST", rank: "III", residency: foreign ? "SPLN" : "SPDN", foreignTin: "TEST-TIN", country: "AUS", address: "Test", dob: "1980-01-01", birthCity: "Test" });
    s.recipients.push(r);
    s.entries.push({ ...entryDefault(s, r.id), comp: ["fixed", "pension"].includes(kind) ? "salary" : "fee", amount: 10000000, documentNo: "TEST-001", documentDate: "2026-10-01" });
    return s;
}
describe("Studio tax calculations", () => {
    it("matches supplied demo: monthly and final-period reconciliation", () => {
        const s = demo(), e = createEngine(s);
        expect(e.taxMonthSummary(s.recipients[0], 10).tax).toBe(200000);
        expect(e.taxMonthSummary(s.recipients[1], 10).tax).toBe(125000);
        const annual = e.payrollResult(s.recipients[0], 12)!;
        expect(annual.annual?.annualTax).toBe(2775000);
        expect(annual.tax).toBe(575000);
    });
    it("loads a fictional example for every supported recipient type", () => {
        const s = demo();
        expect(new Set(s.recipients.map(r => r.kind))).toEqual(new Set(Object.keys(KINDS)));
        expect(s.recipients.every(r => r.name && r.employeeId && r.note)).toBe(true);
        expect(s.entries.every(entry => entry.amount > 0)).toBe(true);
    });
    it("covers every TER category boundary, zero and high incomes", () => {
        for (const [ptkp, cat] of Object.entries(RULES.category)) {
            const s = valid();
            s.recipients[0].ptkp = ptkp;
            const e = createEngine(s), table = RULES.ter[cat as keyof typeof RULES.ter];
            table.upper.forEach((upper, i) => { if (!Number.isFinite(upper))
                return; expect(e.ter(s.recipients[0], upper).rate).toBe(table.rate[i]); expect(e.ter(s.recipients[0], upper + 1).rate).toBe(table.rate[i + 1]); });
            expect(e.ter(s.recipients[0], 0).rate).toBe(0);
        }
    });
    it.each([["casual_month", 200000], ["commissioner", 200000], ["nonemployee", 250000], ["participant", 500000], ["former", 500000]])("calculates %s", (kind, tax) => {
        const s = valid(String(kind));
        expect(createEngine(s).monthResults(s.recipients[0], 10)[0].tax).toBe(tax);
    });
    it("handles daily thresholds, foreign recipients, noncash and negative reconciliation", () => {
        const s = valid("casual_daily");
        const r = s.recipients[0], entry = s.entries[0];
        entry.amount = 450000;
        expect(createEngine(s).monthResults(r, 10)[0].tax).toBe(0);
        entry.amount = 450001;
        expect(createEngine(s).monthResults(r, 10)[0].tax).toBe(2250);
        entry.amount = 2500000;
        expect(createEngine(s).monthResults(r, 10)[0].tax).toBe(12500);
        entry.amount = 2500001;
        expect(createEngine(s).monthResults(r, 10)[0].tax).toBe(62500);
        r.residency = "SPLN";
        entry.amount = 10000000;
        expect(createEngine(s).monthResults(r, 10)[0].tax).toBe(2000000);
        const pay = valid();
        pay.entries.push({ ...entryDefault(pay, pay.recipients[0].id), comp: "natura", amount: 1000000 });
        const result = createEngine(pay).monthResults(pay.recipients[0], 10)[0];
        expect(result.cash).toBe(10000000);
        expect(result.gross).toBe(11000000);
        pay.entries = [{ ...pay.entries[0], amount: 100000000, month: 1 }];
        pay.company.month = 12;
        expect(createEngine(pay).payrollResult(pay.recipients[0], 12)!.tax).toBeLessThan(0);
    });
    it("distinguishes gross, automatic gross-up, and employer-borne payroll tax", () => {
        const s = valid(), r = s.recipients[0], entry = s.entries[0];
        r.ptkp = "TK/0"; entry.amount = 12000000;
        let result = createEngine(s).payrollResult(r, 10)!;
        expect(result.tax).toBe(480000); expect(result.netCash).toBe(11520000);

        r.taxMethod = "gross_up"; r.grossUp = "Yes";
        result = createEngine(s).payrollResult(r, 10)!;
        expect(Math.abs(result.tax - result.parts.taxAllowance)).toBeLessThanOrEqual(1);
        expect(result.gross).toBeGreaterThanOrEqual(12499999); expect(result.gross).toBeLessThanOrEqual(12500000);
        expect(result.tax).toBe(500000); expect(Math.abs(result.netCash - 12000000)).toBeLessThanOrEqual(1);

        r.taxMethod = "employer_borne"; r.grossUp = "No";
        result = createEngine(s).payrollResult(r, 10)!;
        expect(result.gross).toBe(12000000); expect(result.tax).toBe(480000);
        expect(result.netCash).toBe(12000000); expect(result.employerBorneTax).toBe(480000);
    });
    it("solves gross-up with Pasal 17 in the final period", () => {
        const s = valid(), r = s.recipients[0], entry = s.entries[0];
        Object.assign(r, { startMonth: 10, endMonth: 10, ptkp: "TK/0", taxMethod: "gross_up", grossUp: "Yes" });
        entry.amount = 130000000;
        const result = createEngine(s).payrollResult(r, 10)!;
        expect(result.docType).toBe("BPA1"); expect(result.gross).toBe(136264600);
        expect(result.parts.taxAllowance).toBe(6264600); expect(result.tax).toBe(6264600);
        expect(result.netCash).toBe(130000000);
        const fields = Object.fromEntries(createEngine(s).documentsForPeriod()[0].fields);
        expect(fields.GrossUpOpt).toBe("Yes"); expect(fields.IncomeTaxBenefit).toBe(6264600);
    });
});
describe("XML adapters and gates", () => {
    it.each([["BPMP", "fixed", 10, false, false], ["BP21", "nonemployee", 10, false, false], ["BP26", "nonemployee", 10, true, false], ["BPA1", "fixed", 12, false, false], ["BPA2", "fixed", 12, false, true]] as const)("matches official %s root and ordered tags", (type, kind, month, foreign, government) => {
        const s = valid(kind, month, foreign, government), engine = createEngine(s), docs = engine.documentsForPeriod(), b = engine.xmlBatchStatus(docs, type), shape = shapes[type];
        expect(b.ready).toBe(true);
        expect(XML_META[type]).toEqual({ root: shape.root, list: shape.list, item: shape.item });
        expect(b.list[0].fields.map(([k]) => k)).toEqual(shape.fields);
        const xml = engine.makeXml(type, b.list);
        expect(xml).toContain('<' + shape.root + ' xmlns:xsi=');
        if (type !== "BP21")
            expect(xml).toContain('xsi:nil="true"');
    });
    it("blocks incomplete identity, annual history, unsupported facilities and future years", () => {
        const s = demo();
        let e = createEngine(s);
        expect(e.xmlBatchStatus(e.documentsForPeriod(), "BPMP").ready).toBe(true);
        const a = valid("fixed", 12);
        a.recipients[0].annualComplete = false;
        e = createEngine(a);
        expect(e.xmlBatchStatus(e.documentsForPeriod(), "BPA1").ready).toBe(false);
        const f = valid("nonemployee");
        f.recipients[0].facility = "DTP";
        e = createEngine(f);
        expect(e.xmlBatchStatus(e.documentsForPeriod(), "BP21").ready).toBe(false);
        const future = valid();
        future.company.year = 2027;
        e = createEngine(future);
        expect(e.xmlBatchStatus(e.documentsForPeriod(), "BPMP").ready).toBe(false);
    });
    it("escapes markup in XML", () => { const s = valid("nonemployee"); s.entries[0].documentNo = 'A&B <invoice>'; const e = createEngine(s); expect(e.makeXml("BP21", e.documentsForPeriod())).toContain("A&amp;B &lt;invoice&gt;"); });
});
describe("Backup, CSV, IDs and ZIP", () => {
    it("restores v2 losslessly and rejects malformed, duplicate and orphan data", () => {
        const s = demo();
        expect(() => checkBackup(JSON.parse(JSON.stringify(s)))).not.toThrow();
        for (const corrupt of [null, {}, { ...s, recipients: [s.recipients[0], s.recipients[0]] }, { ...s, entries: [{ ...s.entries[0], recipientId: "missing" }] }, { ...s, entries: [{ ...s.entries[0], amount: -1 }] }, { ...s, entries: [{ ...s.entries[0], days: 0 }] }, { ...s, company: { ...s.company, year: "2026" } }])
            expect(() => checkBackup(corrupt)).toThrow();
        s.nextId = 1;
        expect(nextId(s, "P")).not.toBe(s.recipients[0].id);
    });
    it("migrates legacy GrossUpOpt Yes backups to automatic gross-up", () => {
        const legacy = demo();
        delete (legacy.recipients[0] as Partial<typeof legacy.recipients[0]>).taxMethod;
        legacy.recipients[0].grossUp = "Yes";
        expect(() => checkBackup(legacy)).not.toThrow();
        expect(legacy.recipients[0].taxMethod).toBe("gross_up");
    });
    it("roundtrips quoted CSV, skips duplicates and reports invalid rows", () => {
        const s = demo();
        s.entries[0].description = 'Line 1; "quoted"\nLine 2';
        const csv = exportCSV(s), target = structuredClone(s);
        target.entries = [];
        const result = importCSV(target, csv);
        expect(result.count).toBe(s.entries.length);
        expect(target.entries[0].description).toBe(s.entries[0].description);
        expect(importCSV(target, csv).duplicates).toBe(s.entries.length);
        expect(importCSV(target, csv.replace("10000000", "-1")).errors.length).toBe(1);
        expect(() => parseCSV('"unclosed')).toThrow();
    });
    it("copies salary without overwriting existing months", () => { const s = valid(); expect(copySalary(s, s.recipients[0].id)).toBe(11); expect(copySalary(s, s.recipients[0].id)).toBe(0); expect(s.entries).toHaveLength(12); });
    it("creates a ZIP with correct local and central signatures", async () => { const b = zipStore([{ name: "test.xml", content: "<root>✓</root>" }]), bytes = new Uint8Array(await b.arrayBuffer()), v = new DataView(bytes.buffer); expect(v.getUint32(0, true)).toBe(0x04034b50); expect(v.getUint32(bytes.length - 22, true)).toBe(0x06054b50); expect(v.getUint16(bytes.length - 12, true)).toBe(1); });
});
describe("RIPITAX PAYROLL workbook import", () => {
    it("imports company metadata and component columns from the supplied template shape", async () => {
        const book = XLSX.utils.book_new(), rows: (string | number)[][] = Array.from({ length: 12 }, () => []);
        rows[4][2] = "PT TEMPLATE"; rows[4][10] = "0000000000000000"; rows[4][18] = "0000000000000000000000"; rows[4][26] = 2026; rows[4][30] = "Oktober"; rows[4][34] = "2026-10-31";
        rows[10] = [...PAYROLL_HEADERS];
        rows[11] = ["T-001", "EMP-001", "Nadia", "0000000000000001", "Pegawai tetap", "SPDN", "K/0", "Swasta", "Oktober", "Biasa", "Januari", "Desember", 10000000, 500000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Gross", "Normal", "21-100-01", "2026-10-31", "Kontrak", "K-001", "2026-10-01", "", "", "Analis", "", "", "Data uji"];
        const sheet = XLSX.utils.aoa_to_sheet(rows); XLSX.utils.book_append_sheet(book, sheet, "PAYROLL");
        const bytes = XLSX.write(book, { type: "array", bookType: "xlsx" });
        const imported = await importPayrollWorkbook({ name: "RIPITAX_PAYROLL.xlsx", arrayBuffer: async () => bytes } as File);
        expect(imported.studio.company.name).toBe("PT TEMPLATE");
        expect(imported.recipients).toBe(1);
        expect(imported.entries).toBe(2);
        expect(imported.studio.recipients[0].position).toBe("Analis");
    });
    it("keeps the 38-column template released before the extended drag-and-drop contract compatible", async () => {
        const legacyHeaders = PAYROLL_HEADERS.slice(0, 38), book = XLSX.utils.book_new(), rows: (string | number)[][] = Array.from({ length: 12 }, () => []);
        rows[4][2] = "PT LEGACY"; rows[4][10] = "0000000000000000"; rows[4][18] = "0000000000000000000000"; rows[4][26] = 2026; rows[4][30] = "Oktober"; rows[4][34] = "2026-10-31";
        rows[10] = legacyHeaders; rows[11] = ["TRX-LEGACY", "EMP-LEGACY", "Lili", "0000000000000001", "Pegawai tetap", "SPDN", "TK/0", "Swasta", "Oktober", "Normal", "2021-03-15", "", "10,000,000", 0, 0, 0, 0, 0, "590,700", 0, 0, "515,474", "120,000", 0, 0, "Gross", "Normal", "21-100-01", "2026-10-31", "Bukti pembayaran", "PAY-001", "2026-10-31", "", "", "Staf", "", "", "Data template lama"];
        const sheet = XLSX.utils.aoa_to_sheet(rows); XLSX.utils.book_append_sheet(book, sheet, "PAYROLL");
        const imported = await importPayrollWorkbook({ name: "RIPITAX_PAYROLL.xlsx", arrayBuffer: async () => XLSX.write(book, { type: "array", bookType: "xlsx" }) } as File);
        expect(imported.studio.recipients[0]).toMatchObject({ employeeId: "EMP-LEGACY", startMonth: 3, endMonth: 12 });
        expect(imported.studio.entries).toEqual(expect.arrayContaining([expect.objectContaining({ id: "TRX-LEGACY-salary", amount: 10000000 }), expect.objectContaining({ comp: "employerInsurance", amount: 590700 }), expect.objectContaining({ comp: "pensionContribution", amount: 515474 }), expect.objectContaining({ comp: "bpjsDeduction", amount: 120000 })]));
    });
    it("imports the public template used by drag-and-drop and Muat Contoh without rejected rows", async () => {
        const bytes = await readFile("public/tools/payroll/RIPITAX_PAYROLL.xlsx");
        const imported = await importPayrollWorkbook({ name: "RIPITAX_PAYROLL.xlsx", arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) } as File);
        expect(imported).toMatchObject({ recipients: 421, entries: 947, errors: [] });
        expect(imported.studio.company).toMatchObject({ name: "PT Uji Coba Ripitax Nusantara (DUMMY)", year: 2026, month: 10 });
    });
    it("validates full work periods across years and reports truly out-of-period rows", async () => {
        const book = XLSX.utils.book_new(), rows: (string | number)[][] = Array.from({ length: 15 }, () => []);
        rows[4][2] = "PT TEST"; rows[4][10] = "0000000000000000"; rows[4][18] = "0000000000000000000000"; rows[4][26] = 2026; rows[4][30] = "Oktober"; rows[4][34] = "2026-10-31";
        rows[10] = [...PAYROLL_HEADERS];
        rows[11] = ["TRX-383", "P0383", "Laras", "0000000000000001", "Pegawai tetap", "SPDN", "TK/0", "Swasta", "Oktober", "Masa terakhir", "2026-10-01", 46326, 130000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, " GROSS UP ", "Normal", "21-100-01", "2026-10-31", "Bukti pembayaran", "PAY-383", "2026-10-31", "", "", "Staf", "", "", "serial date"];
        rows[12] = ["TRX-384", "P0384", "Adi", "0000000000000002", "Pegawai tetap", "SPDN", "TK/0", "Swasta", "Oktober", "Normal", "2025-12-01", "", 12000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Ditanggung perusahaan", "Normal", "21-100-01", "2026-10-31", "Bukti pembayaran", "PAY-384", "2026-10-31", "", "", "Staf", "", "", "cross-year valid"];
        rows[13] = ["TRX-385", "P0385", "Bima", "0000000000000003", "Pegawai tetap", "SPDN", "TK/0", "Swasta", "Oktober", "Normal", "2026-11-01", "", 12000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Gross", "Normal", "21-100-01", "2026-10-31", "Bukti pembayaran", "PAY-385", "2026-10-31", "", "", "Staf", "", "", "before work starts"];
        rows[14] = ["TRX-404", "P0404", "Vina", "0000000000000004", "Mantan pegawai", "SPDN", "TK/0", "Swasta", "Oktober", "Normal", "2015-02-01", "2025-12-31", 40000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "Gross", "Normal", "21-100-11", "2026-10-31", "Bukti pembayaran", "PAY-404", "2026-10-31", "", "", "Staf", "", "", "post-employment payment"];
        XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), "PAYROLL");
        const imported = await importPayrollWorkbook({ name: "RIPITAX_PAYROLL.xlsx", arrayBuffer: async () => XLSX.write(book, { type: "array", bookType: "xlsx" }) } as File);
        const laras = imported.studio.recipients.find(r => r.employeeId === "P0383")!, adi = imported.studio.recipients.find(r => r.employeeId === "P0384")!, bima = imported.studio.recipients.find(r => r.employeeId === "P0385")!, vina = imported.studio.recipients.find(r => r.employeeId === "P0404")!;
        expect(laras).toMatchObject({ endMonth: 10, taxMethod: "gross_up", grossUp: "Yes" });
        expect(createEngine(imported.studio).payrollResult(laras, 10)).toMatchObject({ docType: "BPA1", tax: 6264600 });
        expect(adi).toMatchObject({ taxMethod: "employer_borne", startMonth: 12, endMonth: 12 });
        expect(imported.studio.entries.some(e => e.recipientId === adi.id)).toBe(true);
        expect(imported.studio.entries.some(e => e.recipientId === vina.id)).toBe(true);
        expect(imported.studio.entries.some(e => e.recipientId === bima.id)).toBe(false);
        expect(imported.errors).toEqual(["Baris 14: periode transaksi 2026-10 berada di luar masa kerja 2026-11 s.d. aktif untuk penerima P0385."]);
    });
});
