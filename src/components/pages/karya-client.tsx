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

export function KaryaClient({ posts = [] }: KaryaClientProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedWork, setSelectedWork] = useState<BlogPost | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
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
            <div className="art-placeholder art-lg" style={{ marginInline: "auto", overflow: "hidden", padding: 0 }}>
              <img
                src="/images/artworks/sea-turtle-gouache.png"
                alt="Penyu Laut Nusantara"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>Penyu Laut · Karya</span>
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

            {filteredWorks.length > 0 ? (
              <div className="work-stack" id="workLibrary">
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
