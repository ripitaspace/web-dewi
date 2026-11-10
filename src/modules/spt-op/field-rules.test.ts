import { describe, expect, it } from 'vitest';
import { canonicalNumber, displayNumber, ambiguousDecimal } from './number-input';
import { choiceOf, digitsOnly, isIdentityKey, numberKind, rangeIssue } from './field-rules';
import { catalog, declarationFields, profileFields, row } from './model';
import { errors, numeric } from './engine';

describe('canonicalNumber', () => {
  it('menormalkan format id-ID dan paste', () => {
    expect(canonicalNumber('1.500.000', 'currency')).toBe('1500000');
    expect(canonicalNumber('Rp 1.500.000,50', 'currency')).toBe('1500000.5');
    expect(canonicalNumber('1500000.5', 'currency')).toBe('1500000.5');
    expect(canonicalNumber('-2.000', 'currency')).toBe('-2000');
    expect(canonicalNumber('12,5', 'percent')).toBe('12.5');
  });
  it('membedakan kosong dan nol', () => {
    expect(canonicalNumber('', 'currency')).toBe('');
    expect(canonicalNumber('   ', 'currency')).toBe('');
    expect(canonicalNumber('0', 'currency')).toBe('0');
    expect(canonicalNumber('-0', 'currency')).toBe('0');
  });
  it('mempertahankan teks tidak valid agar tervalidasi', () => {
    expect(canonicalNumber('1-2', 'currency')).toBe('1-2');
    expect(Number.isFinite(numeric(canonicalNumber('1-2', 'currency')))).toBe(false);
  });
  it('tahun/bulan hanya digit', () => {
    expect(canonicalNumber('20a25', 'year')).toBe('2025');
    expect(canonicalNumber('1 2', 'month')).toBe('12');
  });
  it('nilai kanonik selalu terbaca sama oleh numeric()', () => {
    for (const raw of ['0', '1', '1500', '1500000.5', '-2000', '0.25', '1234567.89']) expect(numeric(canonicalNumber(raw, 'currency'))).toBe(Number(raw));
  });
  it('format tampilan id-ID dan peringatan titik ribuan', () => {
    expect(displayNumber('1500000.5', 'currency')).toBe('1.500.000,5');
    expect(displayNumber('2025', 'year')).toBe('2025');
    expect(ambiguousDecimal('1.500', 'decimal')).toBe(true);
    expect(ambiguousDecimal('1.500', 'currency')).toBe(false);
  });
});

describe('aturan field', () => {
  it('mengenali field identitas dan jenis angka', () => {
    for (const key of ['tin', 'spouseTin', 'debtorTin', 'ownerTin', 'employerTin', 'TINCode']) expect(isIdentityKey(key)).toBe(true);
    for (const key of ['name', 'idNumber', 'tku']) expect(isIdentityKey(key)).toBe(false);
    expect(numberKind({ key: 'fromMonth', type: 'number' })).toBe('month');
    expect(numberKind({ key: 'norm', type: 'number' })).toBe('percent');
    expect(numberKind({ key: 'balance', type: 'money' })).toBe('currency');
    expect(numberKind({ key: 'name', type: 'text' })).toBeNull();
  });
  it('nol di depan identitas tidak hilang', () => {
    expect(digitsOnly('0123 4567-89', 16)).toBe('0123456789');
  });
  it('rentang bulan dan persen diperiksa pada baris', () => {
    const cols = catalog.tables.depreciation.columns;
    const base = { CodeOfAsset: 'x', GroupOfAsset: 'Group 1', YearOfAcquisition: '2024', AcquisitionPrice: '1', RemainingValue: '1', CommercialMethode: 'GL', FiscalMethode: 'GL', FiscalDepretiationThisYear: '1' };
    expect(errors(cols, row({ ...base, MonthOfAcquisition: '13' }))).toContain('Bulan perolehan: bulan 1–12');
    expect(errors(cols, row({ ...base, MonthOfAcquisition: '12' }))).toEqual([]);
    expect(rangeIssue({ key: 'norm', type: 'number' }, '120')).toBe('persentase 0–100');
    expect(rangeIssue({ key: 'debtorTin', type: 'text' }, '12-3')).toMatch(/hanya angka/);
    expect(rangeIssue({ key: 'debtorTin', type: 'text' }, '123456789012345')).toMatch(/16 digit/);
  });
});

