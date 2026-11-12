import { catalog, declarationFields, partnerFields, profileFields, type Field } from './model';
import { answerTicks, boxSlots, digitBinding, resultSlots, tableBindings, tickSets, type TableBinding } from './coretax-map';
import { slotInventory } from './coretax-layout.generated';

/**
 * Semantic registry for every generated form slot. The renderer consumes this
 * metadata; it never guesses a box's meaning from its visual dimensions.
 */
export type AnnotationKind = 'input' | 'choice' | 'table-cell' | 'calculated' | 'helper' | 'static';
export type AnnotationStatus = 'mapped' | 'unmapped' | 'verification-required';
export type AnnotationEditability = 'direct' | 'editor' | 'readonly' | 'none';

export interface FormAnnotation {
    id: string;
    page: number;
    kind: AnnotationKind;
    status: AnnotationStatus;
    editability: AnnotationEditability;
    label: string;
    dataPath?: string;
    validation?: string;
    dependencies?: string[];
    explanation?: string;
}

const allScalarFields = {
    profile: profileFields,
    questions: catalog.questionFields,
    extras: catalog.extraFields,
    partner: partnerFields,
    declaration: declarationFields,
} as const;
type ScalarGroup = keyof typeof allScalarFields;
export type EditorSource = 'profile' | 'questions' | 'extras';
export interface FormSection {
    title: string;
    description: string;
    sources: Array<{ group: EditorSource; keys: string[] }>;
}

/**
 * The editor follows the same reading order as the Induk form. Keeping this
 * here lets the form registry remain the single source for slot meaning and
 * its editor grouping.
 */
export const formSections: FormSection[] = [
    { title: 'Informasi SPT', description: 'Tahun, jenis periode, dan status SPT yang sedang disusun.', sources: [{ group: 'profile', keys: ['year', 'periodType', 'sptStatus', 'amendment', 'fromMonth', 'toMonth'] }] },
    { title: 'A. Identitas Wajib Pajak', description: 'Identitas dan kontak wajib pajak pada Induk SPT.', sources: [{ group: 'profile', keys: ['tin', 'name', 'idType', 'idNumber', 'phone', 'email'] }] },
    { title: 'B. Sumber Penghasilan & Pembukuan', description: 'Dasar sumber penghasilan dan metode pencatatan yang digunakan.', sources: [{ group: 'profile', keys: ['incomeSource', 'bookMethod', 'ptkp', 'maritalTax', 'spouseTin'] }, { group: 'questions', keys: ['hasJobs', 'hasBusiness', 'hasUMKM', 'hasOPPT', 'hasNorm', 'sector', 'hasOtherDomestic', 'hasForeign'] }] },
    { title: 'C. Pengurang & Perhitungan PPh Terutang', description: 'Pilihan yang menentukan lampiran pengurang dan nilai PPh terutang.', sources: [{ group: 'questions', keys: ['hasDeductions', 'hasTaxRelief'] }] },
    { title: 'D. Kredit Pajak', description: 'Pertanyaan dan data pendukung kredit pajak pada Bagian D Induk SPT.', sources: [{ group: 'questions', keys: ['hasWithholding', 'hasForeignRefund'] }, { group: 'extras', keys: ['p25Paid', 'p25STP', 'foreignRefund'] }] },
];
const slotId = (type: string, page: number, ...parts: Array<string | number>) => [type, `p${page}`, ...parts].join(':');

function scalarField(group: string, key: string): Field | undefined {
    return (allScalarFields[group as ScalarGroup] || []).find(field => field.key === key);
}

function validationFor(field?: Field, fallback?: string) {
    if (!field) return fallback;
    if (field.key === 'tin' || field.key === 'spouseTin') return '16 digit angka';
    if (field.key === 'year') return 'tahun 4 digit';
    if (['fromMonth', 'toMonth'].includes(field.key)) return 'bulan 1–12';
    if (field.type === 'money') return 'angka rupiah';
    if (field.type === 'date') return 'tanggal valid';
    if (field.type === 'yesno') return 'pilih Ya atau Tidak';
    if (field.type === 'select') return field.required ? 'pilihan wajib' : 'pilihan terdaftar';
    return field.required ? 'wajib diisi' : fallback;
}

