// Bindings between the 17 generated Coretax F4 sheets and the draft model.
// Sheet / table / slot ordinals come from scripts/build-spt-sheets.cjs (run it with --slots to list them).
import { catalog, type Draft, type Row } from './model';
import { money, numeric, rowValue } from './engine';
import { tableDataRows, tableGroups } from './coretax-layout.generated';

export const firstPage = 1;
export const lastPage = 17;
/** Catalog page → generated sheet numbers. The 17 sheets follow the official PDF page for page. */
export const pageSheets: Record<number, number[]> = Object.fromEntries(Array.from({ length: 17 }, (_, i) => [i + 1, [i + 1]]));
/** Pages printed on F4 landscape (330 × 216 mm) in the official form: L3B, L3C and L5. */
export const landscapePages = [13, 14, 17];
export const pageNumbers = Object.keys(pageSheets).map(Number);

export interface TableBinding { section: string | null; cols: (string | null)[]; book?: string; regions?: string[][] }
const T = (section: string | null, cols: (string | null)[], extra: Partial<TableBinding> = {}): TableBinding => ({ section, cols, ...extra });
const months = Array.from({ length: 12 }, (_, i) => 'm' + (i + 1));
const depreciationCols = ['CodeOfAsset', 'GroupOfAsset', '@period', 'AcquisitionPrice', 'RemainingValue', 'CommercialMethode', 'FiscalMethode', 'FiscalDepretiationThisYear', 'Notes'];
export const tableBindings: Record<string, TableBinding> = {
  '5.0': T('cash', ['code', '@description', 'account', 'owner', 'bank', 'country', 'year', 'balance', 'pps']),
  '5.1': T('receivables', ['code', 'description', 'country', '@debtor', 'principal', 'year', 'balance', 'pps']),
  '5.2': T('investments', ['code', '@description', 'country', '@issuer', 'account', 'cost', 'year', 'current', 'pps']),
  '5.3': T('movable', ['code', '@movable', 'registration', '@ownership', 'year', 'cost', 'current', 'pps']),
  '6.0': T('immovable', ['code', 'description', 'address', '@area', 'source', 'certificate', 'year', 'cost', 'current', 'pps']),
  '6.1': T('otherassets', ['code', 'description', 'year', 'proof', 'notes', 'cost', 'current', 'pps']),
  '6.2': T(null, ['@assetsLabel', '@assetsCost', '@assets']),
  '6.3': T('debts', ['code', 'description', '@creditor', 'country', 'year', 'balance', 'notes']),
  '7.0': T('family', ['name', 'tin', 'birth', 'relation', 'occupation']),
  '7.1': T('jobs', ['#no', 'employer', 'employerTin', 'gross', 'expense', 'net']),
  '7.2': T('withholding', ['#no', '@payer', '@bupot', 'taxType', 'gross', 'withheld']),
  '8.0': T('finalincome', ['#no', '@payer', 'code', 'type', 'base', 'tax']),
  '8.1': T('exempt', ['#no', 'code', 'type', 'sourceTin', 'sourceName', 'gross']),
  '8.2': T('foreign', ['#no', 'source', 'country', 'date', 'type', 'net', 'taxForex', 'taxIDR', 'currency', 'credit']),
  '9.0': T(null, [], { book: 'dagangan' }), '9.1': T(null, [], { book: 'dagangan' }), '9.2': T(null, [], { book: 'dagangan' }),
  '10.0': T(null, [], { book: 'jasa' }), '10.1': T(null, [], { book: 'jasa' }), '10.2': T(null, [], { book: 'jasa' }),
  '11.0': T(null, [], { book: 'industri' }), '11.1': T(null, [], { book: 'industri' }), '11.2': T(null, [], { book: 'industri' }),
  '12.0': T('nppn', ['#no', 'tku', 'business', 'gross', 'norm', 'net']),
  '12.1': T('otherdomestic', ['#no', 'code', 'type', 'net']),
  '13.0': T(null, []),
  '13.1': T('umkm', ['#no', 'tku', ...months, '@months']),
  '13.2': T('opent', ['#no', 'tku', 'method', ...months, '@months']),
  '13.3': T('normmonths', ['#no', 'tku', 'business', ...months, '@months']),
  // Sheet 14 has one grid: heading groups h1–h5, h7, h8 take depreciation rows, h10–h14 amortization rows.
  '14.0': T('depreciation', depreciationCols, { regions: [['h1', 'h2', 'h3', 'h4', 'h5', 'h7', 'h8'], ['h10', 'h11', 'h12', 'h13', 'h14']] }),
  '15.0': T('entertainment', ['#no', 'Date', 'Location', 'Address', 'Type', 'Amount', 'Name', 'Position', 'CompanyName', 'BusinessType', 'Notes']),
  '15.1': T('promotion', ['#no', 'TINCode', 'NameOfRecipient', 'Address', 'DateOfPromotion', 'TypeOfCost', 'AmountOfPromotionCost', 'Notes', 'AmountOfWithholdingTax', 'WithholdingSlipNumber']),
  '15.2': T('baddebt', ['#no', 'TINCode', 'DebtorName', 'DebtorAddress', 'AmountOfDebt', 'AmountBadDebt', 'DeductionMethod', 'TypeOfFulfillment']),
  '17.0': T('taxloss', ['#no', 'year', 'loss', 'compensated']),
  '17.1': T('deductions', ['#no', 'code', 'type', 'amount']),
  '17.2': T('taxrelief', ['#no', 'code', 'type', 'amount']),
};

