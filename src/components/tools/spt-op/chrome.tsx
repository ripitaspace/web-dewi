'use client';

import { useState } from 'react';
import { type Draft } from '@/modules/spt-op/model';
import { RipitaMark } from '@/components/brand/ripita-mark';
import { descendantIds, navigationTree, type NavigationNode, type NavigationTarget } from './navigation-tree';

export { navigation } from './navigation-tree';

interface TopbarProps { draft: Draft; saved: string; isMaximized: boolean; onToggleMaximize: () => void; onBack: () => void; onDrafts: () => void; onSave: () => void; onValidate: () => void; onImport: () => void; onBackup: () => void; onExport: () => void; }

export function Topbar({ draft, saved, isMaximized, onToggleMaximize, onBack, onDrafts, onSave, onValidate, onImport, onBackup, onExport }: TopbarProps) {
  return <header className="spt-topbar">
    <button className="spt-back" onClick={onBack} aria-label="Kembali ke Karya">← Karya</button>
    <div className="spt-brand"><RipitaMark className="spt-brand-mark" title="PuspitaCore" /><div><b>PUSPITACORE</b><small>SPT ORANG PRIBADI STUDIO</small></div></div>
    <span className="spt-pill">{draft.profile.name || 'SPT Orang Pribadi'} · {draft.profile.year}</span><span className="spt-save" role="status">{saved}</span>
    <div className="spt-actions"><button className="spt-maximize" onClick={onToggleMaximize} aria-pressed={isMaximized} aria-label={isMaximized ? 'Kembalikan tampilan' : 'Maximize workspace'} title={isMaximized ? 'Kembalikan tampilan' : 'Maximize workspace'}>{isMaximized ? '↙ Kembalikan' : '↗ Maximize'}</button><button onClick={onDrafts}>Draft</button><button onClick={onSave}>Simpan</button><button onClick={onValidate}>✓ Validasi</button><button onClick={onImport}>↥ Import</button><button onClick={onBackup}>↓ Backup JSON</button><button className="primary" onClick={onExport}>⇩ Ekspor</button></div>
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
