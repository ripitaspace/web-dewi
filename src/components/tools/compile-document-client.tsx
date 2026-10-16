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

const ACCEPTED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

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

export function CompileDocumentClient() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [quality, setQuality] = useState(76);
  const [outputName, setOutputName] = useState("Dokumen-Tergabung.pdf");
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Siap menerima dokumen.");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSize = useMemo(() => items.reduce((total, item) => total + item.file.size, 0), [items]);
  const totalPages = useMemo(() => items.reduce((total, item) => total + (item.pages ?? 1), 0), [items]);
  const previewItem = items.find((item) => item.id === activePreview) ?? items[0];
  const previewUrl = useMemo(() => previewItem ? URL.createObjectURL(previewItem.file) : null, [previewItem]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

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
    setActivePreview((current) => current ?? nextItems[0].id);
    setStatus(`${nextItems.length} dokumen ditambahkan ke antrean.`);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles(event.target.files);
    event.target.value = "";
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (activePreview === id) setActivePreview(null);
    setStatus("Dokumen dihapus dari antrean.");
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
      <section className={styles.intro}>
        <div>
          <span className="topic-pill">100% DI PERANGKATMU</span>
          <h2>Rakit dokumen, tetap pegang kendali.</h2>
          <p>Gabungkan PDF dan gambar menjadi satu berkas rapi. Tidak ada unggahan, login, atau penyimpanan file di server kami.</p>
        </div>
        <dl className={styles.summary}>
          <div><dt>ANTREAN</dt><dd>{items.length} <small>file</small></dd></div>
          <div><dt>HALAMAN</dt><dd>{totalPages}</dd></div>
          <div><dt>UKURAN AWAL</dt><dd>{formatBytes(totalSize)}</dd></div>
        </dl>
      </section>

      <div className={styles.grid}>
        <div className={styles.controls}>
          <section className={`card ${styles.panel}`}>
            <div className={styles.panelHeading}><span>01 · UNGGAH</span><h2>Antrean dokumen</h2></div>
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
                  <button type="button" className={styles.previewSelect} onClick={() => setActivePreview(item.id)} aria-label={`Preview ${item.file.name}`}>
                    <span>{item.kind === "pdf" ? "PDF" : "IMG"}</span>
                  </button>
                  <button type="button" className={styles.fileInfo} onClick={() => setActivePreview(item.id)}>
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
            {!!items.length && <button className={styles.clearButton} type="button" onClick={() => { setItems([]); setActivePreview(null); setStatus("Antrean dikosongkan."); }}>Kosongkan antrean</button>}
          </section>

          <section className={`card ${styles.panel}`}>
            <div className={styles.panelHeading}><span>02 · KOMPRESI</span><h2>Jaga ukuran tetap ringan.</h2></div>
            <p className={styles.helpText}>PDF disalin tanpa mengubah teksnya. Gambar dikonversi dan dikompresi sebelum dimasukkan ke dokumen akhir.</p>
            <label className={styles.rangeLabel} htmlFor="image-quality"><span>Kualitas gambar</span><strong>{quality}%</strong></label>
            <input id="image-quality" className={styles.range} type="range" min="35" max="95" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
            <div className={styles.presets} aria-label="Preset kualitas gambar">
              {[[58, "Lebih kecil"], [76, "Seimbang"], [90, "Lebih tajam"]].map(([value, label]) => <button type="button" className={quality === value ? styles.selectedPreset : ""} key={value} onClick={() => setQuality(value as number)}>{label}</button>)}
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <section className={`card ${styles.panel} ${styles.previewPanel}`}>
            <div className={styles.panelHeading}><span>03 · PREVIEW</span><h2>Lihat dokumen</h2></div>
            <div className={styles.previewArea}>
              {previewItem && previewUrl ? (
                previewItem.kind === "pdf" ? <iframe title={`Preview ${previewItem.file.name}`} src={`${previewUrl}#toolbar=0&navpanes=0`} /> : (
                  // Blob URL dibuat dari file lokal pengguna; image optimization tidak berlaku untuk sumber sementara ini.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt={`Preview ${previewItem.file.name}`} />
                )
              ) : <div><span aria-hidden="true">▣</span><p>Pilih atau tambahkan dokumen untuk melihatnya di sini.</p></div>}
            </div>
            <p className={styles.previewCaption}>{previewItem ? previewItem.file.name : "Belum ada preview"}</p>
          </section>

          <section className={`card ${styles.panel} ${styles.exportPanel}`}>
            <div className={styles.panelHeading}><span>04 · EKSPOR</span><h2>PDF akhir</h2></div>
            <label className={styles.outputLabel} htmlFor="output-name">Nama file</label>
            <input id="output-name" value={outputName} onChange={(event) => setOutputName(event.target.value)} />
            <button className="btn primary" type="button" disabled={!items.length || isExporting} onClick={() => void exportPdf()}>{isExporting ? "Menyusun PDF…" : "Gabungkan & unduh PDF"} <span aria-hidden="true">↓</span></button>
            <div className={styles.status} aria-live="polite">
              <div><span>{status}</span><b>{isExporting || progress === 100 ? `${progress}%` : ""}</b></div>
              <i><em style={{ width: `${progress}%` }} /></i>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