const regionCapacity = (region: string[], s: string) => region.reduce((sum, group) => sum + (tableGroups[s]?.[group] || 0), 0);
/** Rows per sheet part for each editable section, taken from the template's blank rows. */
export const sectionCapacity: Record<string, number> = Object.fromEntries(Object.entries(tableBindings).flatMap(([id, binding]) => binding.section ? [[binding.section, binding.regions ? regionCapacity(binding.regions[0], id) : tableDataRows[id]]] : []));
sectionCapacity.amortization = regionCapacity(tableBindings['14.0'].regions![1], '14.0');
export const capacityOf = (key: string) => sectionCapacity[key] || catalog.LAYOUTS[key]?.n || 1;
/** Index of a sheet cell's group within the flat row order of its table region. */
export function regionOrdinal(binding: TableBinding, id: string, group: string, k: number): { section: string; ordinal: number } | null {
  if (!binding.regions) return null;
  const regionIndex = binding.regions.findIndex(region => region.includes(group));
  if (regionIndex < 0) return null;
  const region = binding.regions[regionIndex];
  const before = region.slice(0, region.indexOf(group)).reduce((sum, name) => sum + (tableGroups[id]?.[name] || 0), 0);
  return { section: regionIndex === 0 ? binding.section! : 'amortization', ordinal: before + k };
}

