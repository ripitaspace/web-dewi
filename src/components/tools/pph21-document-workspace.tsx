"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createDocumentSnapshot, categoryLabel, componentLabel, payrollColumns, payrollWorkbook, slipFileNames, xmlFiles, xmlTypes, type DocumentSnapshot, type PayrollPerson } from '@/modules/payroll/studio/documents';
import { XML_META, KINDS } from '@/modules/payroll/studio/catalog.js';
import { rupi } from '@/modules/payroll/studio/engine.js';
import { zipStore } from '@/modules/payroll/studio/zip.js';
import type { Studio } from '@/modules/payroll/studio/model';
import { PayrollPdfPreview, pdfPrintPages } from './payroll-pdf-preview';
import styles from './pph21-document-workspace.module.css';

type Preview = 'slip' | 'payroll' | 'xml';
type Confirmation = { title: string; lines: string[]; action: string; run: () => Promise<void> };
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);
const label = (p: PayrollPerson) => `${p.recipient.employeeId} · ${p.recipient.name || 'Tanpa nama'}`;

function HighlightXml({ text }: { text: string }) {
    // React escapes every token; generated XML is never inserted as HTML.
    return text.split(/(<[^>]*>)/g).map((part, i) => part.startsWith('<') ? <span className={styles.xmlTag} key={i}>{part.split(/("[^"]*")/g).map((token, n) => token.startsWith('"') ? <span className={styles.xmlValue} key={n}>{token}</span> : token)}</span> : part);
}
function Menu({ title, children, disabled }: { title: string; children: ReactNode; disabled: boolean }) {
    const ref = useRef<HTMLDetailsElement>(null);
    useEffect(() => {
        const close = (event: PointerEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false; };
        document.addEventListener('pointerdown', close); return () => document.removeEventListener('pointerdown', close);
    }, []);
    return <details ref={ref} name="payroll-document-menu" className={styles.menu} onKeyDown={e => { if (e.key === 'Escape' && ref.current) { ref.current.open = false; ref.current.querySelector('summary')?.focus(); } }}>
        <summary aria-disabled={disabled} onClick={e => { if (disabled) e.preventDefault(); }}>{title} <span aria-hidden="true">⌄</span></summary>
        <div className={styles.menuPanel} onClick={e => { if ((e.target as HTMLElement).closest('button:not(:disabled)') && ref.current) { ref.current.open = false; ref.current.querySelector('summary')?.focus(); } }}>{children}</div>
    </details>;
}
function ConfirmExport({ value, close, accept }: { value: Confirmation; close: () => void; accept: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
    return <dialog ref={ref} className={styles.confirm} aria-labelledby="export-confirm-title" onCancel={close}>
        <h3 id="export-confirm-title">{value.title}</h3>
        <div className={styles.confirmList}>{value.lines.map((line, i) => <p key={i}>{line}</p>)}</div>
        <div className={styles.actions}><button type="button" onClick={close} autoFocus>Batal</button><button type="button" className={styles.primary} onClick={accept}>{value.action}</button></div>
    </dialog>;
}

export function Pph21DocumentWorkspace({ state, logo, visible, repair }: { state: Studio; logo: string; visible: boolean; repair: (id: string, message: string) => void }) {
    const snapshot = useMemo(() => createDocumentSnapshot(state), [state]);
    const [activeId, setActiveId] = useState(''), [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState(''), [category, setCategory] = useState(''), [docFilter, setDocFilter] = useState('');
    const [preview, setPreview] = useState<Preview>('slip'), [xmlType, setXmlType] = useState('BPMP'), [listOpen, setListOpen] = useState(true);
    const [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [report, setReport] = useState<string[]>([]), [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    const alive = useRef(true), working = useRef(false), urls = useRef(new Map<string, ReturnType<typeof setTimeout>>());
    const printFrames = useRef(new Set<HTMLIFrameElement>());
    const printCleanups = useRef(new Set<() => void>());
    const previewBody = useRef<HTMLDivElement>(null);
    const active = snapshot.people.find(p => p.recipient.id === activeId) || snapshot.people[0];
    const selection = selected.filter(id => snapshot.people.some(p => p.recipient.id === id));
    const query = search.trim().toLocaleLowerCase('id-ID');
    const filtered = snapshot.people.filter(p => (!query || `${p.recipient.name} ${p.recipient.employeeId} ${p.recipient.id}`.toLocaleLowerCase('id-ID').includes(query)) && (!category || p.recipient.kind === category) && (!docFilter || p.summary.docType === docFilter));
    const hiddenSelected = selection.filter(id => !filtered.some(p => p.recipient.id === id)).length;
    const batch = snapshot.batches.find(b => b.type === xmlType)!;
    const xml = batch.count ? snapshot.engine.makeXml(xmlType, batch.list) : '';
    const recapErrors = snapshot.people.filter(p => p.hasPayment && p.errors.length);
    const recapReady = snapshot.people.length > 0 && !!state.company.name.trim() && !recapErrors.length;
    const [pdfResult, setPdfResult] = useState<{ snapshot: DocumentSnapshot; target: string; logo: string; bytes?: Uint8Array; error?: string } | null>(null);
    const target = preview === 'payroll' ? 'payroll' : active?.recipient.id || '';
    const currentPdf = pdfResult?.snapshot === snapshot && pdfResult.target === target && pdfResult.logo === logo ? pdfResult : null;

    useEffect(() => {
        alive.current = true; const resources = urls.current, frames = printFrames.current, cleanups = printCleanups.current;
        return () => { alive.current = false; resources.forEach((timer, url) => { clearTimeout(timer); URL.revokeObjectURL(url); }); resources.clear(); cleanups.forEach(cleanup => cleanup()); cleanups.clear(); frames.forEach(frame => frame.remove()); frames.clear(); };
    }, []);
    // Reconcile removed IDs during render; filtering never removes selections.
    if (selection.length !== selected.length) setSelected(selection);
    useEffect(() => {
        if (!visible || preview === 'xml' || !target) return;
        let cancelled = false;
        import('@/modules/payroll/studio/pdf').then(async pdfTools => {
            const bytes = target === 'payroll' ? await pdfTools.payrollPdf(snapshot) : await pdfTools.slipPdf(snapshot, snapshot.people.find(p => p.recipient.id === target)!, logo, true);
            if (!cancelled) setPdfResult({ snapshot, target, logo, bytes });
        }).catch(error => { if (!cancelled) setPdfResult({ snapshot, target, logo, error: errorMessage(error) }); });
        return () => { cancelled = true; };
    }, [snapshot, target, logo, visible, preview]);
    useEffect(() => { previewBody.current?.scrollTo({ top: 0 }); }, [preview, active?.recipient.id]);

    function objectUrl(blob: Blob, delay = 30000) {
        const url = URL.createObjectURL(blob);
        const timer = setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); }, delay);
        urls.current.set(url, timer); return url;
    }
    function download(name: string, content: string | Uint8Array | Blob, mime: string) {
        if (!alive.current) throw new Error('Sesi ekspor telah ditutup.');
        const blob = content instanceof Blob ? content : new Blob([typeof content === 'string' ? content : new Uint8Array(content)], { type: mime });
        const anchor = document.createElement('a'); anchor.href = objectUrl(blob); anchor.download = name; document.body.append(anchor); anchor.click(); anchor.remove();
    }
    async function run(action: () => Promise<void>) {
        if (working.current) return;
        working.current = true; setBusy(true); setNotice('Menyiapkan dokumen…'); setReport([]);
        try { await action(); } catch (error) { if (alive.current) setNotice(`Ekspor gagal: ${errorMessage(error)}`); }
        finally { working.current = false; if (alive.current) { setBusy(false); setProgress(null); } }
    }
    async function getPdf(kind: 'slip' | 'payroll') {
        if (kind === 'slip' && (!active || active.errors.length)) throw new Error(active?.errors.join(' ') || 'Pilih penerima.');
        if (kind === 'payroll' && !recapReady) throw new Error('Perbaiki validasi pembayaran sebelum mengunduh rekap.');
        const wanted = kind === 'payroll' ? 'payroll' : active.recipient.id;
        if (pdfResult?.snapshot === snapshot && pdfResult.target === wanted && pdfResult.logo === logo && pdfResult.bytes) return pdfResult.bytes;
        const pdfTools = await import('@/modules/payroll/studio/pdf');
        return kind === 'payroll' ? pdfTools.payrollPdf(snapshot) : pdfTools.slipPdf(snapshot, active, logo);
    }
    async function exportPdf(kind: 'slip' | 'payroll', print = false) {
        const bytes = await getPdf(kind);
        if (!alive.current) return;
        if (print) {
            const pages = await pdfPrintPages(bytes);
            if (!alive.current) return;
            const frame = document.createElement('iframe'); frame.title = 'Dokumen payroll untuk dicetak';
            frame.style.cssText = 'position:fixed;width:1px;height:1px;bottom:0;left:0;border:0;';
            const cleanup = () => { clearTimeout(timer); frame.remove(); printFrames.current.delete(frame); printCleanups.current.delete(cleanup); };
            printCleanups.current.add(cleanup);
            const timer = setTimeout(cleanup, 300000);
            frame.onload = () => { void (async () => {
                try {
                    await Promise.all(Array.from(frame.contentDocument?.images || []).map(image => image.decode()));
                    if (!alive.current || !frame.contentWindow) { cleanup(); return; }
                    frame.contentWindow.addEventListener('afterprint', cleanup, { once: true });
                    setNotice('Dokumen siap dicetak. Dialog cetak diminta dari halaman PDF yang sama dengan preview.');
                    frame.contentWindow.focus(); frame.contentWindow.print();
                } catch { cleanup(); if (alive.current) setNotice('Cetak otomatis dibatasi browser. Unduh PDF lalu cetak dari pembaca PDF.'); }
            })(); };
            const first = pages[0];
            frame.srcdoc = `<!doctype html><html lang="id"><head><title>Payroll ${snapshot.period}</title><style>@page{size:${first.width}mm ${first.height}mm;margin:0}html,body{margin:0;padding:0;background:white}img{display:block;width:${first.width}mm;height:${first.height}mm;break-after:page;page-break-after:always}img:last-child{break-after:auto;page-break-after:auto}</style></head><body>${pages.map((page, index) => `<img alt="Halaman ${index + 1}" src="${page.source}">`).join('')}</body></html>`;
            printFrames.current.add(frame); document.body.append(frame);
        } else {
            download(kind === 'payroll' ? `PAYROLL_INTERNAL_${snapshot.period}.pdf` : slipFileNames(snapshot).get(active.recipient.id)!, bytes, 'application/pdf');
            setNotice(`PDF ${kind === 'payroll' ? 'seluruh penerima' : label(active)} siap; unduhan dimulai.`);
        }
    }
    function requestXml(includeDraft: boolean, type?: string, copy = false) {
        let files: ReturnType<typeof xmlFiles>;
        try { files = xmlFiles(snapshot, includeDraft, type); }
        catch (error) { setNotice(`Ekspor gagal: ${errorMessage(error)}`); return; }
        if (!files.length) { setNotice('Tidak ada XML yang dapat diunduh untuk cakupan ini.'); return; }
        const issues = snapshot.batches.filter(b => files.some(f => f.type === b.type) && !b.ready).flatMap(b => b.issues.map(i => `${b.type} · ${snapshot.people.find(p => p.recipient.id === i.id)?.recipient.employeeId || i.id} · ${i.name}: ${i.text}`));
        const skipped = type ? [] : snapshot.batches.filter(b => b.count && !b.ready && !includeDraft).map(b => `${b.type}: ${b.count} dokumen tertahan; unduh sebagai draft untuk review.`);
        const action = async () => {
            if (files.some(file => new DOMParser().parseFromString(file.content, 'application/xml').querySelector('parsererror'))) throw new Error('Struktur XML rusak dan tidak dapat diunduh, termasuk sebagai draft.');
            if (copy) { await navigator.clipboard.writeText(files[0].content); setNotice(`${files[0].draft ? 'DRAFT XML' : 'XML'} disalin${files[0].draft ? ' — masih memerlukan perbaikan' : ''}.`); }
            else {
                if (type) download(files[0].name, files[0].content, 'application/xml;charset=utf-8');
                else download(`CORETAX_XML_${snapshot.period}${includeDraft ? '_TERMASUK_DRAFT' : ''}.zip`, zipStore(files), 'application/zip');
                setNotice(`Unduhan ${files.length} berkas XML dimulai${issues.length ? ' — termasuk DRAFT bermasalah' : ' — lolos validasi lokal'}${skipped.length ? `; ${skipped.length} tipe tertahan` : ''}.`);
            }
            setReport([...skipped, ...issues]);
        };
        if (issues.length) setConfirmation({ title: copy ? 'Salin XML draft?' : 'Unduh XML termasuk draft?', lines: [`Seluruh dokumen ${type || 'per tipe'} · ${snapshot.period}. Draft belum lolos validasi lokal.`, ...issues], action: copy ? 'Salin Draft' : 'Unduh Draft', run: action });
        else void run(action);
    }
    function requestBulk(scope: 'all' | 'selected') {
        const people = snapshot.people.filter(p => scope === 'all' || selection.includes(p.recipient.id)).sort((a, b) => a.recipient.employeeId.localeCompare(b.recipient.employeeId) || a.recipient.id.localeCompare(b.recipient.id));
        const eligible = people.filter(p => !p.errors.length), failures = people.filter(p => p.errors.length).map(p => `${label(p)}: ${p.errors.join(' ')}`);
        setConfirmation({ title: 'Download Bulk Slip', action: `Buat ${eligible.length} PDF & ZIP`, lines: [`${scope === 'all' ? 'Seluruh penerima' : 'Penerima yang dicentang'} · ${snapshot.period}. ${people.length} penerima dalam cakupan; ${eligible.length} PDF akan dibuat, ${failures.length} dilewati.`, ...failures], run: async () => {
            if (!eligible.length) throw new Error('Tidak ada penerima yang memenuhi syarat.');
            const { slipPdf } = await import('@/modules/payroll/studio/pdf'), names = slipFileNames(snapshot), files: { name: string; content: Uint8Array }[] = [];
            const errors = [...failures]; setProgress({ done: 0, total: eligible.length });
            for (let index = 0; index < eligible.length; index++) {
                if (!alive.current) return;
                const person = eligible[index];
                try { files.push({ name: names.get(person.recipient.id)!, content: await slipPdf(snapshot, person, logo) }); }
                catch (error) { errors.push(`${label(person)}: ${errorMessage(error)}`); }
                if (!alive.current) return;
                setProgress({ done: index + 1, total: eligible.length });
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            setReport(errors);
            if (!files.length) { setNotice(`Bulk gagal: 0 berhasil, ${errors.length} gagal/dilewati. ZIP tidak dibuat.`); return; }
            download(`SLIP_GAJI_BULK_${snapshot.period}.zip`, zipStore(files), 'application/zip');
            setNotice(`${errors.length ? 'Bulk selesai sebagian' : 'Bulk berhasil'}: ${files.length} PDF, ${errors.length} gagal/dilewati. Unduhan ZIP dimulai.`);
        } });
    }
    function choose(person: PayrollPerson) { setActiveId(person.recipient.id); setXmlType(person.summary.docType); }
    function toggle(id: string) { setSelected(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]); }
    function previewXml(type: string) { setXmlType(type); setPreview('xml'); }
    const xmlBlocks = xml ? (() => {
        const meta = XML_META[xmlType as keyof typeof XML_META], start = xml.indexOf(`    <${meta.item}>`), end = xml.lastIndexOf(`    </${meta.item}>`) + `    </${meta.item}>`.length;
        const blocks = xml.slice(start, end).split(new RegExp(`(?=    <${meta.item}>)`)).filter(Boolean);
        return { head: xml.slice(0, start), blocks, tail: xml.slice(end) };
    })() : null;

    return <div className={styles.root} hidden={!visible} aria-busy={busy}>
        <div className={styles.heading}><div><span className={styles.eyebrow}>04 / DOCUMENT WORKSPACE</span><h3>Slip pembayaran & XML Coretax</h3><p>Satu periode. Dua kebutuhan: payroll internal dan dokumen pajak.</p></div><button type="button" disabled={busy} onClick={() => { const fresh = createDocumentSnapshot(state); setNotice(`Validasi diperbarui: ${fresh.people.filter(p => p.errors.length).length} penerima perlu review pembayaran; ${fresh.docs.reduce((n, d) => n + d.errors.length, 0)} masalah XML. Pilihan tetap tersimpan.`); }}>Validasi Ulang</button></div>
        {notice && <div className={styles.toast} role="status"><span>{notice}</span><button type="button" aria-label="Tutup notifikasi" onClick={() => setNotice('')}>×</button></div>}
        {progress && <div className={styles.progress} role="status"><progress max={progress.total} value={progress.done}/><span>{progress.done} / {progress.total} PDF diproses</span></div>}
        {!!report.length && <details className={styles.warning} open><summary>{report.length} catatan ekspor</summary>{report.map((text, i) => <p key={i}>{text}</p>)}</details>}
        <div className={styles.workspace}>
            <aside className={styles.sidebar} aria-label="Daftar penerima dokumen">
                <div className={styles.listHeader}><div><strong>Penerima</strong><span>{snapshot.people.length} terdaftar · {filtered.length} terlihat</span></div><button type="button" className={styles.collapse} aria-expanded={listOpen} aria-controls="document-people" onClick={() => setListOpen(!listOpen)}>{listOpen ? 'Tutup daftar' : 'Pilih penerima'}</button></div>
                <div id="document-people" className={`${styles.listBody} ${!listOpen ? styles.collapsed : ''}`}>
                    <div className={styles.filters}><label>Cari penerima<input type="search" placeholder="Nama atau ID…" value={search} onChange={e => setSearch(e.target.value)}/></label><label>Kategori<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Semua kategori</option>{Object.entries(KINDS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label><label>Jenis dokumen<select value={docFilter} onChange={e => setDocFilter(e.target.value)}><option value="">Semua jenis</option>{xmlTypes.map(type => <option key={type}>{type}</option>)}</select></label></div>
                    <div className={styles.selection}><span>{selection.length} dicentang{hiddenSelected > 0 ? ` · ${hiddenSelected} di luar filter` : ''}</span><div><button type="button" disabled={!filtered.length} onClick={() => setSelected([...new Set([...selection, ...filtered.map(p => p.recipient.id)])])}>Pilih semua terlihat</button><button type="button" disabled={!selection.length} onClick={() => setSelected([])}>Batalkan pilihan</button></div></div>
                    <ul className={styles.people}>{filtered.map(p => <li key={p.recipient.id} className={p.recipient.id === active?.recipient.id ? styles.activePerson : ''}><input type="checkbox" aria-label={`Pilih ${label(p)} untuk bulk`} checked={selection.includes(p.recipient.id)} onChange={() => toggle(p.recipient.id)}/><button type="button" aria-pressed={p.recipient.id === active?.recipient.id} onClick={() => choose(p)}><div className={styles.personLine}><strong>{p.recipient.name || 'Tanpa nama'}</strong><span>{p.recipient.employeeId || p.recipient.id} · {categoryLabel(p.recipient.kind)}</span></div><div className={styles.personFooter}><span>Netto {rupi(p.summary.netCash)}</span><small className={p.errors.length ? styles.problem : styles.ok}>Payroll {p.errors.length ? 'review' : 'siap'}</small><small className={p.xmlErrors.length ? styles.problem : ''}>{p.summary.docType} {p.xmlDocs.length ? p.xmlErrors.length ? `${p.xmlErrors.length} masalah` : 'valid' : 'kosong'}</small></div></button></li>)}</ul>
                    {!filtered.length && <p className={styles.empty}>{snapshot.people.length ? 'Tidak ada penerima sesuai filter.' : 'Tambahkan penerima di Step 01 atau muat contoh.'}</p>}
                </div>
            </aside>
            <section className={styles.detail} aria-label="Document Preview">
                <div className={styles.toolbar}><div><span className={styles.eyebrow}>PERIODE {snapshot.period}</span><strong>{active?.recipient.name || 'Belum ada penerima aktif'}</strong>{active && !filtered.includes(active) && <small>Penerima aktif berada di luar filter.</small>}</div><div className={styles.actions}>
                    <Menu title="XML Pajak" disabled={busy}><p className={styles.menuCaption}>Seluruh periode aktif · tidak mengikuti checkbox/filter</p>{snapshot.batches.map(b => <div className={styles.xmlMenuRow} key={b.type}><div><strong>{b.type} · {b.count} dokumen</strong><small>{!b.count ? 'Tidak ada data' : b.ready ? 'Lolos validasi lokal' : `${b.issues.length} masalah · DRAFT`}</small></div><div className={styles.actions}><button type="button" onClick={() => previewXml(b.type)}>Preview XML</button><button type="button" disabled={busy || !b.count} onClick={() => requestXml(!b.ready, b.type)}>{b.ready ? 'Download XML' : 'Download XML Draft'}</button></div></div>)}<button type="button" disabled={busy || !snapshot.batches.some(b => b.ready)} onClick={() => requestXml(false)}>Download Semua XML Valid · ZIP</button><button type="button" disabled={busy || !snapshot.docs.length} onClick={() => requestXml(true)}>ZIP Semua XML Termasuk Draft</button></Menu>
                    <Menu title="Cetak Payroll" disabled={busy}><h4>Payroll Internal · seluruh penerima</h4><button type="button" onClick={() => setPreview('payroll')}>Preview rekap payroll</button><button type="button" disabled={busy || !recapReady} onClick={() => void run(() => exportPdf('payroll'))}>Download PDF Payroll Internal</button><button type="button" disabled={busy || !recapReady} onClick={() => void run(() => exportPdf('payroll', true))}>Cetak rekap payroll</button><button type="button" disabled={busy || !recapReady} onClick={() => void run(async () => { download(`PAYROLL_INTERNAL_${snapshot.period}.xlsx`, await payrollWorkbook(snapshot), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); setNotice('Rekap Excel seluruh penerima siap; unduhan dimulai.'); })}>Download rekap Excel</button><h4>Slip Individual · {active?.recipient.name || 'belum dipilih'}</h4><button type="button" disabled={!active} onClick={() => setPreview('slip')}>Preview slip penerima aktif</button><button type="button" disabled={busy || !active || !!active.errors.length} onClick={() => void run(() => exportPdf('slip'))}>Download PDF slip individual</button><button type="button" disabled={busy || !active || !!active.errors.length} onClick={() => void run(() => exportPdf('slip', true))}>Cetak slip individual</button><h4>Bulk Slip · satu PDF per penerima</h4><button type="button" disabled={busy || !snapshot.people.some(p => !p.errors.length)} onClick={() => requestBulk('all')}>Bulk seluruh penerima · {snapshot.people.filter(p => !p.errors.length).length} siap</button><button type="button" disabled={busy || !selection.length} onClick={() => requestBulk('selected')}>Bulk yang dicentang · {selection.length} penerima</button></Menu>
                </div></div>
                <div className={styles.previewTabs} role="tablist" aria-label="Jenis preview dokumen">{(['slip', 'payroll', 'xml'] as Preview[]).map((tab, index) => <button type="button" key={tab} id={`doc-tab-${tab}`} role="tab" aria-controls={`doc-preview-${tab}`} aria-selected={preview === tab} tabIndex={preview === tab ? 0 : -1} onClick={() => setPreview(tab)} onKeyDown={e => { const tabs: Preview[] = ['slip', 'payroll', 'xml']; const next = e.key === 'ArrowRight' ? (index + 1) % 3 : e.key === 'ArrowLeft' ? (index + 2) % 3 : e.key === 'Home' ? 0 : e.key === 'End' ? 2 : -1; if (next >= 0) { e.preventDefault(); setPreview(tabs[next]); document.getElementById(`doc-tab-${tabs[next]}`)?.focus(); } }}>{tab === 'slip' ? active?.title || 'Slip Pegawai / Pembayaran' : tab === 'payroll' ? 'Rekap Payroll Internal' : 'XML Coretax'}</button>)}</div>
                <div ref={previewBody} className={`${styles.previewBody} ${preview === 'slip' ? styles.slipPreviewBody : ''}`} role="tabpanel" id={`doc-preview-${preview}`} aria-labelledby={`doc-tab-${preview}`}>
                    {preview === 'xml' ? <>
                        <div className={styles.xmlToolbar}><label>Tipe XML<select value={xmlType} onChange={e => setXmlType(e.target.value)}>{snapshot.batches.map(b => <option key={b.type} value={b.type}>{b.type} · {b.count} dokumen</option>)}</select></label><button type="button" disabled={busy || !batch.count} onClick={() => requestXml(!batch.ready, xmlType, true)}>Copy XML{batch.count && !batch.ready ? ' Draft' : ''}</button><span className={batch.ready ? styles.ok : styles.problem}>{!batch.count ? 'Tidak ada dokumen' : batch.ready ? 'Lolos validasi lokal' : 'DRAFT · perlu perbaikan'}</span></div>
                        <p className={styles.scope}>Seluruh {batch.count} dokumen {xmlType} · {new Set(batch.list.map(d => d.recipientId)).size} penerima · {snapshot.period}. Blok berwarna menandai penerima aktif.</p>
                        {batch.issues.length > 0 && <details open className={styles.warning}><summary>{batch.issues.length} masalah XML</summary>{batch.issues.map((issue, i) => <div className={styles.issue} key={i}><p><strong>{snapshot.people.find(p => p.recipient.id === issue.id)?.recipient.employeeId || issue.id} · {issue.name}</strong><br/>{issue.text}</p><button type="button" onClick={() => repair(issue.id, issue.text)}>Perbaiki</button></div>)}</details>}
                        {xmlBlocks ? <pre className={styles.xmlCode} tabIndex={0} aria-label={`XML ${xmlType}, seluruh periode aktif`}><HighlightXml text={xmlBlocks.head}/>{xmlBlocks.blocks.map((block, index) => <span key={index} className={batch.list[index]?.recipientId === active?.recipient.id ? styles.xmlActive : undefined}><HighlightXml text={block}/></span>)}<HighlightXml text={xmlBlocks.tail}/></pre> : <p className={styles.empty}>Tidak ada dokumen {xmlType} pada periode ini. XML kosong tidak dibuat.</p>}
                        <p className={styles.scope}>Mengikuti referensi template DJP. Lolos validasi lokal bukan jaminan diterima saat impor Coretax.</p>
                    </> : !active ? <p className={styles.empty}>Belum ada data. Tambahkan penerima dan penghasilan di Step 01–02.</p> : <>
                        {preview === 'slip' && <div className={`${styles.documentStatus} ${active.errors.length ? styles.documentNeedsReview : styles.documentReady}`}><div><span>{active.errors.length ? 'PERLU REVIEW' : 'SIAP DIEKSPOR'}</span><strong>{active.title}</strong><small>{label(active)} · {snapshot.period}</small></div><p>{active.errors.length ? `${active.errors.length} hal perlu diperbaiki sebelum slip final dapat diunduh.` : `Bersih dibayarkan ${rupi(active.summary.netCash)}`}</p></div>}
                        {preview === 'payroll' && <p className={styles.scope}>Seluruh {snapshot.people.length} penerima · tidak mengikuti filter atau checkbox · {snapshot.period}</p>}
                        {(preview === 'slip' ? active.errors.length > 0 : !recapReady) && <div className={styles.warning}><strong>Pratinjau · perbaiki pembayaran sebelum ekspor final</strong>{(preview === 'slip' ? active.errors : recapErrors.flatMap(p => p.errors.map(e => `${label(p)}: ${e}`))).map((error, i) => <p key={i}>{error}</p>)}{!state.company.name.trim() && <p>Isi nama perusahaan.</p>}</div>}
                        {currentPdf?.error ? <p className={styles.warning} role="alert">PDF gagal dibuat: {currentPdf.error}</p> : currentPdf?.bytes ? <PayrollPdfPreview bytes={currentPdf.bytes} title={preview === 'payroll' ? 'Rekap Payroll Internal' : active.title}/> : <p className={styles.empty} role="status">Menyiapkan preview PDF…</p>}
                        <details className={styles.textDetails}><summary>Rincian dokumen dalam teks</summary>{preview === 'slip' ? <><h4>{active.recipient.name} · {active.title}</h4><dl>{Object.entries(active.parts).map(([key, value]) => <div key={key}><dt>{componentLabel(key)}</dt><dd>{rupi(value)}</dd></div>)}{[['Bruto pajak', active.summary.gross], ['Penghasilan tunai', active.summary.cash], ['PPh 21/26', active.summary.tax], ['Potongan nonpajak', active.summary.deductions], ['Bersih dibayarkan', active.summary.netCash]].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{rupi(Number(value))}</dd></div>)}</dl></> : <div className={styles.recapTable}><table><caption>Rekap seluruh penerima · {snapshot.period}</caption><thead><tr><th>ID</th><th>Nama</th><th>Kategori</th>{payrollColumns(snapshot).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{snapshot.people.map(p => <tr key={p.recipient.id}><td>{p.recipient.employeeId}</td><td>{p.recipient.name}</td><td>{categoryLabel(p.recipient.kind)}</td>{payrollColumns(snapshot).map(c => <td key={c.key}>{rupi(c.value(p))}</td>)}</tr>)}</tbody><tfoot><tr><th colSpan={3}>Total · {snapshot.people.length} penerima</th>{payrollColumns(snapshot).map(c => <td key={c.key}>{rupi(snapshot.people.reduce((sum, p) => sum + c.value(p), 0))}</td>)}</tr></tfoot></table></div>}</details>
                    </>}
                </div>
            </section>
        </div>
        {confirmation && <ConfirmExport
            value={confirmation}
            close={() => setConfirmation(null)}
            accept={() => { const action = confirmation.run; setConfirmation(null); void run(action); }}
        />}
    </div>;
}
