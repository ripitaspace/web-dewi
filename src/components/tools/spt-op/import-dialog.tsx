'use client';
import { useMemo, useState } from 'react';
import { catalog, type Row } from '@/modules/spt-op/model';
import { previewImport, type Worksheet } from '@/modules/spt-op/import-export';
import { Dialog } from './dialog';
export function ImportDialog({ sheets, initial, tables, onImport, onClose }: {
    sheets: Worksheet[];
    initial: string;
    tables: Record<string, Row[]>;
    onImport: (k: string, rows: Row[]) => void;
    onClose: () => void;
}) { const [sheet, setSheet] = useState(0), [key, setKey] = useState(catalog.tables[initial] ? initial : 'cash'), [header, setHeader] = useState(0), [map, setMap] = useState<Record<string, string>>({}), [selection, setSelection] = useState<Record<number, boolean>>({}); const preview = useMemo(() => { try {
    return { candidates: previewImport(sheets[sheet], header, key, map, tables[key] || []), error: '' };
}
catch (e) {
    return { candidates: [], error: (e as Error).message };
} }, [sheets, sheet, header, key, map, tables]); const candidates = preview.candidates; const reset = () => { setMap({}); setSelection({}); }; const selected = candidates.filter(c => !c.errors.length && (selection[c.line] ?? !c.duplicate)); return <Dialog title="Impor · Pemetaan dan pemeriksaan" onClose={onClose}><div className="spt-formgrid"><label>Worksheet<select value={sheet} onChange={e => { setSheet(Number(e.target.value)); setHeader(0); reset(); }}>{sheets.map((s, i) => <option key={i} value={i}>{s.name}</option>)}</select></label><label>Tabel tujuan<select value={key} onChange={e => { setKey(e.target.value); reset(); }}>{Object.entries(catalog.tables).map(([k, t]) => <option key={k} value={k}>{t.title}</option>)}</select></label><label>Baris header<input type="number" min={1} max={sheets[sheet].rows.length} value={header + 1} onChange={e => { setHeader(Math.max(0, Math.min(sheets[sheet].rows.length - 1, Number(e.target.value) - 1))); reset(); }}/></label></div><div className="spt-formgrid">{catalog.tables[key].columns.filter(f => f.type !== 'computed').map(f => <label key={f.key}>{f.label}{f.required ? ' *' : ''}<select value={map[f.key] || ''} onChange={e => { setMap({ ...map, [f.key]: e.target.value }); setSelection({}); }}><option value="">Jangan impor</option>{(sheets[sheet].rows[header] || []).map((h, i) => <option key={i} value={i}>{i + 1} · {h}</option>)}</select></label>)}</div>{preview.error && <p className="spt-warning">{preview.error}</p>}<p>Baris gagal tetap terlihat. Perbaiki sumber/pemetaan lalu impor ulang. Kandidat duplikat tidak dipilih otomatis.</p><div className="spt-import-preview">{candidates.map(c => <div className="spt-record" key={c.line}><label><input type="checkbox" disabled={!!c.errors.length} checked={!c.errors.length && (selection[c.line] ?? !c.duplicate)} onChange={e => setSelection({ ...selection, [c.line]: e.target.checked })}/> Baris {c.line}{c.duplicate ? ' · kandidat duplikat' : ''}</label><div>{Object.entries(c.row.values).map(([k, v]) => <small key={k}>{catalog.tables[key].columns.find(f => f.key === k)?.label || k}: {v} · </small>)}</div><p className="spt-error">{c.errors.join('; ')}</p></div>)}</div><button className="primary" disabled={!selected.length} onClick={() => onImport(key, selected.map(c => c.row))}>Impor {selected.length} baris terpilih</button></Dialog>; }