// ---- Profile / question / result slots ------------------------------------------------------
type Read = (draft: Draft) => string;
const eq = (group: 'profile' | 'questions' | 'declaration', key: string, value: string) => (d: Draft) => d[group][key] === value;
const yes = (key: string) => [eq('questions', key, 'tidak'), eq('questions', key, 'ya')];
const noTick = () => false;
export const ticks: Record<number, ((draft: Draft) => boolean)[]> = {
  3: [noTick, noTick, eq('profile', 'sptStatus', 'Normal'), eq('profile', 'sptStatus', 'Pembetulan'),
    eq('profile', 'incomeSource', 'Pekerjaan'), eq('profile', 'incomeSource', 'Kegiatan Usaha'), eq('profile', 'incomeSource', 'Pekerjaan Bebas'),
    eq('profile', 'bookMethod', 'Pembukuan Stelsel Akrual'), eq('profile', 'bookMethod', 'Pembukuan Stelsel Kas'), eq('profile', 'bookMethod', 'Pencatatan'),
    eq('profile', 'idType', 'KTP'), eq('profile', 'idType', 'KITAS'), eq('profile', 'idType', 'PASPOR'),
    eq('profile', 'maritalTax', 'PH'), eq('profile', 'maritalTax', 'MT'),
    ...yes('hasJobs'), ...yes('hasBusiness'),
    d => d.questions.hasUMKM === 'tidak' && d.questions.hasOPPT === 'tidak', eq('questions', 'hasUMKM', 'ya'), eq('questions', 'hasOPPT', 'ya'),
    d => d.questions.hasNorm === 'PEMBUKUAN' || (d.questions.hasNorm === 'tidak' && d.profile.bookMethod !== 'Pencatatan'), d => d.questions.hasNorm === 'FINAL_TANPA_PEMBUKUAN' || (d.questions.hasNorm === 'tidak' && d.profile.bookMethod === 'Pencatatan'), d => ['NPPN', 'ya'].includes(d.questions.hasNorm),
    eq('questions', 'sector', 'dagangan'), eq('questions', 'sector', 'jasa'), eq('questions', 'sector', 'industri'),
    ...yes('hasOtherDomestic'), ...yes('hasForeign'), ...yes('hasDeductions'), ...yes('hasTaxRelief'), ...yes('hasWithholding'), ...yes('hasForeignRefund')],
  4: [...yes('hasDeferral'),
    d => /pemeriksaan/i.test(d.declaration.refund || ''), d => /pendahuluan/i.test(d.declaration.refund || ''),
    ...yes('hasP25'), ...yes('hasCustomP25'), ...yes('hasOPPTP25'), ...yes('hasDebt'), ...yes('hasFinal'), ...yes('hasExempt'), ...yes('hasDepreciation'), ...yes('hasSpecialCosts'), ...yes('hasForeignDividend'),
    ...yes('hasFinancialStatements'), ...yes('hasZakatProof'), ...yes('hasForeignCreditProof'), ...yes('hasPowerOfAttorney'), ...yes('hasOtherAttachments'), eq('declaration', 'confirmed', 'ya'), d => /wajib pajak/i.test(d.declaration.capacity || ''), d => /kuasa|wakil/i.test(d.declaration.capacity || '')],
};
/**
 * Direct-toggle actions for ticks that map 1:1 onto a stored answer. Ticks that are derived from several
 * answers or from free text (UMKM/OPPT "Tidak", refund, capacity) stay out and open the editor.
 * `clearable` answers (Ya/Tidak) go back to "" (belum dijawab) when the active tick is clicked again.
 */
