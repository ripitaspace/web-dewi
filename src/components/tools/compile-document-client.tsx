"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import styles from "./compile-document-client.module.css";

type DocumentKind = "pdf" | "image";

interface DocumentItem {
  id: string;
  file: File;
  kind: DocumentKind;
  pages?: number;
}

interface PreviewPage {
  id: string;
  itemId: string;
  file: File;
  kind: DocumentKind;
  pageNumber: number;
  thumbnailUrl: string | null;
}

interface PdfPage {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
}

interface PdfPreviewDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy: () => void;
}

interface PdfPreviewLibrary {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (source: { data: Uint8Array }) => { promise: Promise<PdfPreviewDocument> };
}

const ACCEPTED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
let pdfPreviewLibrary: Promise<PdfPreviewLibrary> | null = null;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

async function getPageCount(file: File) {
  if (file.type !== "application/pdf") return 1;

  try {
    const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    return source.getPageCount();
  } catch {
    return undefined;
  }
}

async function compressImage(file: File, quality: number) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
      nextImage.src = sourceUrl;
    });

    const maxDimension = 2200;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Kompresi gambar tidak didukung browser ini.");

    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Gagal menyiapkan gambar.");
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function getPdfPreviewLibrary() {
  if (!pdfPreviewLibrary) {
    pdfPreviewLibrary = import("pdfjs-dist/legacy/build/pdf.mjs").then((library) => {
      const pdfjs = library as unknown as PdfPreviewLibrary;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      return pdfjs;
    });
  }

  return pdfPreviewLibrary;
}