function annotationFromPath(id: string, page: number, path: string, editability: AnnotationEditability = 'direct'): FormAnnotation {
    const [group, key] = path.split('.') as [ScalarGroup, string];
    const field = scalarField(group, key);
    return {
        id, page, kind: field?.type === 'yesno' || field?.type === 'select' ? 'choice' : 'input',
        status: field ? 'mapped' : 'unmapped', editability: field ? editability : 'none',
        label: field?.label || path, dataPath: path, validation: validationFor(field, 'nilai teks terdaftar'),
        explanation: field ? `Nilai disimpan pada ${path}.` : 'Kotak belum memiliki field data yang terdaftar.',
    };
}

const calculatedSources: Record<string, { dependencies: string[]; explanation: string }> = {
    '@assets': { dependencies: ['tables.cash', 'tables.receivables', 'tables.investments', 'tables.movable', 'tables.immovable', 'tables.otherassets'], explanation: 'Total nilai saat ini seluruh harta aktif.' },
    business: { dependencies: ['questions.hasNorm', 'tables.nppn', 'books.{sector}'], explanation: 'Neto usaha mengikuti Norma atau rekonsiliasi usaha yang berlaku.' },
    net: { dependencies: ['tables.jobs', 'tables.nppn', 'tables.otherdomestic', 'tables.foreign'], explanation: 'Rekap penghasilan neto dari seluruh sumber yang dipetakan.' },
    afterDed: { dependencies: ['result.net', 'tables.deductions', 'tables.taxloss'], explanation: 'Penghasilan neto dikurangi pengurang yang dipetakan.' },
    pt: { dependencies: ['profile.ptkp'], explanation: 'PTKP mengikuti status PTKP yang dipilih.' },
    pk: { dependencies: ['result.net', 'profile.ptkp', 'ruleset.2025'], explanation: 'PKP hanya dihitung oleh ruleset yang telah terverifikasi.' },
    rawTax: { dependencies: ['result.pk', 'ruleset.2025'], explanation: 'PPh terutang mengikuti ruleset 2025 yang tersedia.' },
    tax: { dependencies: ['result.rawTax'], explanation: 'PPh setelah pengurang mengikuti hasil PPh terutang yang terverifikasi.' },
    credit: { dependencies: ['tables.withholding', 'tables.foreign'], explanation: 'Rekap kredit pajak dari bukti potong dan kredit luar negeri.' },
    balance: { dependencies: ['result.tax', 'result.credit'], explanation: 'Selisih PPh terutang dengan kredit pajak.' },
    p25Paid: { dependencies: ['extras.p25Paid'], explanation: 'Nilai PPh Pasal 25 yang dicatat sebagai data pendukung.' },
    p25STP: { dependencies: ['extras.p25STP'], explanation: 'Pokok STP PPh Pasal 25 yang dicatat sebagai data pendukung.' },
    foreignRefund: { dependencies: ['extras.foreignRefund'], explanation: 'Pengembalian kredit luar negeri yang dicatat sebagai data pendukung.' },
    deferral: { dependencies: ['extras.deferral'], explanation: 'Nilai penundaan atau angsuran yang dicatat sebagai data pendukung.' },
    previousBalance: { dependencies: ['extras.previousBalance'], explanation: 'Saldo SPT sebelumnya yang dicatat sebagai data pendukung.' },
    p25Next: { dependencies: ['result.balance', 'questions.hasP25', 'ruleset.2025'], explanation: 'Angsuran berikutnya hanya dihitung bila skenario ruleset memenuhi syarat.' },
    relief: { dependencies: ['tables.taxrelief'], explanation: 'Total pengurang PPh dari Lampiran 5C.' },
    debt: { dependencies: ['tables.debts'], explanation: 'Total saldo utang akhir tahun.' },
    final: { dependencies: ['tables.finalincome'], explanation: 'Total dasar penghasilan final.' },
    exempt: { dependencies: ['tables.exempt'], explanation: 'Total penghasilan bukan objek pajak.' },
    payable: { dependencies: ['result.balance', 'extras.deferral'], explanation: 'Menunggu rumus dan contoh acuan resmi.' },
    amended: { dependencies: ['profile.sptStatus', 'extras.previousBalance'], explanation: 'Menunggu rumus pembetulan yang terverifikasi.' },
};

