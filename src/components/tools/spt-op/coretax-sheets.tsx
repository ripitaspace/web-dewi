'use client';
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { catalog, declarationFields, partnerFields, profileFields, type Draft, type Field } from '@/modules/spt-op/model';
import { compute, money, numeric, rowValue } from '@/modules/spt-op/engine';
import { activeRows, pageRows } from '@/modules/spt-op/form-layout';
import { digitsOnly, padMonth } from '@/modules/spt-op/field-rules';
import { answerTicks, assetTotal, tickSets, bookCell, taggedSum, boxSlots, capacityOf, cellParts, cellText, digitBinding, firstPage, landscapePages, lastPage, pageNumbers, pageSheets, regionOrdinal, resultSlots, sheetLabel, tableBindings, ticks } from '@/modules/spt-op/coretax-map';
import { annotateAnswer, annotateBox, annotateCell, annotateDigits, annotateResult, annotateTick, annotationAttributes, type FormAnnotation } from '@/modules/spt-op/form-annotations';
import { sheetComponents, type SlotComponents } from './coretax-sheets.generated';
import './coretax-sheets.css';

type ScalarGroup = 'profile' | 'questions' | 'extras' | 'partner' | 'declaration';
interface Context { draft: Draft; part: number; print: boolean; audit: boolean; tableParts: Record<string, number>; onField?: (key: string, value: string) => void; onSet?: (group: ScalarGroup, key: string, value: string) => void; onSection?: (section: string) => void; onTableCell?: (section: string, activeIndex: number, key: string, value: string) => void; onTablePart?: (section: string, part: number) => void }
const Ctx = createContext<Context | null>(null);
const useCtx = () => { const value = useContext(Ctx); if (!value) throw Error('Coretax slot outside a sheet'); return value; };
const px = (mm: number) => mm * 96 / 25.4;
const pagerTotalTags = new Set(['1', '2', '3.6', '4', '5', '6', 'A', 'B', 'C', 'D', 'E', 'B.5']);
const auditTitle = (annotation: FormAnnotation, audit: boolean, fallback?: string) => audit ? `${annotation.id} · ${annotation.kind} · ${annotation.editability}${annotation.dataPath ? ` · ${annotation.dataPath}` : ''}` : fallback;

