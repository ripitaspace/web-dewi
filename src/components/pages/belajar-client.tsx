"use client";


import { useState, useMemo } from "react";
import Link from "next/link";
import { type BlogPost } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

interface BelajarClientProps {
  posts?: BlogPost[];
}

export function BelajarClient({ posts = [] }: BelajarClientProps) {
  const [selectedType, setSelectedType] = useState("Semua");

  const types = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
      if (p.topics) p.topics.forEach((t) => set.add(t));
    });
    return ["Semua", ...Array.from(set)];
  }, [posts]);

  const filteredProducts = useMemo(() => {
    if (selectedType === "Semua") return posts;
    return posts.filter((p) => {
      const matchCat = p.category && p.category.toLowerCase() === selectedType.toLowerCase();
      const matchTopic = p.topics && p.topics.some((t) => t.toLowerCase() === selectedType.toLowerCase());
      return matchCat || matchTopic;
    });
  }, [posts, selectedType]);

  return (
    <>
      <SiteHeader currentKey="belajar" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero */}
        <section className="page-hero">
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow text-delima">Catatan Belajar</span>
              <h1 className="display-lg">Pengetahuan yang dapat langsung digunakan.</h1>
              <p className="lead muted">
                Tempatku berbagi pengetahuan, tutorial, dan pengalaman belajar yang bisa kita praktikkan bersama.
              </p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto", overflow: "hidden", padding: 0 }}>
              <img
                src="/images/artworks/kecombrang-gouache.png"
                alt="Bunga Kecombrang Nusantara"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>Kecombrang · Belajar</span>
            </div>
          </div>
        </section>

        {/* Store Catalog Section */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container store-layout">
            <aside className="card store-sidebar">
              <span className="eyebrow text-delima">Filter Topik</span>
              <div className="store-filter" id="storeFilters" style={{ marginTop: "12px" }}>
                {types.map((type) => (
                  <button
                    key={type}
                    className={selectedType === type ? "active" : ""}
                    onClick={() => setSelectedType(type)}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </aside>

            <div>
              {filteredProducts.length > 0 ? (
                <div className="blog-grid" id="storeGrid">
                {filteredProducts.map((item, idx) => {
                  const topicsList = item.topics && item.topics.length > 0
                    ? item.topics
                    : [item.category || item.type || "PEMIKIRAN"];

                  const authorName = item.author && item.author !== "Author" ? item.author : "pus";
                  const hasImage = item.image && !item.image.includes("placeholder") && !item.image.startsWith("data:image/svg+xml");

                  return (
                    <article key={item.id || idx} className="blog-card">
                      <div className="blog-card-cover">
                        {hasImage ? (
                          <img src={item.image} alt={item.title} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                        ) : <strong>?</strong>}
                      </div>
                      <div className="blog-topic-row">
                        {topicsList.map((topic) => (
                          <span className="topic-pill" key={topic}>{topic.toUpperCase()}</span>
                        ))}
                      </div>
                      <h3 className="blog-title">
                        <Link href={`/blog/${encodeURIComponent(item.slug || item.id)}`}>{item.title}</Link>
                      </h3>
                      <p className="blog-excerpt">{item.excerpt}</p>
                      <div className="blog-card-foot">
                        <div className="blog-card-byline">
                          <img className="blog-author-avatar" src="/author-avatar.jpg" alt="" />
                          <span className="blog-author">{authorName}</span>
                          <time className="blog-date">{item.date}</time>
                        </div>
                        <Link className="blog-link" href={`/blog/${encodeURIComponent(item.slug || item.id)}`}>
                          Baca artikel <span>→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
                </div>
              ) : (
                <div className="empty-state" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <h3>Belum ada materi belajar untuk topik ini.</h3>
                  <p className="muted">Silakan pilih topik lain.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
