"use client";

import { useState } from "react";
import Link from "next/link";
import { CHAPTERS } from "@/lib/site-data";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export function TentangClient() {
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);

  const currentChapter = CHAPTERS.find((c) => c.id === activeChapter) || CHAPTERS[0];

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
                Bukan biografi. Ini cerita tentang bagaimana cara berpikirku terbentuk.
              </h1>
              <p className="lead muted">
                Dari angka menuju proses, dari proses menuju sistem, dan dari sistem menuju ekosistem yang dapat digunakan banyak orang.
              </p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto" }}>
              <strong>?</strong>
              <span>Editorial portrait · 1000 × 1000 px</span>
            </div>
          </div>
        </section>

        {/* Chapters Section */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container chapter-layout">
            <nav className="chapter-nav" aria-label="Bab halaman Tentang">
              {CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  className={`chapter-btn ${activeChapter === chapter.id ? "active" : ""}`}
                  onClick={() => setActiveChapter(chapter.id)}
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
                <p className="lead">{currentChapter.lead}</p>
                {currentChapter.quote && (
                  <div className="quote-block">
                    <p className="hand-note">{currentChapter.quote}</p>
                  </div>
                )}
                <p className="muted">{currentChapter.note}</p>
                {currentChapter.cta && (
                  <div style={{ marginTop: "32px" }}>
                    <Link href={currentChapter.cta.path} className="btn btn-primary">
                      {currentChapter.cta.label} →
                    </Link>
                  </div>
                )}
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
