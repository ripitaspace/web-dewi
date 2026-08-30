"use client";

import { useEffect } from "react";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kicker?: string;
  title: string;
  children: React.ReactNode;
}

export function ModalDialog({
  isOpen,
  onClose,
  kicker = "Detail",
  title,
  children,
}: ModalDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.classList.add("modal-open");
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-backdrop ${isOpen ? "open" : ""}`}
      id="modalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="modal" tabIndex={-1}>
        <header className="modal-head">
          <div>
            <span className="eyebrow text-delima" id="modalKicker">
              {kicker}
            </span>
            <h2 id="modalTitle">{title}</h2>
          </div>
          <button
            className="icon-btn"
            id="modalClose"
            aria-label="Tutup dialog"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </header>
        <div className="modal-body" id="modalBody">
          {children}
        </div>
      </section>
    </div>
  );
}
