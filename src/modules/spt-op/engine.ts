import { catalog, type Draft, type Field, type Row } from './model';
import { ruleSetFor, ruleStatus } from './rules';
import { progressiveReference, roundPkpDownToThousand, UMKM_ANNUAL_GROSS_LIMIT, umkmFinalReference } from './rules-2025';
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
    verification?: 'rekap-input' | 'ruleset-2025' | 'not-applicable' | 'pending' | 'reconciliation-required';
    source?: string;
}

/** Values that must be resolved before a browser print can be treated as a complete SPT form. */
export function printBlockers(d: Draft): string[] {
    return compute(d)
        .filter(result => result.verification === 'pending' || result.verification === 'reconciliation-required')
        .map(result => `${result.label}: ${result.note}`);
}

export interface RegularEmployeeEligibility {
    eligible: boolean;
    reason: string;
}

export interface UmkmEligibility {
    eligible: boolean;
    reason: string;
    annualGross: number | null;
}

const activeRows = (d: Draft, key: string) => (d.tables[key] || []).filter(row => !row.disposed);
const hasAmount = (value: string | undefined) => value !== undefined && value.trim() !== '' && numeric(value) !== 0;

/**
 * The first verified slice deliberately accepts only a full-year, normal employee return.
 * Every unsupported branch stays pending rather than being inferred from blank answers.
 */
export function regularEmployeeEligibility(d: Draft): RegularEmployeeEligibility {
    if (d.profile.year !== '2025') return { eligible: false, reason: 'Ruleset terbatas hanya tersedia untuk Tahun Pajak 2025.' };
    if (d.profile.sptStatus !== 'Normal') return { eligible: false, reason: 'SPT pembetulan belum termasuk ruleset karyawan reguler.' };
    if (d.profile.periodType !== 'TAHUN_PAJAK' || d.profile.fromMonth !== '1' || d.profile.toMonth !== '12') return { eligible: false, reason: 'Bagian tahun pajak belum termasuk ruleset karyawan reguler.' };
    if (d.profile.incomeSource !== 'Pekerjaan') return { eligible: false, reason: 'Ruleset ini hanya untuk sumber penghasilan pekerjaan.' };
    if (['PH', 'MT'].includes(d.profile.maritalTax)) return { eligible: false, reason: 'Status PH/MT memerlukan perhitungan pasangan tersendiri.' };
    if (d.questions.hasJobs !== 'ya' || !activeRows(d, 'jobs').length) return { eligible: false, reason: 'Isi penghasilan dari pekerjaan untuk memakai ruleset karyawan reguler.' };
    if (d.questions.hasBusiness !== 'tidak' || d.questions.hasUMKM === 'ya' || d.questions.hasOPPT === 'ya' || activeRows(d, 'nppn').length || Object.values(d.books).some(rows => rows.some(row => !row.disposed))) return { eligible: false, reason: 'Penghasilan usaha, UMKM, OPPT, atau pembukuan belum termasuk ruleset ini.' };
    if (d.questions.hasOtherDomestic !== 'tidak' || activeRows(d, 'otherdomestic').length) return { eligible: false, reason: 'Konfirmasikan tidak ada penghasilan dalam negeri lainnya.' };
    if (d.questions.hasForeign !== 'tidak' || activeRows(d, 'foreign').length) return { eligible: false, reason: 'Konfirmasikan tidak ada penghasilan atau kredit pajak luar negeri.' };
    if (d.questions.hasDeductions !== 'tidak' || d.questions.hasTaxRelief !== 'tidak' || activeRows(d, 'deductions').length || activeRows(d, 'taxloss').length || activeRows(d, 'taxrelief').length || d.overrides.deductions?.enabled) return { eligible: false, reason: 'Konfirmasikan tidak ada pengurang penghasilan neto atau PPh terutang.' };
    if (d.questions.hasForeignRefund !== 'tidak' || d.questions.hasDeferral !== 'tidak') return { eligible: false, reason: 'Konfirmasikan tidak ada pengembalian kredit luar negeri atau penundaan.' };
    if (['p25Paid', 'p25STP', 'foreignRefund', 'deferral', 'previousBalance'].some(key => hasAmount(d.extras[key]))) return { eligible: false, reason: 'Kredit atau penyesuaian pajak tambahan belum termasuk ruleset ini.' };
    const withholding = activeRows(d, 'withholding');
    if ((d.questions.hasWithholding === 'ya') !== (withholding.length > 0)) return { eligible: false, reason: 'Samakan jawaban kredit pajak dengan rincian bukti potong PPh Pasal 21.' };
    if (withholding.some(row => row.values.taxType !== 'PPh Pasal 21')) return { eligible: false, reason: 'Hanya kredit PPh Pasal 21 yang termasuk ruleset ini.' };
    if (activeRows(d, 'jobs').some(row => !Number.isFinite(numeric(row.values.gross)) || !Number.isFinite(numeric(row.values.expense)) || numeric(row.values.expense) > numeric(row.values.gross))) return { eligible: false, reason: 'Periksa nilai bruto dan pengurang pada penghasilan pekerjaan.' };
    if (withholding.some(row => !Number.isFinite(numeric(row.values.withheld)))) return { eligible: false, reason: 'Periksa nilai kredit PPh Pasal 21.' };
    if (ptkpAmount(d.profile.ptkp) === null) return { eligible: false, reason: 'Pilih status PTKP yang tersedia.' };
    return { eligible: true, reason: 'Dihitung dari data dan ruleset 2025 terbatas — bukan persetujuan pelaporan.' };
}

