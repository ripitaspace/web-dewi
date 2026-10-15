"use client";

import { useState } from "react";
import { ModalDialog } from "@/components/shared/modal-dialog";

const PMK_168_PDF_URL =
  "https://pajak.go.id/sites/default/files/2024-02/PMK%20168%20Tahun%202023%20Tentang%20PPh%20Pasal%2021%20TER.pdf";

export function Pph21ReferenceDownload() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="btn primary"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </svg>
        Download PMK 168/2023
      </button>

      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        kicker="REFERENSI REGULASI"
        title="PMK 168 Tahun 2023"
      >
        <p>
          Dokumen resmi ini memuat ketentuan pemotongan Pajak Penghasilan Pasal 21 atas
          penghasilan sehubungan dengan pekerjaan, jasa, atau kegiatan wajib pajak orang pribadi.
        </p>
        <p className="muted">
          PDF akan dibuka dari situs resmi Direktorat Jenderal Pajak di tab baru.
        </p>
        <div className="button-row" style={{ marginTop: "24px" }}>
          <a
            href={PMK_168_PDF_URL}
            className="btn primary"
            target="_blank"
            rel="noreferrer"
          >
            Buka PDF Resmi ↗
          </a>
        </div>
      </ModalDialog>
    </>
  );
}
