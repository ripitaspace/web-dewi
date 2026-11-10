import { errors, numeric } from './engine';
import { catalog, fresh, row, type Draft, type Row, type Values } from './model';
import type { Worksheet } from './import-export';

const INPUT_SHEETS = ['01_META', '02_IDENTITAS', '03_PILIHAN_INDUK', '04_KELUARGA', '05_HARTA_KAS', '06_HARTA_PIUTANG', '07_HARTA_INVESTASI', '08_HARTA_BERGERAK', '09_HARTA_PROPERTI', '10_HARTA_LAIN', '11_UTANG', '12_PEKERJAAN', '13_BUKTI_POTONG', '14_PENGHASILAN_LAIN', '15_TKU', '16_OMZET_BULANAN', '17_NORMA', '18_REKON_LR', '19_NERACA', '20_PENYUSUTAN', '21_BIAYA_TERTENTU', '22_PPH25', '23_PH_MT', '24_PENGURANG'] as const;
type InputSheet = typeof INPUT_SHEETS[number];
type SourceRow = { values: Values; line: number };
export type TemplateImportSummary = { sheet: string; rows: number; mapped: number };
export type TemplateImportResult = { recognized: boolean; draft?: Draft; errors: string[]; warnings: string[]; summary: TemplateImportSummary[] };
export type TemplateImportMode = 'strict' | 'example';
export type TemplateImportOptions = { mode?: TemplateImportMode };

