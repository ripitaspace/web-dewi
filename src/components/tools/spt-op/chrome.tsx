'use client';

import { useState, type ReactNode } from 'react';
import { type Draft } from '@/modules/spt-op/model';
import { RipitaMark } from '@/components/brand/ripita-mark';
import { descendantIds, navigationTree, type NavigationNode, type NavigationTarget } from './navigation-tree';
import { Dialog } from './dialog';

export { navigation } from './navigation-tree';

interface TopbarProps { draft: Draft; saved: string; isMaximized: boolean; onToggleMaximize: () => void; onBack: () => void; onDrafts: () => void; onSave: () => void; onValidate: () => void; onImport: () => void; onLoadExample: () => void; onPrint: () => void; onExport: () => void; }

type ActionIconName = 'maximize' | 'restore' | 'draft' | 'save' | 'validate' | 'audit' | 'import' | 'template' | 'backup' | 'print' | 'export';
const exampleScenarios = [
  { file: 'SPT_OP_WP01_Karyawan_2025.xlsx', title: 'Karyawan', description: 'Pekerja dengan penghasilan dari satu pemberi kerja.' },
  { file: 'SPT_OP_WP02_Karyawan_Menikah_2025.xlsx', title: 'Karyawan menikah', description: 'Karyawan dengan data keluarga dan penghasilan lainnya.' },
  { file: 'SPT_OP_WP03_Status_PH_MT_2025.xlsx', title: 'Status PH/MT', description: 'Contoh pengisian untuk status penghasilan suami-istri terpisah.' },
  { file: 'SPT_OP_WP04_Pengusaha_UMKM_2025.xlsx', title: 'Pengusaha UMKM', description: 'Usaha dengan peredaran bruto tertentu dan data omzet bulanan.' },
  { file: 'SPT_OP_WP05_Profesional_NPPN_2025.xlsx', title: 'Profesional NPPN', description: 'Pekerjaan bebas dengan pencatatan dan norma penghitungan neto.' },
  { file: 'SPT_OP_WP06_Pengusaha_Pembukuan_2025.xlsx', title: 'Pengusaha pembukuan', description: 'Usaha dengan pembukuan, rekonsiliasi laba rugi, dan neraca.' },
] as const;
const examplePath = (file: string) => `/tools/spt-op/examples/${file}`;
function ActionIcon({ name }: { name: ActionIconName }) {
  const paths: Record<ActionIconName, ReactNode> = {
    maximize: <><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="m21 3-7 7" /><path d="m3 21 7-7" /></>,
    restore: <><path d="m14 10 7-7" /><path d="M20 10h-6V4" /><path d="m3 21 7-7" /><path d="M4 14h6v6" /></>,
    draft: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 14h6" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></>,
    validate: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>,
    audit: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h5M8 16h3" /><path d="m16 15 1.5 1.5L21 13" /></>,
    import: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></>,
    template: <><path d="M4 3h16v18H4z" /><path d="M8 3v18M4 8h16M12 12h4M12 16h4" /></>,
    backup: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" /><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" /></>,
    print: <><path d="M6 9V3h12v6" /><rect x="6" y="14" width="12" height="7" rx="1" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /></>,
    export: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function Topbar({ draft, saved, isMaximized, onToggleMaximize, onBack, onDrafts, onSave, onValidate, onImport, onPrint, onExport }: TopbarProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const [templateDownloading, setTemplateDownloading] = useState(false);
  const [auditMode, setAuditMode] = useState(false);
  const downloadTemplate = () => {
    setTemplateDownloading(true);
    window.setTimeout(() => setTemplateDownloading(false), 900);
  };
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
      <button type="button" className={`spt-icon-btn${auditMode ? ' is-active' : ''}`} onClick={() => { const next = !auditMode; setAuditMode(next); window.dispatchEvent(new CustomEvent('spt-audit-mode', { detail: next })); }} aria-pressed={auditMode} aria-label={auditMode ? 'Matikan mode audit anotasi' : 'Nyalakan mode audit anotasi'} title={auditMode ? 'Matikan mode audit anotasi' : 'Nyalakan mode audit anotasi'}><ActionIcon name="audit" /></button>
      <span className="spt-actions-sep" aria-hidden="true" />
      <button type="button" className="spt-icon-btn" onClick={onImport} aria-label="Import" title="Import"><ActionIcon name="import" /></button>
      <button type="button" className={`spt-icon-btn${templateDownloading ? ' is-busy' : ''}`} onClick={() => setDownloadsOpen(true)} aria-busy={templateDownloading} aria-label={templateDownloading ? 'Menyiapkan template Excel' : 'Unduh template Excel'} title={templateDownloading ? 'Menyiapkan template Excel' : 'Unduh template Excel'}>{templateDownloading ? <span className="spt-button-spinner" aria-hidden="true" /> : <ActionIcon name="template" />}</button>
      <button type="button" className="spt-icon-btn" onClick={() => setExamplesOpen(true)} aria-label="Muat contoh" title="Muat contoh"><ActionIcon name="backup" /></button>
      <button type="button" className="spt-icon-btn" onClick={onPrint} aria-label="Print" title="Print"><ActionIcon name="print" /></button>
      <button type="button" className="spt-icon-btn" onClick={onExport} aria-label="Ekspor" title="Ekspor"><ActionIcon name="export" /></button>
    </div>{downloadsOpen && <Dialog title="Unduhan Excel SPT OP" onClose={() => setDownloadsOpen(false)}><div className="spt-example-grid"><article className="spt-example-card"><h3>Formulir Excel untuk staf</h3><p>Replika 17 halaman formulir SPT OP. Isi kotak kuning muda dan simpan file untuk dikumpulkan.</p><a className="spt-download-link" href="/tools/spt-op/PuspitaCore_Formulir_SPT_OP_Staf.xlsx" download onClick={downloadTemplate}>Unduh formulir Excel untuk staf</a></article><article className="spt-example-card"><h3>Template impor teknis</h3><p>Format tabel untuk diimpor ke SPT OP Studio. Ini berbeda dari formulir pengisian staf.</p><a className="spt-download-link" href="/tools/spt-op/PuspitaCore_SPT_OP_Import_Excel.xlsx" download onClick={downloadTemplate}>Unduh template impor</a></article></div></Dialog>}{examplesOpen && <Dialog title="Pilih contoh SPT OP" onClose={() => setExamplesOpen(false)}><p className="spt-example-intro">Pilih skenario untuk memuatnya ke Studio, atau unduh workbook Excel untuk dipelajari dan diimpor kembali.</p><div className="spt-example-grid">{exampleScenarios.map(example => <article className="spt-example-card" key={example.file}><h3>{example.title}</h3><p>{example.description}</p><div className="spt-actions"><button className="primary" onClick={() => { setExamplesOpen(false); window.dispatchEvent(new CustomEvent('spt-load-example', { detail: example.file })); }}>Muat contoh</button><a className="spt-download-link" href={examplePath(example.file)} download>Unduh Excel</a></div></article>)}</div></Dialog>}
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
