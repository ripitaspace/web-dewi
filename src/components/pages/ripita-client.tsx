"use client";

import { useState } from "react";
import Link from "next/link";
import { ECOSYSTEM, FOCUS_ITEMS, type EcoNode } from "@/lib/site-data";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModalDialog } from "@/components/shared/modal-dialog";

export function RipitaClient() {
  const [activeNodeKey, setActiveNodeKey] = useState<string>("core");
  const [modalPreview, setModalPreview] = useState<{ title: string; node: EcoNode } | null>(null);

  const currentNode = ECOSYSTEM[activeNodeKey] || ECOSYSTEM.core;

  const nodeKeys = [
    { key: "finance", label: "Finance & Accounting" },
    { key: "tax", label: "Tax Tech" },
    { key: "logistics", label: "Logistics" },
    { key: "vendor", label: "Vendor CRM" },
    { key: "education", label: "Education" },
    { key: "knowledge", label: "Knowledge Base" },
    { key: "projects", label: "Operations" },
  ];

  return (
    <>
      <SiteHeader currentKey="ripita" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero - Dark Accent */}
        <section
          className="page-hero"
          style={{ background: "var(--selat)", color: "var(--gading)" }}
        >
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow" style={{ color: "var(--kunyit)" }}>
                RIPITA Ecosystem
              </span>
              <h1 className="display-lg">Pengetahuan seharusnya tidak berhenti sebagai teori.</h1>
              <p className="lead" style={{ color: "rgba(243,231,211,.78)" }}>
                RIPITA mengubah pengalaman kerja, proses bisnis, dan cara berpikir menjadi alat, produk, transaksi, dan ekosistem yang dapat digunakan serta dikembangkan.
              </p>
            </div>
            <div className="art-placeholder art-lg art-dark" style={{ marginInline: "auto" }}>
              <strong>?</strong>
              <span style={{ color: "rgba(243,231,211,.72)" }}>RIPITA hero artwork · 1000 × 1000 px</span>
            </div>
          </div>
        </section>

        {/* Interactive Ecosystem Map */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow text-selat">Peta Ekosistem</span>
                <h2 className="display-md">Pilih satu simpul untuk melihat perannya.</h2>
              </div>
              <p className="lead muted">
                PUSPITA menjadi front door & cara berpikir. RIPITA menjadi mesin yang menjalankan produk, data, transaksi, user account, dan operasional.
              </p>
            </div>

            <div className="ecosystem-shell">
              {/* Map Canvas */}
              <div className="ecosystem-map" aria-label="Peta ekosistem RIPITA">
                <button
                  className={`eco-center ${activeNodeKey === "core" ? "active" : ""}`}
                  onClick={() => setActiveNodeKey("core")}
                  type="button"
                >
                  RIPITA
                </button>

                {nodeKeys.map((node) => (
                  <button
                    key={node.key}
                    className={`eco-node ${activeNodeKey === node.key ? "active" : ""}`}
                    data-eco={node.key}
                    onClick={() => setActiveNodeKey(node.key)}
                    type="button"
                  >
                    {node.label}
                  </button>
                ))}
              </div>

              {/* Node Detail Card */}
              <div className="card card-pad eco-detail" id="ecoDetail">
                <span className="eyebrow text-selat">Simpul RIPITA</span>
                <h2 style={{ fontSize: "1.85rem", margin: "6px 0 12px" }}>{currentNode.title}</h2>
                <p className="lead" style={{ fontSize: "1.05rem" }}>
                  {currentNode.purpose}
                </p>
                <div style={{ margin: "14px 0" }}>
                  <span className="status active">{currentNode.status}</span>
                </div>
                <div className="route-line"></div>
                <strong style={{ display: "block", marginBottom: "10px", fontSize: "0.95rem" }}>
                  Produk, Modul, & Eksperimen:
                </strong>
                <ul style={{ paddingLeft: "20px", margin: "0 0 24px" }}>
                  {currentNode.products.map((p, idx) => (
                    <li key={idx} style={{ marginBottom: "6px" }}>
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  className="btn btn-primary"
                  onClick={() => setModalPreview({ title: currentNode.title, node: currentNode })}
                  type="button"
                >
                  Buka Modul Preview →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Focus Items / Currently Building */}
        <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow text-rempah">Fokus Utama</span>
                <h2 className="display-md">Yang Sedang Aktif Dibangun & Diuji</h2>
              </div>
            </div>

            <div className="focus-list" id="focusList">
              {FOCUS_ITEMS.map((item, index) => (
                <div key={item.title} className="focus-item">
                  <span className="focus-index">{String(index + 1).padStart(2, "0")}</span>
                  <strong style={{ fontSize: "1.2rem" }}>{item.title}</strong>
                  <span className={`status ${item.className}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manifesto / Call to Action */}
        <section className="section manifesto">
          <div className="container manifesto-grid">
            <div>
              <span className="eyebrow" style={{ color: "var(--kunyit)" }}>
                Arah Pengembangan
              </span>
              <h2 className="display-md" style={{ margin: "0 0 16px" }}>
                Membangun ekosistem yang berakar di Indonesia, bertumbuh untuk dunia.
              </h2>
              <p className="lead muted">
                Kami percaya kemampuan merancang sistem adalah kunci kemandirian ekonomi dan keunggulan profesional masa depan.
              </p>
              <div className="button-row" style={{ marginTop: "24px" }}>
                <Link href="/kerja-bersama" className="btn btn-dark">
                  Mulai Diskusi Kolaborasi
                </Link>
                <Link href="/karya" className="btn btn-light">
                  Lihat Karya Terkait
                </Link>
              </div>
            </div>

            <div className="art-placeholder art-lg art-dark" style={{ marginInline: "auto" }}>
              <strong>?</strong>
              <span style={{ color: "rgba(243,231,211,.75)" }}>Ecosystem Manifesto · 1000 × 1000 px</span>
            </div>
          </div>
        </section>
      </main>

      {/* Product/Module Preview Modal */}
      <ModalDialog
        isOpen={!!modalPreview}
        onClose={() => setModalPreview(null)}
        kicker={`RIPITA · ${modalPreview?.node.status || "Ecosystem"}`}
        title={modalPreview?.title || ""}
      >
        {modalPreview && (
          <div>
            <div className="art-placeholder art-md" style={{ margin: "10px auto 30px" }}>
              <strong>?</strong>
              <span>Ecosystem preview · 1200 × 800 px</span>
            </div>
            <p className="lead">{modalPreview.node.purpose}</p>
            <div className="route-line"></div>
            <h3 style={{ marginTop: "20px" }}>Daftar Modul Terintegrasi:</h3>
            <ul>
              {modalPreview.node.products.map((item, idx) => (
                <li key={idx} style={{ margin: "8px 0" }}>
                  <strong>{item}</strong> — Alur data otomatis dan validasi real-time.
                </li>
              ))}
            </ul>
            <div className="button-row" style={{ marginTop: "28px" }}>
              <Link href="/kerja-bersama" className="btn btn-primary">
                Diskusikan Integrasi Sistem Ini →
              </Link>
            </div>
          </div>
        )}
      </ModalDialog>

      <SiteFooter />
    </>
  );
}
