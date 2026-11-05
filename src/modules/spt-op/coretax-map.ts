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
const eq = (group: 'profile' | 'questions', key: string, value: string) => (d: Draft) => d[group][key] === value;
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
    d => d.questions.hasNorm === 'tidak' && d.profile.bookMethod !== 'Pencatatan', d => d.questions.hasNorm === 'tidak' && d.profile.bookMethod === 'Pencatatan', eq('questions', 'hasNorm', 'ya'),
    eq('questions', 'sector', 'dagangan'), eq('questions', 'sector', 'jasa'), eq('questions', 'sector', 'industri'),
    ...yes('hasOtherDomestic'), ...yes('hasForeign'), ...yes('hasDeductions'), ...yes('hasTaxRelief'), ...yes('hasWithholding'), ...yes('hasForeignRefund')],
  4: [...yes('hasDeferral'),
    d => /pemeriksaan/i.test(d.declaration.refund || ''), d => /pendahuluan/i.test(d.declaration.refund || ''),
    ...yes('hasP25'), ...yes('hasCustomP25'), ...yes('hasOPPTP25'), ...yes('hasDebt'), ...yes('hasFinal'), ...yes('hasExempt'), ...yes('hasDepreciation'), ...yes('hasSpecialCosts'), ...yes('hasForeignDividend'),
    ...Array.from({ length: 11 }, () => noTick), d => /wajib pajak/i.test(d.declaration.capacity || ''), d => /kuasa|wakil/i.test(d.declaration.capacity || '')],
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
  16: { 2: 'partner.wpNet', 3: 'partner.spouseNet', 4: 'partner.wpDed', 5: 'partner.spouseDed', 8: 'partner.combinedPtkp', 14: 'extras.phmtTax' },
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
  if (field === '@ownership') return [v.ownership === 'Taxpayer' ? 'x' : '', v.ownership === 'Other' ? 'x' : '', v.ownerTin || '', v.ownerName || ''];
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
