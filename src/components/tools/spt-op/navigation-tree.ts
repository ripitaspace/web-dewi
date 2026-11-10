import { catalog, declarationFields, partnerFields, profileFields, type Field } from '../../../modules/spt-op/model';

export type NavigationTarget = { section: string; page: number; focusId?: string };
export type NavigationNode = {
  id: string;
  label: string;
  description?: string;
  target?: NavigationTarget;
  children?: NavigationNode[];
  countKey?: string;
};

const leaf = (id: string, label: string, section: string, page: number, focusId?: string): NavigationNode => ({ id, label, target: { section, page, focusId } });
const fields = (prefix: string, list: Field[], section: string, page: number) => list.map((item, index) => leaf(`${prefix}-${item.key}`, `${index + 1}. ${item.label}`, section, page, item.key));
const table = (key: string): NavigationNode => ({
  id: `table-${key}`,
  label: catalog.tables[key].title,
  target: { section: key, page: catalog.tables[key].page },
  countKey: key,
  children: fields(`table-${key}`, catalog.tables[key].columns, key, catalog.tables[key].page),
});
const book = (key: string): NavigationNode => ({
  id: `book-${key}`,
  label: catalog.BOOKS[key].title,
  target: { section: key, page: catalog.BOOKS[key].page },
  children: fields(`book-${key}`, catalog.bokFields, key, catalog.BOOKS[key].page),
});

export const navigation = [
  ...catalog.NAV,
  ['01 · SPT', 'declaration', 'Pernyataan & lampiran tambahan', 4],
  ['06 · Data & XML', 'documentNotes', 'Referensi dokumen', 4],
  ['06 · Data & XML', 'imports', 'Data sumber Excel', 4],
] as [string, string, string, number][];

