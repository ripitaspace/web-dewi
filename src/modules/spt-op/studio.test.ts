import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { backup, catalog, draftKey, fresh, readBackup, reducer, row } from './model';
import { compute, errors, numeric, readiness, regularEmployeeEligibility, sectionStatus, umkmEligibility, validate } from './engine';
import { copyAssets, csv, excelDate, parseCSV, previewImport, readWorkbook } from './import-export';
import { importTemplateWorkbook } from './template-import';
import { pageCount, pageRows } from './form-layout';
import { boxSlots, tableBindings } from './coretax-map';
import { assertCanSave, saveDraft, withoutDraft } from './storage';
import { adapters, previewXML } from './xml';
import { progressiveReference, roundPkpDownToThousand, rules2025, umkmFinalReference } from './rules-2025';

const employer = () => row({ employer: 'PERUSAHAAN CONTOH', employerTin: '0000000000000001', gross: '120000000', expense: '6000000' });

describe('Draft isolation and migration', () => {
  it('separates taxpayers, years and amendment numbers', () => {
    const d = fresh();
    d.profile.tin = '0000000000000001';
    const versions = [d, { ...d, profile: { ...d.profile, tin: '0000000000000002' } }, { ...d, profile: { ...d.profile, year: '2024' } }, ...['1', '2'].map(amendment => ({ ...d, profile: { ...d.profile, sptStatus: 'Pembetulan', amendment } }))];
    expect(new Set(versions.map(draftKey)).size).toBe(5);
  });
  it('round-trips every table, row ID, provenance, note and override', () => {
    const d = fresh();
    for (const key of Object.keys(catalog.tables)) d.tables[key] = [row({ code: '0001', notes: 'A & B <C> "D"' }, 'import:sheet:2')];
    d.tables.cash[0].disposed = true;
    d.tables.cash[0].review = true;
    d.documentNotes.reference = 'Piagam contoh';
    d.overrides.business = { enabled: true, value: '100', reason: 'Rekonsiliasi contoh' };
    const restored = readBackup(JSON.parse(backup(d)));
    expect(restored.tables).toEqual(d.tables);
    expect(restored.documentNotes).toEqual(d.documentNotes);
    expect(restored.overrides).toEqual(d.overrides);
    expect(restored.id).not.toBe(d.id);
  });
  it('migrates legacy data without mutating its source', () => {
    const legacy = { profile: { tin: '0000000000000001', year: '2025' }, tables: { jobs: [{ employer: 'CONTOH', employerTin: '0000000000000002', gross: 100 }] }, books: {}, umkmPaid: [100, 200], umkmWithheld: [300], documentNotes: { note: 'dokumen lama' } };
    const before = JSON.stringify(legacy);
    const d = readBackup({ format: 'RIPITAX.SPT.OP.v1', data: legacy });
    expect(d.tables.jobs[0].values.employerTin).toBe('0000000000000002');
    expect(d.tables.jobs[0].origin).toBe('legacy-v1');
    expect(d.extras.umkmPaid1).toBe('200');
    expect(d.extras.umkmWithheld0).toBe('300');
    expect(d.documentNotes.note).toBe('dokumen lama');
    expect(JSON.stringify(legacy)).toBe(before);
  });
  it('rejects unsupported versions, malformed data and duplicate row IDs', () => {
    expect(() => readBackup({ format: 'unknown', data: {} })).toThrow();
    const d = fresh(); d.tables.jobs = [employer()]; d.tables.jobs.push(d.tables.jobs[0]);
    expect(() => readBackup(JSON.parse(backup(d)))).toThrow(/ID baris/);
    expect(() => readBackup({ format: 'RIPITAX.SPT.OP.v1', data: { profile: {}, tables: { unknown: [] } } })).toThrow();
    expect(() => readBackup({ format: 'RIPITAX.SPT.OP.v1', data: { profile: { tin: {} } } })).toThrow();
  });
  it('rejects stale revisions and conflicting identities without overwriting', () => {
    const d = fresh(); d.revision = 2; d.profile.tin = '0000000000000001';
    expect(() => assertCanSave(d, 1, [d])).toThrow(/Konflik/);
    expect(() => assertCanSave({ ...d, id: 'new' }, 0, [d])).toThrow(/sudah ada/);
    expect(() => assertCanSave(d, 2, [d])).not.toThrow();
  });
  it('surfaces unavailable device storage', async () => {
    await expect(saveDraft(fresh(), 0)).rejects.toThrow();
  });
  it('removes only the requested draft and leaves the list unchanged when it is missing', () => {
    const first = fresh(), second = fresh();
    expect(withoutDraft([first, second], first.id)).toEqual([second]);
    expect(withoutDraft([first, second], 'missing')).toEqual([first, second]);
  });
  it('copies prior assets as independent rows requiring review', () => {
    const source = fresh(); source.profile.year = '2024';
    source.tables.cash = [row({ balance: '1000' }), { ...row({ balance: '2000' }), disposed: true }];
    const target = fresh(); target.tables.cash = [row({ balance: '3000' })];
    const copied = copyAssets(source, target);
    expect(copied.tables.cash).toHaveLength(2);
    expect(copied.tables.cash[1]).toMatchObject({ review: true, origin: `copy:2024:${source.tables.cash[0].id}` });
    expect(copied.tables.cash[1].id).not.toBe(source.tables.cash[0].id);
    copied.tables.cash[1].values.balance = '4000';
    expect(source.tables.cash[0].values.balance).toBe('1000');
    expect(target.tables.cash).toHaveLength(1);
  });
  it('retains data when a section becomes inapplicable', () => {
    const d = fresh(); d.tables.jobs = [employer()];
    const next = reducer(d, { type: 'field', group: 'questions', key: 'hasJobs', value: 'tidak' });
    expect(next.tables.jobs).toEqual(d.tables.jobs);
    expect(sectionStatus(next, 'jobs').applicability).toBe('Tidak Berlaku');
  });
});

