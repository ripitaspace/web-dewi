import Image from 'next/image';
import { catalog, type Draft } from '../../../modules/spt-op/model';
import { compute, money, numeric, rowValue } from '../../../modules/spt-op/engine';
import { activeRows, pageRows } from '../../../modules/spt-op/form-layout';

type Props = { draft: Draft; page: number; part: number; print?: boolean; onField?: (key: string, value: string) => void; onSection?: (section: string) => void };
const titles: Record<number, string> = { 3: 'INDUK SPT · IDENTITAS DAN IKHTISAR', 4: 'INDUK SPT · PERHITUNGAN DAN TRANSAKSI', 5: 'LAMPIRAN 1 · HARTA', 6: 'LAMPIRAN 1 · HARTA DAN UTANG', 7: 'LAMPIRAN 1 · KELUARGA, PEKERJAAN, BUKTI POTONG', 8: 'LAMPIRAN 2 · PPh FINAL', 13: 'LAMPIRAN 3B · PEREDARAN BRUTO' };
const groups: Record<number, string[]> = { 5: ['cash', 'receivables', 'investments', 'movable'], 6: ['immovable', 'otherassets', 'debts'], 7: ['family', 'jobs', 'withholding'], 8: ['finalincome'], 13: ['umkm'] };
export const htmlPageNumbers = Object.keys(titles).map(Number);

function Table({ draft, section, part, print, onSection }: { draft: Draft; section: string; part: number; print?: boolean; onSection?: (section: string) => void }) {
  const table = catalog.tables[section], layout = catalog.LAYOUTS[section], all = activeRows(draft, section), rows = layout ? pageRows(draft, section, part) : all;
  const capacity = layout?.n || 4, start = all.length ? part * capacity + 1 : 0, end = Math.min(start + rows.length - 1, all.length);
  return <section className="spt-html-table"><header><strong>{table.title}</strong>{!print && <button onClick={() => onSection?.(section)}>Edit tabel</button>}</header><table><thead><tr><th>No</th>{table.columns.map(column => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id}><td>{start + index}</td>{table.columns.map(column => <td key={column.key}>{rowValue(section, row, column.key)}</td>)}</tr>)}{Array.from({ length: Math.max(0, capacity - rows.length) }, (_, index) => <tr key={index} className="spt-html-blank"><td>{start + index || ''}</td>{table.columns.map(column => <td key={column.key} />)}</tr>)}</tbody></table>{table.sum && <p className="spt-html-total">Jumlah: {money(all.reduce((sum, row) => sum + numeric(rowValue(section, row, table.sum!)), 0))}</p>}<footer>Data ke- {part + 1} · Rows {start || 0}–{end || 0} of {all.length}</footer></section>;
}

export function HtmlForm({ draft, page, part, print, onField, onSection }: Props) {
  if (!titles[page]) return null;
  const results = compute(draft);
  const field = (label: string, key: string) => <label className="spt-html-field" key={key}><span>{label}</span>{print ? <b>{draft.profile[key] || '—'}</b> : <input value={draft.profile[key] || ''} onChange={event => onField?.(key, event.target.value)} />}</label>;
  return <article className="spt-html-sheet" data-ripita-page-content><header className="spt-html-header"><Image src="/images/branding/kemenkeu-seal.webp" alt="Kementerian Keuangan" width={48} height={48}/><div><strong>SPT TAHUNAN PAJAK PENGHASILAN (PPh)</strong><span>WAJIB PAJAK ORANG PRIBADI</span></div><b>{titles[page]}</b></header>{page === 3 && <><h2>A. IDENTITAS WAJIB PAJAK</h2><div className="spt-html-fields">{field('Tahun pajak', 'year')}{field('NIK/NPWP', 'tin')}{field('Nama', 'name')}{field('Nomor ID', 'idNumber')}{field('Telepon', 'phone')}{field('Email', 'email')}{field('Status PTKP', 'ptkp')}{field('NIK/NPWP pasangan', 'spouseTin')}</div><h2>B. IKHTISAR PENGHASILAN NETO</h2><p className="spt-html-note">Jawaban pertanyaan dan pilihan lengkap tersedia pada editor data.</p></>}{page === 4 && <><h2>C–K. PERHITUNGAN DAN PERNYATAAN</h2><div className="spt-html-summary">{['net', 'tax', 'credit', 'balance'].map(key => { const item = results.find(result => result.key === key); return <div key={key}><span>{item?.label}</span><b>{money(item?.value ?? null)}</b></div>; })}</div><p className="spt-html-note">Bagian D–K mengikuti data pada editor dan lampiran terkait.</p></>}{groups[page]?.map(section => <Table key={section} draft={draft} section={section} part={part} print={print} onSection={onSection}/>)}</article>;
}
