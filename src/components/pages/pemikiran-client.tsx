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
            <div className="thought-toolbar" aria-label="Cari dan filter pemikiran">
              <div className="thought-search">
                <input
                  className="field-control"
                  id="thoughtSearch"
                  type="search"
                  placeholder="Cari judul, gagasan, atau tag…"
                  aria-label="Cari pemikiran"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="thought-toolbar-controls">
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
            </div>

            {filteredPosts.length > 0 ? (
              <div className="blog-grid" id="thoughtLibrary">
                {filteredPosts.map((item, idx) => {
                  const topicsList = item.topics && item.topics.length > 0
                    ? item.topics
                    : [item.category || item.type || "PEMIKIRAN"];
                  const authorName = item.author && item.author !== "Author" ? item.author : "pus";
                  const hasImage = item.image && !item.image.includes("placeholder") && !item.image.startsWith("data:image/svg+xml");

                  return (
                    <article key={item.id || idx} className="blog-card">
                      <div className="blog-card-cover">
                        {hasImage ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : <strong>?</strong>}
                      </div>
                      <div className="blog-topic-row">
                        {topicsList.map((topic) => (
                          <span className="topic-pill" key={topic}>{topic.toUpperCase()}</span>
                        ))}
                      </div>
                      <h3 className="blog-title">
                        <Link href={`/blog/${item.slug || item.id}`}>{item.title}</Link>
                      </h3>
                      <p className="blog-excerpt">{item.excerpt}</p>
                      <div className="blog-card-foot">
                        <div className="blog-card-byline">
                          <img className="blog-author-avatar" src="/author-avatar.jpg" alt="" />
                          <span className="blog-author">{authorName}</span>
                          <time className="blog-date">{item.date}</time>
                        </div>
                        <Link className="blog-link" href={`/blog/${item.slug || item.id}`}>
                          Baca artikel <span>→</span>
                        </Link>
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