describe('Import and export', () => {
  it('replaces a recognised Excel blueprint with mapped form fields and preserves source rows', () => {
    const names = ['01_META', '02_IDENTITAS', '03_PILIHAN_INDUK', '04_KELUARGA', '05_HARTA_KAS', '06_HARTA_PIUTANG', '07_HARTA_INVESTASI', '08_HARTA_BERGERAK', '09_HARTA_PROPERTI', '10_HARTA_LAIN', '11_UTANG', '12_PEKERJAAN', '13_BUKTI_POTONG', '14_PENGHASILAN_LAIN', '15_TKU', '16_OMZET_BULANAN', '17_NORMA', '18_REKON_LR', '19_NERACA', '20_PENYUSUTAN', '21_BIAYA_TERTENTU', '22_PPH25', '23_PH_MT', '24_PENGURANG'];
    const sheet = (name: string, header: string[] = ['id_baris'], data: string[] = []) => ({ name, rows: [[], [], [], [], header, data] });
    const sheets = names.map(name => sheet(name));
    sheets[0] = sheet('01_META', ['file_signature', 'schema_version', 'tahun_pajak', 'jenis_periode', 'status_spt'], ['PC-SPTOP-IMPORT', '0.2.0', '2025', 'BAGIAN_TAHUN', 'NORMAL']);
    sheets[1] = sheet('02_IDENTITAS', ['nik_npwp', 'nama_wp', 'email'], ['0000000000000001', 'Rico', 'rico@example.test']);
    sheets[2] = { name: '03_PILIHAN_INDUK', rows: [[], [], [], [], ['field_key', 'jawaban'], ['B_1A_PEKERJAAN', 'YA'], ['B_1B3_METODE_NETO', 'NPPN'], ['I_14B_UTANG', 'TIDAK'], ['J_A_LAPKEU', 'YA']] };
    sheets[4] = sheet('05_HARTA_KAS', ['kode_harta', 'nomor_akun', 'atas_nama', 'bank_institusi', 'lokasi_harta', 'tahun_perolehan', 'saldo_akhir'], ['0102', '123', 'Rico', 'Bank Contoh', 'IDN', '2020', '1000000']);
    sheets[11] = sheet('12_PEKERJAAN', ['pemberi_kerja_nama', 'pemberi_kerja_nik_npwp', 'penghasilan_bruto', 'pengurang_bruto'], ['CONTOH', '0000000000000002', '120000000', '6000000']);
    sheets[19] = sheet('20_PENYUSUTAN', ['id_aset', 'kode_harta_djp', 'kelompok_jenis_harta', 'nama_harta', 'jenis_aset']);
    const result = importTemplateWorkbook(sheets);
    expect(result).toMatchObject({ recognized: true, errors: [] });
    expect(result.draft?.profile).toMatchObject({ year: '2025', periodType: 'BAGIAN_TAHUN', name: 'Rico', tin: '0000000000000001' });
    expect(result.draft?.questions).toMatchObject({ hasJobs: 'ya', hasNorm: 'NPPN', hasDebt: 'tidak', hasFinancialStatements: 'ya' });
    expect(result.draft?.tables.cash[0].values).toMatchObject({ code: '0102', balance: '1000000' });
    expect(result.draft?.tables.jobs[0].values.employer).toBe('CONTOH');
    expect(result.draft?.importTables['05_HARTA_KAS'][0].values.saldo_akhir).toBe('1000000');
  });
  it('recognises the downloadable Excel template without changing its required headers', () => {
    const workbook = XLSX.readFile('public/tools/spt-op/PuspitaCore_SPT_OP_Import_Excel.xlsx');
    const sheets = workbook.SheetNames.map(name => ({ name, rows: XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[name], { header: 1, raw: false, defval: '' }) }));
    const result = importTemplateWorkbook(sheets);
    expect(result).toMatchObject({ recognized: true, errors: [] });
    expect(result.summary).toHaveLength(24);
  });
  it('rejects a legacy Excel template without nama_harta', () => {
    const names = ['01_META', '02_IDENTITAS', '03_PILIHAN_INDUK', '04_KELUARGA', '05_HARTA_KAS', '06_HARTA_PIUTANG', '07_HARTA_INVESTASI', '08_HARTA_BERGERAK', '09_HARTA_PROPERTI', '10_HARTA_LAIN', '11_UTANG', '12_PEKERJAAN', '13_BUKTI_POTONG', '14_PENGHASILAN_LAIN', '15_TKU', '16_OMZET_BULANAN', '17_NORMA', '18_REKON_LR', '19_NERACA', '20_PENYUSUTAN', '21_BIAYA_TERTENTU', '22_PPH25', '23_PH_MT', '24_PENGURANG'];
    const sheets = names.map(name => ({ name, rows: [[], [], [], [], ['id_baris'], []] }));
    sheets[0] = { name: '01_META', rows: [[], [], [], [], ['file_signature', 'schema_version'], ['PC-SPTOP-IMPORT', '0.1.0']] };
    const result = importTemplateWorkbook(sheets);
    expect(result.errors).toContain('Versi template Excel lama. Unduh template SPT OP Studio terbaru sebelum mengimpor.');
  });
  it('rejects a workbook that claims version 0.2.0 but lacks nama_harta', () => {
    const names = ['01_META', '02_IDENTITAS', '03_PILIHAN_INDUK', '04_KELUARGA', '05_HARTA_KAS', '06_HARTA_PIUTANG', '07_HARTA_INVESTASI', '08_HARTA_BERGERAK', '09_HARTA_PROPERTI', '10_HARTA_LAIN', '11_UTANG', '12_PEKERJAAN', '13_BUKTI_POTONG', '14_PENGHASILAN_LAIN', '15_TKU', '16_OMZET_BULANAN', '17_NORMA', '18_REKON_LR', '19_NERACA', '20_PENYUSUTAN', '21_BIAYA_TERTENTU', '22_PPH25', '23_PH_MT', '24_PENGURANG'];
    const sheets = names.map(name => ({ name, rows: [[], [], [], [], ['id_baris'], []] }));
    sheets[0] = { name: '01_META', rows: [[], [], [], [], ['file_signature', 'schema_version'], ['PC-SPTOP-IMPORT', '0.2.0']] };
    const result = importTemplateWorkbook(sheets);
    expect(result.errors).toContain('20_PENYUSUTAN: kolom wajib nama_harta tidak ditemukan. Unduh template SPT OP Studio terbaru sebelum mengimpor.');
  });
  const exampleFiles = [
    'SPT_OP_WP01_Karyawan_2025.xlsx',
    'SPT_OP_WP02_Karyawan_Menikah_2025.xlsx',
    'SPT_OP_WP03_Status_PH_MT_2025.xlsx',
    'SPT_OP_WP04_Pengusaha_UMKM_2025.xlsx',
    'SPT_OP_WP05_Profesional_NPPN_2025.xlsx',
    'SPT_OP_WP06_Pengusaha_Pembukuan_2025.xlsx',
  ];
  const exampleIncomeSources: Record<string, string> = {
    'SPT_OP_WP01_Karyawan_2025.xlsx': 'Pekerjaan',
    'SPT_OP_WP02_Karyawan_Menikah_2025.xlsx': 'Pekerjaan',
    'SPT_OP_WP03_Status_PH_MT_2025.xlsx': 'Pekerjaan',
    'SPT_OP_WP04_Pengusaha_UMKM_2025.xlsx': 'Kegiatan Usaha',
    'SPT_OP_WP05_Profesional_NPPN_2025.xlsx': 'Pekerjaan Bebas',
    'SPT_OP_WP06_Pengusaha_Pembukuan_2025.xlsx': 'Kegiatan Usaha',
  };
  const readExample = (file: string) => {
    const workbook = XLSX.readFile(`public/tools/spt-op/examples/${file}`);
    return workbook.SheetNames.map(name => ({ name, rows: XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[name], { header: 1, raw: false, defval: '' }) }));
  };
  it.each(exampleFiles)('loads example %s while retaining source rows for review', file => {
    const result = importTemplateWorkbook(readExample(file), { mode: 'example' });
    expect(result).toMatchObject({ recognized: true, errors: [] });
    expect(result.draft?.profile.name).toMatch(/^SIMULASI/);
    expect(result.draft?.profile.incomeSource).toBe(exampleIncomeSources[file]);
    expect(result.draft?.importTables['11_UTANG']).not.toHaveLength(0);
    if (file === 'SPT_OP_WP04_Pengusaha_UMKM_2025.xlsx') expect(result.warnings).toHaveLength(0);
    else expect(result.warnings.length).toBeGreaterThan(0);
  });
  it('calculates the regular employee example and marks unrelated branches not applicable', () => {
    const result = importTemplateWorkbook(readExample('SPT_OP_WP01_Karyawan_2025.xlsx'), { mode: 'example' });
    expect(result.draft).toBeDefined();
    const values = compute(result.draft!);
    expect(values.find(item => item.key === 'pk')).toMatchObject({ verification: 'ruleset-2025' });
    for (const key of ['payable', 'amended', 'umkmTax', 'phmt']) expect(values.find(item => item.key === key)?.verification).toBe('not-applicable');
  });
  it('imports UMKM payments by adding each TKU within the same month', () => {
    const sheets = readExample('SPT_OP_WP04_Pengusaha_UMKM_2025.xlsx');
    const omzet = sheets.find(sheet => sheet.name === '16_OMZET_BULANAN')!;
    const header = omzet.rows[4];
    const paid = header.indexOf('pph_dibayar_sendiri');
    const january = omzet.rows.filter(row => row[2] === '1').slice(0, 2);
    january[0][paid] = '100';
    january[1][paid] = '200';
    const result = importTemplateWorkbook(sheets, { mode: 'example' });
    expect(result.draft?.extras.umkmPaid0).toBe('300');
  });
  it('calculates the cleaned UMKM example with complete active attachments', () => {
    const result = importTemplateWorkbook(readExample('SPT_OP_WP04_Pengusaha_UMKM_2025.xlsx'), { mode: 'example' });
    const draft = result.draft!;
    expect(result.warnings).toHaveLength(0);
    expect(draft.profile.maritalTax).toBe('Gabung');
    expect(draft.tables.family.map(item => item.values.relation)).toEqual(['Istri', 'Anak']);
    expect(draft.tables.receivables.every(item => item.values.code !== '0209')).toBe(true);
    expect(draft.tables.debts.every(item => item.values.code === '101')).toBe(true);
    for (const section of ['family', 'receivables', 'debts', 'umkm']) expect(sectionStatus(draft, section)).toEqual({ applicability: 'Berlaku', progress: 'Lengkap' });
    expect(compute(draft).find(item => item.key === 'umkmTax')).toMatchObject({ value: 0, verification: 'ruleset-2025' });
  });
  it('keeps the standard Excel import strict while normalizing known movable-asset ownership values', () => {
    const sheets = readExample('SPT_OP_WP01_Karyawan_2025.xlsx');
    const strict = importTemplateWorkbook(sheets);
    const example = importTemplateWorkbook(sheets, { mode: 'example' });
    expect(strict.errors.length).toBeGreaterThan(0);
    expect(example.draft?.tables.movable.map(item => item.values.ownership)).toEqual(expect.arrayContaining(['Taxpayer', 'Other']));
  });
  it('reads quoted multiline CSV and does not lose leading zero', () => {
    const parsed = parseCSV('\uFEFFNama;NPWP;Catatan\r\n"A; B";0000123;"Baris 1\nBaris 2 ""kutip"""');
    expect(parsed).toEqual([['Nama', 'NPWP', 'Catatan'], ['A; B', '0000123', 'Baris 1\nBaris 2 "kutip"']]);
    expect(() => parseCSV('a,b\n"unclosed')).toThrow();
  });
  it('rejects empty mappings and reports each failed or duplicate row', () => {
    const sheet = { name: 'Pekerjaan', rows: [['Nama', 'NPWP', 'Bruto', 'Pengurang'], ['CONTOH', '0000000000000001', '120.000.000', '6.000.000'], ['RUSAK', '', 'abc', '0'], ['CONTOH', '0000000000000001', '120000000', '6000000']] };
    expect(() => previewImport(sheet, 0, 'jobs', {}, [])).toThrow(/pemetaan/);
    const candidates = previewImport(sheet, 0, 'jobs', { employer: '0', employerTin: '1', gross: '2', expense: '3' }, []);
    expect(candidates.map(c => c.line)).toEqual([2, 3, 4]);
    expect(candidates[0].row.values.employerTin).toBe('0000000000000001');
    expect(candidates[1].errors).toHaveLength(2);
    expect(candidates[2].duplicate).toBe(true);
    expect(candidates.filter(c => !c.errors.length && !c.duplicate)).toHaveLength(1);
  });
  it('detects duplicates against existing rows despite formatting differences', () => {
    const r = employer(); r.values.net = '114000000';
    const sheet = { name: 'Sheet', rows: [['a','b','c','d'], ['PERUSAHAAN CONTOH','0000000000000001','120.000.000','6.000.000']] };
    expect(previewImport(sheet,0,'jobs',{employer:'0',employerTin:'1',gross:'2',expense:'3'},[r])[0].duplicate).toBe(true);
  });
  it('handles Excel date systems and rejects the nonexistent 1900 leap day', () => {
    expect(excelDate('45658')).toBe('2025-01-01');
    expect(excelDate('44196', true)).toBe('2025-01-01');
    expect(excelDate('60')).toBe('60');
    expect(errors(catalog.tables.family.columns, row({ birth: '2025-02-30' }))).toContain('Tanggal lahir: tanggal tidak valid');
  });
  it('reads multiple Excel sheets locally, formatted IDs and date cells', async () => {
    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([['ID', 'Tanggal'], ['0000000000000001', 45658]]);
    sheet.B2.z = 'm/d/yy';
    XLSX.utils.book_append_sheet(wb, sheet, 'Data');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Keterangan']]), 'Catatan');
    const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const result = await readWorkbook(new File([data], 'contoh.xlsx'));
    expect(result.map(s=>s.name)).toEqual(['Data', 'Catatan']);
    expect(result[0].rows[1]).toEqual(['0000000000000001','2025-01-01']);
  });
  it('exports computed net and quotes special characters', () => {
    const d = fresh(); const r=employer(); r.values.employer='CONTOH "A", B'; d.tables.jobs=[r];
    const result=parseCSV(csv(d,'jobs'));
    expect(result[1][0]).toBe(r.values.employer);
    expect(result[1][1]).toBe('0000000000000001');
    expect(result[1][4]).toBe('114000000');
  });
});

