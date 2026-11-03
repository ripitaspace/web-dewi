import { COMPONENTS, KINDS, XML_META } from './catalog.js';
import { createEngine } from './engine.js';
import type { Studio } from './model';
import xmlShapes from './official-xml-shapes.json';

// These messages concern XML mapping only, not the calculated payment.
const XML_ONLY_ISSUES = new Set([
    'Tarif Pasal 17 progresif harian tidak dapat dipetakan sebagai satu Rate XML secara aman.',
    'Tarif progresif lebih dari satu lapisan: satu angka Rate XML perlu dipastikan dengan referensi DJP.',
    'Pengecualian material/tenaga pihak lain membutuhkan pemetaan DPP khusus yang belum tervalidasi pada XML.',
    'Kode objek penghasilan mantan pegawai belum dipetakan otomatis; perlu review.',
]);
export const xmlTypes = Object.keys(XML_META);
export const componentLabel = (key: string) => COMPONENTS[key as keyof typeof COMPONENTS]?.label || key;
export const categoryLabel = (key: string) => KINDS[key as keyof typeof KINDS] || key;
export const isSalary = (kind: string) => ['fixed', 'casual_month', 'casual_daily'].includes(kind);
export const periodKey = (state: Studio) => `${state.company.year}-${String(state.company.month).padStart(2, '0')}`;

export function createDocumentSnapshot(input: Studio) {
    const state = structuredClone(input), engine = createEngine(state), docs = engine.documentsForPeriod();
    const people = state.recipients.map(recipient => {
        const summary = engine.taxMonthSummary(recipient, state.company.month);
        const parts = engine.periodParts(recipient, state.company.month).parts;
        const generatedAllowance = summary.rows.reduce((total, row) => total + (row.parts.taxAllowance || 0), 0);
        if (summary.rows.some(row => Object.hasOwn(row.parts, "taxAllowance"))) parts.taxAllowance = generatedAllowance;
        const entries = engine.linesFor(recipient.id, state.company.month);
        const errors: string[] = [];
        if (!state.company.name.trim()) errors.push('Isi nama perusahaan.');
        if (!recipient.name.trim()) errors.push('Isi nama penerima.');
        if (!recipient.employeeId.trim()) errors.push('Isi ID penerima.');
        if (!Number.isInteger(state.company.year) || state.company.year < 1900 || !Number.isInteger(state.company.month) || state.company.month < 1 || state.company.month > 12) errors.push('Periode pembayaran tidak valid.');
        const hasPayment = summary.rows.length > 0 && (entries.length > 0 || summary.tax !== 0);
        if (!hasPayment) errors.push('Tidak ada pembayaran atau rekonsiliasi pada periode ini.');
        if (entries.some(e => !Number.isFinite(e.amount) || e.amount < 0 || !Object.hasOwn(COMPONENTS, e.comp))) errors.push('Periksa nilai dan komponen penghasilan.');
        if ([summary.gross, summary.cash, summary.tax, summary.deductions, summary.netCash].some(v => !Number.isFinite(v))) errors.push('Hasil perhitungan tidak valid.');
        errors.push(...summary.issues.filter(issue => !XML_ONLY_ISSUES.has(issue)));
        // Do not invent a different cash calculation for unsupported entry combinations.
        const componentDeductions = Object.entries(parts).reduce((sum, [key, amount]) => sum + (COMPONENTS[key as keyof typeof COMPONENTS]?.cash === -1 ? amount : 0), 0);
        if (componentDeductions !== summary.deductions) errors.push('Potongan komponen belum cocok dengan hasil Step 03; periksa klasifikasi penghasilan.');
        const xmlDocs = docs.filter(d => d.recipientId === recipient.id);
        return { recipient, summary, parts, hasPayment, errors: [...new Set(errors)], xmlDocs,
            xmlErrors: [...new Set(xmlDocs.flatMap(d => d.errors))],
            title: isSalary(recipient.kind) ? 'Slip Gaji' : 'Slip Pembayaran' };
    });
    const batches = xmlTypes.map(type => ({ type, ...engine.xmlBatchStatus(docs, type) }));
    return { state, engine, docs, people, batches, period: periodKey(state) };
}
export type DocumentSnapshot = ReturnType<typeof createDocumentSnapshot>;
export type PayrollPerson = DocumentSnapshot['people'][number];

