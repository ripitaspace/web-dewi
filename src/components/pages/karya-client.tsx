"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type BlogPost } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModalDialog } from "@/components/shared/modal-dialog";

interface KaryaClientProps {
  posts?: BlogPost[];
}

type MiniToolStatus = "available" | "maintenance";

interface MiniTool {
  number: string;
  category: "Business Essentials" | "Finance Essentials" | "Tax Essentials";
  title: string;
  description: string;
  icon: string;
  status: MiniToolStatus;
  href?: string;
}

const MINI_TOOL_CATEGORIES = ["Business Essentials", "Finance Essentials", "Tax Essentials"] as const;

const MINI_TOOLS: MiniTool[] = [
  { number: "09", category: "Tax Essentials", title: "Coretax Invoice Scraper & Renamer", description: "Ekstrak data dan rename faktur pajak.", icon: "▤", status: "available", href: "/karya/pajak/coretax" },
  { number: "01", category: "Business Essentials", title: "Quotation Generator", description: "Membuat surat penawaran harga.", icon: "“", status: "maintenance" },
  { number: "02", category: "Business Essentials", title: "Invoice Generator", description: "Membuat invoice atau tagihan pelanggan.", icon: "▤", status: "maintenance" },
  { number: "03", category: "Business Essentials", title: "Kuitansi Generator", description: "Membuat bukti penerimaan pembayaran.", icon: "✓", status: "maintenance" },
  { number: "04", category: "Business Essentials", title: "Purchase Order Generator", description: "Membuat surat pesanan pembelian.", icon: "↗", status: "maintenance" },
  { number: "05", category: "Business Essentials", title: "Surat Jalan Generator", description: "Membuat dokumen pengiriman barang.", icon: "→", status: "maintenance" },
  { number: "06", category: "Finance Essentials", title: "Bukti Kas & Bank Generator", description: "Membuat bukti kas/bank masuk dan keluar.", icon: "↔", status: "maintenance" },
  { number: "07", category: "Finance Essentials", title: "Kas & Pengeluaran Tracker", description: "Membuat rekap kas dan pengeluaran dari Excel.", icon: "⌁", status: "maintenance" },
  { number: "08", category: "Finance Essentials", title: "Laporan Keuangan Sederhana", description: "Membuat laba rugi dan neraca dari data terstruktur.", icon: "≋", status: "maintenance" },
  { number: "10", category: "Tax Essentials", title: "Kalkulator Pajak", description: "Menghitung PPN dan PPh dasar.", icon: "%", status: "maintenance" },
];

