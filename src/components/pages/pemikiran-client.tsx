"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type BlogPost } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

interface PemikiranClientProps {
  posts?: BlogPost[];
}

export function PemikiranClient({ posts = [] }: PemikiranClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");


  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => {
      if (p.category) cats.add(p.category);
      if (p.topics) p.topics.forEach((t) => cats.add(t));
    });
    return ["all", ...Array.from(cats)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = posts.filter((item) => {
      const topicsStr = (item.topics || []).join(" ");
      const haystack = `${item.title} ${item.excerpt} ${item.category} ${item.type} ${topicsStr}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesCategory =
        category === "all" ||
        item.category.toLowerCase() === category.toLowerCase() ||
        (item.topics && item.topics.some((t) => t.toLowerCase() === category.toLowerCase()));
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sort === "oldest") return (a.date || "").localeCompare(b.date || "");
      if (sort === "title") return a.title.localeCompare(b.title);
      return (b.date || "").localeCompare(a.date || ""); // newest
    });

    return result;
  }, [posts, search, category, sort]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
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
            <div className="art-placeholder art-lg" style={{ marginInline: "auto", overflow: "hidden", padding: 0 }}>
              <img
                src="/images/artworks/coral-fish-gouache.png"
                alt="Ikan Karang Nusantara"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span>Ikan Karang Nusantara</span>
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

            {filteredPosts.length > 0 ? (
              <div className="library-grid" id="thoughtLibrary">
                {filteredPosts.map((item, idx) => {
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

                  return (
                    <article key={item.id || idx} className="modern-blog-card">
                      <Link
                        href={`/blog/${item.slug || item.id}`}
                        className="modern-card-cover-link"
                        aria-label={item.title}
                      >
                        <div className="modern-card-cover">
                          <img
                            src={artSrc}
                            alt={item.title}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
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
                          <Link href={`/blog/${item.slug || item.id}`}>
                            {item.title}
                          </Link>
                        </h3>

                        <p className="modern-card-excerpt">
                          {item.excerpt}
                        </p>

                        <div className="modern-card-footer">
                          <div className="modern-author-avatar">
                            <span>{(item.author || "D").charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="modern-author-info">
                            <strong className="modern-author-name">{item.author || "Dewi"}</strong>
                            <time className="modern-author-date">{item.date}</time>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
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

      <SiteFooter />
    </>
  );
}
