"use client";

import { useEffect, useRef, useState } from "react";
import {
  createInvoiceBookmarkletSource,
  createInvoiceBookmarkletUrl,
  type CoretaxBookmarkletKind,
  LAPTOP_KENTANG_DELAY_SECONDS,
} from "@/lib/invoice-bookmarklet";
import styles from "./invoice-extension-info.module.css";

interface InvoiceBookmarkletProps {
  laptopKentang?: boolean;
  kind?: CoretaxBookmarkletKind;
}

export function InvoiceBookmarklet({ laptopKentang = false, kind = "invoice" }: InvoiceBookmarkletProps) {
  const [notice, setNotice] = useState("");
  const [isDragGuideOpen, setIsDragGuideOpen] = useState(false);
  const bookmarkletLinkRef = useRef<HTMLAnchorElement>(null);
  const closeGuideButtonRef = useRef<HTMLButtonElement>(null);
  const isWithholdingSlip = kind === "withholding-slip";
  const bookmarkletName = isWithholdingSlip ? "Bupot Kentang" : laptopKentang ? "🥔 Faktur Kentang" : "Download Faktur";
  const recordLabel = isWithholdingSlip ? "Nomor Pemotongan" : "Nomor Faktur Pajak";
  const recordPlural = isWithholdingSlip ? "bukti potong" : "faktur";
  const source = createInvoiceBookmarkletSource(kind);
  const bookmarkletUrl = createInvoiceBookmarkletUrl(kind);
  const readableCodeSummary = `JavaScript terbaca · jeda ${LAPTOP_KENTANG_DELAY_SECONDS} detik`;
  const oneLineCodeSummary = `Kode bookmarklet satu baris · jeda ${LAPTOP_KENTANG_DELAY_SECONDS} detik`;

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

  async function copyBookmarklet() {
    try {
      await navigator.clipboard.writeText(bookmarkletUrl);
      setNotice(`Bookmarklet dengan jeda ${LAPTOP_KENTANG_DELAY_SECONDS} detik sudah disalin. Buat bookmark baru, lalu tempel kode ke kolom URL/alamat bookmark.`);
    } catch {
      setNotice("Browser tidak mengizinkan penyalinan otomatis. Buka Kode bookmarklet satu baris di bawah, lalu salin kodenya secara manual.");
    }
  }

  return (
    <section className={styles.bookmarklet} aria-labelledby="bookmarklet-title">
      <span className="eyebrow text-delima">ALTERNATIF BOOKMARKLET</span>
      <h2 id="bookmarklet-title">Simpan di bookmark, jalankan di Coretax{laptopKentang ? " 🥔" : "."}</h2>
      <p>{laptopKentang ? `Versi ringan untuk laptop kentang: jeda antar klik sudah diatur lebih aman, ${LAPTOP_KENTANG_DELAY_SECONDS} detik. Setiap faktur diperiksa ulang berdasarkan Nomor Faktur Pajak sebelum tombol download dipicu.` : `Simpan script ini sebagai bookmarklet. Setiap ${recordPlural} diperiksa ulang berdasarkan ${recordLabel} sebelum tombol download dipicu.`}</p>

      <div className="button-row">
        <a
          className="btn primary"
          href="#bookmarklet-guide"
          ref={(link) => {
            bookmarkletLinkRef.current = link;
            // React blocks javascript: href props. This is a local bookmarklet URL
            // intended as the browser's drag-to-bookmark target.
            if (link) link.setAttribute("href", bookmarkletUrl);
          }}
          draggable
          title={bookmarkletName}
          onClick={(event) => {
            event.preventDefault();
            setNotice(`Seret tombol ini ke Bookmark Bar. Bookmarklet akan memakai jeda ${LAPTOP_KENTANG_DELAY_SECONDS} detik saat dijalankan.`);
            setIsDragGuideOpen(true);
          }}
          aria-describedby="bookmarklet-guide"
        >{bookmarkletName}</a>
        <button type="button" className="btn" onClick={copyBookmarklet}>Salin bookmarklet</button>
      </div>
      <p>Seret tombol <strong>{bookmarkletName}</strong> ke Bookmark Bar untuk menyimpannya.</p>
      <p className={styles.notice} role="status">{notice}</p>
      <ol id="bookmarklet-guide" className={styles.bookmarkletGuide}>
        <li>Tampilkan Bookmark Bar dengan <strong>Ctrl+Shift+B</strong> (Windows) atau <strong>⌘+Shift+B</strong> (Mac).</li>
        <li>Seret tombol di atas ke Bookmark Bar. Alternatifnya, salin kode lalu buat bookmark bernama <strong>{bookmarkletName}</strong> dan tempel kode ke kolom URL.</li>
        <li>{isWithholdingSlip ? "Login ke Coretax, buka tabel Bukti Potong, dan pastikan dokumen yang tampil siap diunduh." : "Login ke Coretax, buka tabel Pajak Keluaran atau Pajak Masukan, dan pastikan faktur siap diunduh."}</li>
        <li>Klik bookmark yang disimpan. Periksa ringkasan hasil dan daftar Download browser sebelum menjalankannya lagi.</li>
      </ol>
      <p className={styles.guideNote}>Bookmarklet hanya memicu klik pada tombol download yang terlihat untuk {recordPlural} di halaman tabel aktif. Tombol yang gagal dipicu tidak diulang otomatis. Periksa daftar Download browser untuk memastikan file berhasil tersimpan dan mencegah dokumen ganda.</p>
      <details className={styles.codeDetails}>
        <summary>{readableCodeSummary}</summary>
        <label htmlFor="bookmarklet-readable-code">Gunakan versi ini untuk audit atau perawatan</label>
        <textarea id="bookmarklet-readable-code" readOnly value={source} rows={20} onFocus={(event) => event.currentTarget.select()} spellCheck={false} />
      </details>
      <details className={styles.codeDetails}>
        <summary>{oneLineCodeSummary}</summary>
        <label htmlFor="bookmarklet-code">Salin seluruh kode ini ke kolom URL bookmark</label>
        <textarea id="bookmarklet-code" readOnly value={bookmarkletUrl} rows={4} onFocus={(event) => event.currentTarget.select()} spellCheck={false} />
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
            <p>Drag <strong>{bookmarkletName}</strong> ke bar bookmark di atas browser. Jeda yang disimpan: {LAPTOP_KENTANG_DELAY_SECONDS} detik.</p>
            <button ref={closeGuideButtonRef} className="btn" type="button" onClick={closeDragGuide}>{laptopKentang ? "Mengerti, Kentang" : "Mengerti"}</button>
            <p className={styles.dragGuideShortcut}>Tekan <strong>Escape</strong> untuk menutup.</p>
          </div>
        </div>
      )}
    </section>
  );
}