export function annotateDigits(page: number, index: number, count: number): FormAnnotation {
    const binding = digitBinding(page, index, count);
    const key = binding.key;
    if (!key) return { id: slotId('digits', page, index), page, kind: 'helper', status: 'verification-required', editability: 'none', label: 'Digit tampilan', explanation: 'Nilai ditampilkan dari field tanggal/pernyataan; editor langsung belum dipetakan.' };
    return annotationFromPath(slotId('digits', page, index), page, `profile.${key}`);
}

export function annotateTick(page: number, index: number): FormAnnotation {
    const set = tickSets[page]?.[index];
    if (!set) return { id: slotId('tick', page, index), page, kind: 'helper', status: 'verification-required', editability: 'editor', label: 'Pilihan formulir', explanation: 'Centang ini mencerminkan jawaban di editor; pemetaan langsung perlu verifikasi.' };
    return annotationFromPath(slotId('tick', page, index), page, `${set.group}.${set.key}`);
}

export function annotateAnswer(page: number, index: number): FormAnnotation {
    const ticks = answerTicks[page]?.[index];
    return {
        id: slotId('answer', page, index), page, kind: 'helper', status: ticks?.length ? 'mapped' : 'unmapped', editability: 'readonly',
        label: 'Nomor pilihan', dependencies: ticks?.map(tick => `tick:p${page}:${tick}`),
        explanation: ticks?.length ? 'Menampilkan urutan pilihan yang dicentang pada pertanyaan terkait.' : 'Kotak jawaban belum terhubung dengan kelompok pilihan.',
    };
}

export function annotateBox(page: number, index: number): FormAnnotation {
    const path = boxSlots[page]?.[index];
    return path
        ? annotationFromPath(slotId('box', page, index), page, path)
        : { id: slotId('box', page, index), page, kind: 'static', status: 'unmapped', editability: 'none', label: 'Kotak template', explanation: 'Kotak tersedia pada template, tetapi belum memiliki sumber data yang aman untuk diisi.' };
}

export function annotateResult(page: number, index: number): FormAnnotation {
    const key = resultSlots[page]?.[index];
    if (!key) return { id: slotId('result', page, index), page, kind: 'static', status: 'unmapped', editability: 'none', label: 'Hasil template', explanation: 'Kotak hasil belum memiliki sumber atau rumus.' };
    if (key.startsWith('extras.')) return annotationFromPath(slotId('result', page, index), page, key, 'editor');
    const source = calculatedSources[key];
    return {
        id: slotId('result', page, index), page, kind: 'calculated', status: source ? (['payable', 'amended'].includes(key) ? 'verification-required' : 'mapped') : 'unmapped', editability: 'readonly', label: `Hasil ${key}`,
        dataPath: `result.${key}`, dependencies: source?.dependencies, explanation: source?.explanation || 'Sumber perhitungan belum terdaftar.',
    };
}

function tableField(binding: TableBinding, column: number) {
    if (!binding.section) return undefined;
    const key = binding.cols[column];
    return key && !key.startsWith('@') && key !== '#no' ? catalog.tables[binding.section]?.columns.find(field => field.key === key) : undefined;
}