async function getImageElement(file: File) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
      image.src = sourceUrl;
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function createImagePreview(file: File, targetWidth: number) {
  const image = await getImageElement(file);
  const width = Math.max(1, Math.min(targetWidth, image.naturalWidth));
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Preview gambar tidak didukung browser ini.");

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#fffdf7";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

async function renderPdfPage(documentPdf: PdfPreviewDocument, pageNumber: number, targetWidth: number) {
  const page = await documentPdf.getPage(pageNumber);
  const originalViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / originalViewport.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Preview PDF tidak didukung browser ini.");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.8);
}

async function createPreviewPages(items: DocumentItem[]) {
  const pages: PreviewPage[] = [];
  const pdfjs = items.some((item) => item.kind === "pdf") ? await getPdfPreviewLibrary() : null;

  for (const item of items) {
    if (item.kind === "image") {
      try {
        pages.push({
          id: `${item.id}-page-1`,
          itemId: item.id,
          file: item.file,
          kind: item.kind,
          pageNumber: 1,
          thumbnailUrl: await createImagePreview(item.file, 112),
        });
      } catch {
        pages.push({ id: `${item.id}-page-1`, itemId: item.id, file: item.file, kind: item.kind, pageNumber: 1, thumbnailUrl: null });
      }
      continue;
    }

    try {
      const documentPdf = await pdfjs!.getDocument({ data: new Uint8Array(await item.file.arrayBuffer()) }).promise;
      for (let pageNumber = 1; pageNumber <= documentPdf.numPages; pageNumber += 1) {
        pages.push({
          id: `${item.id}-page-${pageNumber}`,
          itemId: item.id,
          file: item.file,
          kind: item.kind,
          pageNumber,
          thumbnailUrl: await renderPdfPage(documentPdf, pageNumber, 112),
        });
      }
      documentPdf.destroy();
    } catch {
      pages.push({ id: `${item.id}-page-1`, itemId: item.id, file: item.file, kind: item.kind, pageNumber: 1, thumbnailUrl: null });
    }
  }

  return pages;
}

export function CompileDocumentClient() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [quality, setQuality] = useState(76);
  const [outputName, setOutputName] = useState("Dokumen-Tergabung.pdf");
  const [previewPages, setPreviewPages] = useState<PreviewPage[]>([]);
  const [activePreviewPageId, setActivePreviewPageId] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<{ id: string; url: string | null } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Siap menerima dokumen.");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSize = useMemo(() => items.reduce((total, item) => total + item.file.size, 0), [items]);
  const totalPages = useMemo(() => items.reduce((total, item) => total + (item.pages ?? 1), 0), [items]);
  const estimatedOutputSize = useMemo(() => {
    const imageSize = items.filter((item) => item.kind === "image").reduce((total, item) => total + item.file.size, 0);
    const pdfSize = totalSize - imageSize;
    const imageCompression = 0.25 + (quality / 100) * 0.6;
    return pdfSize + imageSize * imageCompression;
  }, [items, quality, totalSize]);
  const activePreviewPage = previewPages.find((page) => page.id === activePreviewPageId) ?? previewPages[0];

  useEffect(() => {
    let cancelled = false;

    const buildPreviewPages = async () => {
      const nextPages = await createPreviewPages(items);
      if (cancelled) return;
      setPreviewPages(nextPages);
      setActivePreviewPageId((current) => nextPages.some((page) => page.id === current) ? current : (nextPages[0]?.id ?? null));
    };

    void buildPreviewPages();
    return () => { cancelled = true; };
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const renderActivePreview = async () => {
      if (!activePreviewPage) return;

      try {
        let url: string;
        if (activePreviewPage.kind === "image") {
          objectUrl = URL.createObjectURL(activePreviewPage.file);
          url = objectUrl;
        } else {
          const pdfjs = await getPdfPreviewLibrary();
          const documentPdf = await pdfjs.getDocument({ data: new Uint8Array(await activePreviewPage.file.arrayBuffer()) }).promise;
          url = await renderPdfPage(documentPdf, activePreviewPage.pageNumber, 820);
          documentPdf.destroy();
        }
        if (!cancelled) setActivePreview({ id: activePreviewPage.id, url });
      } catch {
        if (!cancelled) setActivePreview({ id: activePreviewPage.id, url: null });
      }
    };

    void renderActivePreview();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activePreviewPage]);

  const addFiles = async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList).filter((file) => ACCEPTED_TYPES.has(file.type));

    if (!selected.length) {
      setStatus("Pilih file PDF, JPG, PNG, atau WEBP.");
      return;
    }

    setStatus("Memeriksa dokumen…");
    const nextItems = await Promise.all(selected.map(async (file) => ({
      id: createId(file),
      file,
      kind: file.type === "application/pdf" ? "pdf" as const : "image" as const,
      pages: await getPageCount(file),
    })));
    setItems((current) => [...current, ...nextItems]);
    setStatus(`${nextItems.length} dokumen ditambahkan ke antrean.`);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles(event.target.files);
    event.target.value = "";
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus("Dokumen dihapus dari antrean.");
  };

  const selectDocumentPreview = (itemId: string) => {
    const firstPage = previewPages.find((page) => page.itemId === itemId);
    if (firstPage) setActivePreviewPageId(firstPage.id);
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const dropItem = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setItems((current) => {
      const from = current.findIndex((item) => item.id === draggedId);
      const to = current.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggedId(null);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files);
  };

  const exportPdf = async () => {
    if (!items.length) return;

    setIsExporting(true);
    setProgress(4);
    setStatus("Menyusun dokumen…");

    try {
      const result = await PDFDocument.create();
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        setProgress(Math.round(8 + (index / items.length) * 84));
        setStatus(`Memproses ${index + 1} dari ${items.length}: ${item.file.name}`);

        if (item.kind === "pdf") {
          const source = await PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: true });
          const copiedPages = await result.copyPages(source, source.getPageIndices());
          copiedPages.forEach((page) => result.addPage(page));
        } else {
          const image = await result.embedJpg(await compressImage(item.file, quality / 100));
          const page = result.addPage([595.28, 841.89]);
          const margin = 28;
          const availableWidth = page.getWidth() - margin * 2;
          const availableHeight = page.getHeight() - margin * 2;
          const scale = Math.min(availableWidth / image.width, availableHeight / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          page.drawImage(image, {
            x: (page.getWidth() - width) / 2,
            y: (page.getHeight() - height) / 2,
            width,
            height,
          });
        }
      }

      setProgress(96);
      setStatus("Menyiapkan file unduhan…");
      const bytes = await result.save({ useObjectStreams: true, addDefaultPage: false });
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      const fileName = outputName.trim().toLowerCase().endsWith(".pdf") ? outputName.trim() : `${outputName.trim() || "Dokumen-Tergabung"}.pdf`;
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setProgress(100);
      setStatus("Selesai. PDF gabungan siap digunakan.");
    } catch (error) {
      setProgress(0);
      setStatus(error instanceof Error ? error.message : "PDF belum dapat dibuat. Coba lagi dengan file lain.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.grid}>
        <div className={styles.controls}>
          <section className={`card ${styles.panel}`}>
            <div className={styles.queueHeader}>
              <div>
                <h2>Antrean dokumen</h2>
                <p>PDF, JPG, PNG, atau WEBP · diproses langsung di perangkatmu.</p>
              </div>
              <dl className={styles.summary} aria-label="Ringkasan antrean">
                <div><dt>FILE</dt><dd>{items.length}</dd></div>
                <div><dt>HALAMAN</dt><dd>{totalPages}</dd></div>
                <div><dt>UKURAN</dt><dd>{formatBytes(totalSize)}</dd></div>
                <div><dt>HASIL</dt><dd>~{formatBytes(estimatedOutputSize)}</dd></div>
              </dl>
            </div>
            <div
              className={styles.dropzone}
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
            >
              <input ref={inputRef} id="compile-file-input" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple onChange={handleFileInput} />
              <span aria-hidden="true" className={styles.uploadIcon}>+</span>
              <strong>Tarik dokumen ke sini</strong>
              <span>atau pilih PDF, JPG, PNG, maupun WEBP</span>
              <button type="button" className="btn" onClick={() => inputRef.current?.click()}>Pilih dokumen</button>
            </div>
            <div className={styles.fileList} aria-live="polite">
              {items.length ? items.map((item, index) => (
                <div
                  className={styles.fileRow}
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropItem(item.id)}
                >
                  <span className={styles.fileIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <button type="button" className={styles.previewSelect} onClick={() => selectDocumentPreview(item.id)} aria-label={`Preview ${item.file.name}`}>
                    <span>{item.kind === "pdf" ? "PDF" : "IMG"}</span>
                  </button>
                  <button type="button" className={styles.fileInfo} onClick={() => selectDocumentPreview(item.id)}>
                    <strong>{item.file.name}</strong>
                    <small>{item.pages ? `${item.pages} halaman · ` : ""}{formatBytes(item.file.size)}</small>
                  </button>
                  <div className={styles.rowActions}>
                    <button type="button" onClick={() => moveItem(item.id, -1)} disabled={index === 0} aria-label={`Naikkan ${item.file.name}`}>↑</button>
                    <button type="button" onClick={() => moveItem(item.id, 1)} disabled={index === items.length - 1} aria-label={`Turunkan ${item.file.name}`}>↓</button>
                    <button type="button" onClick={() => removeItem(item.id)} aria-label={`Hapus ${item.file.name}`}>×</button>
                  </div>
                </div>
              )) : <p className={styles.emptyQueue}>Belum ada file di antrean.</p>}
            </div>
            {!!items.length && <button className={styles.clearButton} type="button" onClick={() => { setItems([]); setActivePreviewPageId(null); setActivePreview(null); setStatus("Antrean dikosongkan."); }}>Kosongkan antrean</button>}
          </section>
        </div>

        <aside className={styles.sidebar}>
          <section className={`card ${styles.previewWorkspace}`}>
            <div className={styles.controlPanel}>
              <div className={styles.qualityControl}>
                <div className={styles.controlTitle}><span>Kompresi gambar</span><strong>{quality}%</strong></div>
                <input id="image-quality" className={styles.range} aria-label="Kualitas gambar" type="range" min="35" max="95" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
                <div className={styles.presets} aria-label="Preset kualitas gambar">
                  {[[58, "Kecil"], [76, "Seimbang"], [90, "Tajam"]].map(([value, label]) => <button type="button" className={quality === value ? styles.selectedPreset : ""} key={value} onClick={() => setQuality(value as number)}>{label}</button>)}
                </div>
              </div>
              <div className={styles.exportControl}>
                <label className={styles.outputLabel} htmlFor="output-name">Nama PDF</label>
                <input id="output-name" value={outputName} onChange={(event) => setOutputName(event.target.value)} />
                <button className="btn primary" type="button" disabled={!items.length || isExporting} onClick={() => void exportPdf()}>{isExporting ? "Menyusun…" : "Gabungkan & unduh"} <span aria-hidden="true">↓</span></button>
              </div>
              <div className={styles.status} aria-live="polite">
                <div><span>{status}</span><b>{isExporting || progress === 100 ? `${progress}%` : ""}</b></div>
                <i><em style={{ width: `${progress}%` }} /></i>
              </div>
            </div>
            <div className={styles.previewLayout}>
              <nav className={styles.thumbnailList} aria-label="Halaman dokumen">
                {previewPages.map((page, index) => (
                  <button key={page.id} type="button" className={`${styles.thumbnail} ${activePreviewPage?.id === page.id ? styles.activeThumbnail : ""}`} onClick={() => setActivePreviewPageId(page.id)} aria-label={`Buka halaman ${index + 1}`}>
                    {page.thumbnailUrl ? (
                      // Thumbnail dibuat dari file lokal pengguna.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={page.thumbnailUrl} alt="" />
                    ) : <span className={styles.thumbnailFallback}>{page.kind === "pdf" ? "PDF" : "IMG"}</span>}
                    <b>{index + 1}</b>
                  </button>
                ))}
              </nav>
              <div className={styles.previewArea}>
                {activePreviewPage && activePreview?.id === activePreviewPage.id && activePreview.url ? (
                  // Preview dibuat dari file lokal pengguna; image optimization tidak berlaku untuk sumber sementara ini.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activePreview.url} alt={`Preview ${activePreviewPage.file.name}, halaman ${activePreviewPage.pageNumber}`} />
                ) : activePreviewPage ? <div><span aria-hidden="true">…</span><p>Menyiapkan halaman {activePreviewPage.pageNumber}…</p></div> : <div><span aria-hidden="true">▣</span><p>Pilih atau tambahkan dokumen untuk melihatnya di sini.</p></div>}
              </div>
            </div>
            <p className={styles.previewCaption}>{activePreviewPage ? `${activePreviewPage.file.name} · halaman ${activePreviewPage.pageNumber}` : "Belum ada preview"}</p>
          </section>
        </aside>
      </div>
      <section className={`card ${styles.guide}`} aria-labelledby="compile-guide-title">
        <div className={styles.guideIntro}>
          <p className={styles.eyebrow}>PANDUAN SINGKAT</p>
          <h2 id="compile-guide-title">Cara menggunakan Compile Dokumen</h2>
          <p>Gabungkan beberapa PDF dan gambar menjadi satu dokumen tanpa perlu mengunggah file ke server.</p>
        </div>
        <ol className={styles.guideSteps}>
          <li><strong>Masukkan dokumen</strong><span>Klik area unggah atau tarik PDF, JPG, PNG, dan WEBP langsung ke halaman.</span></li>
          <li><strong>Periksa file yang dipilih</strong><span>Pastikan antrean, jumlah halaman, dan ukuran awalnya sudah sesuai.</span></li>
          <li><strong>Atur kualitas gambar</strong><span>Pilih Kecil, Seimbang, atau Tajam. Seimbang cocok untuk menjaga keterbacaan gambar.</span></li>
          <li><strong>Gabungkan dan unduh</strong><span>Tentukan nama file, lalu pilih Gabungkan &amp; unduh.</span></li>
          <li><strong>Periksa hasilnya</strong><span>Buka PDF yang diunduh dan pastikan halaman serta ukurannya sudah sesuai tujuan.</span></li>
        </ol>
        <div className={styles.guideNotes}>
          <div><h3>Perlu diketahui</h3><p>PDF asli digabungkan tanpa mengubah seluruh halaman menjadi gambar. Pengaturan kompresi terutama berlaku untuk file gambar, sehingga PDF yang sudah besar belum tentu otomatis mengecil.</p></div>
          <div><h3>Privasi tetap terjaga</h3><p>Dokumen diproses langsung di browser perangkatmu, tanpa diunggah ke server PuspitaCore.</p></div>
          <a href="/pemikiran">Baca panduan dan cerita di balik Compile Dokumen <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </div>
  );
}
