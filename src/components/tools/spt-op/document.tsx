/* eslint-disable @next/next/no-img-element */
import { catalog, profileFields, partnerFields, declarationFields, type Draft, type Row } from '@/modules/spt-op/model';
import { compute, money, numeric, rowValue } from '@/modules/spt-op/engine';
import { identityFields, resultFields, pageRows } from '@/modules/spt-op/form-layout';
import { SourceSheet } from './source-template';
export { pageCount } from '@/modules/spt-op/form-layout';

export function Document(props: Parameters<typeof LegacyDocument>[0]) {
  const source: Record<number, number> = {5:3,6:4,7:5,8:6,13:7};
  const sheet = source[props.page];
  if (sheet === undefined) return <LegacyDocument {...props}/>;
  return <>{(props.part || 0) === 0 && <SourceSheet draft={props.draft} sheet={sheet} print={props.print} onField={props.onField}/>}<LegacyDocument {...props}/></>;
}

function text(key: string, row: Row, field: string) {
  const combined: Record<string, string[]> = {
    '@movable': ['type', 'model'], '@ownership': ['ownership', 'ownerTin', 'ownerName'],
    '@area': ['landArea', 'buildingArea'], '@creditor': ['creditorTin', 'creditor'],
    '@payer': ['payerTin', 'payerName'], '@bupot': ['slipNo', 'slipDate'],
    '@period': ['MonthOfAcquisition', 'YearOfAcquisition'], '@promo': ['DateOfPromotion', 'TypeOfCost'],
  };
  if (field === '@description') return row.values.description || row.values.code || '';
  if (combined[field]) return combined[field].map(part => row.values[part]).filter(Boolean).join(' · ');
  const value = rowValue(key, row, field);
  const type = catalog.tables[key].columns.find(column => column.key === field)?.type;
  return ['money', 'computed'].includes(type || '') && value ? money(numeric(value)) : value;
}
function LegacyDocument({ draft, page, part = 0, onField, onSection, print = false }: { draft: Draft; page: number; part?: number; onField?: (key: string, value: string) => void; onSection?: (section: string) => void; print?: boolean }) {
  // Preserve all eight source sheets. Mixed legacy pages remain available below.
  if (page === 3) return <SourceSheet draft={draft} sheet={0} print={print} onField={onField}/>;
  if (page === 4) return <><SourceSheet draft={draft} sheet={1} print={print} onField={onField}/><SourceSheet draft={draft} sheet={2} print={print} onField={onField}/></>;
  const sheet = catalog.PAGES[page - 1], results = compute(draft);
  const rect = (x: number, y: number, width: number, height = 12) => ({ left: `${100 * x / sheet.w}%`, top: `${100 * y / sheet.h}%`, width: `${100 * width / sheet.w}%`, height: `${100 * height / sheet.h}%`, fontSize: '1.05cqw' });
  return <div className={`spt-sheet ${sheet.w > sheet.h ? 'spt-landscape' : ''}`} style={{ aspectRatio: `${sheet.w}/${sheet.h}`, containerType: 'inline-size' }}><img src={sheet.src} alt={`Formulir halaman ${page} · ${catalog.PAGE_NAMES[page - 1]}`} draggable={false}/><span className="spt-sheet-caption">DRAFT KERJA · {page}/17{part ? ` · Lanjutan ${part}` : ''}</span>{(identityFields[page] || []).map(([key, x, y, width]) => print ? <span className="spt-cell" key={key} style={rect(x, y, width)}>{draft.profile[key]}</span> : <input aria-label={`Formulir ${key}`} className="spt-overlay" key={key} style={rect(x, y, width)} value={draft.profile[key] || ''} onChange={event => onField?.(key, event.target.value)}/>)}{(resultFields[page] || []).map(([key, y]) => { const result = results.find(item => item.key === key); return <button className="spt-cell spt-result" style={rect(485, y, 89)} key={key} onClick={() => onSection?.('summary')} title={result?.note}>{money(result?.value ?? null)}</button>; })}{Object.entries(catalog.LAYOUTS).filter(([key]) => catalog.tables[key].page === page).flatMap(([key, layout]) => pageRows(draft, key, part).flatMap((row, index) => layout.cols.map(([field, x, width]) => <span className="spt-cell" key={`${key}-${row.id}-${field}`} style={rect(x, layout.y + index * layout.dy + 1, width, Math.min(layout.dy - 2, 14))}>{text(key, row, field)}</span>)))}</div>;
}
function PrintScalarDetails({ draft }: { draft: Draft }) { return <section className="spt-print-details"><h1>Rincian data kerja · SPT OP {draft.profile.year}</h1>{(['profile', 'questions', 'extras', 'partner', 'declaration', 'documentNotes'] as const).map(group => <section key={group}><h2>{{ profile: 'Identitas', questions: 'Jawaban Induk', extras: 'Penyesuaian', partner: 'Pasangan', declaration: 'Pernyataan', documentNotes: 'Referensi dokumen' }[group]}</h2><dl>{Object.entries(draft[group]).filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{[...profileFields, ...partnerFields, ...declarationFields, ...catalog.questionFields, ...catalog.extraFields].find(field => field.key === key)?.label || key}</dt><dd>{value}</dd></div>)}</dl></section>)}</section>; }

export function PrintDetails({ draft }: { draft: Draft }) {
  return <><PrintScalarDetails draft={draft}/><section className="spt-print-details"><h1>Rincian seluruh tabel</h1>{Object.entries({ ...draft.tables, ...draft.books }).map(([key, rows]) => <section key={key}><h2>{catalog.tables[key]?.title || catalog.BOOKS[key]?.title || key}</h2>{rows.map((row, index) => <article key={row.id}><h3>Baris {index + 1}{row.disposed ? ' · Dilepas' : ''}</h3><dl>{Object.entries(row.values).map(([field, value]) => <div key={field}><dt>{catalog.tables[key]?.columns.find(column => column.key === field)?.label || catalog.bokFields.find(column => column.key === field)?.label || field}</dt><dd>{value}</dd></div>)}</dl></article>)}</section>)}</section></>;
}
