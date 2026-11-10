import raw from './prototype.json';
export type Values = Record<string, string>;
export interface Field {
    label: string;
    key: string;
    type: string;
    options: string[];
    required: boolean;
}
export interface Table {
    title: string;
    page: number;
    columns: Field[];
    sum?: string | null;
    summary?: string;
    xml?: boolean;
}
export interface Row {
    id: string;
    values: Values;
    origin: string;
    disposed?: boolean;
    review?: boolean;
}
export interface Draft {
    schema: 3;
    id: string;
    revision: number;
    updatedAt: string;
    profile: Values;
    questions: Values;
    extras: Values;
    partner: Values;
    declaration: Values;
    documentNotes: Values;
    tables: Record<string, Row[]>;
    /** Source rows from the Excel blueprint that do not have a dedicated SPT table yet. */
    importTables: Record<string, Row[]>;
    books: Record<string, Row[]>;
    overrides: Record<string, {
        value: string;
        reason: string;
        enabled: boolean;
    }>;
}
export interface Layout {
    y: number;
    dy: number;
    n: number;
    cols: [
        string,
        number,
        number
    ][];
}
export const catalog = raw as unknown as {
    PAGES: {
        w: number;
        h: number;
        src: string;
    }[];
    PAGE_NAMES: string[];
    tables: Record<string, Table>;
    BOOKS: Record<string, {
        title: string;
        page: number;
    }>;
    bookAccounts: Record<string, string[][]>;
    bookCommon: string[][];
    bokFields: Field[];
    profileFields: Field[];
    questionFields: Field[];
    extraFields: Field[];
    propsDefault: Values;
    NAV: [
        string,
        string,
        string,
        number
    ][];
    LAYOUTS: Record<string, Layout>;
};
export const field = (key: string, label: string, type = 'text', options: string[] = [], required = false): Field => ({ key, label, type, options, required });
export const profileFields = [...catalog.profileFields, field('amendment', 'Nomor pembetulan', 'number')];
export const partnerFields = ['wpNet', 'spouseNet', 'wpDed', 'spouseDed', 'combinedPtkp'].map((key, i) => field(key, ['Neto WP', 'Neto pasangan', 'Pengurang WP', 'Pengurang pasangan', 'PTKP gabungan — perlu verifikasi'][i], 'money'));
export const declarationFields = [field('refund', 'G · Permohonan pengembalian', 'select', ['Pemeriksaan|Pemeriksaan', 'Pendahuluan|Pendahuluan']), field('additional', 'J · Daftar lampiran tambahan'), field('confirmed', 'K · Pernyataan benar, lengkap, dan jelas', 'yesno'), field('signer', 'K · Nama penandatangan'), field('capacity', 'K · Kapasitas penandatangan', 'select', ['Wajib Pajak|Wajib Pajak', 'Kuasa|Kuasa / wakil']), field('date', 'K · Tanggal pernyataan', 'date'), field('place', 'K · Tempat'), field('notes', 'Catatan / referensi dokumen pendukung')];
export const assets = ['cash', 'receivables', 'investments', 'movable', 'immovable', 'otherassets'];
export function fresh(): Draft { return { schema: 3, id: crypto.randomUUID(), revision: 0, updatedAt: '', profile: { ...catalog.propsDefault, amendment: '0' }, questions: {}, extras: {}, partner: {}, declaration: {}, documentNotes: {}, tables: {}, importTables: {}, books: {}, overrides: {} }; }
export function row(values: Values, origin = 'manual'): Row { return { id: crypto.randomUUID(), values, origin, disposed: false, review: false }; }
/** A clearly fictional, local-only draft for exploring the Studio. */
export function exampleDraft(): Draft {
    const d = fresh();
    d.profile = { ...d.profile, year: '2025', tin: '0000000000000000', name: 'WAJIB PAJAK CONTOH', idNumber: '0000000000000000', phone: '081234567890', email: 'contoh@example.test', incomeSource: 'Pekerjaan', ptkp: 'TK/0' };
    d.tables.jobs = [row({ employer: 'PERUSAHAAN CONTOH', employerTin: '0000000000000000', gross: '120000000', expense: '6000000', net: '114000000' }, 'contoh')];
    d.tables.withholding = [row({ payerTin: '0000000000000000', payerName: 'PERUSAHAAN CONTOH', slipNo: 'BUKTI-POTONG-CONTOH', slipDate: '2025-12-31', taxType: 'PPh 21', gross: '120000000', withheld: '3000000' }, 'contoh')];
    d.tables.cash = [row({ code: '0102', account: '000123456789', owner: 'WAJIB PAJAK CONTOH', bank: 'BANK CONTOH', country: 'IDN', year: '2020', balance: '25000000', pps: '' }, 'contoh')];
    return d;
}
export type Action = {
    type: 'replace';
    draft: Draft;
} | {
    type: 'field';
    group: 'profile' | 'questions' | 'extras' | 'partner' | 'declaration' | 'documentNotes';
    key: string;
    value: string;
} | {
    type: 'rows';
    key: string;
    rows: Row[];
    book?: boolean;
} | {
    type: 'override';
    key: string;
    value: Draft['overrides'][string];
};
export function reducer(d: Draft, a: Action): Draft { if (a.type === 'replace')
    return a.draft; if (a.type === 'field')
    return { ...d, [a.group]: { ...d[a.group], [a.key]: a.value } }; if (a.type === 'override')
    return { ...d, overrides: { ...d.overrides, [a.key]: a.value } }; const group = a.book ? 'books' : 'tables'; return { ...d, [group]: { ...d[group], [a.key]: a.rows } }; }