export function annotateCell(page: number, table: number, row: number, column: number, sum = false): FormAnnotation {
    const binding = tableBindings[`${page}.${table}`];
    const id = slotId('cell', page, table, row, column, sum ? 'sum' : 'value');
    if (!binding) return { id, page, kind: 'static', status: 'unmapped', editability: 'none', label: 'Sel template', explanation: 'Tabel belum memiliki pemetaan data.' };
    if (sum && `${page}.${table}` === '6.2') return { id, page, kind: 'calculated', status: 'mapped', editability: 'readonly', label: 'Total harta', dataPath: 'result.assets', dependencies: calculatedSources['@assets'].dependencies, explanation: calculatedSources['@assets'].explanation };
    if (sum) return { id, page, kind: 'calculated', status: binding.section || binding.book ? 'mapped' : 'verification-required', editability: 'readonly', label: 'Total tabel', dataPath: binding.section ? `tables.${binding.section}` : binding.book ? `books.${binding.book}` : undefined, dependencies: binding.section ? [`tables.${binding.section}`] : binding.book ? [`books.${binding.book}`] : undefined, explanation: 'Total dihitung dari baris aktif pada tabel terkait.' };
    if (binding.book) return { id, page, kind: 'table-cell', status: 'mapped', editability: 'editor', label: `Sel rekonsiliasi ${binding.book}`, dataPath: `books.${binding.book}[].*`, validation: 'nilai mengikuti kolom buku besar', explanation: 'Nilai dikelola pada editor rekonsiliasi usaha.' };
    const field = tableField(binding, column);
    if (!binding.section || !field) return { id, page, kind: 'helper', status: binding.section ? 'verification-required' : 'unmapped', editability: 'editor', label: binding.section ? `Kolom tampilan ${binding.section}` : 'Sel template', dataPath: binding.section ? `tables.${binding.section}[]` : undefined, explanation: 'Sel adalah nomor, gabungan nilai, atau tampilan turunan dari baris tabel.' };
    return { id, page, kind: field.type === 'computed' ? 'calculated' : 'table-cell', status: 'mapped', editability: field.type === 'computed' ? 'readonly' : 'direct', label: field.label, dataPath: `tables.${binding.section}[].${field.key}`, validation: validationFor(field), dependencies: field.type === 'computed' ? [`tables.${binding.section}[]`] : undefined, explanation: field.type === 'computed' ? 'Nilai diturunkan dari kolom pada baris yang sama.' : 'Nilai dapat diisi langsung pada sel formulir atau melalui editor tabel.' };
}

export function annotationAttributes(annotation: FormAnnotation) {
    return {
        'data-spt-annotation': annotation.id,
        'data-spt-kind': annotation.kind,
        'data-spt-status': annotation.status,
        'data-spt-editability': annotation.editability,
    };
}

export interface AnnotationAudit { errors: string[]; warnings: string[]; unmapped: string[]; summary: Record<AnnotationKind, number>; }
export function auditFormAnnotations(): AnnotationAudit {
    const errors: string[] = [], warnings: string[] = [], unmapped: string[] = [], ids = new Set<string>();
    const seen = (annotation: FormAnnotation) => { if (ids.has(annotation.id)) errors.push(`ID anotasi ganda: ${annotation.id}`); ids.add(annotation.id); if (annotation.kind === 'input' && !annotation.validation) errors.push(`Input tanpa validasi: ${annotation.id}`); if (annotation.kind === 'calculated' && !annotation.dependencies?.length) errors.push(`Hasil tanpa sumber: ${annotation.id}`); if (annotation.status === 'unmapped') unmapped.push(annotation.id); };
    Object.entries(slotInventory).forEach(([pageText, inventory]) => {
        const page = Number(pageText);
        for (let index = 0; index < inventory.digits; index++) seen(annotateDigits(page, index, 0));
        for (let index = 0; index < inventory.answers; index++) seen(annotateAnswer(page, index));
        for (let index = 0; index < inventory.results; index++) seen(annotateResult(page, index));
        for (let index = 0; index < inventory.boxes; index++) seen(annotateBox(page, index));
        for (let index = 0; index < inventory.choices; index++) seen(annotateTick(page, index));
        inventory.cells.forEach(cell => seen(annotateCell(page, cell.table, cell.row, cell.column, cell.sum)));
    });
    if (unmapped.length) warnings.push(`${unmapped.length} slot template belum memiliki sumber data aman; lihat mode audit untuk ID setiap slot.`);
    const summary = { input: 0, choice: 0, 'table-cell': 0, calculated: 0, helper: 0, static: 0 } as Record<AnnotationKind, number>;
    const count = (annotation: FormAnnotation) => { summary[annotation.kind]++; };
    Object.entries(slotInventory).forEach(([pageText, inventory]) => {
        const page = Number(pageText);
        for (let index = 0; index < inventory.digits; index++) count(annotateDigits(page, index, 0));
        for (let index = 0; index < inventory.answers; index++) count(annotateAnswer(page, index));
        for (let index = 0; index < inventory.results; index++) count(annotateResult(page, index));
        for (let index = 0; index < inventory.boxes; index++) count(annotateBox(page, index));
        for (let index = 0; index < inventory.choices; index++) count(annotateTick(page, index));
        inventory.cells.forEach(cell => count(annotateCell(page, cell.table, cell.row, cell.column, cell.sum)));
    });
    return { errors, warnings, unmapped, summary };
}