export interface TickSet { group: 'profile' | 'questions' | 'declaration'; key: string; value: string; clearable: boolean }
const S = (group: TickSet['group'], key: string, value: string): TickSet => ({ group, key, value, clearable: group !== 'profile' });
const yesSets = (key: string): TickSet[] => [S('questions', key, 'tidak'), S('questions', key, 'ya')];
export const tickSets: Record<number, Record<number, TickSet>> = {
  3: Object.fromEntries([
    [2, S('profile', 'sptStatus', 'Normal')], [3, S('profile', 'sptStatus', 'Pembetulan')],
    [4, S('profile', 'incomeSource', 'Pekerjaan')], [5, S('profile', 'incomeSource', 'Kegiatan Usaha')], [6, S('profile', 'incomeSource', 'Pekerjaan Bebas')],
    [7, S('profile', 'bookMethod', 'Pembukuan Stelsel Akrual')], [8, S('profile', 'bookMethod', 'Pembukuan Stelsel Kas')], [9, S('profile', 'bookMethod', 'Pencatatan')],
    [10, S('profile', 'idType', 'KTP')], [11, S('profile', 'idType', 'KITAS')], [12, S('profile', 'idType', 'PASPOR')],
    [13, S('profile', 'maritalTax', 'PH')], [14, S('profile', 'maritalTax', 'MT')],
    ...[...yesSets('hasJobs'), ...yesSets('hasBusiness')].map((set, n) => [15 + n, set]),
    [20, S('questions', 'hasUMKM', 'ya')], [21, S('questions', 'hasOPPT', 'ya')], [22, S('questions', 'hasNorm', 'PEMBUKUAN')], [23, S('questions', 'hasNorm', 'FINAL_TANPA_PEMBUKUAN')], [24, S('questions', 'hasNorm', 'NPPN')],
    [25, S('questions', 'sector', 'dagangan')], [26, S('questions', 'sector', 'jasa')], [27, S('questions', 'sector', 'industri')],
    ...['hasOtherDomestic', 'hasForeign', 'hasDeductions', 'hasTaxRelief', 'hasWithholding', 'hasForeignRefund'].flatMap(yesSets).map((set, n) => [28 + n, set]),
  ]),
  4: Object.fromEntries([
    ...yesSets('hasDeferral').map((set, n) => [n, set]),
    [2, S('declaration', 'refund', 'Pemeriksaan')], [3, S('declaration', 'refund', 'Pendahuluan')],
    [33, S('declaration', 'capacity', 'Wajib Pajak')], [34, S('declaration', 'capacity', 'Kuasa')],
    ...['hasP25', 'hasCustomP25', 'hasOPPTP25', 'hasDebt', 'hasFinal', 'hasExempt', 'hasDepreciation', 'hasSpecialCosts', 'hasForeignDividend', 'hasFinancialStatements', 'hasZakatProof', 'hasForeignCreditProof', 'hasPowerOfAttorney', 'hasOtherAttachments'].flatMap(yesSets).map((set, n) => [4 + n, set]),
    [32, S('declaration', 'confirmed', 'ya')],
  ]),
};
/** Answer boxes show the 1-based option picked among the listed tick ordinals; unlisted boxes stay blank. */
export const answerTicks: Record<number, Record<number, number[]>> = {
  3: { 0: [15, 16], 5: [28, 29], 6: [30, 31], 7: [32, 33], 8: [34, 35], 9: [36, 37], 10: [38, 39] },
  4: { 0: [0, 1], 1: [4, 5], 2: [6, 7], 3: [8, 9], 4: [10, 11], 5: [12, 13], 6: [14, 15], 7: [16, 17], 8: [18, 19], 9: [20, 21] },
};
export const resultSlots: Record<number, (string | null)[]> = {
  3: ['business', 'net', 'afterDed', 'pt', 'pk', 'rawTax', 'tax', 'p25Paid', 'p25STP'],
  4: ['balance', 'payable', 'previousBalance', 'amended', '@assets', null],
  16: ['net', 'extras.compLoss', 'extras.otherDeduction', null, 'pt', 'pk', 'rawTax', 'relief', 'credit', 'balance', 'p25Next'],
};
export const boxSlots: Record<number, Record<number, string>> = {
  3: { 0: 'profile.ptkp' },
  4: { 3: 'declaration.signer' },
  // 0 = A.5 helper box; B rows 1-3 have WP/spouse boxes (1-6), rows 4-9 one merged box each (7, 8 = PTKP helper, 9-13).
  16: { 3: 'partner.wpNet', 4: 'partner.spouseNet', 5: 'partner.wpDed', 6: 'partner.spouseDed', 9: 'partner.combinedPtkp', 12: 'extras.phmtTax' },
};
export interface DigitBinding { read: Read; key?: string }
const profileDigits = (key: string): DigitBinding => ({ read: d => d.profile[key] || '', key });
const datePart = (index: number): DigitBinding => ({ read: d => (d.declaration.date || '').split('-')[index === 0 ? 2 : index === 1 ? 1 : 0] || '' });
export function digitBinding(sheet: number, i: number, count: number): DigitBinding {
  if (sheet === 3) return [profileDigits('year'), profileDigits('fromMonth'), profileDigits('toMonth'), profileDigits('tin'), profileDigits('spouseTin')][i];
  if (sheet === 4) return [profileDigits('tin'), datePart(0), datePart(1), datePart(2)][i];
  if (sheet === 16 && i === 3) return profileDigits('spouseTin');
  return count === 4 ? profileDigits('year') : profileDigits('tin');
}

