"use client";

import { useEffect, useRef, useState } from "react";
import { INVOICE_BOOKMARKLET_URL } from "@/lib/invoice-bookmarklet";
import styles from "./invoice-extension-info.module.css";

export function InvoiceBookmarklet() {
  const [notice, setNotice] = useState("");
  const [isDragGuideOpen, setIsDragGuideOpen] = useState(false);
  const bookmarkletLinkRef = useRef<HTMLAnchorElement>(null);
  const closeGuideButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isDragGuideOpen) return;
      if (event.key === "Escape") {
        setIsDragGuideOpen(false);
        bookmarkletLinkRef.current?.focus();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeGuideButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDragGuideOpen]);

  useEffect(() => {
    if (isDragGuideOpen) closeGuideButtonRef.current?.focus();
  }, [isDragGuideOpen]);

  function closeDragGuide() {
    setIsDragGuideOpen(false);
    bookmarkletLinkRef.current?.focus();
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(INVOICE_BOOKMARKLET_URL);
      setNotice("Kode disalin. Buat bookmark baru, lalu tempel kode ke kolom URL/alamat bookmark.");
    } catch {
      setNotice("Browser tidak mengizinkan penyalinan otomatis. Buka Kode bookmarklet di bawah, lalu salin kodenya secara manual.");
    }
  }

  return (
    <section className={styles.bookmarklet} aria-labelledby="bookmarklet-title">
      <span className="eyebrow text-delima">ALTERNATIF BOOKMARKLET</span>
      <h2 id="bookmarklet-title">Simpan di bookmark, jalankan di Coretax.</h2>
      <p>Sambil menunggu extension, kamu bisa menyimpan script sebagai bookmarklet. Bookmarklet mengklik tombol download yang aktif pada halaman saat ini secara berurutan.</p>
      <div className="button-row">
        <a
          className="btn primary"
          href="#bookmarklet-guide"
          ref={(link) => {
            bookmarkletLinkRef.current = link;
            // React blocks javascript: href props. This is an intentional, local,
            // static bookmarklet URL used as the browser's drag-to-bookmark target.
            if (link) link.setAttribute("href", INVOICE_BOOKMARKLET_URL);
          }}
          draggable
          title="Download Faktur"
          onClick={(event) => {
            event.preventDefault();
            setNotice("Seret tombol ini ke Bookmark Bar. Setelah tersimpan, buka tabel faktur di Coretax lalu klik bookmark tersebut.");
            setIsDragGuideOpen(true);
          }}
          aria-describedby="bookmarklet-guide"
        >Download Faktur</a>
        <button type="button" className="btn" onClick={copyCode}>Salin kode bookmarklet</button>
      </div>
      <p>Seret tombol <strong>Download Faktur</strong> ke Bookmark Bar untuk menyimpannya.</p>
      <p className={styles.notice} role="status">{notice}</p>
      <ol id="bookmarklet-guide" className={styles.bookmarkletGuide}>
        <li>Tampilkan Bookmark Bar dengan <strong>Ctrl+Shift+B</strong> (Windows) atau <strong>⌘+Shift+B</strong> (Mac).</li>
        <li>Seret tombol di atas ke Bookmark Bar. Alternatifnya, salin kode lalu buat bookmark bernama <strong>Download Faktur</strong> dan tempel kode ke kolom URL.</li>
        <li>Login ke Coretax, buka tabel Pajak Keluaran atau Pajak Masukan, dan pastikan faktur siap diunduh.</li>
        <li>Klik bookmark yang disimpan. Tunggu antrean klik selesai, lalu periksa hasilnya di daftar Download browser.</li>
      </ol>
      <p className={styles.guideNote}>Browser memerlukan tindakanmu untuk menyimpan bookmark. Script ini belum diuji langsung pada kedua menu Coretax, tidak berpindah halaman, dan tidak memastikan file berhasil tersimpan. Jika browser meminta izin download beberapa file, tinjau permintaan tersebut. Jangan jalankan ulang sebelum memeriksa hasil download agar tidak terjadi duplikat.</p>
      <details className={styles.codeDetails}>
        <summary>Kode bookmarklet</summary>
        <label htmlFor="bookmarklet-code">Salin seluruh kode ini ke kolom URL bookmark</label>
        <textarea id="bookmarklet-code" readOnly value={INVOICE_BOOKMARKLET_URL} rows={4} onFocus={(event) => event.currentTarget.select()} spellCheck={false} />
      </details>
      {isDragGuideOpen && (
        <div className={styles.dragGuide} role="dialog" aria-modal="true" aria-labelledby="drag-guide-title">
          <div className={styles.dragGuideTarget} aria-hidden="true" />
          <div className={styles.dragGuideArrow} aria-hidden="true">
            <svg viewBox="0 0 180 250" focusable="false">
              <path d="M24 224C25 120 77 110 128 58" />
              <path d="M93 58H128V93" />
            </svg>
          </div>
          <div className={styles.dragGuideCard}>
            <span className="eyebrow text-delima">SIMPAN BOOKMARKLET</span>
            <h3 id="drag-guide-title">Seret tombol ke Bookmark Bar.</h3>
            <p>Drag <strong>Download Faktur</strong> ke bar bookmark di atas browser, mengikuti arah panah ini.</p>
            <button ref={closeGuideButtonRef} className="btn" type="button" onClick={closeDragGuide}>Mengerti</button>
            <p className={styles.dragGuideShortcut}>Tekan <strong>Escape</strong> untuk menutup.</p>
          </div>
        </div>
      )}
    </section>
  );
}
