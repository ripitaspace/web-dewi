'use client';
import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { catalog, declarationFields, partnerFields, profileFields, type Draft, type Field } from '@/modules/spt-op/model';
import { compute, money, numeric, rowValue } from '@/modules/spt-op/engine';
import { activeRows, pageRows } from '@/modules/spt-op/form-layout';
import { digitsOnly } from '@/modules/spt-op/field-rules';
import { answerTicks, assetTotal, tickSets, bookCell, taggedSum, boxSlots, capacityOf, cellParts, cellText, digitBinding, landscapePages, pageSheets, regionOrdinal, resultSlots, tableBindings, ticks } from '@/modules/spt-op/coretax-map';
import { sheetComponents, type SlotComponents } from './coretax-sheets.generated';
import './coretax-sheets.css';

type ScalarGroup = 'profile' | 'questions' | 'extras' | 'partner' | 'declaration';
interface Context { draft: Draft; part: number; print: boolean; tableParts: Record<string, number>; onField?: (key: string, value: string) => void; onSet?: (group: ScalarGroup, key: string, value: string) => void; onSection?: (section: string) => void; onTablePart?: (section: string, part: number) => void }
const Ctx = createContext<Context | null>(null);
const useCtx = () => { const value = useContext(Ctx); if (!value) throw Error('Coretax slot outside a sheet'); return value; };
const px = (mm: number) => mm * 96 / 25.4;
const pagerTotalTags = new Set(['1', '2', '3.6', '4', '5', '6', 'A', 'B', 'C', 'D', 'E', 'B.5']);