// ---- Cell text ---------------------------------------------------------------------------
const combined: Record<string, string[]> = {
  '@debtor': ['debtorTin', 'debtor'], '@issuer': ['issuerTin', 'issuer'],
  '@movable': ['type', 'model'], '@ownership': ['ownership', 'ownerTin', 'ownerName'],
  '@area': ['landArea', 'buildingArea'], '@creditor': ['creditorTin', 'creditor'],
  '@payer': ['payerTin', 'payerName'], '@bupot': ['slipNo', 'slipDate'],
  '@period': ['MonthOfAcquisition', 'YearOfAcquisition'],
};
export function cellText(section: string, row: Row, field: string): string {
  if (field === '@description') {
    const code = row.values.code || '';
    const option = catalog.tables[section].columns.find(column => column.key === 'code')?.options.find(item => item.split('|')[0] === code);
    return row.values.description || option?.split('|')[1] || code;
  }
  if (field === '@months') return money(months.reduce((sum, key) => sum + numeric(row.values[key]), 0));
  if (combined[field]) return combined[field].map(part => row.values[part]).filter(Boolean).join(field === '@period' ? '/' : ' · ');
  const value = rowValue(section, row, field);
  const meta = catalog.tables[section].columns.find(item => item.key === field);
  if (field === 'GroupOfAsset') return meta?.options.find(item => item.split('|')[0] === value)?.split('|')[1] || value;
  const type = meta?.type;
  return ['money', 'computed'].includes(type || '') && value ? money(numeric(value)) : value;
}
export function cellParts(section: string, row: Row, field: string): string[] {
  const v = row.values;
  if (field === '@ownership') return [v.ownership === 'Taxpayer' ? 'x' : '', v.ownership === 'Other' ? 'x' : '', v.ownership === 'Other' ? v.ownerTin || '' : '', v.ownership === 'Other' ? v.ownerName || '' : ''];
  if (field === '@movable') return [v.type || '', '', v.model || ''];
  if (field === '@area') return [v.landArea || '', v.buildingArea || ''];
  if (field === '@payer') return [v.payerTin || '', v.payerName || ''];
  if (field === '@bupot') return [v.slipNo || '', v.slipDate || ''];
  if (field === '@creditor') return [v.creditorTin || '', v.creditor || ''];
  if (field === '@debtor') return [v.debtorTin || '', v.debtor || ''];
  if (field === '@issuer') return [v.issuerTin || '', v.issuer || ''];
  return [cellText(section, row, field)];
}
export const assetSections = ['cash', 'receivables', 'investments', 'movable', 'immovable', 'otherassets'];
export function assetTotal(draft: Draft, column: 'cost' | 'current') {
  return assetSections.reduce((sum, key) => sum + (draft.tables[key] || []).filter(row => !row.disposed).reduce((inner, row) => inner + numeric(row.values[column] || row.values.balance || row.values.principal), 0), 0);
}
const bookColumns = ['commercial', 'nonobject', 'final', 'nonfinal', 'positive', 'negative', 'fiscalCode', 'fiscal'];
export function bookCell(draft: Draft, sector: string, code: string | undefined, c: number, balance: boolean): string {
  const row = code ? draft.books[sector]?.find(item => item.values.code === code) : undefined;
  if (!row) return '';
  const key = balance ? 'commercial' : bookColumns[c - 2];
  if (!key) return '';
  const value = key === 'fiscal' ? rowValue('book', row, 'fiscal') : row.values[key] || '';
  return ['fiscalCode'].includes(key) || !value ? value : money(numeric(value));
}
export function sheetLabel(page: number) {
  const sheets = pageSheets[page] || [];
  return sheets.length > 1 ? `${sheets[0]}–${sheets[sheets.length - 1]}` : String(sheets[0] ?? page);
}

const tableTotal = (draft: Draft, key: string, column: string) => (draft.tables[key] || []).filter(row => !row.disposed).reduce((total, row) => total + numeric(rowValue(key, row, column)), 0);
const sumSpecs: Record<string, (draft: Draft) => number> = {
  '5.1|2': draft => tableTotal(draft, 'receivables', 'balance'),
  '5.2|3.6': draft => tableTotal(draft, 'investments', 'cost'),
  '5.2|3.8': draft => tableTotal(draft, 'investments', 'current'),
  '6.2|7': draft => assetTotal(draft, 'cost'),
  '8.2|C.6': draft => tableTotal(draft, 'foreign', 'net'),
  '8.2|C.8': draft => tableTotal(draft, 'foreign', 'taxIDR'),
  '8.2|C.10': draft => tableTotal(draft, 'foreign', 'credit'),
  '17.1|B.5': draft => tableTotal(draft, 'deductions', 'amount'),
  '17.1|B.6': draft => tableTotal(draft, 'taxloss', 'compensated'),
  '17.1|B.7': draft => tableTotal(draft, 'deductions', 'amount') + tableTotal(draft, 'taxloss', 'compensated'),
};
/** Total printed in a tagged total cell when the official form has more than one total per table. */
export function taggedSum(draft: Draft, id: string, tag?: string): number | null {
  const spec = tag ? sumSpecs[`${id}|${tag}`] : undefined;
  return spec ? spec(draft) : null;
}