export function safeFilePart(value: string) {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^[_-]+|[_-]+$/g, '').slice(0, 70).toUpperCase() || 'TANPA_NAMA';
}
export function slipFileNames(snapshot: DocumentSnapshot) {
    const names = new Map<string, string>(), used = new Set<string>();
    for (const p of [...snapshot.people].sort((a, b) => a.recipient.id.localeCompare(b.recipient.id))) {
        const prefix = isSalary(p.recipient.kind) ? 'SLIP_GAJI' : 'SLIP_PEMBAYARAN';
        const base = `${prefix}_${snapshot.period}_${safeFilePart(p.recipient.employeeId)}_${safeFilePart(p.recipient.name)}`;
        let name = `${base}.pdf`, suffix = 0;
        while (used.has(name)) name = `${base}_${safeFilePart(p.recipient.id)}${suffix++ ? `_${suffix}` : ''}.pdf`;
        used.add(name); names.set(p.recipient.id, name);
    }
    return names;
}
export function xmlFiles(snapshot: DocumentSnapshot, includeDraft: boolean, onlyType?: string) {
    return snapshot.batches.filter(b => b.count && (!onlyType || b.type === onlyType) && (b.ready || includeDraft)).map(b => {
        const shape = xmlShapes[b.type as keyof typeof xmlShapes], meta = XML_META[b.type as keyof typeof XML_META];
        if (!shape || meta.root !== shape.root || meta.list !== shape.list || meta.item !== shape.item || b.list.some(d => d.type !== b.type || d.fields.length !== shape.fields.length || d.fields.some(([key], i) => key !== shape.fields[i]))) {
            throw new Error(`Struktur ${b.type} tidak cocok dengan referensi template DJP; ekspor termasuk draft ditahan.`);
        }
        return { name: `PPH21_${b.type}_${snapshot.period}${b.ready ? '' : '_DRAFT'}.xml`,
            content: snapshot.engine.makeXml(b.type, b.list), type: b.type, draft: !b.ready };
    });
}
export function payrollColumns(snapshot: DocumentSnapshot) {
    const components = Object.keys(COMPONENTS).filter(key => snapshot.people.some(p => p.parts[key]));
    return [
        ...components.map(key => ({ key, label: componentLabel(key), value: (p: PayrollPerson) => p.parts[key] || 0 })),
        ...(['gross', 'cash', 'tax', 'deductions', 'netCash'] as const).map((key, index) => ({ key, label: ['Bruto pajak', 'Penghasilan tunai', 'PPh 21/26', 'Potongan nonpajak', 'Netto dibayarkan'][index], value: (p: PayrollPerson) => p.summary[key] })),
        ...(snapshot.people.some(p => p.summary.employerBorneTax > 0) ? [{ key: 'employerBorneTax', label: 'PPh ditanggung perusahaan', value: (p: PayrollPerson) => p.summary.employerBorneTax }] : []),
    ];
}
export async function payrollWorkbook(snapshot: DocumentSnapshot) {
    const XLSX = await import('xlsx'), columns = payrollColumns(snapshot);
    const rows = [
        [snapshot.state.company.name, 'Rekap Payroll Internal', snapshot.period],
        [`Seluruh ${snapshot.people.length} penerima · periode aktif`],
        ['ID', 'Nama', 'Kategori', ...columns.map(c => c.label), 'Status pembayaran'],
        ...snapshot.people.map(p => [p.recipient.employeeId, p.recipient.name, categoryLabel(p.recipient.kind), ...columns.map(c => c.value(p)), p.errors.length ? p.errors.join(' ') : 'Siap']),
        ['TOTAL', `${snapshot.people.length} penerima`, '', ...columns.map(c => snapshot.people.reduce((sum, p) => sum + c.value(p), 0)), ''],
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = [{ wch: 18 }, { wch: 30 }, { wch: 27 }, ...columns.map(() => ({ wch: 23 })), { wch: 60 }];
    for (let row = 3; row < rows.length; row++) for (let col = 3; col < columns.length + 3; col++) {
        const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })]; if (cell) cell.z = '#,##0;[Red]-#,##0';
    }
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, sheet, 'Payroll Internal');
    return new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }));
}