function Digits({ s, i, cls, count }: { s: number; i: number; cls: string; count: number }) {
  const { draft, print, onField } = useCtx();
  const binding = digitBinding(s, i, count);
  const value = binding.read(draft);
  const editable = !print && !!binding.key && !(s >= 7 && s <= 9 && i >= 2) && !(s === 16 && i === 2);
  return <span className={cls}>{Array.from({ length: count }, (_, n) => <i key={n}>{value[n] || ''}</i>)}{editable && <input id={`field-${binding.key}`} aria-label={`Formulir ${binding.key}`} title="Klik untuk mengisi" value={value} inputMode="numeric" onChange={event => onField?.(binding.key!, digitsOnly(event.target.value, count))} />}</span>;
}
function Q({ s, i, hidden }: { s: number; i: number; hidden?: boolean }) {
  const { draft } = useCtx();
  const group = answerTicks[s]?.[i];
  const picked = group ? group.findIndex(tick => ticks[s][tick]?.(draft)) : -1;
  return <div className="qval" style={hidden ? { visibility: 'hidden' } : undefined}>{picked >= 0 ? picked + 1 : ''}</div>;
}
function tickSection(s: number, i: number) { return s === 1 && i < 15 ? 'profile' : s === 2 && i >= 22 ? 'declaration' : 'questions'; }
function Tick({ s, i }: { s: number; i: number }) {
  const { draft, print, onSection, onSet } = useCtx();
  const on = !!ticks[s]?.[i]?.(draft);
  const section = tickSection(s, i);
  const set = tickSets[s]?.[i];
  const act = () => {
    if (set && onSet) onSet(set.group, set.key, set.clearable && draft[set.group][set.key] === set.value ? '' : set.value);
    else onSection?.(section);
  };
  const title = set && onSet ? (set.clearable && on ? 'Klik lagi untuk mengosongkan jawaban' : 'Klik untuk memilih') : 'Klik untuk membuka isian di editor';
  return <span className={`tick${on ? ' on' : ''}${print ? '' : ' clickable'}`} onClick={print ? undefined : act} title={print ? undefined : title} {...(print ? {} : { role: set && onSet ? 'checkbox' : 'button', tabIndex: 0, ...(set && onSet ? { 'aria-checked': on } : {}), onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); act(); } } })} />;
}
function R({ s, i }: { s: number; i: number }) {
  const { draft, onSection, print } = useCtx();
  const slot = resultSlots[s]?.[i];
  const results = useResults(draft);
  if (!slot) return <span className="r-val" />;
  let text = '', pending = false;
  if (slot === '@assets') text = money(assetTotal(draft, 'current'));
  else if (slot.startsWith('extras.')) { const raw = draft.extras[slot.slice(7)]; text = raw?.trim() ? money(numeric(raw)) : ''; }
  else { const result = results.find(item => item.key === slot); text = money(result?.value ?? null); pending = result?.value == null; }
  return <span className={`r-val${pending ? ' pending' : ''}${print ? '' : ' clickable'}`} onClick={print ? undefined : () => onSection?.('summary')} title={print ? undefined : 'Buka ikhtisar'}>{text}</span>;
}
function useResults(draft: Draft) { return useMemo(() => compute(draft), [draft]); }
function Box({ s, i, style }: { s: number; i: number; style?: React.CSSProperties }) {
  const { draft, onSet, onSection, print } = useCtx();
  const slot = boxSlots[s]?.[i];
  if (!slot) return <span className="emptybox" style={style} />;
  const [group, key] = slot.split('.') as [Exclude<ScalarGroup, 'questions'>, string];
  const raw = draft[group][key] || '';
  const fields: Field[] = group === 'profile' ? profileFields : group === 'partner' ? partnerFields : group === 'declaration' ? declarationFields : catalog.extraFields;
  const meta = fields.find(item => item.key === key);
  const shown = group === 'declaration' || group === 'profile' ? raw : raw ? money(numeric(raw)) : '';
  if (print || !onSet || !meta) return <span className={`emptybox${print ? '' : ' clickable'}`} title={print ? undefined : 'Klik untuk mengisi di editor'} style={style} onClick={print ? undefined : () => onSection?.(group)}>{shown}</span>;
  const control = meta.type === 'select'
    ? <select className="slot-input" aria-label={`Formulir ${key}`} value={raw} onChange={event => onSet(group, key, event.target.value)}><option value="">Pilih</option>{meta.options.map(option => { const [value, label] = option.split('|'); return <option key={value} value={value}>{label || value}</option>; })}</select>
    : <input className="slot-input" aria-label={`Formulir ${key}`} value={raw} inputMode={meta.type === 'money' ? 'decimal' : undefined} onClick={event => event.stopPropagation()} onChange={event => onSet(group, key, event.target.value)} />;
  return <span className="emptybox inline-field" style={style}>{control}</span>;
}
function TablePager({ section, page, count, anchor }: { section: string; page: number; count: number; anchor: React.RefObject<HTMLSpanElement | null> }) {
  const { onTablePart } = useCtx();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const safePage = Math.min(page, count - 1);
  useLayoutEffect(() => {
    const cell = anchor.current?.closest('tr')?.querySelector<HTMLElement>('td:first-child');
    if (!cell) return;
    // The label cell already belongs to the generated template and contains text.
    // Create a leaf host inside it so React never shares a portal container with that text.
    const pagerHost = document.createElement('span');
    pagerHost.className = 'spt-table-pager-host';
    cell.prepend(pagerHost);
    setHost(pagerHost);
    return () => {
      pagerHost.remove();
    };
  }, [anchor]);
  useLayoutEffect(() => {
    if (safePage !== page) onTablePart?.(section, safePage);
  }, [onTablePart, page, safePage, section]);
  if (!host) return null;
  return createPortal(<span className="spt-table-pager" aria-label={`Navigasi ${section}`}>
    <button type="button" disabled={safePage === 0} onClick={() => onTablePart?.(section, safePage - 1)} aria-label="Halaman sebelumnya">←</button>
    <span>Halaman {safePage + 1}/{count}</span>
    <button type="button" disabled={safePage === count - 1} onClick={() => onTablePart?.(section, safePage + 1)} aria-label="Halaman berikutnya">→</button>
  </span>, host);
}
function C({ s, t, r, c, code, g, k, sum, sub, lead, tag, className, style }: { s: number; t: number; r: number; c: number; code?: string; g?: string; k?: number; sum?: boolean; sub?: string; lead?: string; tag?: string; className?: string; style?: React.CSSProperties }) {
  const { draft, part, print, tableParts, onSection } = useCtx();
  const anchor = useRef<HTMLSpanElement>(null);
  const id = `${s}.${t}`, binding = tableBindings[id];
  if (!binding) return <td className={className} style={style} data-lead={lead} data-tag={tag} />;
  let content = '', section = binding.section, parts: string[] = [];
  if (binding.book) content = bookCell(draft, binding.book, code, c, t > 0);
  else if (sum) {
    const tagged = taggedSum(draft, id, tag);
    if (tagged !== null) content = money(tagged);
    else if (section) { const column = catalog.tables[section].sum; if (column) content = money((draft.tables[section] || []).filter(row => !row.disposed).reduce((total, row) => total + numeric(rowValue(section!, row, column)), 0)); }
    else if (id === '6.2') content = money(assetTotal(draft, 'current'));
  } else if (section) {
    let ordinal = r;
    if (binding.regions) { const ro = regionOrdinal(binding, id, g || '', k || 0); if (!ro) return <td className={className} style={style} data-lead={lead} />; section = ro.section; ordinal = ro.ordinal; }
    const tablePart = print ? part : tableParts[section] || 0;
    const row = pageRows(draft, section, tablePart)[ordinal], column = binding.cols[c];
    if (!row && column === '#no' && s === 17) content = String(tablePart * capacityOf(section) + ordinal + 1);
    if (row && column) {
      content = column === '#no' ? String(tablePart * capacityOf(section) + ordinal + 1) : cellText(section, row, column);
      if (sub) parts = cellParts(section, row, column);
      if (lead && content) content = `${lead}. ${content}`;
    }
  }
  const tablePart = section ? (print ? part : tableParts[section] || 0) : 0;
  const continuationCount = section ? Math.max(1, Math.ceil(activeRows(draft, section).length / capacityOf(section))) : 1;
  const clickable = !print && !!section && !binding.book;
  return <td className={[className, /^[\d.,]+$|^-?[\d.,]+$/.test(content) ? 'num' : '', clickable ? 'clickable' : ''].filter(Boolean).join(' ') || undefined} style={style} onClick={clickable ? () => onSection?.(section!) : undefined} title={clickable ? 'Klik untuk mengisi / mengedit tabel' : undefined} data-tag={tag} data-lead={lead && !content ? lead : undefined}>{sub ? sub.split('|').map((label, index) => <div className="sub-line" key={index}>{label.startsWith('[ ]') ? <><span className={`cb${parts[index] === 'x' ? ' on' : ''}`} />{label.slice(4)}</> : <>{label} {parts[index] || ''}</>}</div>) : sum ? content : <span className="spt-cell-text">{content}</span>}{sum && !print && section && tag && pagerTotalTags.has(tag) && <><span ref={anchor} /><TablePager section={section} page={tablePart} count={continuationCount} anchor={anchor} /></>}</td>;
}
// Keep this list in sync with SlotComponents generated from the Coretax template.
const slots: SlotComponents = { Digits, Q, R, Box, Tick, C };

