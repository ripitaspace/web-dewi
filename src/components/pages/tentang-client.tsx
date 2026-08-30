"use client";

import { useState } from "react";
import Link from "next/link";
import { type TentangPageData, fallbackTentangData } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

interface TentangClientProps {
  data?: TentangPageData;
}

export function TentangClient({ data }: TentangClientProps) {
  const pageData = data && data.chapters && data.chapters.length > 0 ? data : fallbackTentangData;
  const [activeChapterId, setActiveChapterId] = useState(pageData.chapters[0].id);

  const currentChapter =
    pageData.chapters.find((c) => c.id === activeChapterId) || pageData.chapters[0];

  return (
    <>
      <SiteHeader currentKey="tentang" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero */}
        <section className="page-hero">
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow text-delima">Tentang Puspita</span>
              <h1 className="display-lg">
                {pageData.title}
              </h1>
              <p className="lead muted">
                {pageData.lead}
              </p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto", overflow: "hidden", padding: 0 }}>
              <img
                src={pageData.image && !pageData.image.includes("placeholder") ? pageData.image : "/images/artworks/javan-leopard-gouache.png"}
                alt="Macan Tutul Jawa"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>Macan Tutul Jawa</span>
            </div>
          </div>
        </section>

        {/* Chapters Section */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container chapter-layout">
            <nav className="chapter-nav" aria-label="Bab halaman Tentang">
              {pageData.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  className={`chapter-btn ${activeChapterId === chapter.id ? "active" : ""}`}
                  onClick={() => setActiveChapterId(chapter.id)}
                  type="button"
                >
                  {chapter.number.replace("Bab ", "")} · {chapter.title}
                </button>
              ))}
            </nav>

            <div>
              <article className="chapter-panel active" key={currentChapter.id}>
                <span className="eyebrow text-delima">{currentChapter.number}</span>
                <h2>{currentChapter.title}</h2>
                {currentChapter.lead && <p className="lead">{currentChapter.lead}</p>}
                {currentChapter.quote && (
                  <div className="quote-block">
                    <p className="hand-note">“{currentChapter.quote.replace(/^["“]|["”]$/g, "")}”</p>
                  </div>
                )}
                {currentChapter.content && (
                  <div style={{ lineHeight: 1.8, marginTop: "16px", whiteSpace: "pre-line" }}>
                    <p className="muted">{currentChapter.content}</p>
                  </div>
                )}
                <div style={{ marginTop: "32px" }}>
                  <Link href="/pemikiran" className="btn btn-primary">
                    Lihat Pustaka Pemikiran →
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
