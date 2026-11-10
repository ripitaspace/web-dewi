import { catalog, type Draft, type Field, type Row } from './model';
import { ruleSetFor, ruleStatus } from './rules';
import { isHidden, isRequired, rangeIssue } from './field-rules';
export function numeric(v: string | number | undefined): number { if (typeof v === 'number')
    return v; let s = (v || '').trim().replace(/\s/g, ''); if (!s)
    return 0; if (!/^-?[\d.,]+$/.test(s))
    return NaN; if (s.includes(',') && s.includes('.'))
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
else if (/^-?\d{1,3}([.,]\d{3})+$/.test(s))
    s = s.replace(/[.,]/g, '');
else
    s = s.replace(',', '.'); return Number(s); }
export const PTKP_ANNUAL: Record<string, number> = {
    'TK/0': 54_000_000, 'TK/1': 58_500_000, 'TK/2': 63_000_000, 'TK/3': 67_500_000,
    'K/0': 58_500_000, 'K/1': 63_000_000, 'K/2': 67_500_000, 'K/3': 72_000_000,
    'K/I/0': 112_500_000, 'K/I/1': 117_000_000, 'K/I/2': 121_500_000, 'K/I/3': 126_000_000,
};
export function ptkpAmount(status: string | undefined): number | null { return status && status in PTKP_ANNUAL ? PTKP_ANNUAL[status] : null; }
export const money = (n: number | null) => n === null || !Number.isFinite(n) ? 'Perlu Verifikasi' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n);
export function rowValue(k: string, r: Row, key: string): string { if (key === 'net' && k === 'jobs')
    return String(numeric(r.values.gross) - numeric(r.values.expense)); if (key === 'net' && k === 'nppn')
    return String(numeric(r.values.gross) * numeric(r.values.norm) / 100); if (key === 'fiscal')
    return String(numeric(r.values.commercial) - numeric(r.values.nonobject) - numeric(r.values.final) + numeric(r.values.positive) - numeric(r.values.negative)); return r.values[key] || ''; }