function Digits({ s, i, cls, count }: { s: number; i: number; cls: string; count: number }) {
  const { draft, print, audit, onField } = useCtx();
  const annotation = annotateDigits(s, i, count);
  const binding = digitBinding(s, i, count);
  const raw = binding.read(draft);
  const month = binding.key === 'fromMonth' || binding.key === 'toMonth';
  const formatted = month ? padMonth(raw) : raw;
  const [typing, setTyping] = useState<string | null>(null);
  const value = typing ?? formatted;
  const editable = !print && !!binding.key && !(s >= 7 && s <= 9 && i >= 2) && !(s === 16 && i === 2);
  return <span className={cls} title={auditTitle(annotation, audit)} {...annotationAttributes(annotation)}>{Array.from({ length: count }, (_, n) => <i key={n}>{value[n] || ''}</i>)}{editable && <input id={`field-${binding.key}`} aria-label={`Formulir ${binding.key}`} title={auditTitle(annotation, audit, 'Klik untuk mengisi')} value={value} inputMode="numeric" onFocus={event => { setTyping(formatted); event.currentTarget.select(); }} onChange={event => { const next = digitsOnly(event.target.value, count); setTyping(next); onField?.(binding.key!, next); }} onBlur={() => { if (month) onField?.(binding.key!, padMonth(value)); setTyping(null); }} />}</span>;
}
function Q({ s, i, hidden }: { s: number; i: number; hidden?: boolean }) {
  const { draft, audit } = useCtx();
  const annotation = annotateAnswer(s, i);
  const group = answerTicks[s]?.[i];
  const picked = group ? group.findIndex(tick => ticks[s][tick]?.(draft)) : -1;
  return <div className="qval" title={auditTitle(annotation, audit)} style={hidden ? { visibility: 'hidden' } : undefined} {...annotationAttributes(annotation)}>{picked >= 0 ? picked + 1 : ''}</div>;
}
function tickSection(s: number, i: number) { return s === 1 && i < 15 ? 'profile' : s === 2 && i >= 22 ? 'declaration' : 'questions'; }
function Tick({ s, i }: { s: number; i: number }) {
  const { draft, print, audit, onSection, onSet } = useCtx();
  const annotation = annotateTick(s, i);
  const on = !!ticks[s]?.[i]?.(draft);
  const section = tickSection(s, i);
  const set = tickSets[s]?.[i];
  const act = () => {
    if (set && onSet) onSet(set.group, set.key, set.clearable && draft[set.group][set.key] === set.value ? '' : set.value);
    else onSection?.(section);
  };
  const title = set && onSet ? (set.clearable && on ? 'Klik lagi untuk mengosongkan jawaban' : 'Klik untuk memilih') : 'Klik untuk membuka isian di editor';
  return <span className={`tick${on ? ' on' : ''}${print ? '' : ' clickable'}`} onClick={print ? undefined : act} title={print ? undefined : auditTitle(annotation, audit, title)} {...annotationAttributes(annotation)} {...(print ? {} : { role: set && onSet ? 'checkbox' : 'button', tabIndex: 0, ...(set && onSet ? { 'aria-checked': on } : {}), onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); act(); } } })} />;
}
function R({ s, i }: { s: number; i: number }) {
  const { draft, onSection, print, audit } = useCtx();
  const annotation = annotateResult(s, i);
  const slot = resultSlots[s]?.[i];
  const results = useResults(draft);
  if (!slot) return <span className="r-val" title={auditTitle(annotation, audit)} {...annotationAttributes(annotation)} />;
  let text = '', pending = false;
  if (slot === '@assets') text = money(assetTotal(draft, 'current'));
  else if (slot.startsWith('extras.')) { const raw = draft.extras[slot.slice(7)]; text = raw?.trim() ? money(numeric(raw)) : ''; }
  else { const result = results.find(item => item.key === slot); text = money(result?.value ?? null); pending = result?.value == null; }
  return <span className={`r-val${pending ? ' pending' : ''}${print ? '' : ' clickable'}`} onClick={print ? undefined : () => onSection?.('summary')} title={print ? undefined : auditTitle(annotation, audit, 'Buka ikhtisar dan sumber perhitungan')} {...annotationAttributes(annotation)}>{text}</span>;
}
function useResults(draft: Draft) { return useMemo(() => compute(draft), [draft]); }
function Box({ s, i, style }: { s: number; i: number; style?: React.CSSProperties }) {
  const { draft, onSet, onSection, print, audit } = useCtx();
  const annotation = annotateBox(s, i);
  const slot = boxSlots[s]?.[i];
  if (!slot) return <span className="emptybox" style={style} title={auditTitle(annotation, audit)} {...annotationAttributes(annotation)} />;
  const [group, key] = slot.split('.') as [Exclude<ScalarGroup, 'questions'>, string];
  const raw = draft[group][key] || '';
  const fields: Field[] = group === 'profile' ? profileFields : group === 'partner' ? partnerFields : group === 'declaration' ? declarationFields : catalog.extraFields;
  const meta = fields.find(item => item.key === key);
  const shown = group === 'declaration' || group === 'profile' ? raw : raw ? money(numeric(raw)) : '';
  const identityWide = s === 3 && i < 4 ? ' identity-wide' : '';
  if (print || !onSet || !meta) return <span className={`emptybox${identityWide}${print ? '' : ' clickable'}`} title={print ? undefined : auditTitle(annotation, audit, 'Klik untuk mengisi di editor')} style={style} onClick={print ? undefined : () => onSection?.(group)} {...annotationAttributes(annotation)}>{shown}</span>;
  const control = meta.type === 'select'
    ? <select className="slot-input" aria-label={`Formulir ${key}`} value={raw} onChange={event => onSet(group, key, event.target.value)}><option value="">Pilih</option>{meta.options.map(option => { const [value, label] = option.split('|'); return <option key={value} value={value}>{label || value}</option>; })}</select>
    : <input className="slot-input" aria-label={`Formulir ${key}`} value={raw} inputMode={meta.type === 'money' ? 'decimal' : undefined} onClick={event => event.stopPropagation()} onChange={event => onSet(group, key, event.target.value)} />;
  return <span className={`emptybox inline-field${identityWide}`} style={style} title={auditTitle(annotation, audit)} {...annotationAttributes(annotation)}>{control}</span>;
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
  const { draft, part, print, audit, tableParts, onSection, onTableCell } = useCtx();
  const anchor = useRef<HTMLSpanElement>(null);
  const annotation = annotateCell(s, t, r, c, !!sum);
  const id = `${s}.${t}`, binding = tableBindings[id];
  if (!binding) return <td className={className} style={style} title={auditTitle(annotation, audit)} data-lead={lead} data-tag={tag} {...annotationAttributes(annotation)} />;
  let content = '', section = binding.section, parts: string[] = [], ordinal = r, tablePart = 0;
  let dataRow: Draft['tables'][string][number] | undefined;
  const column = binding.cols[c];
  if (binding.book) content = bookCell(draft, binding.book, code, c, t > 0);
  else if (sum) {
    const tagged = taggedSum(draft, id, tag);
    if (tagged !== null) content = money(tagged);
    else if (section) { const column = catalog.tables[section].sum; if (column) content = money((draft.tables[section] || []).filter(row => !row.disposed).reduce((total, row) => total + numeric(rowValue(section!, row, column)), 0)); }
    else if (id === '6.2') content = money(assetTotal(draft, 'current'));
  } else if (section) {
    if (binding.regions) { const ro = regionOrdinal(binding, id, g || '', k || 0); if (!ro) return <td className={className} style={style} title={auditTitle(annotation, audit)} data-lead={lead} {...annotationAttributes(annotation)} />; section = ro.section; ordinal = ro.ordinal; }
    // A page continuation selects the default part for every table on the sheet.
    // A table pager, when present, remains an explicit per-table override.
    tablePart = print ? part : tableParts[section] ?? part;
    dataRow = pageRows(draft, section, tablePart)[ordinal];
    if (!dataRow && column === '#no' && s === 17) content = String(tablePart * capacityOf(section) + ordinal + 1);
    if (dataRow && column) {
      content = column === '#no' ? String(tablePart * capacityOf(section) + ordinal + 1) : cellText(section, dataRow, column);
      if (sub) parts = cellParts(section, dataRow, column);
      if (lead && content) content = `${lead}. ${content}`;
    }
  }
  if (section && !tablePart) tablePart = print ? part : tableParts[section] ?? part;
  const continuationCount = section ? Math.max(1, Math.ceil(activeRows(draft, section).length / capacityOf(section))) : 1;
  const fieldMeta = section && column ? catalog.tables[section]?.columns.find(field => field.key === column) : undefined;
  const activeIndex = tablePart * capacityOf(section || '') + ordinal;
  const inlineEditable = !print && !sum && !sub && !!section && !!column && annotation.editability === 'direct' && !!fieldMeta;
  const update = (value: string) => {
    if (onTableCell) onTableCell(section!, activeIndex, column!, value);
    else window.dispatchEvent(new CustomEvent('spt-table-cell-edit', { detail: { section, activeIndex, key: column, value } }));
  };
  const editor = inlineEditable && (fieldMeta.type === 'select'
    ? <select className="spt-cell-input" aria-label={`Formulir ${fieldMeta.label}`} value={dataRow?.values[column!] || ''} onClick={event => event.stopPropagation()} onChange={event => update(event.target.value)}><option value="">Pilih</option>{fieldMeta.options.map(option => { const [value, label] = option.split('|'); return <option key={value} value={value}>{label || value}</option>; })}</select>
    : <input className="spt-cell-input" aria-label={`Formulir ${fieldMeta.label}`} value={dataRow?.values[column!] || ''} inputMode={fieldMeta.type === 'money' || fieldMeta.type === 'number' ? 'decimal' : undefined} onClick={event => event.stopPropagation()} onChange={event => update(event.target.value)} />);
  const clickable = !print && !!section && !binding.book && !inlineEditable;
  return <td className={[className, /^[\d.,]+$|^-?[\d.,]+$/.test(content) ? 'num' : '', clickable ? 'clickable' : '', inlineEditable ? 'inline-editable' : ''].filter(Boolean).join(' ') || undefined} style={style} onClick={clickable ? () => onSection?.(section!) : undefined} title={auditTitle(annotation, audit, inlineEditable ? 'Ketik atau tempel nilai untuk mengisi sel' : clickable ? 'Klik untuk mengisi / mengedit tabel' : undefined)} data-tag={tag} data-lead={lead && !content ? lead : undefined} {...annotationAttributes(annotation)}>{editor || (sub ? sub.split('|').map((label, index) => <div className="sub-line" key={index}>{label.startsWith('[ ]') ? <><span className={`cb${parts[index] === 'x' ? ' on' : ''}`} />{label.slice(4)}</> : <>{label} {parts[index] || ''}</>}</div>) : sum ? content : <span className="spt-cell-text">{content}</span>)}{sum && !print && section && tag && pagerTotalTags.has(tag) && <><span ref={anchor} /><TablePager section={section} page={tablePart} count={continuationCount} anchor={anchor} /></>}</td>;
}
// Keep this list in sync with SlotComponents generated from the Coretax template.
const slots: SlotComponents = { Digits, Q, R, Box, Tick, C };

