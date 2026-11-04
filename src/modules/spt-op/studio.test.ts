import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { backup, catalog, draftKey, fresh, readBackup, reducer, row } from './model';
import { compute, errors, numeric, sectionStatus, validate } from './engine';
import { copyAssets, csv, excelDate, parseCSV, previewImport, readWorkbook } from './import-export';
import { pageCount, pageRows } from './form-layout';
import { assertCanSave, saveDraft } from './storage';
import { adapters, previewXML } from './xml';
import { progressiveReference, rules2025 } from './rules-2025';

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
    for(const key of ['pt','pk','rawTax','tax','balance','amended','p25Next','umkmTax','phmt']) expect(compute(d).find(r=>r.key===key)?.value).toBeNull();
    expect(rules2025.annualReturnVerified).toBe(false);
  });
  // These expected values come from the four published DJP illustrations, not the prototype.
  it.each([[54000000,0],[60000000,300000],[120000000,3900000],[180000000,12900000]])('matches DJP TK/0 reference net %i', (net,tax) => {
    expect(progressiveReference(Math.max(0,net-54000000))).toBe(tax);
  });
  it('rejects invalid PKP in the isolated tariff function', () => expect(()=>progressiveReference(NaN)).toThrow());
  it.todo('official annual fixtures: multiple employers and deductions');
  it.todo('official annual fixtures: PH/MT, books, NPPN and UMKM eligibility');
  it.todo('official annual fixtures: foreign credit, overpayment, installments and amendment');
});

describe('Form continuation and XML', () => {
  it('prints each active row exactly once beyond the capacity of every table', () => {
    const d=fresh();
    for(const [key,layout] of Object.entries(catalog.LAYOUTS)) {
      d.tables[key]=Array.from({length:layout.n*2+1},(_,i)=>row({description:'Baris '+i}));
      d.tables[key].push({...row({description:'Dilepas'}),disposed:true});
      const rows=Array.from({length:pageCount(d,catalog.tables[key].page)},(_,part)=>pageRows(d,key,part)).flat();
      expect(rows.map(r=>r.id)).toEqual(d.tables[key].filter(r=>!r.disposed).map(r=>r.id));
    }
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