describe('Reconciliation and tax verification gates', () => {
  const regularEmployee = () => {
    const d = fresh();
    d.questions = {
      hasJobs: 'ya', hasBusiness: 'tidak', hasOtherDomestic: 'tidak', hasForeign: 'tidak',
      hasDeductions: 'tidak', hasTaxRelief: 'tidak', hasWithholding: 'ya', hasForeignRefund: 'tidak',
      hasDeferral: 'tidak', hasP25: 'tidak', hasCustomP25: 'tidak', hasOPPTP25: 'tidak',
    };
    d.tables.jobs = [employer()];
    d.tables.withholding = [row({ payerTin: '0000000000000001', payerName: 'PERUSAHAAN CONTOH', taxType: 'PPh Pasal 21', gross: '120000000', withheld: '3000000' })];
    return d;
  };
  const umkm = (monthlyGross: number[]) => {
    const d = fresh();
    d.profile = { ...d.profile, year: '2025', sptStatus: 'Normal', periodType: 'TAHUN_PAJAK', fromMonth: '1', toMonth: '12', incomeSource: 'Kegiatan Usaha', maritalTax: 'TK', bookMethod: 'Pencatatan' };
    d.questions = {
      hasJobs: 'tidak', hasBusiness: 'ya', hasUMKM: 'ya', hasOPPT: 'tidak', hasNorm: 'FINAL_TANPA_PEMBUKUAN',
      hasOtherDomestic: 'tidak', hasForeign: 'tidak', hasDeductions: 'tidak', hasTaxRelief: 'tidak',
      hasWithholding: 'tidak', hasForeignRefund: 'tidak', hasDeferral: 'tidak', hasP25: 'tidak', hasCustomP25: 'tidak', hasOPPTP25: 'tidak',
    };
    d.tables.umkm = [row(Object.fromEntries(monthlyGross.map((value, index) => [`m${index + 1}`, String(value)])))];
    return d;
  };
  it.each([['1.234.567,89',1234567.89],['1,234,567.89',1234567.89],['0001',1],['-500',-500]])('parses %s', (input, expected) => expect(numeric(input)).toBe(expected));
  it('does not turn invalid amounts into zero', () => expect(Number.isNaN(numeric('not a number'))).toBe(true));
  it('sums multiple employers and applies overrides once', () => {
    const d = fresh(); d.questions.hasBusiness='tidak'; d.tables.jobs=[employer(),employer()];
    d.tables.deductions=[row({amount:'100'})]; d.extras.otherDeduction='200';
    d.overrides.deductions={enabled:true,value:'300',reason:'Rekap pengganti'};
    const result=compute(d);
    expect(result.find(r=>r.key==='net')?.value).toBe(228000000);
    expect(result.find(r=>r.key==='ded')?.value).toBe(300);
    expect(result.every(r=>r.ruleVersion&&r.source&&r.verification)).toBe(true);
  });
  it('takes a zero book result as zero instead of falling back to manual amounts', () => {
    const d=fresh(); d.questions.sector='jasa'; d.extras.businessNeto='10000';
    d.books.jasa=[row({code:'4800',commercial:'100',positive:'10',negative:'110'})];
    expect(compute(d).find(r=>r.key==='business')?.value).toBe(0);
  });
  it('flags possible double foreign credit instead of using it as final tax', () => {
    const d=fresh(); d.tables.foreign=[row({net:'100',credit:'10'})];d.tables.withholding=[row({taxType:'PPh Pasal 24',withheld:'10'})];
    expect(validate(d).some(v=>v.startsWith('Rekonsiliasi PPh 24'))).toBe(true);
    expect(compute(d).find(r=>r.key==='balance')?.value).toBeNull();
  });
  it.each(['2024','2025','2026'])('withholds unverified annual results for %s', year => {
    const d=fresh(); d.profile.year=year; d.tables.jobs=[employer()];
    expect(compute(d).find(r=>r.key==='pt')?.value).toBe(54000000);
    for(const key of ['pk','rawTax','tax','balance','amended','p25Next','umkmTax','phmt']) expect(compute(d).find(r=>r.key===key)?.value).toBeNull();
    expect(rules2025.annualReturnVerified).toBe(false);
  });
  it('keeps unsupported years editable but blocks their reporting readiness', () => {
    const d = fresh(); d.profile.year = '2026'; d.profile.tin = '0000000000000001'; d.profile.name = 'CONTOH';
    const report = readiness(d);
    expect(report.rulesReady).toBe(false);
    expect(report.issues.join(' ')).toMatch(/2026/);
  });
  // These expected values come from the four published DJP illustrations, not the prototype.
  it.each([[54000000,0],[60000000,300000],[120000000,3900000],[180000000,12900000]])('matches DJP TK/0 reference net %i', (net,tax) => {
    expect(progressiveReference(Math.max(0,net-54000000))).toBe(tax);
  });
  it('rejects invalid PKP in the isolated tariff function', () => expect(()=>progressiveReference(NaN)).toThrow());
  it('calculates the verified 2025 regular-employee slice and keeps its provenance', () => {
    const d = regularEmployee();
    const result = compute(d);
    expect(regularEmployeeEligibility(d)).toMatchObject({ eligible: true });
    expect(result.find(r => r.key === 'pk')).toMatchObject({ value: 60000000, verification: 'ruleset-2025' });
    expect(result.find(r => r.key === 'rawTax')).toMatchObject({ value: 3000000, verification: 'ruleset-2025' });
    expect(result.find(r => r.key === 'tax')).toMatchObject({ value: 3000000 });
    expect(result.find(r => r.key === 'credit')).toMatchObject({ value: 3000000, label: 'Kredit PPh Pasal 21' });
    expect(result.find(r => r.key === 'balance')).toMatchObject({ value: 0 });
    expect(result.find(r => r.key === 'p25Next')).toMatchObject({ value: 0 });
  });
  it('rounds PKP down to the full thousand before applying the progressive tariff', () => {
    const d = regularEmployee();
    d.tables.jobs[0].values = { ...d.tables.jobs[0].values, gross: '120000123', expense: '0' };
    expect(roundPkpDownToThousand(66000123)).toBe(66000000);
    expect(compute(d).find(r => r.key === 'pk')?.value).toBe(66000000);
    expect(compute(d).find(r => r.key === 'rawTax')?.value).toBe(3900000);
  });
  it('sums multiple employers and derives the regular PPh 25 installment when selected', () => {
    const d = regularEmployee();
    d.tables.jobs.push(employer());
    d.questions.hasP25 = 'ya';
    const result = compute(d);
    expect(result.find(r => r.key === 'pk')?.value).toBe(174000000);
    expect(result.find(r => r.key === 'rawTax')?.value).toBe(20100000);
    expect(result.find(r => r.key === 'p25Next')?.value).toBe(1425000);
  });
  it.each([
    ['PH/MT', (d: ReturnType<typeof regularEmployee>) => { d.profile.maritalTax = 'PH'; }],
    ['usaha', (d: ReturnType<typeof regularEmployee>) => { d.questions.hasBusiness = 'ya'; }],
    ['PPh 24', (d: ReturnType<typeof regularEmployee>) => { d.tables.withholding[0].values.taxType = 'PPh Pasal 24'; }],
    ['pembetulan', (d: ReturnType<typeof regularEmployee>) => { d.profile.sptStatus = 'Pembetulan'; d.profile.amendment = '1'; }],
  ])('holds annual calculations for %s outside the limited ruleset', (_name, change) => {
    const d = regularEmployee();
    change(d);
    expect(regularEmployeeEligibility(d).eligible).toBe(false);
    for (const key of ['pk', 'rawTax', 'tax', 'balance', 'p25Next']) expect(compute(d).find(r => r.key === key)?.value).toBeNull();
  });
  it('holds only the standalone Lampiran 4A calculation when H.13b is selected', () => {
    const d = regularEmployee();
    d.questions.hasCustomP25 = 'ya';
    expect(compute(d).find(r => r.key === 'pk')?.value).toBe(60000000);
    expect(compute(d).find(r => r.key === 'p25Next')).toMatchObject({ value: null, verification: 'pending', note: 'Lampiran 4 Bagian A belum termasuk ruleset ini.' });
  });
  it('holds the ruleset when the PPh 21 answer and its evidence disagree', () => {
    const d = regularEmployee();
    d.tables.withholding = [];
    expect(regularEmployeeEligibility(d)).toMatchObject({ eligible: false });
    expect(compute(d).find(r => r.key === 'pk')?.value).toBeNull();
  });
  it.each([[500000000,0],[650000000,750000]])('calculates final UMKM tax from annual gross %i', (gross, expected) => {
    expect(umkmFinalReference(gross)).toBe(expected);
  });
  it('calculates UMKM under the annual allowance and keeps it separate from annual income tax', () => {
    const d = umkm([332639973]);
    expect(umkmEligibility(d)).toMatchObject({ eligible: true, annualGross: 332639973 });
    expect(compute(d).find(r => r.key === 'umkmTax')).toMatchObject({ value: 0, verification: 'ruleset-2025' });
    for (const key of ['pk', 'rawTax', 'tax', 'balance', 'p25Next']) expect(compute(d).find(r => r.key === key)).toMatchObject({ value: null, verification: 'not-applicable' });
  });
  it('aggregates multiple TKU, reconciles UMKM payments, and flags a mismatch without hiding the formula', () => {
    const d = umkm([400000000]);
    d.tables.umkm.push(row({ m1: '250000000' }));
    d.extras.umkmPaid0 = '750000';
    expect(compute(d).find(r => r.key === 'umkmTax')).toMatchObject({ value: 750000, verification: 'ruleset-2025' });
    d.extras.umkmPaid0 = '500000';
    expect(compute(d).find(r => r.key === 'umkmTax')).toMatchObject({ value: 750000, verification: 'reconciliation-required' });
  });
  it.each([
    ['PH/MT', (d: ReturnType<typeof umkm>) => { d.profile.maritalTax = 'PH'; }],
    ['other income', (d: ReturnType<typeof umkm>) => { d.questions.hasOtherDomestic = 'ya'; }],
    ['PPh 25', (d: ReturnType<typeof umkm>) => { d.questions.hasP25 = 'ya'; }],
    ['gross above Rp4.8 billion', (d: ReturnType<typeof umkm>) => { d.tables.umkm[0].values.m1 = '4800000001'; }],
  ])('holds UMKM calculation for %s outside the limited ruleset', (_name, change) => {
    const d = umkm([100]);
    change(d);
    expect(umkmEligibility(d).eligible).toBe(false);
    expect(compute(d).find(r => r.key === 'umkmTax')?.value).toBeNull();
  });
  it.todo('official annual fixtures: foreign credit, overpayment, installments and amendment');
});

