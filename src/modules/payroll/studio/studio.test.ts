import { describe, it, expect } from "vitest";
import { createEngine } from "./engine.js";
import { checkBackup, copySalary, dateFor, demo, entryDefault, fresh, nextId, recipientDefault } from "./data";
import { exportCSV, importCSV, parseCSV } from "./csv";
import { KINDS, RULES, XML_META } from "./catalog.js";
import { zipStore } from "./zip.js";
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
