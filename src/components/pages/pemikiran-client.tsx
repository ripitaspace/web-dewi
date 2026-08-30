"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type BlogPost } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModalDialog } from "@/components/shared/modal-dialog";

interface PemikiranClientProps {
  posts?: BlogPost[];
}

export function PemikiranClient({ posts = [] }: PemikiranClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

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
                    : [item.type || "PEMIKIRAN", item.category || "UMUM"];

                  const itemArts = [
                    "/images/artworks/system-beetle-gouache.png",
                    "/images/artworks/coral-fish-gouache.png",
                    "/images/artworks/javan-leopard-gouache.png",
                  ];
                  const artSrc = item.image && !item.image.includes("placeholder") ? item.image : itemArts[idx % itemArts.length];

                  return (
                    <article key={item.id || idx} className="card card-pad card-hover library-card">
                      <div className="blog-card-avatar">
                        <img
                          src={artSrc}
                          alt={item.title}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <strong>?</strong>
                      </div>
                      <div className="blog-topic-row">
                        {topicsList.map((topic, tIdx) => (
                          <span className="topic-pill" key={tIdx}>
                            {topic.toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <h3 style={{ fontSize: "1.45rem", lineHeight: 1.25, marginBottom: "12px" }}>
                        {item.title}
                      </h3>
                      <p className="muted" style={{ fontSize: "0.95rem", flexGrow: 1 }}>
                        {item.excerpt}
                      </p>
                      <div className="card-actions">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setSelectedPost(item)}
                          type="button"
                        >
                          Baca Catatan
                        </button>
                      </div>
                      <p className="muted" style={{ marginTop: "18px", fontSize: "0.78rem" }}>
                        {item.date} · Oleh {item.author || "Rio Carisandy"}
                      </p>
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

      {/* Modal Dialog for Selected Post */}
      <ModalDialog
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        kicker={selectedPost ? `${(selectedPost.topics || [selectedPost.type]).join(" · ").toUpperCase()}` : "Detail"}
        title={selectedPost?.title || ""}
      >
        {selectedPost && (
          <div>
            <div className="art-placeholder art-md" style={{ margin: "10px auto 30px", overflow: "hidden", padding: 0 }}>
              <img
                src={selectedPost.image && !selectedPost.image.includes("placeholder") ? selectedPost.image : "/images/artworks/coral-fish-gouache.png"}
                alt="Article artwork"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>{selectedPost.title}</span>
            </div>
            <p className="lead">{selectedPost.excerpt}</p>
            <div className="route-line"></div>
            {selectedPost.content ? (
              <div style={{ marginTop: "24px", lineHeight: 1.8 }}>
                <p>{selectedPost.content}</p>
              </div>
            ) : (
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ marginTop: "20px" }}>Gagasan & Esensi</h3>
                <p className="muted">
                  {selectedPost.excerpt}
                </p>
              </div>
            )}
            <div style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem" }}>
              <strong>{selectedPost.date}</strong> · Penulis: <span>{selectedPost.author || "Rio Carisandy"}</span>
            </div>
          </div>
        )}
      </ModalDialog>

      <SiteFooter />
    </>
  );
}