describe('Form continuation and XML', () => {
  it('maps identity text fields to the Induk profile boxes', () => {
    expect(boxSlots[3]).toMatchObject({ 0: 'profile.name', 1: 'profile.idNumber', 2: 'profile.phone', 3: 'profile.email', 4: 'profile.ptkp' });
  });
  it('maps every Inspector table and book to an official sheet', () => {
    const mappedTables = new Set(Object.values(tableBindings).flatMap(binding => [binding.section, ...(binding.regions ? ['amortization'] : [])]).filter(Boolean));
    expect(Object.keys(catalog.tables).every(key => mappedTables.has(key))).toBe(true);
    const mappedBooks = new Set(Object.values(tableBindings).flatMap(binding => binding.book ? [binding.book] : []));
    expect(Object.keys(catalog.BOOKS).every(key => mappedBooks.has(key))).toBe(true);
  });
  it('prints each active row exactly once beyond the capacity of every table', () => {
    const d=fresh();
    for(const [key,layout] of Object.entries(catalog.LAYOUTS)) {
      d.tables[key]=Array.from({length:layout.n*2+1},(_,i)=>row({description:'Baris '+i}));
      d.tables[key].push({...row({description:'Dilepas'}),disposed:true});
      const rows=Array.from({length:pageCount(d,catalog.tables[key].page)},(_,part)=>pageRows(d,key,part)).flat();
      expect(rows.map(r=>r.id)).toEqual(d.tables[key].filter(r=>!r.disposed).map(r=>r.id));
    }
  });
  it('splits WP06 amortization across the two page-14 form parts', async () => {
    const workbook = XLSX.readFile('public/tools/spt-op/examples/SPT_OP_WP06_Pengusaha_Pembukuan_2025.xlsx');
    const sheets = workbook.SheetNames.map(name => ({ name, rows: XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[name], { header: 1, defval: '' }) }));
    const result = importTemplateWorkbook(sheets, { mode: 'example' });
    const draft = result.draft!;

    expect(result.errors).toEqual([]);
    expect(pageCount(draft, 14)).toBe(2);
    expect(pageRows(draft, 'depreciation', 0)).toHaveLength(20);
    expect(pageRows(draft, 'amortization', 0)).toHaveLength(5);
    expect(pageRows(draft, 'depreciation', 0).map(item => item.values.AssetName).slice(0, 3)).toEqual(['Laptop operasional', 'Printer laser', 'Mesin kasir']);
    expect(pageRows(draft, 'amortization', 1).map(item => item.values.CodeOfAsset)).toEqual(['0608', '0699']);
  });
  it('has all 17 source pages with native portrait/landscape dimensions', () => {
    expect(catalog.PAGES).toHaveLength(17);
    expect(catalog.PAGES.filter(p=>p.w>p.h)).toHaveLength(3);
    expect(catalog.PAGES.every(p=>p.w*p.h===612*936)).toBe(true);
  });
  it('refuses every unverified XML format', () => {
    for(const adapter of adapters){expect(adapter.verified).toBe(false);expect(()=>previewXML(adapter.id)).toThrow(adapter.reason);}
    expect(()=>previewXML('unknown')).toThrow(/tidak dikenal/);
  });
  it.todo('official valid XML fixtures: L1A, L3C and L3D, all tags/codes/dates/escaping');
});