export function KaryaClient({ posts = [] }: KaryaClientProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedWork, setSelectedWork] = useState<BlogPost | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>(MINI_TOOL_CATEGORIES);
    posts.forEach((p) => {
      if (p.category) cats.add(p.category);
      if (p.topics) p.topics.forEach((t) => cats.add(t));
    });
    return ["Semua", ...Array.from(cats)];
  }, [posts]);

  const filteredWorks = useMemo(() => {
    if (activeCategory === "Semua") return posts;
    return posts.filter((w) => {
      const matchCat = w.category && w.category.toLowerCase() === activeCategory.toLowerCase();
      const matchTopic = w.topics && w.topics.some((t) => t.toLowerCase() === activeCategory.toLowerCase());
      return matchCat || matchTopic;
    });
  }, [posts, activeCategory]);

  const filteredMiniTools = useMemo(() => (
    activeCategory === "Semua"
      ? MINI_TOOLS
      : MINI_TOOLS.filter((tool) => tool.category === activeCategory)
  ), [activeCategory]);

  const hasVisibleWorks = filteredWorks.length > 0 || filteredMiniTools.length > 0;

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
            <div
              className="art-placeholder art-lg"
              style={{ marginInline: "auto", overflow: "hidden", padding: 0, background: "var(--gading)" }}
            >
              <img
                src="/images/artworks/djp-ripita-emblem.png"
                alt="Emblem DJP dengan palet dan ornamen RIPITA"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>

        {/* Work Stack Section */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div className="mini-tools-notice mini-tools-notice--centered">
              <span className="mini-tools-notice__icon" aria-hidden="true">⌁</span>
              <p><strong>Diproses di perangkatmu.</strong> Seluruh mini tools dirancang 100% offline, tanpa login, database pengguna, atau penyimpanan transaksi. Isi data secara manual atau unggah Excel/CSV, proses di browser, lalu unduh hasilnya.</p>
            </div>
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

            {hasVisibleWorks ? (
              <div className="work-stack" id="workLibrary">
                {filteredMiniTools.length > 0 && (
                  <section className="mini-tools-catalog" aria-label="Katalog mini tools RIPITA">
                    <div className="mini-tools-stack">
                      {filteredMiniTools.map((tool) => {
                        const content = <>
                          <div className="mini-tool-index" aria-label={`Tool ${tool.number}`}>{tool.number}</div>
                          <div className="mini-tool-icon" aria-hidden="true">
                            {tool.href ? <img src="/images/artworks/coretax-ripita-icon.png" alt="" /> : tool.icon}
                          </div>
                          <div className="mini-tool-copy">
                            <span className="topic-pill">{tool.category}</span>
                            <h3>{tool.title}</h3>
                            <p>{tool.description}</p>
                          </div>
                          <span className={`mini-tool-status mini-tool-status--${tool.status}`}>
                            <span aria-hidden="true">{tool.status === "available" ? "●" : "◌"}</span>
                            {tool.status === "available" ? "Available" : "Under Maintenance"}
                          </span>
                        </>;

                        return tool.href ? (
                          <Link key={tool.number} href={tool.href} className="mini-tool-card mini-tool-card--available card card-hover" aria-label={`Buka ${tool.title}`}>
                            {content}
                          </Link>
                        ) : (
                          <article key={tool.number} className="mini-tool-card mini-tool-card--maintenance card" aria-label={`${tool.title}: sedang dalam pengembangan`}>
                            {content}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )}
                {filteredWorks.map((item, idx) => {
                  const topicsList = item.topics && item.topics.length > 0
                    ? item.topics
                    : [item.type || "KARYA", item.category || "CASE STUDY"];

                  const itemArts = [
                    "/images/artworks/system-beetle-gouache.png",
                    "/images/artworks/coral-fish-gouache.png",
                    "/images/artworks/javan-leopard-gouache.png",
                  ];
                  const artSrc = item.image && !item.image.includes("placeholder") ? item.image : itemArts[idx % itemArts.length];

                  return (
                    <article key={item.id || idx} className="card card-hover work-card">
                      <div className="art-placeholder art-md" style={{ overflow: "hidden", padding: 0 }}>
                        <img
                          src={artSrc}
                          alt={item.title}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <strong>?</strong>
                        <span>{item.title}</span>
                      </div>
                      <div>
                        <div className="blog-topic-row" style={{ marginBottom: "10px" }}>
                          {topicsList.map((topic, tIdx) => (
                            <span className="topic-pill" key={tIdx}>
                              {topic.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <h3 style={{ fontSize: "1.65rem", margin: "6px 0 14px" }}>{item.title}</h3>
                        <p className="muted" style={{ marginBottom: "12px" }}>
                          {item.excerpt}
                        </p>
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
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ textAlign: "center", padding: "60px 20px" }}>
                <h3>Belum ada karya untuk kategori ini.</h3>
                <p className="muted">Silakan pilih kategori lain.</p>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* Case Study Detail Modal */}
      <ModalDialog
        isOpen={!!selectedWork}
        onClose={() => setSelectedWork(null)}
        kicker={selectedWork ? `${(selectedWork.topics || [selectedWork.type]).join(" · ").toUpperCase()}` : "Detail"}
        title={selectedWork?.title || ""}
      >
        {selectedWork && (
          <div>
            <div className="art-placeholder art-md" style={{ margin: "10px auto 30px", overflow: "hidden", padding: 0 }}>
              <img
                src={selectedWork.image && !selectedWork.image.includes("placeholder") ? selectedWork.image : "/images/artworks/system-beetle-gouache.png"}
                alt="Case study artwork"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>{selectedWork.title}</span>
            </div>
            <h3 style={{ fontSize: "1.2rem", color: "var(--delima)" }}>Ringkasan Karya & Studi Kasus</h3>
            <p className="lead">{selectedWork.excerpt}</p>
            {selectedWork.content ? (
              <div style={{ marginTop: "20px", lineHeight: 1.8 }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--delima)" }}>Arsitektur Solusi</h3>
                <p>{selectedWork.content}</p>
              </div>
            ) : null}
            <div className="button-row" style={{ marginTop: "28px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
