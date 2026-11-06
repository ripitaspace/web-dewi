'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { backup, catalog, draftKey, fresh, readBackup, type Draft } from '@/modules/spt-op/model';
import { compute, money } from '@/modules/spt-op/engine';
import { copyAssets, download, parseCSV, readWorkbook, type Worksheet } from '@/modules/spt-op/import-export';
import { Document, pageCount, PrintDetails } from './document';
import { Editor } from './editor';
import { Dialog } from './dialog';
import { ImportDialog } from './import-dialog';
import { useDrafts } from './use-drafts';
import './studio.css';
import { navigation, Topbar, Navigation } from './chrome';
import { type NavigationTarget } from './navigation-tree';
import { PrintDialog } from './print-dialog';
import { applyStamp } from './watermark';
import { firstPage, landscapePages, lastPage, pageNumbers, sheetLabel } from '@/modules/spt-op/coretax-map';
export function SptStudio() {
    const { draft, dispatch, ready, saved, list, save, replace, openDraft, reload, rescue, legacy, blocked } = useDrafts();
    const [section, setSection] = useState('profile'), [page, setPage] = useState(3), [part, setPart] = useState(0), [zoom, setZoom] = useState(100), [modal, setModal] = useState(''), [notice, setNotice] = useState(''), [sheets, setSheets] = useState<Worksheet[] | null>(null), [printPages, setPrintPages] = useState<number[]>([]), [pdfPages, setPdfPages] = useState<number[]>([]), [copyId, setCopyId] = useState(''), [focusId, setFocusId] = useState<string | null>(null), [isMaximized, setIsMaximized] = useState(false);
    const router = useRouter();
    const file = useRef<HTMLInputElement>(null), restoreFile = useRef<HTMLInputElement>(null), printRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        document.body.classList.toggle('spt-workspace-maximized', isMaximized);
        return () => document.body.classList.remove('spt-workspace-maximized');
    }, [isMaximized]);
    useEffect(() => { if (!pdfPages.length)
        return; let cancelled = false, removeStamp = () => {}; document.body.classList.add('spt-pdf-export');
        (async () => { try { await document.fonts?.ready; await Promise.all(Array.from(printRef.current?.querySelectorAll('img') || []).map(i => i.decode().catch(() => undefined))); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')]);
            const sheets = Array.from(printRef.current?.querySelectorAll<HTMLElement>('.spt-coretax .sheet') || []); if (!sheets.length) throw Error('no sheets'); let pdf: InstanceType<typeof jsPDF> | null = null; removeStamp = applyStamp(printRef.current, draft!);
            for (const [index, sheet] of sheets.entries()) { if (cancelled) return; const land = sheet.classList.contains('landscape'), w = land ? 330.2 : 215.9, h = land ? 215.9 : 330.2;
                const canvas = await html2canvas(sheet, { scale: 2.5, backgroundColor: '#ffffff', useCORS: true, logging: false }), format: [number, number] = [w, h], orientation = land ? 'landscape' : 'portrait';
                if (!pdf) pdf = new jsPDF({ orientation, unit: 'mm', format: [Math.min(w, h), Math.max(w, h)], compress: true }); else pdf.addPage([Math.min(w, h), Math.max(w, h)], orientation);
                void format; pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, w, h, undefined, 'FAST'); setNotice(`Menyiapkan PDF… ${index + 1}/${sheets.length}`); }
            if (cancelled || !pdf) return; const name = (draft?.profile.name || 'SPT_OP').replace(/[^\w\-]+/g, '_'); pdf.save(`SPT_OP_${draft?.profile.year ?? ''}_${name}.pdf`); setNotice('PDF selesai diunduh.'); }
          catch { if (!cancelled) setNotice('Gagal membuat PDF. Coba lagi.'); }
          finally { removeStamp(); document.body.classList.remove('spt-pdf-export'); if (!cancelled) setPdfPages([]); } })();
        return () => { cancelled = true; document.body.classList.remove('spt-pdf-export'); }; }, [pdfPages]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { if (!printPages.length)
        return; let cancelled = false, removeStamp = () => {}; const after = () => { removeStamp(); document.body.classList.remove('spt-printing'); setPrintPages([]); }; document.body.classList.add('spt-printing'); window.addEventListener('afterprint', after); Promise.all(Array.from(printRef.current?.querySelectorAll('img') || []).map(i => i.decode())).then(() => { if (!cancelled) { removeStamp = applyStamp(printRef.current, draft!);
        window.print(); } }).catch(() => { setNotice('Gagal memuat formulir cetak. Coba lagi setelah semua halaman tersedia.'); after(); }); return () => { cancelled = true; document.body.classList.remove('spt-printing'); window.removeEventListener('afterprint', after); }; }, [printPages]);
    function choose(s: string) { setFocusId(null); setSection(s); setPage(navigation.find(n => n[1] === s)?.[3] || 3); setPart(0); }
    function navigate(target: NavigationTarget) {
        setSection(target.section);
        setPage(target.page);
        setPart(0);
        // Kolom tabel membuka editornya; hanya input formulir yang boleh menerima fokus langsung.
        setFocusId(['profile', 'questions', 'extras', 'partner', 'declaration', 'documentNotes'].includes(target.section) ? target.focusId || null : null);
    }
    function go(n: number) { setPage(n); setPart(0); setSection(navigation.find(x => x[3] === n)?.[1] || 'profile'); }
    useEffect(() => { if (!focusId) return; const frame = requestAnimationFrame(() => { const input = document.getElementById(`field-${focusId}`); input?.focus(); input?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }); return () => cancelAnimationFrame(frame); }, [focusId, section]);
    async function openFile(f?: File) { if (!f)
        return; try {
        if (f.size > 25 * 1024 * 1024)
            throw Error('Batas file 25 MB.');
        if (/\.json$/i.test(f.name)) {
            const d = readBackup(JSON.parse(await f.text()));
            const existing = list.find(x => draftKey(x) === draftKey(d));
            if (!window.confirm(existing ? 'Pulihkan backup dan timpa draft dengan identitas/periode ini?' : 'Pulihkan backup sebagai draft terpisah?'))
                return;
            if (await replace(existing ? { ...d, id: existing.id, revision: existing.revision } : d))
                setNotice('Backup dipulihkan.');
        }
        else {
            const wb = /\.xlsx$/i.test(f.name) ? await readWorkbook(f) : [{ name: f.name, rows: parseCSV(await f.text()) }];
            if (!wb.length || !wb.some(s => s.rows.length))
                throw Error('File kosong.');
            setSheets(wb);
        }
    }
    catch (e) {
        setNotice(e instanceof Error ? e.message : 'File gagal dibaca.');
    } }
    if (!ready || !draft)
        return <section className="spt-root" aria-label="SPT OP Studio"><p role="status">Memuat SPT OP Studio…</p></section>;
    const d: Draft = draft, results = compute(d);
    const counts = pageCount(d, page);
    return <section className={`spt-root${isMaximized ? ' spt-workspace-maximized' : ''}`} aria-label="SPT OP Studio"><div className="spt-screen"><Topbar onPrint={() => setModal('print')} onPdf={() => { setNotice('Menyiapkan PDF…'); setPdfPages(pageNumbers); }} pdfBusy={pdfPages.length > 0} draft={d} saved={saved} isMaximized={isMaximized} onToggleMaximize={() => setIsMaximized(value => !value)} onBack={async () => { if (await save())
        router.push('/karya'); }} onDrafts={() => setModal('drafts')} onSave={() => void save()} onValidate={() => choose('validation')} onImport={() => file.current?.click()} onBackup={() => download(`RIPITAX_SPT_OP_${d.profile.year}.json`, backup(d))} onExport={() => setModal('export')}/>{blocked && <div className="spt-warning" role="alert">{saved}<button onClick={() => { if (window.confirm('Muat draft dari penyimpanan dan buang perubahan lokal yang belum tersimpan?'))
        void reload().catch(() => setNotice('Draft gagal dimuat.')); }}>Muat draft terbaru</button><button onClick={rescue}>Simpan salinan (identitas dikosongkan)</button></div>}{notice && <div role="status" className="spt-notice">{notice}<button onClick={() => setNotice('')} aria-label="Tutup pemberitahuan">✕</button></div>}<div className="spt-app"><Navigation draft={d} section={section} onNavigate={navigate}/><section className="spt-workspace"><div className="spt-head"><small>SPT ORANG PRIBADI · DRAFT KERJA {d.profile.year}</small><h2>{catalog.PAGE_NAMES[page - 1]}</h2><p>Tampilan formulir dari prototype · pemeriksaan aturan dan pemetaan masih berlangsung.</p></div><div className="spt-kpis">{['net', 'tax', 'credit', 'balance'].map(key => { const r = results.find(r => r.key === key)!; return <button key={key} onClick={() => choose('summary')}><small>{r.label}</small><strong>{money(r.value)}</strong></button>; })}</div><div className="spt-mobile-nav"><label>Bagian<select value={section} onChange={e => choose(e.target.value)}>{navigation.map(([, k, t]) => <option value={k} key={k}>{t}</option>)}</select></label></div><div className="spt-toolbar"><button disabled={page === firstPage} onClick={() => go(page - 1)}>← Previous</button><label>Halaman<select value={page} onChange={e => go(Number(e.target.value))}>{pageNumbers.map(n => <option key={n} value={n}>{sheetLabel(n)}. {catalog.PAGE_NAMES[n - 1]}</option>)}</select></label><button disabled={page === lastPage} onClick={() => go(page + 1)}>Next →</button><button disabled={zoom === 55} onClick={() => setZoom(Math.max(55, zoom - 10))} aria-label="Zoom out">−</button><span>{zoom}%</span><button disabled={zoom === 170} onClick={() => setZoom(Math.min(170, zoom + 10))} aria-label="Zoom in">＋</button><button onClick={() => setModal('print')}>Preview / Print</button></div>{counts > 1 && <label>Lembar lanjutan<select value={part} onChange={e => setPart(Number(e.target.value))}>{Array.from({ length: counts }, (_, i) => <option key={i} value={i}>{i === 0 ? 'Utama' : `Lanjutan ${i}`}</option>)}</select></label>}<a className="spt-editor-jump" href="#spt-editor">Buka editor data ↓</a><div className="spt-stage"><div style={{ width: `${zoom}%`, minWidth: 350, maxWidth: (landscapePages.includes(page) ? 1300 : 860) * zoom / 100, flexShrink: 0 }}><Document draft={d} page={page} part={part} onField={(key, value) => dispatch({ type: 'field', group: 'profile', key, value })} onSet={(group, key, value) => dispatch({ type: 'field', group, key, value })} onSection={choose}/></div></div><p className="spt-footnote">Seluruh data juga disertakan dalam rincian cetak. Pemetaan isian lengkap dan hasil pajak memerlukan pembandingan dengan sumber resmi.</p></section><aside className="spt-inspector" id="spt-editor"><header><h2>{navigation.find(x => x[1] === section)?.[2]}</h2><small>Editor data · perubahan tersimpan otomatis</small></header><div className="spt-editor"><Editor key={section} draft={d} section={section} dispatch={dispatch} onSection={choose}/></div></aside></div></div><input ref={file} type="file" hidden accept=".xlsx,.csv,.tsv,.json" onChange={e => { void openFile(e.target.files?.[0]); e.target.value = ''; }}/><input ref={restoreFile} type="file" hidden accept=".json" onChange={e => { void openFile(e.target.files?.[0]); e.target.value = ''; }}/>{sheets && <ImportDialog sheets={sheets} initial={section} tables={d.tables} onClose={() => setSheets(null)} onImport={(key, rows) => { dispatch({ type: 'rows', key, rows: [...(d.tables[key] || []), ...rows] }); setSheets(null); choose(key); setNotice(`${rows.length} baris diimpor.`); }}/>}{modal === 'export' && <Dialog title="Ekspor data kerja" onClose={() => setModal('')}><div className="spt-actions"><button onClick={() => download(`RIPITAX_SPT_OP_${d.profile.year}.json`, backup(d))}>Backup seluruh data JSON</button><button onClick={() => { setModal(''); choose('xml'); }}>XML per lampiran</button><button onClick={() => setModal('print')}>Preview / cetak</button></div><p>Ekspor CSV tersedia pada editor setiap tabel.</p></Dialog>}{modal === 'drafts' && <Dialog title="Draft lokal" onClose={() => setModal('')}><div className="spt-actions"><button onClick={async () => { if (await replace(fresh()))
        setModal(''); }}>Draft baru</button><button onClick={() => restoreFile.current?.click()}>Restore JSON</button><button onClick={async () => { try {
        const old = legacy();
        if (window.confirm('Impor draft HTML lama sebagai draft baru? Data sumber tetap disimpan.'))
            await replace(old);
    }
    catch (e) {
        setNotice((e as Error).message);
    } }}>Impor draft HTML lama</button></div>{list.map(item => <div className="spt-record" key={item.id}><strong>{item.profile.name || 'Tanpa nama'} · {item.profile.year}</strong><small>{item.profile.sptStatus} / {item.profile.amendment} · {item.updatedAt}</small><button onClick={async () => { if (await openDraft(item.id))
        setModal(''); }}>Buka draft</button></div>)}<h3>Copy harta dan utang tahun sebelumnya</h3><select value={copyId} onChange={e => setCopyId(e.target.value)}><option value="">Pilih draft sumber</option>{list.filter(x => x.profile.tin === d.profile.tin && Number(x.profile.year) < Number(d.profile.year)).map(x => <option key={x.id} value={x.id}>{x.profile.name} · {x.profile.year}</option>)}</select><button disabled={!copyId} onClick={() => { const source = list.find(x => x.id === copyId); if (source && window.confirm('Tambahkan salinan harta/utang? Periksa duplikasi dan perbarui nilai akhir tahun.')) {
        dispatch({ type: 'replace', draft: copyAssets(source, d) });
        setModal('');
    } }}>Copy dan tinjau nilai</button></Dialog>}{modal === 'print' && <PrintDialog draft={d} page={page} onClose={() => setModal('')} onPrint={pages => { setModal(''); setPrintPages(pages); }}/>}<div className="spt-print" ref={printRef}>{(pdfPages.length ? pdfPages : printPages).flatMap(n => Array.from({ length: pageCount(d, n) }, (_, i) => <Document key={n + '-' + i} draft={d} page={n} part={i} print/>))}{printPages.length > 0 && !pdfPages.length && <PrintDetails draft={d}/>}</div></section>;
}
