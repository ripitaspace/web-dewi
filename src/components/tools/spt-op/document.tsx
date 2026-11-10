import { catalog, profileFields, partnerFields, declarationFields, type Draft } from '@/modules/spt-op/model';
import { CoretaxPage } from './coretax-sheets';
export { pageCount } from '@/modules/spt-op/form-layout';

export function Document({ draft, page, part = 0, onField, onSet, onSection, print = false }: { draft: Draft; page: number; part?: number; onField?: (key: string, value: string) => void; onSet?: (group: 'profile' | 'questions' | 'extras' | 'partner' | 'declaration', key: string, value: string) => void; onSection?: (section: string) => void; print?: boolean }) {
  return <CoretaxPage draft={draft} page={page} part={part} print={print} onField={onField} onSet={onSet} onSection={onSection}/>;
}

function PrintScalarDetails({ draft }: { draft: Draft }) { return <section className="spt-print-details"><h1>Rincian data kerja · SPT OP {draft.profile.year}</h1>{(['profile', 'questions', 'extras', 'partner', 'declaration', 'documentNotes'] as const).map(group => <section key={group}><h2>{{ profile: 'Identitas', questions: 'Jawaban Induk', extras: 'Penyesuaian', partner: 'Pasangan', declaration: 'Pernyataan', documentNotes: 'Referensi dokumen' }[group]}</h2><dl>{Object.entries(draft[group]).filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{[...profileFields, ...partnerFields, ...declarationFields, ...catalog.questionFields, ...catalog.extraFields].find(field => field.key === key)?.label || key}</dt><dd>{value}</dd></div>)}</dl></section>)}</section>; }

export function PrintDetails({ draft }: { draft: Draft }) {
  return <><PrintScalarDetails draft={draft}/><section className="spt-print-details"><h1>Rincian seluruh tabel</h1>{Object.entries({ ...draft.tables, ...draft.books }).map(([key, rows]) => <section key={key}><h2>{catalog.tables[key]?.title || catalog.BOOKS[key]?.title || key}</h2>{rows.map((row, index) => <article key={row.id}><h3>Baris {index + 1}{row.disposed ? ' · Dilepas' : ''}</h3><dl>{Object.entries(row.values).map(([field, value]) => <div key={field}><dt>{catalog.tables[key]?.columns.find(column => column.key === field)?.label || catalog.bokFields.find(column => column.key === field)?.label || field}</dt><dd>{value}</dd></div>)}</dl></article>)}</section>)}</section></>;
}