/**
 * The sheets are laid out once at their reference size (F4 at 96 dpi) and then scaled as a whole,
 * so every box keeps the same ratio to the page width at any zoom. CSS `zoom` re-lays out the text
 * at each level, which let rows wrap differently and drift by up to a millimetre.
 */
function Fit({ print, landscape, children }: { print: boolean; landscape: boolean; children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null), inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });
  useLayoutEffect(() => {
    if (print || !wrapper.current || !inner.current) return;
    const outer = wrapper.current, sheet = inner.current;
    const measure = () => {
      const scale = outer.clientWidth / px(landscape ? 330.2 : 215.9);
      setFit(previous => previous.scale === scale && previous.height === sheet.offsetHeight * scale ? previous : { scale, height: sheet.offsetHeight * scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [print, landscape]);
  return <div ref={wrapper} className="spt-coretax-fit" style={print ? undefined : { height: fit.height || undefined, overflow: 'hidden' }}><div ref={inner} className={`spt-coretax${print ? '' : ' is-interactive'}`} style={print ? undefined : { transform: `scale(${fit.scale})`, transformOrigin: '0 0' }}>{children}</div></div>;
}

export function CoretaxPage({ draft, page, part = 0, print = false, onField, onSet, onSection, tableParts = {}, onTablePart }: { draft: Draft; page: number; part?: number; print?: boolean; onField?: Context['onField']; onSet?: Context['onSet']; onSection?: Context['onSection']; tableParts?: Context['tableParts']; onTablePart?: Context['onTablePart'] }) {
  const sheets = pageSheets[page];
  if (!sheets) return null;
  return <Ctx.Provider value={{ draft, part, print, tableParts, onField, onSet, onSection, onTablePart }}><Fit print={print} landscape={landscapePages.includes(page)}>{sheets.map(number => { const Sheet = sheetComponents[number - 1]; return <Sheet key={number} slots={slots} />; })}</Fit></Ctx.Provider>;
}
