"use client";

import { SystemState } from "@/components/system-state/system-state";
import { useMemo, useState } from "react";
import Link from "next/link";
import { type BlogPost } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { filterThoughts, getThoughtTopics, type ThoughtSort } from "./pemikiran-filters";

interface PemikiranClientProps {
  posts?: BlogPost[];
}

const featherLayers = [
  { id: "sharp-one", className: "peacock-feather--sharp-one" },
  { id: "sharp-two", className: "peacock-feather--sharp-two" },
  { id: "sharp-three", className: "peacock-feather--sharp-three" },
  { id: "sharp-four", className: "peacock-feather--sharp-four" },
  { id: "blur-one", className: "peacock-feather--blur-one", blurred: true },
  { id: "blur-two", className: "peacock-feather--blur-two", blurred: true },
  { id: "blur-three", className: "peacock-feather--blur-three", blurred: true },
  { id: "blur-four", className: "peacock-feather--blur-four", blurred: true },
];

export function PemikiranClient({ posts = [] }: PemikiranClientProps) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [sort, setSort] = useState<ThoughtSort>("newest");
  const topics = useMemo(() => getThoughtTopics(posts), [posts]);
  const filteredPosts = useMemo(
    () => filterThoughts(posts, search, topic, sort),
    [posts, search, topic, sort]
  );
  const hasActiveFilters = search !== "" || topic !== "" || sort !== "newest";

  const handleResetFilters = () => {
    setSearch("");
    setTopic("");
    setSort("newest");
  };

  return (
    <>
      <SiteHeader currentKey="pemikiran" />

      <div className="fixed-parallax-bg pemikiran-feather-fixed-bg" aria-hidden="true">
        {featherLayers.map((feather) => (
          <img
            key={feather.id}
            className={`peacock-feather ${feather.className}${feather.blurred ? " peacock-feather--blurred" : ""}`}
            src="/images/artworks/peacock-feather-ornament.png"
            alt=""
          />
        ))}
      </div>

      <div className="pemikiran-page-content">
        <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero */}
        <section className="page-hero">
          <div className="container page-hero-grid pemikiran-hero-grid">
            <div>
              <span className="eyebrow text-selat">Arsip Pemikiran</span>
              <h1 className="display-lg">Hal-hal yang kupahami, pertanyakan, dan masih kuji.</h1>
              <p className="lead muted">
                Perpustakaan yang memuat esai, catatan, framework, diagram, pertanyaan, eksperimen, dan refleksi kasus.
              </p>
            </div>
            <div style={{ width: "min(640px, 100%)", aspectRatio: "1", marginInline: "auto" }}>
              <img
                src="/images/artworks/javan-peacock-gouache-transparent.png"
                alt="Merak Hijau Nusantara"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        </section>

        {/* Library Grid & Toolbar */}
        <section className="section-tight">
          <div className="container">
            <div className="thought-toolbar" role="search" aria-label="Cari dan filter pemikiran">
              <div className="thought-search thought-field">
                <label htmlFor="thoughtSearch">Cari pemikiran</label>
                <input
                  className="field-control"
                  id="thoughtSearch"
                  type="search"
                  placeholder="Cari judul, gagasan, atau topik…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="thought-toolbar-controls">
                <div className="thought-field">
                  <label htmlFor="thoughtTopic">Topik</label>
                  <select
                    className="field-control"
                    id="thoughtTopic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option value="">Semua topik</option>
                    {topics.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="thought-field">
                  <label htmlFor="thoughtSort">Urutkan</label>
                  <select
                    className="field-control"
                    id="thoughtSort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ThoughtSort)}
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="title">Judul A–Z</option>
                  </select>
                </div>
              </div>
              <div className="thought-results">
                <p role="status" aria-live="polite" aria-atomic="true">
                  Menampilkan {filteredPosts.length} dari {posts.length} artikel
                </p>
                {hasActiveFilters && (
                  <button type="button" className="thought-reset" onClick={handleResetFilters}>
                    Reset Filter
                  </button>
                )}
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
                          <time className="blog-date" dateTime={item.dateISO || undefined}>{item.date}</time>
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
              <SystemState type="empty" size="section"
                title={posts.length === 0 ? "Belum ada artikel." : "Belum ada hasil pencarian."}
                description={posts.length === 0 ? undefined : "Belum ada catatan yang cocok. Coba kata pencarian lain atau reset filter."}
              />
            )}
          </div>
        </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
