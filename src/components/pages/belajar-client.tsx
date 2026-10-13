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
                <div className="store-grid" id="storeGrid">
                {filteredProducts.map((item, idx) => {
                  const topicsList = item.topics && item.topics.length > 0
                    ? item.topics
                    : [item.category || item.type || "PEMIKIRAN"];

                  const primaryTopic = topicsList[0] || "PEMIKIRAN";
                  const themeColors = [
                    { bg: "#38bdf8", text: "#ffffff" }, // cyan
                    { bg: "#6366f1", text: "#ffffff" }, // indigo
                    { bg: "#ec4899", text: "#ffffff" }, // pink
                    { bg: "#10b981", text: "#ffffff" }, // emerald
                    { bg: "#f59e0b", text: "#ffffff" }, // amber
                  ];
                  const topicKey = primaryTopic.toLowerCase();
                  let theme = themeColors[idx % themeColors.length];
                  if (topicKey.includes("tech") || topicKey.includes("tekno")) theme = { bg: "#38bdf8", text: "#ffffff" };
                  else if (topicKey.includes("pop") || topicKey.includes("bisnis") || topicKey.includes("system")) theme = { bg: "#6366f1", text: "#ffffff" };
                  else if (topicKey.includes("desain") || topicKey.includes("design") || topicKey.includes("karya")) theme = { bg: "#ec4899", text: "#ffffff" };
                  else if (topicKey.includes("uang") || topicKey.includes("account")) theme = { bg: "#10b981", text: "#ffffff" };

                  const itemArts = [
                    "/images/artworks/system-beetle-gouache.png",
                    "/images/artworks/coral-fish-gouache.png",
                    "/images/artworks/javan-leopard-gouache.png",
                  ];
                  const artSrc = item.image && !item.image.includes("placeholder") && !item.image.startsWith("data:image/svg+xml") ? item.image : itemArts[idx % itemArts.length];
                  const authorName = item.author && item.author !== "Author" ? item.author : "pus";

                  return (
                    <article key={item.id || idx} className="modern-blog-card">
                      <Link
                        href={`/blog/${encodeURIComponent(item.slug || item.id)}`}
                        className="modern-card-cover-link"
                        aria-label={item.title}
                      >
                        <div className="modern-card-cover">
                          <img src={artSrc} alt={item.title} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                        </div>
                      </Link>

                      <div className="modern-card-body">
                        <div className="modern-card-badges">
                          <span
                            className="modern-badge"
                            style={{ backgroundColor: theme.bg, color: theme.text }}
                          >
                            {primaryTopic.toUpperCase()}
                          </span>
                        </div>

                        <h3 className="modern-card-title">
                          <Link href={`/blog/${encodeURIComponent(item.slug || item.id)}`}>
                            {item.title}
                          </Link>
                        </h3>

                        <p className="modern-card-excerpt">
                          {item.excerpt}
                        </p>

                        <div className="modern-card-footer">
                          <div className="modern-author-avatar">
                            <img src="/author-avatar.jpg" alt={authorName} />
                          </div>
                          <div className="modern-author-info">
                            <strong className="modern-author-name">{authorName}</strong>
                            <time className="modern-author-date">{item.date}</time>
                          </div>
                        </div>
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
