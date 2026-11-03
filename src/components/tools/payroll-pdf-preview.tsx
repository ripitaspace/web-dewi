"use client";
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import styles from './pph21-document-workspace.module.css';

let library: Promise<typeof import('pdfjs-dist/legacy/build/pdf.mjs')> | undefined;
function loadPdfJs() {
    library ??= import('pdfjs-dist/legacy/build/pdf.mjs').then(pdfjs => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();
        return pdfjs;
    });
    return library;
}
export async function pdfPrintPages(bytes: Uint8Array) {
    const lib = await loadPdfJs(), task = lib.getDocument({ data: bytes.slice(), isEvalSupported: false });
    const pdf = await task.promise;
    try {
        const pages: { source: string; width: number; height: number }[] = [];
        for (let index = 1; index <= pdf.numPages; index++) {
            const page = await pdf.getPage(index), original = page.getViewport({ scale: 1 }), viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas'); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
            try {
                const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas cetak tidak tersedia.');
                await page.render({ canvas, canvasContext: context, viewport }).promise;
                pages.push({ source: canvas.toDataURL('image/png'), width: original.width / 72 * 25.4, height: original.height / 72 * 25.4 });
            } finally { canvas.width = 0; canvas.height = 0; page.cleanup(); }
        }
        return pages;
    } finally { await task.destroy(); }
}
export function PayrollPdfPreview({ bytes, title }: { bytes: Uint8Array; title: string }) {
    const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null), [pageNumber, setPageNumber] = useState(1);
    const [space, setSpace] = useState({ width: 500, height: 560 }), [zoom, setZoom] = useState('width'), [error, setError] = useState('');
    useEffect(() => {
        let disposed = false, task: ReturnType<typeof import('pdfjs-dist')['getDocument']> | undefined;
        loadPdfJs().then(lib => {
            if (disposed) return;
            task = lib.getDocument({ data: bytes.slice(), isEvalSupported: false });
            return task.promise.then(doc => { if (!disposed) { setPdf(doc); setPageNumber(1); setError(''); } });
        }).catch(e => { if (!disposed) setError(e instanceof Error ? e.message : 'Preview PDF gagal dimuat.'); });
        return () => { disposed = true; void task?.destroy(); };
    }, [bytes]);
    useEffect(() => {
        if (!host.current) return;
        const observer = new ResizeObserver(entries => setSpace({ width: Math.max(180, entries[0].contentRect.width - 40), height: Math.max(180, entries[0].contentRect.height - 40) }));
        observer.observe(host.current); return () => observer.disconnect();
    }, []);
    useEffect(() => { host.current?.scrollTo({ top: 0, left: 0 }); }, [bytes, pageNumber, zoom]);
    useEffect(() => {
        if (!pdf || !canvas.current) return;
        let disposed = false, render: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined;
        pdf.getPage(Math.min(pageNumber, pdf.numPages)).then(page => {
            if (disposed || !canvas.current) return;
            const natural = page.getViewport({ scale: 1 });
            const scale = zoom === 'page' ? Math.min(space.width / natural.width, space.height / natural.height) : zoom === 'width' ? space.width / natural.width : space.width / natural.width * Number(zoom);
            const viewport = page.getViewport({ scale }), density = Math.min(window.devicePixelRatio || 1, 2);
            const target = canvas.current; target.width = Math.ceil(viewport.width * density); target.height = Math.ceil(viewport.height * density);
            target.style.width = `${viewport.width}px`; target.style.height = `${viewport.height}px`;
            const context = target.getContext('2d'); if (!context) throw new Error('Canvas PDF tidak tersedia.');
            render = page.render({ canvas: target, canvasContext: context, viewport, transform: [density, 0, 0, density, 0, 0] });
            return render.promise.then(() => {
                if (disposed) return;
                host.current?.scrollTo({ top: 0, left: 0 });
            });
        }).catch(e => { if (!disposed && e?.name !== 'RenderingCancelledException') setError(String(e.message || e)); });
        return () => { disposed = true; render?.cancel(); };
    }, [pdf, pageNumber, space, zoom]);
    return <div className={styles.pdfPreview}>
        <div className={styles.pdfControls}>
            <button type="button" onClick={() => setZoom('width')}>Fit lebar</button>
            <label>Zoom <select aria-label="Zoom PDF" value={zoom} onChange={e => setZoom(e.target.value)}><option value="width">Fit lebar · default</option><option value="page">Halaman penuh</option><option value=".75">75%</option><option value="1">100%</option><option value="1.25">125%</option><option value="1.5">150%</option></select></label>
            <button type="button" aria-label="Halaman PDF sebelumnya" disabled={pageNumber <= 1} onClick={() => setPageNumber(n => n - 1)}>←</button>
            <span aria-live="polite">{pageNumber} / {pdf?.numPages || '…'}</span>
            <button type="button" aria-label="Halaman PDF berikutnya" disabled={!pdf || pageNumber >= pdf.numPages} onClick={() => setPageNumber(n => n + 1)}>→</button>
        </div>
        <div ref={host} className={styles.pdfCanvas} tabIndex={0} aria-label={`Preview ${title}`}>
            {error ? <p role="alert">Preview gagal: {error}</p> : <><canvas ref={canvas} role="img" aria-label={`${title}, halaman ${pageNumber}. Rincian teks tersedia di bawah preview.`}/>{!pdf && <p role="status">Memuat halaman PDF…</p>}</>}
        </div>
    </div>;
}
