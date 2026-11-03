import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { demo, entryDefault } from './data';
import { createEngine } from './engine.js';
import { createDocumentSnapshot, payrollColumns, payrollWorkbook, safeFilePart, slipFileNames, xmlFiles } from './documents';
import { payrollPdf, slipPdf } from './pdf';
import { zipStore } from './zip.js';

async function pdfText(bytes: Uint8Array) {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const task = pdfjs.getDocument({ data: bytes.slice(), useSystemFonts: true });
    const pdf = await task.promise;
    try {
        const pages: string[] = [];
        for (let index = 1; index <= pdf.numPages; index++) {
            const content = await (await pdf.getPage(index)).getTextContent();
            pages.push(content.items.map(item => 'str' in item ? item.str : '').join(' '));
        }
        return pages.join('\n');
    } finally { await task.destroy(); }
}
function unzipStored(bytes: Uint8Array) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), decoder = new TextDecoder();
    let offset = 0; const files: { name: string; bytes: Uint8Array }[] = [];
    while (view.getUint32(offset, true) === 0x04034b50) {
        expect(view.getUint16(offset + 8, true)).toBe(0);
        expect(view.getUint16(offset + 6, true) & 0x800).toBe(0x800);
        const size = view.getUint32(offset + 18, true), nameLength = view.getUint16(offset + 26, true), extra = view.getUint16(offset + 28, true);
        const start = offset + 30 + nameLength + extra;
        const data = bytes.slice(start, start + size); let crc = 0xffffffff;
        for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
        expect(view.getUint32(offset + 14, true)).toBe((crc ^ 0xffffffff) >>> 0);
        files.push({ name: decoder.decode(bytes.slice(offset + 30, offset + 30 + nameLength)), bytes: data }); offset = start + size;
    }
    expect(view.getUint32(offset, true)).toBe(0x02014b50);
    return files;
}
describe('Step 04 shared document snapshot', () => {
    it('preserves all calculations, noncash income, deductions and frozen period', () => {
        const state = demo();
        state.entries.push({ ...entryDefault(state, state.recipients[0].id), comp: 'natura', amount: 1000000 });
        const snapshot = createDocumentSnapshot(state), engine = createEngine(state);
        expect(snapshot.people).toHaveLength(10);
        snapshot.people.forEach(p => expect(p.summary).toEqual(engine.taxMonthSummary(p.recipient, 10)));
        const asn = snapshot.people.find(p => p.recipient.employeeId === 'ASN-001')!;
        expect(asn.summary.deductions).toBe(350000);
        expect(asn.summary.netCash).not.toBe(asn.summary.gross - asn.summary.tax);
        expect(snapshot.people[0].summary.gross).toBe(11000000);
        expect(snapshot.people[0].summary.cash).toBe(10000000);
        state.company.month = 11; state.recipients[0].name = 'CHANGED';
        expect(snapshot.period).toBe('2026-10'); expect(snapshot.people[0].recipient.name).toBe('Nadia Pramesti');
    });
    it('separates XML identity and mapping issues from payroll calculation failures', () => {
        const state = demo(); state.recipients[0].tin = ''; state.recipients[0].tku = '';
        let snapshot = createDocumentSnapshot(state);
        expect(snapshot.people[0].errors).toEqual([]); expect(snapshot.people[0].xmlErrors.length).toBeGreaterThan(0);
        expect(snapshot.people.find(p => p.recipient.kind === 'former')!.errors).toEqual([]);
        state.recipients[0].taxMethod = 'gross_up'; state.recipients[0].grossUp = 'Yes'; snapshot = createDocumentSnapshot(state);
        expect(snapshot.people[0].errors.join(' ')).not.toContain('Gross-up');
    });
    it('uses recipient category, not XML type, for slip titles and preserves negative reconciliation', () => {
        const snapshot = createDocumentSnapshot(demo());
        expect(snapshot.people.find(p => p.recipient.kind === 'casual_month')!.title).toBe('Slip Gaji');
        expect(snapshot.people.find(p => p.recipient.kind === 'pension')!.title).toBe('Slip Pembayaran');
        const state = demo(); state.entries = [{ ...state.entries[0], month: 1, amount: 100000000 }]; state.company.month = 12;
        const annual = createDocumentSnapshot(state).people[0];
        expect(annual.summary.tax).toBeLessThan(0); expect(annual.hasPayment).toBe(true);
        expect(annual.summary).toEqual(createEngine(state).taxMonthSummary(state.recipients[0], 12));
    });
    it('does not issue empty slips and catches deductions unsupported by Step 03', () => {
        const state = demo(); state.entries = state.entries.filter(e => e.recipientId !== state.recipients[0].id);
        expect(createDocumentSnapshot(state).people[0].errors.join(' ')).toContain('Tidak ada pembayaran');
        state.entries.push({ ...entryDefault(state, state.recipients[1].id), comp: 'otherDeduction', amount: 1000 });
        expect(createDocumentSnapshot(state).people[1].errors.join(' ')).toContain('Potongan komponen');
    });
});
describe('XML exports and unique names', () => {
    it('retains the 3/6/1/0/0 demo and exports invalid BP21 only as DRAFT', () => {
        const snapshot = createDocumentSnapshot(demo());
        expect(snapshot.batches.map(b => b.count)).toEqual([3, 6, 1, 0, 0]);
        expect(xmlFiles(snapshot, false).map(f => f.type)).toEqual(['BPMP', 'BP26']);
        expect(xmlFiles(snapshot, true).map(f => f.name)).toEqual(['PPH21_BPMP_2026-10.xml', 'PPH21_BP21_2026-10_DRAFT.xml', 'PPH21_BP26_2026-10.xml']);
        expect(xmlFiles(snapshot, true, 'BPA1')).toEqual([]);
        expect(xmlFiles(snapshot, true, 'BPA2')).toEqual([]);
    });
    it('exports three complete valid types for a separate valid 10-recipient fixture', () => {
        const state = demo(), former = state.recipients.find(r => r.kind === 'former')!;
        former.kind = 'nonemployee'; former.taxObject = '21-100-07';
        const snapshot = createDocumentSnapshot(state), files = xmlFiles(snapshot, false);
        expect(snapshot.batches.map(b => b.count)).toEqual([3, 6, 1, 0, 0]); expect(files).toHaveLength(3);
        for (const file of files) expect(file.content).toBe(snapshot.engine.makeXml(file.type, snapshot.docs));
    });
    it('blocks malformed field structure even in the draft path', () => {
        const snapshot = createDocumentSnapshot(demo());
        snapshot.batches[0].list[0].fields.pop();
        expect(() => xmlFiles(snapshot, true)).toThrow('Struktur BPMP');
    });
    it('sanitizes paths and resolves collisions including duplicate external IDs', () => {
        const state = demo(); state.recipients.forEach(r => { r.kind = 'fixed'; r.name = '../../Nadia:*?'; r.employeeId = 'EMP/001'; });
        const names = [...slipFileNames(createDocumentSnapshot(state)).values()];
        expect(new Set(names).size).toBe(10);
        expect(names.every(name => /^SLIP_GAJI_2026-10_EMP_001_NADIA(?:_[A-Z0-9_-]+)?\.pdf$/.test(name))).toBe(true);
        expect(safeFilePart(' A\u0000/B\\C ')).toBe('A_B_C');
    });
});
describe('PDF, Excel and binary ZIP', () => {
    it('creates one private PDF per recipient, with matching amounts and payroll labels', async () => {
        const snapshot = createDocumentSnapshot(demo()), files: { name: string; content: Uint8Array }[] = [];
        const names = slipFileNames(snapshot);
        for (const person of snapshot.people) {
            const bytes = await slipPdf(snapshot, person), text = await pdfText(bytes);
            expect(text).toContain(person.recipient.name); expect(text).toContain(person.title);
            expect(text).toContain(Math.round(person.summary.netCash).toLocaleString('id-ID'));
            for (const other of snapshot.people.filter(p => p !== person)) expect(text).not.toContain(other.recipient.name);
            expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0);
            files.push({ name: names.get(person.recipient.id)!, content: bytes });
        }
        const zip = new Uint8Array(await zipStore(files).arrayBuffer()), extracted = unzipStored(zip);
        expect(extracted).toHaveLength(10);
        extracted.forEach((file, index) => expect(file.bytes).toEqual(files[index].content));
    }, 20000);
    it('exports all recap components, totals and text identities to PDF and Excel', async () => {
        const snapshot = createDocumentSnapshot(demo()), bytes = await payrollPdf(snapshot), text = await pdfText(bytes);
        snapshot.people.forEach(p => expect(text).toContain(p.recipient.name));
        expect(text).toContain('59.018.500');
        const workbook = XLSX.read(await payrollWorkbook(snapshot), { type: 'array' });
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(workbook.Sheets['Payroll Internal'], { header: 1 });
        expect(rows).toHaveLength(14); expect(rows[3][0]).toBe('EMP-001');
        const columns = payrollColumns(snapshot), total = rows.at(-1)!;
        columns.forEach((column, i) => expect(total[i + 3]).toBe(snapshot.people.reduce((sum, p) => sum + column.value(p), 0)));
    });
    it('creates a final slip using the same automatic gross-up amount as the summary', async () => {
        const state = demo(); state.recipients[0].taxMethod = 'gross_up'; state.recipients[0].grossUp = 'Yes'; const snapshot = createDocumentSnapshot(state);
        expect(snapshot.people[0].errors).toEqual([]);
        expect(await pdfText(await slipPdf(snapshot, snapshot.people[0]))).toContain('Tunjangan PPh');
    });
    it('handles long details, repeated recap headers and binary data without corrupting XML', async () => {
        const state = demo();
        state.recipients[0].position = 'Keterangan profesi panjang '.repeat(100);
        const snapshot = createDocumentSnapshot(state), bytes = await slipPdf(snapshot, snapshot.people[0]);
        expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
        const files = [{ name: 'uji_é.xml', content: '<x>é &amp; test</x>' }, { name: 'slip.pdf', content: bytes }];
        const extracted = unzipStored(new Uint8Array(await zipStore(files).arrayBuffer()));
        expect(new TextDecoder().decode(extracted[0].bytes)).toBe(files[0].content);
        expect(extracted[0].name).toBe('uji_é.xml'); expect(extracted[1].bytes).toEqual(bytes);
    });
});
