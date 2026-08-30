"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { WORKS, type WorkItem } from "@/lib/site-data";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModalDialog } from "@/components/shared/modal-dialog";

export function KaryaClient() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);

  const categories = useMemo(() => {
    return ["Semua", ...Array.from(new Set(WORKS.map((w) => w.category)))];
  }, []);

  const filteredWorks = useMemo(() => {
    if (activeCategory === "Semua") return WORKS;
    return WORKS.filter((w) => w.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <SiteHeader currentKey="karya" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero */}
        <section className="page-hero">
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow text-rempah">Karya & Case Study</span>
              <h1 className="display-lg">Karya menjelaskan pemikirannya. RIPITA menjalankan produknya.</h1>
              <p className="lead muted">
                Setiap karya dibaca sebagai konteks, persoalan, temuan utama, logika sistem, bentuk yang dibuat, dan kemungkinan pengembangannya.
              </p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto" }}>
              <strong>?</strong>
              <span>Works artwork · 1000 × 1000 px</span>
            </div>
          </div>
        </section>

        {/* Work Stack Section */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div className="tabs" id="workTabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="work-stack" id="workLibrary">
              {filteredWorks.map((item) => (
                <article key={item.id} className="card card-hover work-card">
                  <div className="art-placeholder art-md">
                    <strong>?</strong>
                    <span>{item.title}</span>
                  </div>
                  <div>
                    <div className="work-meta">
                      <span className="badge">{item.category}</span>
                      <span className={`status ${item.statusClass}`}>{item.status}</span>
                    </div>
                    <h3 style={{ fontSize: "1.65rem", margin: "6px 0 14px" }}>{item.title}</h3>
                    <span className="problem-label">Persoalan</span>
                    <p className="muted" style={{ marginBottom: "12px" }}>
                      {item.problem}
                    </p>
                    <span className="problem-label">Bentuk</span>
                    <p>{item.form}</p>
                  </div>
                  <div className="card-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => setSelectedWork(item)}
                      type="button"
                    >
                      Pelajari
                    </button>
                    <Link href="/ripita" className="btn btn-secondary btn-small">
                      Lihat di RIPITA
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Case Study Detail Modal */}
      <ModalDialog
        isOpen={!!selectedWork}
        onClose={() => setSelectedWork(null)}
        kicker={selectedWork ? `${selectedWork.category} · ${selectedWork.status}` : "Detail"}
        title={selectedWork?.title || ""}
      >
        {selectedWork && (
          <div>
            <div className="art-placeholder art-md" style={{ margin: "10px auto 30px" }}>
              <strong>?</strong>
              <span>Case study artwork · 1200 × 900 px</span>
            </div>
            <h3 style={{ fontSize: "1.2rem", color: "var(--delima)" }}>Business Problem</h3>
            <p>{selectedWork.problem}</p>
            <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>Key Insight</h3>
            <p className="muted">{selectedWork.insight}</p>
            <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>System or Solution</h3>
            <p>{selectedWork.form}</p>
            <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>Current Status</h3>
            <p>
              <span className={`status ${selectedWork.statusClass}`}>{selectedWork.status}</span>
            </p>
            <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>What Could Grow Next</h3>
            <p className="muted">{selectedWork.next}</p>
            <div className="button-row" style={{ marginTop: "28px" }}>
              <Link href="/ripita" className="btn btn-primary">
                Lihat Modul di RIPITA Ecosystem →
              </Link>
            </div>
          </div>
        )}
      </ModalDialog>

      <SiteFooter />
    </>
  );
}