/**
 * The sheets are laid out once at their reference size (F4 at 96 dpi) and then scaled as a whole,
 * so every box keeps the same ratio to the page width at any zoom. CSS `zoom` re-lays out the text
 * at each level, which let rows wrap differently and drift by up to a millimetre.
 */
function Fit({ print, landscape, audit, children }: { print: boolean; landscape: boolean; audit: boolean; children: ReactNode }) {
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
  return <div ref={wrapper} className="spt-coretax-fit" style={print ? undefined : { height: fit.height || undefined, overflow: 'hidden' }}><div ref={inner} className={`spt-coretax${print ? '' : ' is-interactive'}${audit ? ' is-audit' : ''}`} style={print ? undefined : { transform: `scale(${fit.scale})`, transformOrigin: '0 0' }}>{children}</div></div>;
}

function BottomPageNavigation({ page }: { page: number }) {
  const move = (next: number) => window.dispatchEvent(new CustomEvent('spt-page-navigation', { detail: next }));
  const [zoom, setZoom] = useState(100);
  useEffect(() => {
    const syncZoom = (event: Event) => setZoom(Number((event as CustomEvent<number>).detail));
    window.addEventListener('spt-zoom-changed', syncZoom);
    return () => window.removeEventListener('spt-zoom-changed', syncZoom);
  }, []);
  const changeZoom = (amount: number) => window.dispatchEvent(new CustomEvent('spt-zoom-navigation', { detail: amount }));
  return <nav className="spt-toolbar spt-form-bottom-navigation" aria-label="Navigasi halaman formulir bawah">
    <button type="button" disabled={page === firstPage} onClick={() => move(page - 1)}>← Previous</button>
    <label>Halaman<select aria-label="Pilih halaman formulir" value={page} onChange={event => move(Number(event.target.value))}>{pageNumbers.map(number => <option key={number} value={number}>{sheetLabel(number)}. {catalog.PAGE_NAMES[number - 1]}</option>)}</select></label>
    <button type="button" disabled={page === lastPage} onClick={() => move(page + 1)}>Next →</button>
    <button type="button" disabled={zoom === 55} onClick={() => changeZoom(-10)} aria-label="Zoom out">−</button><span>{zoom}%</span><button type="button" disabled={zoom === 170} onClick={() => changeZoom(10)} aria-label="Zoom in">＋</button>
  </nav>;
}