export const navigationTree: NavigationNode[] = [
  {
    id: 'induk', label: '01 · Induk SPT', description: 'Halaman 1–4', children: [
      leaf('instructions', 'Halaman 1–2 · Petunjuk & persyaratan', 'profile', 1),
      {
        id: 'induk-page-3', label: 'Halaman 3 · Identitas & perhitungan', target: { section: 'profile', page: 3 }, children: [
          { id: 'induk-a', label: 'A. Identitas Wajib Pajak', target: { section: 'profile', page: 3 }, children: fields('profile', profileFields, 'profile', 3) },
          { id: 'induk-b', label: 'B. Ikhtisar Penghasilan Neto', target: { section: 'questions', page: 3 }, children: fields('questions', catalog.questionFields, 'questions', 3) },
          { id: 'induk-c', label: 'C. Penghitungan PPh Terutang', target: { section: 'summary', page: 3 }, children: [
            leaf('summary-net', '1. Penghasilan neto setahun', 'summary', 3),
            leaf('summary-ded', '2. Pengurang penghasilan neto', 'summary', 3),
            leaf('summary-ptkp', '3. PTKP, PKP, dan PPh terutang', 'summary', 3),
          ] },
        ],
      },
      {
        id: 'induk-page-4', label: 'Halaman 4 · Pembetulan & transaksi', target: { section: 'summary', page: 4 }, children: [
          { id: 'induk-d', label: 'D. Kredit Pajak', target: { section: 'withholding', page: 4 }, children: [leaf('withholding-summary', 'Bukti potong / pungut', 'withholding', 7), leaf('foreign-credit', 'Kredit pajak luar negeri', 'foreign', 8)] },
          { id: 'induk-e', label: 'E. PPh Kurang / Lebih Bayar', target: { section: 'summary', page: 4 } },
          { id: 'induk-f', label: 'F. Pembetulan', target: { section: 'extras', page: 4 }, children: fields('extras', catalog.extraFields.filter(field => ['previousBalance', 'p25Paid', 'p25STP'].includes(field.key)), 'extras', 4) },
          { id: 'induk-g', label: 'G. Permohonan Pengembalian', target: { section: 'declaration', page: 4 }, children: [leaf('declaration-refund', 'Permohonan pengembalian', 'declaration', 4, 'refund')] },
          { id: 'induk-h', label: 'H. Angsuran PPh Pasal 25', target: { section: 'partner', page: 16 }, children: [leaf('p25-paid', 'PPh 25 dibayar', 'extras', 4, 'p25Paid'), leaf('p25-next', 'Angsuran tahun berikutnya', 'extras', 4, 'nextP25')] },
          { id: 'induk-i', label: 'I. Pernyataan Transaksi Lainnya', target: { section: 'questions', page: 4 } },
          { id: 'induk-j', label: 'J. Lampiran Tambahan', target: { section: 'declaration', page: 4 }, children: [leaf('declaration-additional', 'Daftar lampiran tambahan', 'declaration', 4, 'additional')] },
          { id: 'induk-k', label: 'K. Pernyataan', target: { section: 'declaration', page: 4 }, children: fields('declaration', declarationFields.filter(field => field.key !== 'refund' && field.key !== 'additional'), 'declaration', 4) },
        ],
      },
    ],
  },
  { id: 'lampiran-1', label: '02 · Lampiran 1', description: 'Harta, utang, keluarga, pekerjaan', children: [
    { id: 'l1-assets', label: 'Halaman 5 · Harta 1–4', children: ['cash', 'receivables', 'investments', 'movable'].map(table) },
    { id: 'l1-assets-debt', label: 'Halaman 6 · Harta 5–7 & utang', children: ['immovable', 'otherassets', 'debts'].map(table) },
    { id: 'l1-family-income', label: 'Halaman 7 · Keluarga, pekerjaan & bukti potong', children: ['family', 'jobs', 'withholding'].map(table) },
  ] },
  { id: 'lampiran-2', label: '03 · Lampiran 2', description: 'Final, nonobjek, luar negeri', children: [
    { id: 'l2-page-8', label: 'Halaman 8 · Penghasilan', children: ['finalincome', 'exempt', 'foreign'].map(table) },
  ] },
  { id: 'lampiran-3', label: '04 · Lampiran 3', description: 'Usaha, norma, peredaran bruto, biaya', children: [
    { id: 'l3-books', label: 'Halaman 9–11 · Rekonsiliasi usaha', children: ['dagangan', 'jasa', 'industri'].map(book) },
    { id: 'l3-norm', label: 'Halaman 12 · Norma & penghasilan lain', children: ['nppn', 'otherdomestic'].map(table) },
    { id: 'l3-gross', label: 'Halaman 13 · Peredaran bruto', children: ['umkm', 'opent', 'normmonths'].map(table) },
    { id: 'l3-depreciation', label: 'Halaman 14 · Penyusutan & amortisasi', children: ['depreciation', 'amortization'].map(table) },
    { id: 'l3-costs', label: 'Halaman 15 · Rincian biaya tertentu', children: ['entertainment', 'promotion', 'baddebt'].map(table) },
  ] },
  { id: 'lampiran-45', label: '05 · Lampiran 4/5', description: 'PPh 25, pasangan, pengurang', children: [
    { id: 'l4-page-16', label: 'Halaman 16 · PPh 25 & PH/MT', target: { section: 'partner', page: 16 }, children: fields('partner', partnerFields, 'partner', 16) },
    { id: 'l5-page-17', label: 'Halaman 17 · Pengurang', children: ['taxloss', 'deductions', 'taxrelief'].map(table) },
  ] },
  { id: 'data-xml', label: '06 · Data & XML', description: 'Pemeriksaan dan ekspor', children: [
    leaf('validation', 'Pemeriksaan data', 'validation', 3),
    leaf('xml', 'Ekspor XML Coretax', 'xml', 14),
    leaf('references', 'Referensi dokumen', 'documentNotes', 4, 'references'),
    leaf('imports', 'Data sumber Excel', 'imports', 4),
  ] },
];

export function descendantIds(nodes: NavigationNode[]): string[] {
  return nodes.flatMap(node => [node.id, ...descendantIds(node.children || [])]);
}