export function draftKey(d: Draft) { return [d.profile.tin || d.id, d.profile.year, d.profile.sptStatus, d.profile.sptStatus === 'Pembetulan' ? d.profile.amendment : '0'].join(':'); }
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function values(v: unknown): Values { if (!isObject(v) || Object.keys(v).some(k => ['__proto__', 'constructor', 'prototype'].includes(k)) || Object.values(v).some(x => !['string', 'number', 'boolean'].includes(typeof x)))
    throw Error('Struktur kolom tidak valid.'); return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x)])); }
export function readBackup(input: unknown): Draft {
    if (!isObject(input) || !isObject(input.data))
        throw Error('Bukan backup SPT OP.');
    const old = input.format === 'RIPITAX.SPT.OP.v1', v = input.data;
    if (!old && (!['RIPITAX.SPT.OP.v2', 'RIPITAX.SPT.OP.v3'].includes(String(input.format)) || ![2, 3].includes(Number(v.schema))))
        throw Error('Versi backup belum didukung.');
    const d = fresh();
    d.profile = { ...d.profile, ...values(v.profile) };
    for (const key of ['questions', 'extras', 'partner', 'declaration', 'documentNotes'] as const)
        d[key] = values(v[key] || {});
    if (d.questions.hasNorm === 'ya')
        d.questions.hasNorm = 'NPPN';
    else if (d.questions.hasNorm === 'tidak')
        d.questions.hasNorm = d.profile.bookMethod === 'Pencatatan' ? 'FINAL_TANPA_PEMBUKUAN' : 'PEMBUKUAN';
    const rowIds = new Set<string>();
    for (const group of ['tables', 'books'] as const) {
        if (!isObject(v[group] || {}))
            throw Error('Daftar tabel tidak valid.');
        for (const [k, items] of Object.entries(v[group] || {})) {
            if (!Object.hasOwn(group === 'tables' ? catalog.tables : catalog.BOOKS, k))
                throw Error('Tabel tidak dikenal: ' + k);
            if (!Array.isArray(items) || items.length > 100000)
                throw Error('Jumlah baris tidak valid.');
            d[group][k] = items.map(item => { if (!isObject(item))
                throw Error('Baris rusak.'); const restored = row(values(old ? item : item.values), old ? 'legacy-v1' : typeof item.origin === 'string' ? item.origin : 'restore'); if (!old) {
                if (typeof item.id !== 'string' || !item.id || rowIds.has(item.id))
                    throw Error('ID baris backup kosong atau duplikat.');
                restored.id = item.id;
            } rowIds.add(restored.id); return { ...restored, disposed: !old && item.disposed === true, review: !old && item.review === true }; });
        }
    }
    if (!old && v.importTables !== undefined) {
        if (!isObject(v.importTables))
            throw Error('Data impor Excel tidak valid.');
        for (const [key, items] of Object.entries(v.importTables)) {
            if (!/^\d{2}_[A-Z_]+$/.test(key) || !Array.isArray(items) || items.length > 100000)
                throw Error('Data impor Excel tidak valid.');
            d.importTables[key] = items.map(item => { if (!isObject(item))
                throw Error('Baris impor Excel rusak.'); const restored = row(values(item.values), typeof item.origin === 'string' ? item.origin : `import:${key}`); if (typeof item.id === 'string' && item.id)
                restored.id = item.id; return restored; });
        }
    }
    if (!old && v.overrides !== undefined) {
        if (!isObject(v.overrides))
            throw Error('Override rusak.');
        for (const [k, x] of Object.entries(v.overrides)) {
            if (!['business', 'deductions'].includes(k) || !isObject(x) || typeof x.value !== 'string' || typeof x.reason !== 'string' || typeof x.enabled !== 'boolean')
                throw Error('Override rusak.');
            d.overrides[k] = { value: x.value, reason: x.reason, enabled: x.enabled };
        }
    }
    // Legacy monthly payments remain accessible rather than being discarded.
    if (old)
        for (const key of ['umkmPaid', 'umkmWithheld'])
            if (Array.isArray(v[key]))
                v[key].forEach((n, i) => d.extras[key + i] = String(n));
    return d;
}
export function backup(d: Draft) { return JSON.stringify({ format: 'RIPITAX.SPT.OP.v3', savedAt: new Date().toISOString(), data: d }, null, 2); }