const compact = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_');
const yesNo = (value: string) => compact(value) === 'YA' ? 'ya' : compact(value) === 'TIDAK' ? 'tidak' : value.trim();
const copy = (source: SourceRow, map: Record<string, string>): Values => Object.fromEntries(Object.entries(map).flatMap(([target, input]) => source.values[input] ? [[target, source.values[input]]] : []));
const rawRows = (sheet: Worksheet): SourceRow[] => {
    const header = sheet.rows[4] || [];
    return sheet.rows.slice(5).map((cells, index) => ({ line: index + 6, values: Object.fromEntries(header.map((key, column) => [key.trim(), String(cells[column] || '').trim()])) })).filter(row => Object.values(row.values).some(Boolean));
};
const fieldMap: Record<string, string> = {
    A_SRC_PEKERJAAN: 'hasJobs', A_SRC_USAHA: 'hasBusiness', A_SRC_BEBAS: 'hasBusiness', B_1A_PEKERJAAN: 'hasJobs', B_1B1_USAHA_BEBAS: 'hasBusiness', B_1C_DN_LAIN: 'hasOtherDomestic', B_1D_LUAR_NEGERI: 'hasForeign', C_3_PENGURANG_NETO: 'hasDeductions', C_8_PENGURANG_PPH: 'hasTaxRelief', D_10A_BUPOT: 'hasWithholding', D_10D_KREDIT_LN_KEMBALI: 'hasForeignRefund', E_11B_ANGSUR_TUNDA: 'hasDeferral', H_13A_ANGSURAN: 'hasP25', H_13B_PERHITUNGAN_SENDIRI: 'hasCustomP25', H_13C_OPPT: 'hasOPPTP25', I_14B_UTANG: 'hasDebt', I_14C_FINAL: 'hasFinal', I_14D_NONOBJEK: 'hasExempt', I_14E_PENYUSUTAN: 'hasDepreciation', I_14F_BIAYA: 'hasSpecialCosts', I_14G_DIVIDEN_INVESTASI: 'hasForeignDividend', J_A_LAPKEU: 'hasFinancialStatements', J_B_BUKTI_ZAKAT: 'hasZakatProof', J_C_BUKTI_KREDIT_LN: 'hasForeignCreditProof', J_D_KUASA: 'hasPowerOfAttorney', J_E_LAINNYA: 'hasOtherAttachments',
};
const tableMaps: Partial<Record<InputSheet, [string, Record<string, string>]>> = {
    '04_KELUARGA': ['family', { name: 'nama', tin: 'nik', birth: 'tanggal_lahir', relation: 'hubungan', occupation: 'pekerjaan' }],
    '05_HARTA_KAS': ['cash', { code: 'kode_harta', account: 'nomor_akun', owner: 'atas_nama', bank: 'bank_institusi', country: 'lokasi_harta', year: 'tahun_perolehan', balance: 'saldo_akhir', pps: 'keterangan_pps' }],
    '06_HARTA_PIUTANG': ['receivables', { code: 'kode_harta', description: 'deskripsi', country: 'lokasi_penerima', debtorTin: 'penerima_nik_npwp', debtor: 'penerima_nama', principal: 'nilai_piutang_awal', year: 'tahun_dimulai', balance: 'saldo_piutang_akhir', pps: 'keterangan_pps' }],
    '07_HARTA_INVESTASI': ['investments', { code: 'kode_harta', country: 'lokasi_harta', issuerTin: 'institusi_npwp', issuer: 'institusi_nama', account: 'nomor_akun', cost: 'harga_perolehan', year: 'tahun_perolehan', current: 'nilai_saat_ini', pps: 'keterangan_pps' }],
    '08_HARTA_BERGERAK': ['movable', { code: 'kode_harta', type: 'tipe', model: 'merek_model', registration: 'nomor_polisi_registrasi', ownership: 'kepemilikan', ownerTin: 'pemilik_lain_nik_npwp', ownerName: 'pemilik_lain_nama', year: 'tahun_perolehan', cost: 'harga_perolehan', current: 'nilai_saat_ini', pps: 'keterangan_pps' }],
    '09_HARTA_PROPERTI': ['immovable', { code: 'kode_harta', description: 'deskripsi', address: 'lokasi_harta', landArea: 'luas_tanah_m2', buildingArea: 'luas_bangunan_m2', source: 'sumber_kepemilikan', certificate: 'nomor_sertifikat', year: 'tahun_perolehan', cost: 'harga_perolehan', current: 'nilai_saat_ini', pps: 'keterangan_pps' }],
    '10_HARTA_LAIN': ['otherassets', { code: 'kode_harta', description: 'deskripsi', year: 'tahun_perolehan', proof: 'bukti_kepemilikan_nomor', notes: 'informasi_tambahan', cost: 'harga_perolehan', current: 'nilai_saat_ini', pps: 'keterangan_pps' }],
    '11_UTANG': ['debts', { code: 'kode_utang', description: 'deskripsi', creditorTin: 'kreditur_nik_npwp', creditor: 'kreditur_nama', country: 'negara_kreditur', year: 'tahun_peminjaman', balance: 'saldo_akhir', notes: 'keterangan' }],
    '12_PEKERJAAN': ['jobs', { employer: 'pemberi_kerja_nama', employerTin: 'pemberi_kerja_nik_npwp', gross: 'penghasilan_bruto', expense: 'pengurang_bruto' }],
    '13_BUKTI_POTONG': ['withholding', { payerTin: 'pemotong_nik_npwp', payerName: 'pemotong_nama', slipNo: 'nomor_bukti_potong', slipDate: 'tanggal_bukti', taxType: 'jenis_pph', gross: 'dasar_pengenaan', withheld: 'pph_dipotong_dipungut' }],
    '17_NORMA': ['nppn', { tku: 'tku_id', business: 'jenis_usaha_pekerjaan', gross: 'peredaran_bruto', norm: 'persen_norma', net: 'penghasilan_neto_input' }],
};

function normalizeTableValues(key: string, values: Values): Values {
    if (key !== 'movable') return values;
    const ownership = ({ SENDIRI: 'Taxpayer', PIHAK_LAIN: 'Other' } as Record<string, string>)[compact(values.ownership || '')];
    return ownership ? { ...values, ownership } : values;
}

function validationFields(key: string, fields: { key: string; type: string; label: string; required: boolean; options: string[] }[], values: Values) {
    if (key !== 'movable' || values.ownership !== 'Taxpayer') return fields;
    return fields.map(field => ['ownerTin', 'ownerName'].includes(field.key) ? { ...field, required: false } : field);
}

