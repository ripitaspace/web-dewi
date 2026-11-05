'use client';
import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { catalog, type Draft } from '@/modules/spt-op/model';
import { compute, money, numeric, rowValue } from '@/modules/spt-op/engine';
import { pageRows } from '@/modules/spt-op/form-layout';
import { answerTicks, assetTotal, bookCell, boxSlots, capacityOf, cellParts, cellText, digitBinding, landscapePages, pageSheets, regionOrdinal, resultSlots, tableBindings, ticks } from '@/modules/spt-op/coretax-map';
import { sheetComponents, type SlotComponents } from './coretax-sheets.generated';
import './coretax-sheets.css';

interface Context { draft: Draft; part: number; print: boolean; onField?: (key: string, value: string) => void; onSection?: (section: string) => void }
const Ctx = createContext<Context | null>(null);
const useCtx = () => { const value = useContext(Ctx); if (!value) throw Error('Coretax slot outside a sheet'); return value; };
const px = (mm: number) => mm * 96 / 25.4;

function Digits({ s, i, cls, count }: { s: number; i: number; cls: string; count: number }) {
  const { draft, print, onField } = useCtx();
  const binding = digitBinding(s, i, count);
  const value = binding.read(draft);
  const editable = !print && !!binding.key && !(s >= 7 && s <= 9 && i >= 2) && !(s === 16 && i === 2);
  return <span className={cls}>{Array.from({ length: count }, (_, n) => <i key={n}>{value[n] || ''}</i>)}{editable && <input id={`field-${binding.key}`} aria-label={`Formulir ${binding.key}`} maxLength={count} value={value} onChange={event => onField?.(binding.key!, event.target.value.slice(0, count))} />}</span>;
}
function Q({ s, i, hidden }: { s: number; i: number; hidden?: boolean }) {
  const { draft } = useCtx();
  const group = answerTicks[s]?.[i];
  const picked = group ? group.findIndex(tick => ticks[s][tick]?.(draft)) : -1;
  return <div className="qval" style={hidden ? { visibility: 'hidden' } : undefined}>{picked >= 0 ? picked + 1 : ''}</div>;
}
function tickSection(s: number, i: number) { return s === 1 && i < 15 ? 'profile' : s === 2 && i >= 22 ? 'declaration' : 'questions'; }
function Tick({ s, i }: { s: number; i: number }) {
  const { draft, print, onSection } = useCtx();
  const on = !!ticks[s]?.[i]?.(draft);
  const section = tickSection(s, i);
  return <span className={`tick${on ? ' on' : ''}`} onClick={print ? undefined : () => onSection?.(section)} title={print ? undefined : 'Ubah di editor data'} />;
}
function R({ s, i }: { s: number; i: number }) {
  const { draft, onSection, print } = useCtx();
  const slot = resultSlots[s]?.[i];
  const results = useResults(draft);
  if (!slot) return <span className="r-val" />;
  let text = '', pending = false;
  if (slot === '@assets') text = money(assetTotal(draft, 'current'));
  else if (slot.startsWith('extras.')) text = money(numeric(draft.extras[slot.slice(7)]));
  else { const result = results.find(item => item.key === slot); text = money(result?.value ?? null); pending = result?.value == null; }
  return <span className={`r-val${pending ? ' pending' : ''}`} onClick={print ? undefined : () => onSection?.('summary')} title={print ? undefined : 'Buka ikhtisar'}>{text}</span>;
}
function useResults(draft: Draft) { return useMemo(() => compute(draft), [draft]); }
function Box({ s, i, style }: { s: number; i: number; style?: React.CSSProperties }) {
  const { draft, onSection, print } = useCtx();
  const slot = boxSlots[s]?.[i];
  if (!slot) return <span className="emptybox" style={style} />;
  const [group, key] = slot.split('.') as ['profile' | 'partner' | 'extras' | 'declaration', string];
  const raw = draft[group][key] || '';
  return <span className="emptybox" style={style} onClick={print ? undefined : () => onSection?.(group)}>{group === 'declaration' || group === 'profile' ? raw : raw ? money(numeric(raw)) : ''}</span>;
}
function C({ s, t, r, c, code, g, k, sum, sub, lead, tag, className, style }: { s: number; t: number; r: number; c: number; code?: string; g?: string; k?: number; sum?: boolean; sub?: string; lead?: string; tag?: string; className?: string; style?: React.CSSProperties }) {
  const { draft, part, print, onSection } = useCtx();
  const id = `${s}.${t}`, binding = tableBindings[id];
  if (!binding) return <td className={className} style={style} data-lead={lead} data-tag={tag} />;
  let content = '', section = binding.section, parts: string[] = [];
  if (binding.book) content = bookCell(draft, binding.book, code, c, t > 0);
  else if (sum) {
    if (section) { const column = catalog.tables[section].sum; if (column) content = money((draft.tables[section] || []).filter(row => !row.disposed).reduce((total, row) => total + numeric(rowValue(section!, row, column)), 0)); }
    else if (id === '4.2') content = money(assetTotal(draft, 'current'));
  } else if (section) {
    let ordinal = r;
    if (binding.regions) { const ro = regionOrdinal(binding, id, g || '', k || 0); if (!ro) return <td className={className} style={style} data-lead={lead} />; section = ro.section; ordinal = ro.ordinal; }
    const row = pageRows(draft, section, part)[ordinal], column = binding.cols[c];
    if (row && column) {
      content = column === '#no' ? String(part * capacityOf(section) + ordinal + 1) : cellText(section, row, column);
      if (sub) parts = cellParts(section, row, column);
      if (lead && content) content = `${lead}. ${content}`;
    }
  }
  const clickable = !print && !!section && !binding.book;
  return <td className={[className, /^[\d.,]+$|^-?[\d.,]+$/.test(content) ? 'num' : ''].filter(Boolean).join(' ') || undefined} style={style} onClick={clickable ? () => onSection?.(section!) : undefined} title={clickable ? 'Edit tabel' : undefined} data-tag={tag} data-lead={lead && !content ? lead : undefined}>{sub ? sub.split('|').map((label, index) => <div className="sub-line" key={index}>{label.startsWith('[ ]') ? <><span className={`cb${parts[index] === 'x' ? ' on' : ''}`} />{label.slice(4)}</> : <>{label} {parts[index] || ''}</>}</div>) : content}</td>;
}
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
  return <div ref={wrapper} className="spt-coretax-fit" style={print ? undefined : { height: fit.height || undefined, overflow: 'hidden' }}><div ref={inner} className="spt-coretax" style={print ? undefined : { transform: `scale(${fit.scale})`, transformOrigin: '0 0' }}>{children}</div></div>;
}

export function CoretaxPage({ draft, page, part = 0, print = false, onField, onSection }: { draft: Draft; page: number; part?: number; print?: boolean; onField?: Context['onField']; onSection?: Context['onSection'] }) {
  const sheets = pageSheets[page];
  if (!sheets) return null;
  return <Ctx.Provider value={{ draft, part, print, onField, onSection }}><Fit print={print} landscape={landscapePages.includes(page)}>{sheets.map(number => { const Sheet = sheetComponents[number - 1]; return <Sheet key={number} slots={slots} />; })}</Fit></Ctx.Provider>;
}