export function CoretaxPage({ draft, page, part = 0, print = false, audit = false, onField, onSet, onSection, onTableCell, tableParts = {}, onTablePart }: { draft: Draft; page: number; part?: number; print?: boolean; audit?: boolean; onField?: Context['onField']; onSet?: Context['onSet']; onSection?: Context['onSection']; onTableCell?: Context['onTableCell']; tableParts?: Context['tableParts']; onTablePart?: Context['onTablePart'] }) {
  const sheets = pageSheets[page];
  const [auditMode, setAuditMode] = useState(audit);
  useEffect(() => {
    if (print) return;
    const toggle = (event: Event) => setAuditMode(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener('spt-audit-mode', toggle);
    return () => window.removeEventListener('spt-audit-mode', toggle);
  }, [print]);
  if (!sheets) return null;
  const effectiveAudit = audit || auditMode;
  return <Ctx.Provider value={{ draft, part, print, audit: effectiveAudit, tableParts, onField, onSet, onSection, onTableCell, onTablePart }}><Fit print={print} audit={effectiveAudit} landscape={landscapePages.includes(page)}>{sheets.map(number => { const Sheet = sheetComponents[number - 1]; return <Sheet key={number} slots={slots} />; })}</Fit>{!print && <BottomPageNavigation page={page} />}</Ctx.Provider>;
}
