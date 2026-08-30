"use client";

import { useState, useMemo } from "react";
import { THOUGHTS, formatIdDate, type ThoughtItem } from "@/lib/site-data";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModalDialog } from "@/components/shared/modal-dialog";

export function PemikiranClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selectedThought, setSelectedThought] = useState<ThoughtItem | null>(null);

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(THOUGHTS.map((t) => t.category)))];
  }, []);

  const formats = useMemo(() => {
    return ["all", ...Array.from(new Set(THOUGHTS.map((t) => t.format)))];
  }, []);

  const filteredThoughts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = THOUGHTS.filter((item) => {
      const haystack = `${item.title} ${item.excerpt} ${item.category} ${item.format} ${item.tags.join(" ")}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesCategory = category === "all" || item.category === category;
      const matchesFormat = format === "all" || item.format === format;
      return matchesSearch && matchesCategory && matchesFormat;
    });

    result.sort((a, b) => {
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.date.localeCompare(a.date); // newest
    });

    return result;
  }, [search, category, format, sort]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setFormat("all");
    setSort("newest");
  };

  return (
    <>
      <SiteHeader currentKey="pemikiran" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero */}
        <section className="page-hero">
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow text-selat">Arsip Pemikiran</span>
              <h1 className="display-lg">Hal-hal yang kupahami, pertanyakan, dan masih kuji.</h1>
              <p className="lead muted">
                Perpustakaan yang memuat esai, catatan, framework, diagram, pertanyaan, eksperimen, dan refleksi kasus.
              </p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto" }}>
              <strong>?</strong>
              <span>Thinking artwork · 1000 × 1000 px</span>
            </div>
          </div>
        </section>

        {/* Library Grid & Toolbar */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div className="toolbar">
              <input
                className="field-control"
                id="thoughtSearch"
                type="search"
                placeholder="Cari judul, gagasan, atau tag…"
                aria-label="Cari pemikiran"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="field-control"
                id="thoughtCategory"
                aria-label="Filter kategori"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">Semua kategori</option>
                {categories
                  .filter((c) => c !== "all")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <select
                className="field-control"
                id="thoughtFormat"
                aria-label="Filter format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="all">Semua format</option>
                {formats
                  .filter((f) => f !== "all")
                  .map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt}
                    </option>
                  ))}
              </select>
              <select
                className="field-control"
                id="thoughtSort"
                aria-label="Urutkan pemikiran"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Judul A–Z</option>
              </select>
            </div>

            {filteredThoughts.length > 0 ? (
              <div className="library-grid" id="thoughtLibrary">
                {filteredThoughts.map((item) => (
                  <article key={item.id} className="card card-pad card-hover library-card">
                    <div className="art-placeholder art-xs" style={{ marginBottom: "18px" }}>
                      <strong>?</strong>
                      <span>{item.format}</span>
                    </div>
                    <div className="meta" style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <span className="badge">{item.format}</span>
                      <span className="badge">{item.category}</span>
                    </div>
                    <h3 style={{ fontSize: "1.35rem", lineHeight: 1.25, marginBottom: "12px" }}>
                      {item.title}
                    </h3>
                    <p className="muted" style={{ fontSize: "0.95rem", flexGrow: 1 }}>
                      {item.excerpt}
                    </p>
                    <div className="card-actions">
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => setSelectedThought(item)}
                        type="button"
                      >
                        Baca Catatan
                      </button>
                    </div>
                    <p className="muted" style={{ marginTop: "18px", fontSize: "0.78rem" }}>
                      {formatIdDate(item.date)} · {item.readingTime} menit · {item.status}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state" id="thoughtEmpty">
                <h3>Tidak ada catatan yang cocok.</h3>
                <p className="muted">Coba ubah kata pencarian atau reset filter.</p>
                <button
                  className="btn btn-secondary"
                  id="resetThoughts"
                  onClick={handleResetFilters}
                  type="button"
                  style={{ marginTop: "16px" }}
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modal Dialog for Selected Thought */}
      <ModalDialog
        isOpen={!!selectedThought}
        onClose={() => setSelectedThought(null)}
        kicker={selectedThought ? `${selectedThought.format} · ${selectedThought.category}` : "Detail"}
        title={selectedThought?.title || ""}
      >
        {selectedThought && (
          <div>
            <div className="art-placeholder art-md" style={{ margin: "10px auto 30px" }}>
              <strong>?</strong>
              <span>Article artwork · 1200 × 800 px</span>
            </div>
            <p className="lead">{selectedThought.excerpt}</p>
            <div className="route-line"></div>
            <h3 style={{ marginTop: "24px" }}>Gagasan Utama</h3>
            <p className="muted">
              Pertumbuhan dan kompleksitas bisnis kerap menuntut transparansi alur transaksi dan integrasi sistem yang kokoh. Pemikiran ini menjembatani realitas operasional di lapangan dengan arsitektur data yang dapat direplikasi.
            </p>
            <h3 style={{ marginTop: "20px" }}>Pertanyaan Lanjutan</h3>
            <p className="muted">
              Apa bukti yang diperlukan? Siapa yang mengalami masalah ini? Produk atau modul mana di ekosistem RIPITA yang dapat mengotomatisasi solusi ini?
            </p>
            <div style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem" }}>
              <strong>{formatIdDate(selectedThought.date)}</strong> · {selectedThought.readingTime} menit membaca · Status: <span className="status active">{selectedThought.status}</span>
            </div>
          </div>
        )}
      </ModalDialog>

      <SiteFooter />
    </>
  );
}
