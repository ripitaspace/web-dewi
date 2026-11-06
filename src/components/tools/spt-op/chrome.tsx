'use client';

import { useState, type ReactNode } from 'react';
import { type Draft } from '@/modules/spt-op/model';
import { RipitaMark } from '@/components/brand/ripita-mark';
import { descendantIds, navigationTree, type NavigationNode, type NavigationTarget } from './navigation-tree';

export { navigation } from './navigation-tree';

interface TopbarProps { draft: Draft; saved: string; isMaximized: boolean; onToggleMaximize: () => void; onBack: () => void; onDrafts: () => void; onSave: () => void; onValidate: () => void; onImport: () => void; onBackup: () => void; onPrint: () => void; onPdf: () => void; pdfBusy?: boolean; onExport: () => void; }

type ActionIconName = 'maximize' | 'restore' | 'draft' | 'save' | 'validate' | 'import' | 'backup' | 'print' | 'pdf' | 'export';
function ActionIcon({ name }: { name: ActionIconName }) {
  const paths: Record<ActionIconName, ReactNode> = {
    maximize: <><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="m21 3-7 7" /><path d="m3 21 7-7" /></>,
    restore: <><path d="m14 10 7-7" /><path d="M20 10h-6V4" /><path d="m3 21 7-7" /><path d="M4 14h6v6" /></>,
    draft: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 14h6" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></>,
    validate: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>,
    import: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></>,
    backup: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" /><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" /></>,
    print: <><path d="M6 9V3h12v6" /><rect x="6" y="14" width="12" height="7" rx="1" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /></>,
    pdf: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 17v-4h1.5a1.2 1.2 0 0 1 0 2.4H9" /><path d="M14 17v-4" /></>,
    export: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function Topbar({ draft, saved, isMaximized, onToggleMaximize, onBack, onDrafts, onSave, onValidate, onImport, onBackup, onPrint, onPdf, pdfBusy, onExport }: TopbarProps) {
  return <header className="spt-topbar">
    <button className="spt-back" onClick={onBack} aria-label="Kembali ke Karya">← Karya</button>
    <div className="spt-brand"><RipitaMark className="spt-brand-mark" title="PuspitaCore" /><div><b>PUSPITACORE</b><small>SPT ORANG PRIBADI STUDIO</small></div></div>
    <span className="spt-pill">{draft.profile.name || 'SPT Orang Pribadi'} · {draft.profile.year}</span><span className="spt-save" role="status">{saved}</span>
    <div className="spt-actions" role="group" aria-label="Aksi SPT">
      <button type="button" className="spt-icon-btn spt-maximize" onClick={onToggleMaximize} aria-pressed={isMaximized} aria-label={isMaximized ? 'Kembalikan tampilan' : 'Maximize workspace'} title={isMaximized ? 'Kembalikan tampilan' : 'Maximize workspace'}><ActionIcon name={isMaximized ? 'restore' : 'maximize'} /></button>
      <span className="spt-actions-sep" aria-hidden="true" />
      <button type="button" className="spt-icon-btn" onClick={onDrafts} aria-label="Draft" title="Draft"><ActionIcon name="draft" /></button>
      <button type="button" className="spt-icon-btn" onClick={onSave} aria-label="Simpan" title="Simpan"><ActionIcon name="save" /></button>
      <button type="button" className="spt-icon-btn" onClick={onValidate} aria-label="Validasi" title="Validasi"><ActionIcon name="validate" /></button>
      <span className="spt-actions-sep" aria-hidden="true" />
      <button type="button" className="spt-icon-btn" onClick={onImport} aria-label="Import" title="Import"><ActionIcon name="import" /></button>
      <button type="button" className="spt-icon-btn" onClick={onBackup} aria-label="Backup JSON" title="Backup JSON"><ActionIcon name="backup" /></button>
      <button type="button" className="spt-icon-btn" onClick={onPrint} aria-label="Print" title="Print"><ActionIcon name="print" /></button>
      <button type="button" className="spt-icon-btn" onClick={onPdf} disabled={pdfBusy} aria-busy={pdfBusy} aria-label="Unduh PDF (F4)" title="Unduh PDF (F4)"><ActionIcon name="pdf" /></button>
      <button type="button" className="spt-icon-btn primary" onClick={onExport} aria-label="Ekspor" title="Ekspor"><ActionIcon name="export" /></button>
    </div>
  </header>;
}

function treeHasSection(node: NavigationNode, section: string): boolean { return node.target?.section === section || (node.children || []).some(child => treeHasSection(child, section)); }

function TreeNode({ node, draft, section, expanded, toggle, onNavigate, depth }: { node: NavigationNode; draft: Draft; section: string; expanded: Set<string>; toggle: (id: string) => void; onNavigate: (target: NavigationTarget) => void; depth: number; }) {
  const hasChildren = !!node.children?.length, isOpen = expanded.has(node.id), active = !!node.target && treeHasSection(node, section);
  return <li className={`spt-tree-node depth-${depth}${active ? ' is-active' : ''}`}>
    <div className="spt-tree-row">
      {hasChildren ? <button className="spt-tree-toggle" onClick={() => toggle(node.id)} aria-expanded={isOpen} aria-controls={`tree-${node.id}`} aria-label={`${isOpen ? 'Tutup' : 'Buka'} ${node.label}`}>{isOpen ? '⌄' : '›'}</button> : <span className="spt-tree-spacer" aria-hidden="true" />}
      {node.target ? <button className="spt-tree-link" onClick={() => onNavigate(node.target!)} title={node.description || node.label} aria-current={active ? 'page' : undefined}>{node.label}{node.countKey && <span className="spt-tree-count">{(draft.tables[node.countKey] || []).length}</span>}</button> : <span className="spt-tree-label" title={node.description || node.label}>{node.label}</span>}
    </div>
    {hasChildren && isOpen && <ul id={`tree-${node.id}`} className="spt-tree-children">{node.children!.map(child => <TreeNode key={child.id} node={child} draft={draft} section={section} expanded={expanded} toggle={toggle} onNavigate={onNavigate} depth={depth + 1} />)}</ul>}
  </li>;
}

export function Navigation({ draft, section, onNavigate }: { draft: Draft; section: string; onNavigate: (target: NavigationTarget) => void }) {
  const [expanded, setExpanded] = useState(() => new Set(descendantIds(navigationTree)));
  const [compact, setCompact] = useState(false);
  const allIds = descendantIds(navigationTree);
  const toggle = (id: string) => setExpanded(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <aside className={`spt-nav${compact ? ' spt-nav-compact' : ''}`} aria-label="Navigasi formulir">
    <header className="spt-nav-header"><span className="spt-nav-title">Peta SPT</span><button onClick={() => setCompact(value => !value)} aria-label={compact ? 'Perluas navigasi' : 'Ringkas navigasi'} title={compact ? 'Perluas navigasi' : 'Ringkas navigasi'}>{compact ? '»' : '«'}</button></header>
    {!compact && <><div className="spt-nav-actions"><button onClick={() => setExpanded(new Set(allIds))}>Buka semua</button><button onClick={() => setExpanded(new Set())}>Tutup semua</button></div><ul className="spt-tree">{navigationTree.map(node => <TreeNode key={node.id} node={node} draft={draft} section={section} expanded={expanded} toggle={toggle} onNavigate={onNavigate} depth={0} />)}</ul><p>Data tersimpan di perangkat ini. Backup JSON sebelum membersihkan data browser.</p></>}
    {compact && <div className="spt-nav-compact-list">{navigationTree.map(node => <button key={node.id} className={treeHasSection(node, section) ? 'active' : ''} onClick={() => { setCompact(false); setExpanded(current => new Set([...current, node.id])); }} title={node.label}>{node.label.match(/^\d+/)?.[0] || '•'}</button>)}</div>}
  </aside>;
}