export function fieldError(f: Field, v: string, values?: Record<string, string>): string | null {
    if (f.type === 'computed') return null;
    if ((values ? isRequired(f, values) : f.required) && !v.trim()) return 'wajib diisi';
    if (v && ['money', 'number', 'year'].includes(f.type) && !Number.isFinite(numeric(v))) return 'angka tidak valid';
    if (v && f.type === 'year' && !/^\d{4}$/.test(v)) return 'gunakan 4 digit';
    if (v && f.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v)) || new Date(v).toISOString().slice(0, 10) !== v)) return 'tanggal tidak valid';
    if (v && ['select', 'yesno'].includes(f.type) && f.options.length && !f.options.some(o => o.split('|')[0] === v)) return 'kode tidak dikenal';
    return rangeIssue(f, v);
}
export function errors(fields: Field[], r: Row): string[] { return fields.flatMap(f => { if (isHidden(f, r.values)) return []; const issue = fieldError(f, r.values[f.key] || '', r.values); return issue ? [f.label + ': ' + issue] : []; }); }
export interface Result {
    key: string;
    label: string;
    value: number | null;
    sections: string[];
    note: string;
    ruleVersion?: string;
    verification?: 'rekap-input' | 'pending';
    source?: string;
}
export function compute(d: Draft): Result[] {
    const sum = (k: string, col: string) => (d.tables[k] || []).filter(r => !r.disposed).reduce((s, r) => s + numeric(rowValue(k, r, col)), 0);
    const override = (key: string, v: number | null) => { const o = d.overrides[key]; return o?.enabled ? (o.reason.trim() && o.value.trim() ? numeric(o.value) : null) : v; };
    const jobs = sum('jobs', 'net'), norm = sum('nppn', 'net'), other = sum('otherdomestic', 'net'), foreign = sum('foreign', 'net');
    const profit = d.books[d.questions.sector]?.find(r => r.values.code === '4800');
    const business = override('business', ['NPPN', 'ya'].includes(d.questions.hasNorm) ? norm : profit ? numeric(rowValue('book', profit, 'fiscal')) : d.questions.hasBusiness === 'tidak' ? 0 : null);
    const deductions = override('deductions', sum('deductions', 'amount') + sum('taxloss', 'compensated'));
    const net = business === null ? null : jobs + business + other + foreign;
    const credit = sum('withholding', 'withheld') + sum('foreign', 'credit');
    const ptkp = ptkpAmount(d.profile.ptkp);
    const sourceNote = 'Rekap data kerja; perlakuan pajak dan kelengkapan perlu verifikasi.';
    const results: Result[] = [
        { key: 'jobs', label: 'Penghasilan neto pekerjaan', value: jobs, sections: ['jobs'], note: 'Bruto dikurangi pengurang yang diinput.' },
        { key: 'business', label: 'Penghasilan neto usaha', value: business, sections: ['nppn', d.questions.sector || 'jasa'], note: 'Norma dan rekonsiliasi memerlukan dasar dan pemeriksaan; override harus menyertakan alasan.' },
        { key: 'other', label: 'Penghasilan dalam negeri lainnya', value: other, sections: ['otherdomestic'], note: sourceNote },
        { key: 'foreign', label: 'Penghasilan luar negeri', value: foreign, sections: ['foreign'], note: sourceNote },
        { key: 'net', label: 'Penghasilan neto setahun', value: net, sections: ['jobs', 'nppn', 'otherdomestic', 'foreign'], note: sourceNote },
        { key: 'ded', label: 'Pengurang penghasilan neto', value: deductions, sections: ['deductions', 'taxloss'], note: 'Override menggantikan rekap, tidak ditambahkan kembali.' },
        { key: 'afterDed', label: 'Neto setelah pengurang (rekap)', value: net === null || deductions === null ? null : net - deductions, sections: ['deductions', 'taxloss'], note: sourceNote },
        { key: 'pt', label: 'PTKP', value: ptkp, sections: ['profile'], note: 'Nilai mengikuti status PTKP yang dipilih.' },
        ...[['pk', 'PKP'], ['rawTax', 'PPh terutang'], ['tax', 'PPh setelah pengurang']].map(([key, label]) => ({ key, label, value: null, sections: ['profile', 'partner'], note: 'Menunggu ruleset 2025 dan skenario acuan resmi yang terverifikasi.' })),
        { key: 'credit', label: 'Rekap kredit pajak (belum direkonsiliasi)', value: credit, sections: ['withholding', 'foreign'], note: 'Periksa kemungkinan PPh 24 dicatat dua kali; belum digunakan sebagai kredit final.' },
        { key: 'balance', label: 'Kurang / (lebih) bayar', value: null, sections: ['extras', 'withholding', 'foreign'], note: 'Ditahan sampai perhitungan pajak dan kredit tervalidasi.' },
        { key: 'relief', label: 'Rekap pengurang PPh', value: sum('taxrelief', 'amount'), sections: ['taxrelief'], note: sourceNote },
        ...[['p25Paid', 'PPh 25 dibayar'], ['p25STP', 'Pokok STP PPh 25'], ['foreignRefund', 'Pengembalian kredit luar negeri'], ['deferral', 'Angsuran / penundaan'], ['previousBalance', 'Saldo SPT sebelumnya']].map(([key, label]) => ({ key, label, value: numeric(d.extras[key]), sections: ['extras'], note: sourceNote })),
        ...[['payable', 'Saldo setelah penundaan'], ['amended', 'Selisih pembetulan'], ['p25Next', 'Angsuran PPh 25 berikutnya'], ['umkmTax', 'PPh final UMKM'], ['phmt', 'Alokasi PPh PH/MT']].map(([key, label]) => ({ key, label, value: null, sections: [key === 'umkmTax' ? 'umkm' : key === 'phmt' ? 'partner' : 'extras'], note: 'Menunggu verifikasi syarat, rumus, dan contoh acuan resmi.' })),
        { key: 'debt', label: 'Saldo utang akhir tahun', value: sum('debts', 'balance'), sections: ['debts'], note: sourceNote },
        { key: 'final', label: 'Dasar penghasilan final', value: sum('finalincome', 'base'), sections: ['finalincome'], note: sourceNote },
        { key: 'exempt', label: 'Penghasilan bukan objek', value: sum('exempt', 'gross'), sections: ['exempt'], note: sourceNote },
    ];
    const rules = ruleSetFor(d.profile.year);
    return results.map(r => ({ ...r, value: r.value !== null && Number.isFinite(r.value) ? r.value : null, ruleVersion: rules?.version || 'unsupported-year', verification: r.value === null || !Number.isFinite(r.value) ? 'pending' : 'rekap-input', source: rules?.sources.prototype?.title || 'Belum ada ruleset DJP terdaftar untuk tahun ini.' }));
}
const questionFor: Record<string, string> = { jobs: 'hasJobs', withholding: 'hasWithholding', debts: 'hasDebt', finalincome: 'hasFinal', exempt: 'hasExempt', foreign: 'hasForeign', nppn: 'hasNorm', otherdomestic: 'hasOtherDomestic', umkm: 'hasUMKM', opent: 'hasOPPT', normmonths: 'hasNorm', depreciation: 'hasDepreciation', amortization: 'hasDepreciation', entertainment: 'hasSpecialCosts', promotion: 'hasSpecialCosts', baddebt: 'hasSpecialCosts', deductions: 'hasDeductions', taxrelief: 'hasTaxRelief' };
export function sectionStatus(d: Draft, k: string) { const q = questionFor[k], answer = q ? d.questions[q] : undefined, yes = answer === 'ya' || answer === 'NPPN', no = answer === 'tidak' || ['PEMBUKUAN', 'FINAL_TANPA_PEMBUKUAN'].includes(answer || ''); const rows = d.tables[k] || []; return { applicability: no ? 'Tidak Berlaku' : yes ? 'Berlaku' : 'Perlu Verifikasi', progress: (yes && !rows.length) || rows.some(r => errors(catalog.tables[k]?.columns || [], r).length || r.review) ? 'Belum Lengkap' : 'Perlu Verifikasi' }; }
export function validate(d: Draft): string[] {
    const status = ruleStatus(d.profile.year);
    const issues = [status.message, 'Aturan kewajiban lampiran dan XML belum disahkan terhadap seluruh referensi resmi.'];
    if (!d.profile.name.trim()) issues.push('Nama wajib pajak belum diisi.');
    if (!/^\d{16}$/.test(d.profile.tin)) issues.push('Identitas: isi NIK/NPWP 16 digit sebagai teks.');
    if (d.profile.sptStatus === 'Pembetulan' && !/^[1-9]\d*$/.test(d.profile.amendment)) issues.push('Isi nomor pembetulan lebih dari 0.');
    const from = numeric(d.profile.fromMonth), to = numeric(d.profile.toMonth);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 12 || from > to) issues.push('Periode bulan tidak valid.');
    for (const [key, override] of Object.entries(d.overrides)) {
        if (override.enabled && (!override.reason.trim() || !override.value.trim() || !Number.isFinite(numeric(override.value)))) issues.push('Override '+key+': isi nilai valid dan alasan/dokumen sumber.');
    }
    for (const [key, value] of Object.entries(d.extras)) if(value && !Number.isFinite(numeric(value))) issues.push('Penyesuaian '+key+': angka tidak valid.');
    for (const [key, rows] of Object.entries(d.tables)) {
        for (const [index, r] of rows.entries()) {
            const prefix = catalog.tables[key].title + ' · Baris ' + (index + 1) + ': ';
            for (const error of errors(catalog.tables[key].columns, r)) issues.push(prefix + error);
            if (r.review) issues.push(prefix + 'perbarui nilai baris salinan tahun sebelumnya.');
            if(key==='jobs' && numeric(r.values.expense)>numeric(r.values.gross)) issues.push(prefix+'pengurang melebihi bruto; periksa dokumen sumber.');
            if(key==='nppn' && (numeric(r.values.norm)<0 || numeric(r.values.norm)>100)) issues.push(prefix+'persentase norma harus antara 0–100; dasar norma tetap perlu verifikasi.');
        }
        if (d.questions[questionFor[key]]==='tidak' && rows.length) issues.push(catalog.tables[key].title+': jawaban Tidak, tetapi data masih ada. Data dipertahankan; tinjau jawaban/rinciannya.');
    }
    for(const [key,rows] of Object.entries(d.books)) for(const r of rows) for(const error of errors(catalog.bokFields,r)) issues.push(catalog.BOOKS[key].title+': '+error);
    if ((d.tables.foreign || []).length && (d.tables.withholding || []).some(r => r.values.taxType === 'PPh Pasal 24')) issues.push('Rekonsiliasi PPh 24: periksa kredit luar negeri dan bukti potong agar tidak dihitung ganda.');
    if(['businessNeto','compLoss','otherDeduction','otherTaxRelief','phmtTax','nextP25'].some(key=>numeric(d.extras[key])!==0)) issues.push('Nilai manual lama disimpan sebagai pendukung; tidak ditambahkan otomatis. Untuk neto usaha/pengurang gunakan override beralasan di Ikhtisar.');
    return issues;
}

export interface ReadinessReport { rulesReady: boolean; summary: string; issues: string[]; mapped: { direct: string; editorOnly: number } }
/** Release gate for this local preparation workspace, never a filing approval. */
export function readiness(d: Draft): ReadinessReport {
    const status = ruleStatus(d.profile.year);
    const issues = validate(d);
    return {
        rulesReady: status.ready,
        summary: status.ready && !issues.length ? 'Data kerja siap ditinjau dan dicetak.' : 'Data kerja belum siap dilaporkan; selesaikan temuan di bawah.',
        mapped: { direct: 'Kotak dan pilihan yang sudah dipetakan', editorOnly: Object.keys(catalog.tables).length },
        issues,
    };
}
