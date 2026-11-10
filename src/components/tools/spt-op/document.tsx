import { catalog, profileFields, partnerFields, declarationFields, type Draft } from '@/modules/spt-op/model';
import { CoretaxPage } from './coretax-sheets';
export { pageCount } from '@/modules/spt-op/form-layout';

export function Document({ draft, page, part = 0, onField, onSet, onSection, print = false }: { draft: Draft; page: number; part?: number; onField?: (key: string, value: string) => void; onSet?: (group: 'profile' | 'questions' | 'extras' | 'partner' | 'declaration', key: string, value: string) => void; onSection?: (section: string) => void; print?: boolean }) {
  return <CoretaxPage draft={draft} page={page} part={part} print={print} onField={onField} onSet={onSet} onSection={onSection}/>;
}

const scalarLabels = [...profileFields, ...partnerFields, ...declarationFields, ...catalog.questionFields, ...catalog.extraFields];
const fieldLabel = (key: string) => scalarLabels.find(field => field.key === key)?.label || key;

function DetailRows({ values }: { values: Record<string, string> }) {
  const entries = Object.entries(values).filter(([, value]) => value);
  return entries.length ? <dl>{entries.map(([key, value]) => <div key={key}><dt>{fieldLabel(key)}</dt><dd>{value}</dd></div>)}</dl> : <p>Tidak ada data.</p>;
}

function PrintScalarDetails({ draft }: { draft: Draft }) {
  const headings = { profile: 'Identitas', questions: 'Jawaban Induk', extras: 'Penyesuaian', partner: 'Pasangan', declaration: 'Pernyataan', documentNotes: 'Referensi dokumen' };
  return <section className="spt-print-details"><h1>Rincian data kerja · SPT OP {draft.profile.year}</h1>{(['profile', 'questions', 'extras', 'partner', 'declaration', 'documentNotes'] as const).map(group => <section key={group}><h2>{headings[group]}</h2><DetailRows values={draft[group]}/></section>)}</section>;
}

function PrintTableDetails({ draft }: { draft: Draft }) {
  return <section className="spt-print-details"><h1>Rincian seluruh tabel</h1>{Object.entries({ ...draft.tables, ...draft.books }).map(([key, rows]) => <section key={key}><h2>{catalog.tables[key]?.title || catalog.BOOKS[key]?.title || key}</h2>{rows.length ? rows.map((row, index) => <article key={row.id}><h3>Baris {index + 1}{row.disposed ? ' · Dilepas' : ''}</h3><DetailRows values={row.values}/></article>) : <p>Tidak ada data.</p>}</section>)}</section>;
}

function PrintImportedSourceDetails({ draft }: { draft: Draft }) {
  const imports = Object.entries(draft.importTables || {});
  if (!imports.length) return null;
  return <section className="spt-print-details"><h1>Data sumber Excel</h1><p>Baris berikut disimpan sebagai sumber karena belum seluruhnya memiliki kotak SPT resmi.</p>{imports.map(([sheet, rows]) => <section key={sheet}><h2>{sheet}</h2>{rows.length ? rows.map((row, index) => <article key={row.id}><h3>Baris {index + 1}</h3><DetailRows values={row.values}/></article>) : <p>Tidak ada data.</p>}</section>)}</section>;
}

export function PrintDetails({ draft }: { draft: Draft }) {
  return <><PrintScalarDetails draft={draft}/><PrintTableDetails draft={draft}/><PrintImportedSourceDetails draft={draft}/></>;
}
