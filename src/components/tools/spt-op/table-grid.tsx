'use client';
import { useEffect, useRef, useState } from 'react';
import { row as newRow, type Field, type Row } from '@/modules/spt-op/model';
import { fieldError, money, numeric, rowValue } from '@/modules/spt-op/engine';
import { choiceOf, isHidden, isIdentityKey, numberKind } from '@/modules/spt-op/field-rules';
import { TaxIdentityField, TaxNumberField } from './inputs';

/**
 * Tabel isian inline untuk satu lampiran: satu baris = satu Row di draft yang sama dengan dialog baris.
 * Perubahan langsung tersimpan (autosave); sel yang belum valid ditandai tetapi tidak memblokir, sama seperti tab Pemeriksaan.
 * Enter = sel yang sama di baris berikutnya (baris baru bila sudah di baris terakhir); Tab = sel berikutnya.
 */
export function TableGrid({ section, columns, rows, assets, sumKey, sumLabel, onRows }: {
  section: string; columns: Field[]; rows: Row[]; assets: boolean; sumKey?: string | null; sumLabel?: string; onRows: (rows: Row[]) => void;
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const pendingFocus = useRef<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const setFocus = (target: { id: string; key: string }) => { pendingFocus.current = `grid-${target.id}-${target.key}`; };
  const firstKey = columns.find(c => c.type !== 'computed')?.key || columns[0]?.key;
  const cell = (rowId: string, key: string) => `${rowId}:${key}`;
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [rows]);
  const set = (id: string, key: string, value: string) => onRows(rows.map(item => item.id === id ? { ...item, values: { ...item.values, [key]: value } } : item));
  const touch = (id: string, key: string) => setTouched(previous => previous[cell(id, key)] ? previous : { ...previous, [cell(id, key)]: true });
  const add = (after?: string) => {
    const created = newRow({});
    const at = after ? rows.findIndex(item => item.id === after) + 1 : rows.length;
    onRows([...rows.slice(0, at), created, ...rows.slice(at)]);
    setFocus({ id: created.id, key: firstKey });
  };
  const enter = (id: string, key: string) => {
    const index = rows.findIndex(item => item.id === id);
    if (index === rows.length - 1) { const created = newRow({}); onRows([...rows, created]); setFocus({ id: created.id, key }); }
    else setFocus({ id: rows[index + 1].id, key });
  };
  const sum = sumKey ? rows.filter(item => !item.disposed).reduce((total, item) => total + (Number.isFinite(numeric(rowValue(section, item, sumKey))) ? numeric(rowValue(section, item, sumKey)) : 0), 0) : null;

  function control(item: Row, f: Field, index: number) {
    const id = `grid-${item.id}-${f.key}`, value = item.values[f.key] || '', name = `${f.label} · baris ${index + 1}`;
    const message = touched[cell(item.id, f.key)] ? fieldError(f, value, item.values) : null;
    const common = { 'data-cell': cell(item.id, f.key), 'aria-label': name, 'aria-invalid': message ? true : undefined, title: message ? `${f.label}: ${message}` : undefined } as const;
    const onKey = (event: React.KeyboardEvent) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); enter(item.id, f.key); } };
    if (isHidden(f, item.values)) return <span className="spt-cell-na" aria-label={`${name}: tidak berlaku`}>—</span>;
    if (f.type === 'computed') return <span className="spt-cell-ro" data-cell={cell(item.id, f.key)} tabIndex={-1}>{money(numeric(rowValue(section, item, f.key)))}</span>;
    const kind = numberKind(f);
    if (isIdentityKey(f.key) && f.type === 'text') return <div onKeyDown={onKey} {...{}}><TaxIdentityField id={id} value={value} onChange={v => set(item.id, f.key, v)} onBlur={() => touch(item.id, f.key)} invalid={!!message} /></div>;
    if (kind) return <div onKeyDown={onKey}><TaxNumberField id={id} kind={kind} value={value} onChange={v => set(item.id, f.key, v)} onBlur={() => touch(item.id, f.key)} invalid={!!message} /></div>;
    if (f.type === 'select' || f.type === 'yesno') {
      const choice = choiceOf(f);
      const options = choice ? choice.options : f.options.map(o => { const [v, label] = o.split('|'); return { value: v, label: label || v }; }).filter(o => o.value);
      const emptyLabel = options.some(o => !o.value) ? null : '—';
      return <select {...common} id={id} value={value} onChange={e => set(item.id, f.key, e.target.value)} onBlur={() => touch(item.id, f.key)}>{emptyLabel && <option value="">{emptyLabel}</option>}{options.map(o => <option key={o.value || 'empty'} value={o.value}>{o.label}</option>)}</select>;
    }
    return <input {...common} id={id} value={value} type={f.type === 'date' ? 'date' : 'text'} autoComplete="off" onChange={e => set(item.id, f.key, e.target.value)} onBlur={() => touch(item.id, f.key)} onKeyDown={onKey} />;
  }

  return <div className="spt-grid-wrap" ref={wrap}>
    <div className="spt-grid-scroll"><table className="spt-grid">
      <thead><tr><th scope="col">#</th>{columns.map(f => <th scope="col" key={f.key}>{f.label}{f.required ? ' *' : ''}</th>)}{assets && <th scope="col">Dilepas</th>}<th scope="col"><span className="spt-sr">Aksi</span></th></tr></thead>
      <tbody>
        {rows.map((item, index) => {
          const problems = columns.filter(f => f.type !== 'computed' && !isHidden(f, item.values) && fieldError(f, item.values[f.key] || '', item.values));
          return <tr key={item.id} className={item.disposed ? 'disposed' : undefined}>
            <th scope="row">{index + 1}</th>
            {columns.map(f => <td key={f.key} data-kind={f.type === 'money' || numberKind(f) ? 'num' : undefined} data-key={f.key}>{control(item, f, index)}</td>)}
            {assets && <td><input type="checkbox" aria-label={`Dilepas · baris ${index + 1}`} checked={!!item.disposed} onChange={e => onRows(rows.map(x => x.id === item.id ? { ...x, disposed: e.target.checked } : x))} /></td>}
            <td className="spt-grid-actions">
              {!!problems.length && <span className="spt-grid-warn" title={problems.map(f => `${f.label}: ${fieldError(f, item.values[f.key] || '', item.values)}`).join('\n')} aria-label={`${problems.length} isian perlu diperiksa`}>⚠ {problems.length}</span>}
              <button type="button" onClick={() => onRows([...rows.slice(0, index + 1), newRow({ ...item.values }, 'duplicate:' + item.id), ...rows.slice(index + 1)])} aria-label={`Duplikasi baris ${index + 1}`} title="Duplikasi">⧉</button>
              <button type="button" onClick={() => { if (!Object.values(item.values).some(Boolean) || window.confirm('Hapus baris ini?')) onRows(rows.filter(x => x.id !== item.id)); }} aria-label={`Hapus baris ${index + 1}`} title="Hapus">🗑</button>
            </td>
          </tr>;
        })}
        {!rows.length && <tr><td colSpan={columns.length + (assets ? 3 : 2)} className="spt-grid-empty">Belum ada baris. Klik “Tambah baris”.</td></tr>}
      </tbody>
    </table></div>
    <div className="spt-grid-foot">
      <button type="button" className="primary" onClick={() => add()}>＋ Tambah baris</button>
      <span>{rows.length} baris · Enter = baris berikutnya, Tab = kolom berikutnya</span>
      {sum !== null && <b>Total {sumLabel}: {money(sum)}</b>}
    </div>
  </div>;
}