/** A deliberately narrow final-UMKM slice. Annual-return reporting remains unverified. */
export function umkmEligibility(d: Draft): UmkmEligibility {
    const ineligible = (reason: string): UmkmEligibility => ({ eligible: false, reason, annualGross: null });
    if (d.profile.year !== '2025') return ineligible('Ruleset UMKM terbatas hanya tersedia untuk Tahun Pajak 2025.');
    if (d.profile.sptStatus !== 'Normal') return ineligible('SPT pembetulan belum termasuk ruleset UMKM terbatas.');
    if (d.profile.periodType !== 'TAHUN_PAJAK' || d.profile.fromMonth !== '1' || d.profile.toMonth !== '12') return ineligible('Bagian tahun pajak belum termasuk ruleset UMKM terbatas.');
    if (d.profile.incomeSource !== 'Kegiatan Usaha') return ineligible('Ruleset ini hanya untuk sumber penghasilan kegiatan usaha.');
    if (['PH', 'MT'].includes(d.profile.maritalTax)) return ineligible('Status PH/MT memerlukan perhitungan pasangan tersendiri.');
    if (d.questions.hasBusiness !== 'ya' || d.questions.hasUMKM !== 'ya' || d.questions.hasOPPT === 'ya' || d.questions.hasNorm !== 'FINAL_TANPA_PEMBUKUAN') return ineligible('Pilih usaha dengan rezim final peredaran bruto tertentu dan pencatatan.');
    if (!activeRows(d, 'umkm').length) return ineligible('Isi rekap omzet UMKM untuk memakai ruleset ini.');
    if (d.questions.hasJobs === 'ya' || activeRows(d, 'jobs').length || activeRows(d, 'nppn').length || activeRows(d, 'opent').length || Object.values(d.books).some(rows => rows.some(row => !row.disposed))) return ineligible('Penghasilan pekerjaan, NPPN, OPPT, atau pembukuan belum termasuk ruleset UMKM ini.');
    if (d.questions.hasOtherDomestic !== 'tidak' || d.questions.hasForeign !== 'tidak' || d.questions.hasDeductions !== 'tidak' || d.questions.hasTaxRelief !== 'tidak') return ineligible('Penghasilan atau pengurang di luar UMKM belum termasuk ruleset ini.');
    if (activeRows(d, 'otherdomestic').length || activeRows(d, 'foreign').length || activeRows(d, 'finalincome').length || activeRows(d, 'deductions').length || activeRows(d, 'taxloss').length || activeRows(d, 'taxrelief').length) return ineligible('Rincian penghasilan final atau pengurang tambahan perlu dihitung terpisah.');
    if (d.questions.hasWithholding !== 'tidak' || activeRows(d, 'withholding').length || d.questions.hasForeignRefund !== 'tidak' || d.questions.hasDeferral !== 'tidak') return ineligible('Kredit, pemotongan, atau penundaan pajak belum termasuk ruleset ini.');
    if (['hasP25', 'hasCustomP25', 'hasOPPTP25'].some(key => d.questions[key] === 'ya') || ['p25Paid', 'p25STP', 'foreignRefund', 'deferral', 'previousBalance'].some(key => hasAmount(d.extras[key]))) return ineligible('Angsuran atau penyesuaian pajak umum belum termasuk ruleset UMKM ini.');
    const monthlyGross = activeRows(d, 'umkm').flatMap(row => Array.from({ length: 12 }, (_, index) => row.values[`m${index + 1}`] || '')).filter(Boolean).map(numeric);
    if (!monthlyGross.length || monthlyGross.some(value => !Number.isFinite(value) || value < 0)) return ineligible('Periksa nilai omzet UMKM bulanan.');
    const annualGross = monthlyGross.reduce((sum, value) => sum + value, 0);
    if (annualGross > UMKM_ANNUAL_GROSS_LIMIT) return { eligible: false, annualGross, reason: 'Omzet tahunan melampaui batas Rp4,8 miliar untuk ruleset UMKM ini.' };
    return { eligible: true, annualGross, reason: 'Dihitung dari data dan ruleset UMKM 2025 terbatas — bukan persetujuan pelaporan.' };
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
    const regular = regularEmployeeEligibility(d);
    const umkm = umkmEligibility(d);
    const pkp = regular.eligible && net !== null && ptkp !== null ? roundPkpDownToThousand(net - ptkp) : null;
    const rawTax = pkp === null ? null : progressiveReference(pkp);
    const tax = rawTax;
    const balance = tax === null ? null : tax - credit;
    const p25Next = !regular.eligible || d.questions.hasCustomP25 === 'ya' || d.questions.hasOPPTP25 === 'ya'
        ? null
        : d.questions.hasP25 === 'ya' && d.questions.hasCustomP25 === 'tidak' && d.questions.hasOPPTP25 === 'tidak' && balance !== null ? balance / 12
            : d.questions.hasP25 === 'tidak' && d.questions.hasOPPTP25 === 'tidak' ? 0 : null;
    const umkmTax = umkm.eligible && umkm.annualGross !== null ? umkmFinalReference(umkm.annualGross) : null;
    const umkmPayments = Array.from({ length: 12 }, (_, index) => numeric(d.extras[`umkmPaid${index}`]) + numeric(d.extras[`umkmWithheld${index}`])).reduce((sum, value) => sum + value, 0);
    const umkmReconciled = umkmTax !== null && umkmTax === umkmPayments;
    const sourceNote = 'Rekap data kerja; perlakuan pajak dan kelengkapan perlu verifikasi.';
    const calculatedNote = regular.reason;
    const calculated = { verification: 'ruleset-2025' as const, source: ruleSetFor('2025')?.sources.regularEmployee.title };
    const calculatedUmkm = { verification: 'ruleset-2025' as const, source: ruleSetFor('2025')?.sources.umkm.title };
    const notApplicable = { verification: 'not-applicable' as const, note: 'Tidak Berlaku untuk jawaban SPT ini.' };
    const generalTaxNotApplicable = { verification: 'not-applicable' as const, note: 'Tidak Berlaku: skenario ini hanya menggunakan PPh Final UMKM.' };
    const results: Result[] = [
        { key: 'jobs', label: 'Penghasilan neto pekerjaan', value: jobs, sections: ['jobs'], note: 'Bruto dikurangi pengurang yang diinput.' },
        { key: 'business', label: 'Penghasilan neto usaha', value: business, sections: ['nppn', d.questions.sector || 'jasa'], note: 'Norma dan rekonsiliasi memerlukan dasar dan pemeriksaan; override harus menyertakan alasan.', ...(umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'other', label: 'Penghasilan dalam negeri lainnya', value: other, sections: ['otherdomestic'], note: sourceNote },
        { key: 'foreign', label: 'Penghasilan luar negeri', value: foreign, sections: ['foreign'], note: sourceNote },
        { key: 'net', label: 'Penghasilan neto setahun', value: net, sections: ['jobs', 'nppn', 'otherdomestic', 'foreign'], note: sourceNote, ...(umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'ded', label: 'Pengurang penghasilan neto', value: deductions, sections: ['deductions', 'taxloss'], note: 'Override menggantikan rekap, tidak ditambahkan kembali.' },
        { key: 'afterDed', label: 'Neto setelah pengurang (rekap)', value: net === null || deductions === null ? null : net - deductions, sections: ['deductions', 'taxloss'], note: sourceNote, ...(umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'pt', label: 'PTKP', value: ptkp, sections: ['profile'], note: 'Nilai mengikuti status PTKP yang dipilih.' },
        { key: 'pk', label: 'PKP', value: pkp, sections: ['profile', 'jobs'], note: regular.eligible ? calculatedNote : regular.reason, ...(regular.eligible ? calculated : umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'rawTax', label: 'PPh terutang', value: rawTax, sections: ['profile', 'jobs'], note: regular.eligible ? calculatedNote : regular.reason, ...(regular.eligible ? calculated : umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'tax', label: 'PPh setelah pengurang', value: tax, sections: ['profile', 'jobs'], note: regular.eligible ? calculatedNote : regular.reason, ...(regular.eligible ? calculated : umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'credit', label: regular.eligible ? 'Kredit PPh Pasal 21' : 'Rekap kredit pajak (belum direkonsiliasi)', value: credit, sections: ['withholding', 'foreign'], note: regular.eligible ? calculatedNote : 'Periksa kemungkinan PPh 24 dicatat dua kali; belum digunakan sebagai kredit final.', ...(regular.eligible ? calculated : umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'balance', label: 'Kurang / (lebih) bayar', value: balance, sections: ['extras', 'withholding', 'foreign'], note: regular.eligible ? calculatedNote : regular.reason, ...(regular.eligible ? calculated : umkm.eligible ? generalTaxNotApplicable : {}) },
        { key: 'relief', label: 'Rekap pengurang PPh', value: sum('taxrelief', 'amount'), sections: ['taxrelief'], note: sourceNote },
        ...[['p25Paid', 'PPh 25 dibayar'], ['p25STP', 'Pokok STP PPh 25'], ['foreignRefund', 'Pengembalian kredit luar negeri'], ['deferral', 'Angsuran / penundaan'], ['previousBalance', 'Saldo SPT sebelumnya']].map(([key, label]) => ({ key, label, value: numeric(d.extras[key]), sections: ['extras'], note: sourceNote })),
        { key: 'payable', label: 'Saldo setelah penundaan', value: null, sections: ['extras'], note: 'Menunggu verifikasi syarat, rumus, dan contoh acuan resmi.', ...(d.questions.hasDeferral === 'tidak' ? notApplicable : {}) },
        { key: 'amended', label: 'Selisih pembetulan', value: null, sections: ['extras'], note: 'Menunggu verifikasi syarat, rumus, dan contoh acuan resmi.', ...(d.profile.sptStatus === 'Normal' ? notApplicable : {}) },
        { key: 'p25Next', label: 'Angsuran PPh 25 berikutnya', value: p25Next, sections: ['extras'], note: d.questions.hasCustomP25 === 'ya' ? 'Lampiran 4 Bagian A belum termasuk ruleset ini.' : regular.eligible ? calculatedNote : regular.reason, ...(umkm.eligible ? generalTaxNotApplicable : regular.eligible && d.questions.hasCustomP25 !== 'ya' ? calculated : {}) },
        { key: 'umkmTax', label: 'PPh final UMKM', value: umkmTax, sections: ['umkm'], note: d.questions.hasBusiness === 'tidak' || d.questions.hasUMKM === 'tidak' ? 'Tidak Berlaku untuk jawaban SPT ini.' : !umkm.eligible ? umkm.reason : umkmReconciled ? umkm.reason : `PPh terhitung Rp${money(umkmTax)}; rekonsiliasikan dengan setoran/pemotongan Rp${money(umkmPayments)}.`, ...(d.questions.hasBusiness === 'tidak' || d.questions.hasUMKM === 'tidak' ? notApplicable : umkm.eligible ? umkmReconciled ? calculatedUmkm : { ...calculatedUmkm, verification: 'reconciliation-required' as const } : {}) },
        { key: 'phmt', label: 'Alokasi PPh PH/MT', value: null, sections: ['partner'], note: 'Menunggu verifikasi syarat, rumus, dan contoh acuan resmi.', ...(!['PH', 'MT'].includes(d.profile.maritalTax) ? notApplicable : {}) },
        { key: 'debt', label: 'Saldo utang akhir tahun', value: sum('debts', 'balance'), sections: ['debts'], note: sourceNote },
        { key: 'final', label: 'Dasar penghasilan final', value: sum('finalincome', 'base'), sections: ['finalincome'], note: sourceNote },
        { key: 'exempt', label: 'Penghasilan bukan objek', value: sum('exempt', 'gross'), sections: ['exempt'], note: sourceNote },
    ];
    const rules = ruleSetFor(d.profile.year);
    return results.map(r => ({ ...r, value: r.value !== null && Number.isFinite(r.value) ? r.value : null, ruleVersion: rules?.version || 'unsupported-year', verification: r.verification === 'not-applicable' ? r.verification : r.value === null || !Number.isFinite(r.value) ? 'pending' : r.verification || 'rekap-input', source: r.source || rules?.sources.prototype?.title || 'Belum ada ruleset DJP terdaftar untuk tahun ini.' }));
}
const questionFor: Record<string, string> = { jobs: 'hasJobs', withholding: 'hasWithholding', debts: 'hasDebt', finalincome: 'hasFinal', exempt: 'hasExempt', foreign: 'hasForeign', nppn: 'hasNorm', otherdomestic: 'hasOtherDomestic', umkm: 'hasUMKM', opent: 'hasOPPT', normmonths: 'hasNorm', depreciation: 'hasDepreciation', amortization: 'hasDepreciation', entertainment: 'hasSpecialCosts', promotion: 'hasSpecialCosts', baddebt: 'hasSpecialCosts', deductions: 'hasDeductions', taxrelief: 'hasTaxRelief' };
export function sectionStatus(d: Draft, k: string) {
    const q = questionFor[k], answer = q ? d.questions[q] : undefined;
    const rows = d.tables[k] || [];
    const yes = answer === 'ya' || answer === 'NPPN' || (!q && rows.length > 0), no = answer === 'tidak' || ['PEMBUKUAN', 'FINAL_TANPA_PEMBUKUAN'].includes(answer || '');
    if (no) return { applicability: 'Tidak Berlaku', progress: '—' };
    if (!yes) return { applicability: 'Perlu Verifikasi', progress: 'Menunggu jawaban' };
    if (!rows.length || rows.some(r => errors(catalog.tables[k]?.columns || [], r).length || r.review)) return { applicability: 'Berlaku', progress: 'Belum Lengkap' };
    return { applicability: 'Berlaku', progress: 'Lengkap' };
}
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