describe('batas panjang setelah penyaringan', () => {
  it('tahun 4 digit, bulan 2 digit, tempelan berseparator tetap utuh', () => {
    expect(canonicalNumber('20 25 99', 'year')).toBe('2025');
    expect(canonicalNumber('123', 'month')).toBe('12');
    expect(digitsOnly('0123 4567 8901 2345 99', 16)).toBe('0123456789012345');
  });
});

describe('choiceOf', () => {
  const find = (list: { key: string }[], key: string) => list.find(item => item.key === key) as Parameters<typeof choiceOf>[0];
  it('Ya/Tidak = segmented yang bisa dikosongkan', () => {
    const choice = choiceOf(find(catalog.questionFields, 'hasJobs'))!;
    expect(choice.mode).toBe('segmented'); expect(choice.clearable).toBe(true);
    expect(choice.options).toEqual([{ value: 'ya', label: 'Ya' }, { value: 'tidak', label: 'Tidak' }]);
  });
  it('enum eksklusif = radio; wajib tidak bisa dikosongkan', () => {
    const status = choiceOf(find(profileFields, 'sptStatus'))!;
    expect(status.options.map(o => o.value)).toEqual(['Normal', 'Pembetulan']); expect(status.clearable).toBe(false);
    expect(choiceOf(find(profileFields, 'bookMethod'))!.mode).toBe('radio');
  });
  it('PPS memakai "Tidak terkait" sebagai pilihan nyata', () => {
    const pps = choiceOf(catalog.tables.cash.columns.find(c => c.key === 'pps')!)!;
    expect(pps.options.map(o => o.value)).toEqual(['', '01', '02']); expect(pps.clearable).toBe(false);
  });
  it('sector tanpa opsi kosong, bisa dikosongkan', () => {
    const sector = choiceOf(find(catalog.questionFields, 'sector'))!;
    expect(sector.options.map(o => o.value)).toEqual(['dagangan', 'jasa', 'industri']); expect(sector.clearable).toBe(true);
  });
  it('select berkode banyak tetap select', () => {
    expect(choiceOf(find(profileFields, 'ptkp'))).toBeNull();
    expect(choiceOf(catalog.tables.family.columns.find(c => c.key === 'relation')!)).toBeNull();
  });
  it('G dan K kini pilihan, cocok dengan regex centang lama', () => {
    expect(choiceOf(find(declarationFields, 'refund'))!.options.map(o => o.value)).toEqual(['Pemeriksaan', 'Pendahuluan']);
    expect(choiceOf(find(declarationFields, 'capacity'))!.options.map(o => o.value)).toEqual(['Wajib Pajak', 'Kuasa']);
  });
});

import { isHidden, isRequired, monthColumn } from './field-rules';
describe('kolom bersyarat dan bulan', () => {
  const cols = catalog.tables.movable.columns;
  const base = { code: '0402', type: 'x', model: 'y', registration: 'z', year: '2020', cost: '1', current: '1' };
  it('data pemilik hanya wajib bila atas nama pihak lain', () => {
    expect(errors(cols, row({ ...base, ownership: 'Taxpayer' }))).toEqual([]);
    const other = errors(cols, row({ ...base, ownership: 'Other' }));
    expect(other).toContain('NPWP pemilik: wajib diisi'); expect(other).toContain('Nama pemilik: wajib diisi');
    expect(errors(cols, row({ ...base, ownership: 'Other', ownerTin: '0123456789012345', ownerName: 'A' }))).toEqual([]);
    const tin = cols.find(c => c.key === 'ownerTin')!;
    expect(isHidden(tin, { ownership: 'Taxpayer' })).toBe(true); expect(isRequired(tin, { ownership: 'Other' })).toBe(true);
  });
  it('mengenali m1..m12 saja', () => {
    expect(['m1', 'm9', 'm12'].every(k => monthColumn.test(k))).toBe(true);
    expect(['m0', 'm13', 'mm1', 'method'].some(k => monthColumn.test(k))).toBe(false);
  });
});