export function importTemplateWorkbook(sheets: Worksheet[], options: TemplateImportOptions = {}): TemplateImportResult {
    const mode = options.mode || 'strict';
    const byName = new Map(sheets.map(sheet => [sheet.name, sheet]));
    const errors: string[] = [], warnings: string[] = [], summary: TemplateImportSummary[] = [];
    const reviewRows = new Map<string, { count: number; messages: Set<string> }>();
    const meta = byName.get('01_META');
    if (!meta || meta.rows[4]?.[0] !== 'file_signature') return { recognized: false, errors, warnings, summary };
    const missing = INPUT_SHEETS.filter(name => !byName.has(name));
    if (missing.length) return { recognized: true, errors: [`Worksheet wajib tidak ditemukan: ${missing.join(', ')}`], warnings, summary };
    const source = Object.fromEntries(INPUT_SHEETS.map(name => [name, rawRows(byName.get(name)!)])) as Record<InputSheet, SourceRow[]>;
    const signature = source['01_META'][0]?.values;
    if (signature?.file_signature !== 'PC-SPTOP-IMPORT') errors.push('Signature workbook tidak cocok. Gunakan template SPT OP Studio.');
    if (signature?.schema_version !== '0.2.0') errors.push('Versi template Excel lama. Unduh template SPT OP Studio terbaru sebelum mengimpor.');
    for (const name of INPUT_SHEETS) if ((byName.get(name)?.rows[4] || []).every(value => !value.trim())) errors.push(`${name}: header teknis harus berada di baris 5.`);
    const depreciationHeaders = (byName.get('20_PENYUSUTAN')?.rows[4] || []).map(value => value.trim());
    if (!depreciationHeaders.includes('nama_harta')) errors.push('20_PENYUSUTAN: kolom wajib nama_harta tidak ditemukan. Unduh template SPT OP Studio terbaru sebelum mengimpor.');
    if (errors.length) return { recognized: true, errors, warnings, summary };
    const d = fresh();
    d.profile = Object.fromEntries(Object.keys(d.profile).map(key => [key, '']));
    for (const name of INPUT_SHEETS) d.importTables[name] = source[name].map(item => row(item.values, `import:${name}:${item.line}`));
    const set = (group: 'profile' | 'questions' | 'extras' | 'declaration' | 'documentNotes', key: string, value: string) => { if (key) d[group][key] = value; };
    const metadata = signature || {};
    const metaValues: Record<string, [typeof set extends never ? never : 'profile' | 'declaration' | 'documentNotes', string, (value: string) => string]> = {
        tahun_pajak: ['profile', 'year', value => value], periode_mulai: ['profile', 'fromMonth', value => value], periode_akhir: ['profile', 'toMonth', value => value], jenis_periode: ['profile', 'periodType', value => ({ TAHUN_PAJAK: 'TAHUN_PAJAK', BAGIAN_TAHUN: 'BAGIAN_TAHUN' }[compact(value)] || value)], status_spt: ['profile', 'sptStatus', value => compact(value) === 'PEMBETULAN' ? 'Pembetulan' : compact(value) === 'NORMAL' ? 'Normal' : value], metode_pembukuan: ['profile', 'bookMethod', value => ({ AKRUAL: 'Pembukuan Stelsel Akrual', KAS: 'Pembukuan Stelsel Kas', PENCATATAN: 'Pencatatan' }[compact(value)] || value)], pembetulan_ke: ['profile', 'amendment', value => value], sumber_data: ['documentNotes', 'excelSource', value => value], catatan: ['documentNotes', 'excelNote', value => value], tanggal_pernyataan: ['declaration', 'date', value => value],
    };
    for (const [sourceKey, [group, key, transform]] of Object.entries(metaValues)) set(group, key, transform(metadata[sourceKey] || ''));
    summary.push({ sheet: '01_META', rows: source['01_META'].length, mapped: Object.values(metadata).filter(Boolean).length });
    const identity = source['02_IDENTITAS'][0]?.values || {};
    const identityMap: Record<string, string> = { nik_npwp: 'tin', nama_wp: 'name', jenis_id: 'idType', nomor_id: 'idNumber', telepon: 'phone', email: 'email', status_pasangan: 'maritalTax', nik_npwp_pasangan: 'spouseTin', status_ptkp: 'ptkp' };
    for (const [from, to] of Object.entries(identityMap)) set('profile', to, identity[from] || '');
    if (identity.nama_pasangan) set('documentNotes', 'spouseName', identity.nama_pasangan);
    if (identity.alamat) set('documentNotes', 'address', identity.alamat);
    if (identity.keterangan) set('documentNotes', 'identityNote', identity.keterangan);
    summary.push({ sheet: '02_IDENTITAS', rows: source['02_IDENTITAS'].length, mapped: Object.values(identity).filter(Boolean).length });
    for (const item of source['03_PILIHAN_INDUK']) {
        const code = item.values.field_key, answer = item.values.jawaban;
        if (!answer) continue;
        if (fieldMap[code]) set('questions', fieldMap[code], yesNo(answer));
        if (code === 'B_1B2_KATEGORI') { set('questions', 'hasUMKM', compact(answer) === 'FINAL_BRUTO_TERTENTU' ? 'ya' : 'tidak'); set('questions', 'hasOPPT', compact(answer) === 'OPPT' ? 'ya' : 'tidak'); }
        if (code === 'B_1B3_METODE_NETO') set('questions', 'hasNorm', compact(answer));
        if (code.startsWith('B_1B4_') && yesNo(answer) === 'ya') set('questions', 'sector', code.slice(7).toLowerCase());
        if (code === 'K_PENANDATANGAN') set('declaration', 'capacity', compact(answer) === 'WAKIL_KUASA' ? 'Kuasa' : 'Wajib Pajak');
        if (code.startsWith('J_') && yesNo(answer) === 'ya') set('declaration', 'additional', [d.declaration.additional, item.values.pertanyaan].filter(Boolean).join('; '));
    }
    const answer = (code: string) => yesNo(source['03_PILIHAN_INDUK'].find(item => item.values.field_key === code)?.values.jawaban || '') === 'ya';
    const hasJob = answer('A_SRC_PEKERJAAN'), hasBusiness = answer('A_SRC_USAHA'), hasProfession = answer('A_SRC_BEBAS');
    // The Excel template records income sources as separate answers while the current profile has one selector.
    // Preserve ambiguous combined sources as blank rather than silently choosing a primary source.
    if (hasJob && !hasBusiness && !hasProfession) set('profile', 'incomeSource', 'Pekerjaan');
    else if (!hasJob && hasBusiness && !hasProfession) set('profile', 'incomeSource', 'Kegiatan Usaha');
    else if (!hasJob && !hasBusiness && hasProfession) set('profile', 'incomeSource', 'Pekerjaan Bebas');
    summary.push({ sheet: '03_PILIHAN_INDUK', rows: source['03_PILIHAN_INDUK'].length, mapped: source['03_PILIHAN_INDUK'].filter(item => item.values.jawaban).length });
    const addTable = (key: string, input: SourceRow[], map: Record<string, string>, name: string) => {
        const fields = catalog.tables[key]?.columns || [];
        const rows: Row[] = [];
        for (const item of input) {
            const next = row(normalizeTableValues(key, copy(item, map)), `import:${name}:${item.line}`);
            const messages = errorsFor(validationFields(key, fields, next.values), next);
            if (!messages.length) {
                rows.push(next);
                continue;
            }
            if (mode === 'strict') {
                for (const message of messages) errors.push(`${name}: ${message}`);
                rows.push(next);
                continue;
            }
            const review = reviewRows.get(name) || { count: 0, messages: new Set<string>() };
            review.count++;
            for (const message of messages) review.messages.add(message);
            reviewRows.set(name, review);
        }
        d.tables[key] = rows;
        summary.push({ sheet: name, rows: input.length, mapped: rows.length });
    };
    for (const [name, config] of Object.entries(tableMaps) as [InputSheet, [string, Record<string, string>]][]) addTable(config[0], source[name], config[1], name);
    const incomeMaps: Record<string, [string, Record<string, string>]> = {
        FINAL: ['finalincome', { payerTin: 'pemotong_nik_npwp', payerName: 'pemotong_nama', code: 'kode_penghasilan', type: 'jenis_penghasilan', base: 'dasar_pengenaan_bruto', tax: 'pph_terutang' }],
        BUKAN_OBJEK: ['exempt', { code: 'kode_penghasilan', type: 'jenis_penghasilan', sourceTin: 'pemotong_nik_npwp', sourceName: 'pemotong_nama', gross: 'dasar_pengenaan_bruto' }],
        LUAR_NEGERI: ['foreign', { source: 'pemotong_nama', country: 'negara_sumber', type: 'jenis_penghasilan', net: 'penghasilan_neto', taxIDR: 'pph_dipotong', credit: 'pph_dipotong' }],
        DALAM_NEGERI_LAIN: ['otherdomestic', { code: 'kode_penghasilan', type: 'jenis_penghasilan', net: 'penghasilan_neto' }],
    };
    for (const [category, config] of Object.entries(incomeMaps)) addTable(config[0], source['14_PENGHASILAN_LAIN'].filter(item => compact(item.values.kategori) === category), config[1], '14_PENGHASILAN_LAIN');
    for (const item of source['14_PENGHASILAN_LAIN']) if (!incomeMaps[compact(item.values.kategori)]) warnings.push(`14_PENGHASILAN_LAIN baris ${item.line}: kategori tidak dipetakan.`);
    const tkuNames = Object.fromEntries(source['15_TKU'].map(item => [item.values.tku_id, item.values.nama_tku || item.values.id_tku_djp || item.values.tku_id]));
    const monthRows: Record<string, Record<string, Values>> = { FINAL_BRUTO_TERTENTU: {}, OPPT: {}, NPPN: {} };
    const paymentAmount = (value: string) => numeric(value) || 0;
    for (const item of source['16_OMZET_BULANAN']) { const mode = compact(item.values.rezim_pelaporan), month = Number(item.values.bulan); if (!monthRows[mode] || month < 1 || month > 12) { warnings.push(`16_OMZET_BULANAN baris ${item.line}: rezim atau bulan tidak valid.`); continue; } const tku = item.values.tku_id, values = monthRows[mode][tku] || { tku: tkuNames[tku] || tku }; values[`m${month}`] = item.values.peredaran_bruto; monthRows[mode][tku] = values; if (mode === 'FINAL_BRUTO_TERTENTU') { const paid = `umkmPaid${month - 1}`, withheld = `umkmWithheld${month - 1}`; d.extras[paid] = String(paymentAmount(d.extras[paid]) + paymentAmount(item.values.pph_dibayar_sendiri)); d.extras[withheld] = String(paymentAmount(d.extras[withheld]) + paymentAmount(item.values.pph_dipotong_pihak_lain)); } }
    d.tables.umkm = Object.values(monthRows.FINAL_BRUTO_TERTENTU).map(values => row(values, 'import:16_OMZET_BULANAN'));
    d.tables.opent = Object.values(monthRows.OPPT).map(values => row({ ...values, method: d.profile.bookMethod }, 'import:16_OMZET_BULANAN'));
    d.tables.normmonths = Object.values(monthRows.NPPN).map(values => row(values, 'import:16_OMZET_BULANAN'));
    summary.push({ sheet: '16_OMZET_BULANAN', rows: source['16_OMZET_BULANAN'].length, mapped: d.tables.umkm.length + d.tables.opent.length + d.tables.normmonths.length });
    for (const item of source['18_REKON_LR']) { const key = ({ DAGANG: 'dagangan', JASA: 'jasa', INDUSTRI: 'industri' }[compact(item.values.sektor)]); if (!key) { warnings.push(`18_REKON_LR baris ${item.line}: sektor tidak dipetakan.`); continue; } const values = copy(item, { code: 'kode_akun_djp', label: 'nama_akun', commercial: 'nilai_komersial', nonobject: 'nilai_bukan_objek', final: 'nilai_pph_final', nonfinal: 'nilai_objek_nonfinal', positive: 'koreksi_positif', negative: 'koreksi_negatif', fiscalCode: 'kode_penyesuaian_fiskal' }); d.books[key] = [...(d.books[key] || []), row(values, `import:18_REKON_LR:${item.line}`)]; }
    summary.push({ sheet: '18_REKON_LR', rows: source['18_REKON_LR'].length, mapped: Object.values(d.books).reduce((count, rows) => count + rows.length, 0) });
    addTable('depreciation', source['20_PENYUSUTAN'].filter(item => compact(item.values.jenis_aset) === 'BERWUJUD'), { CodeOfAsset: 'kode_harta_djp', GroupOfAsset: 'kelompok_jenis_harta', AssetName: 'nama_harta', MonthOfAcquisition: 'bulan_perolehan', YearOfAcquisition: 'tahun_perolehan', AcquisitionPrice: 'harga_perolehan', RemainingValue: 'nilai_sisa_buku_awal', CommercialMethode: 'metode_komersial', FiscalMethode: 'metode_fiskal', FiscalDepretiationThisYear: 'beban_tahun_ini_input', Notes: 'keterangan' }, '20_PENYUSUTAN');
    addTable('amortization', source['20_PENYUSUTAN'].filter(item => compact(item.values.jenis_aset) === 'TAK_BERWUJUD'), { CodeOfAsset: 'kode_harta_djp', GroupOfAsset: 'kelompok_jenis_harta', AssetName: 'nama_harta', MonthOfAcquisition: 'bulan_perolehan', YearOfAcquisition: 'tahun_perolehan', AcquisitionPrice: 'harga_perolehan', RemainingValue: 'nilai_sisa_buku_awal', CommercialMethode: 'metode_komersial', FiscalMethode: 'metode_fiskal', FiscalDepretiationThisYear: 'beban_tahun_ini_input', Notes: 'keterangan' }, '20_PENYUSUTAN');
    const costMaps: Record<string, [string, Record<string, string>]> = { ENTERTAINMENT: ['entertainment', { Date: 'tanggal_transaksi', Location: 'nama_tempat', Address: 'alamat_tempat', Type: 'jenis_transaksi', Amount: 'jumlah_biaya', Name: 'penerima_nama', Position: 'penerima_jabatan', CompanyName: 'penerima_perusahaan', BusinessType: 'penerima_jenis_usaha', Notes: 'keterangan' }], PROMOSI_NATURA: ['promotion', { TINCode: 'penerima_nik_npwp', NameOfRecipient: 'penerima_nama', Address: 'alamat_tempat', DateOfPromotion: 'tanggal_transaksi', TypeOfCost: 'jenis_transaksi', AmountOfPromotionCost: 'jumlah_biaya', WithholdingSlipNumber: 'nomor_bukti_potong', Notes: 'keterangan' }], PIUTANG_TAK_TERTAGIH: ['baddebt', { TINCode: 'penerima_nik_npwp', DebtorName: 'penerima_nama', DebtorAddress: 'alamat_tempat', AmountBadDebt: 'jumlah_biaya', TypeOfFulfillment: 'keterangan' }] };
    for (const [category, config] of Object.entries(costMaps)) addTable(config[0], source['21_BIAYA_TERTENTU'].filter(item => compact(item.values.kategori_biaya) === category), config[1], '21_BIAYA_TERTENTU');
    d.extras.p25Paid = String(source['22_PPH25'].filter(item => compact(item.values.jenis_setoran) === 'PPH25').reduce((sum, item) => sum + numeric(item.values.nilai_pokok), 0) || '');
    d.extras.p25STP = String(source['22_PPH25'].filter(item => compact(item.values.jenis_setoran) === 'STP_POKOK').reduce((sum, item) => sum + numeric(item.values.nilai_pokok), 0) || '');
    summary.push({ sheet: '22_PPH25', rows: source['22_PPH25'].length, mapped: source['22_PPH25'].length });
    d.extras.phmtTax = String(source['23_PH_MT'].reduce((sum, item) => sum + numeric(item.values.nilai), 0) || '');
    summary.push({ sheet: '23_PH_MT', rows: source['23_PH_MT'].length, mapped: source['23_PH_MT'].length });
    const deductionMaps: Record<string, [string, Record<string, string>]> = { KERUGIAN_FISKAL: ['taxloss', { year: 'tahun_asal', loss: 'nilai_awal', compensated: 'nilai_tahun_ini' }], PENGURANG_NETO: ['deductions', { code: 'jenis_uraian', type: 'jenis_uraian', amount: 'nilai_tahun_ini' }], PENGURANG_PPH: ['taxrelief', { code: 'jenis_uraian', type: 'jenis_uraian', amount: 'nilai_tahun_ini' }] };
    for (const [category, config] of Object.entries(deductionMaps)) addTable(config[0], source['24_PENGURANG'].filter(item => compact(item.values.kategori) === category), config[1], '24_PENGURANG');
    for (const [sheet, review] of reviewRows) warnings.push(`${sheet}: ${review.count} baris disimpan sebagai data sumber untuk ditinjau (${[...review.messages].slice(0, 2).join('; ')}).`);
    for (const name of INPUT_SHEETS) if (!summary.some(item => item.sheet === name)) summary.push({ sheet: name, rows: source[name].length, mapped: 0 });
    const grouped = Object.values(summary.reduce<Record<string, TemplateImportSummary>>((all, item) => ({ ...all, [item.sheet]: { sheet: item.sheet, rows: source[item.sheet as InputSheet].length, mapped: (all[item.sheet]?.mapped || 0) + item.mapped } }), {}));
    return { recognized: true, draft: d, errors, warnings, summary: grouped };
}
function errorsFor(fields: { key: string; type: string; label: string; required: boolean; options: string[] }[], value: Row) { return errors(fields, value); }
