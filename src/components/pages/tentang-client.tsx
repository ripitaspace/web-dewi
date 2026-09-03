"use client";

import { useState } from "react";
import Link from "next/link";
import { type TentangPageData } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

interface TentangClientProps {
  data?: TentangPageData;
  notionId?: string;
}

export function TentangClient({ data, notionId }: TentangClientProps) {
  const activeNotionId = data?.pageId || notionId;
  const chapters = data?.chapters || [];

  const hasChapters = chapters.length > 0;
  const [activeChapterId, setActiveChapterId] = useState(chapters[0]?.id || "");

  const currentChapter =
    chapters.find((c) => c.id === activeChapterId) || chapters[0];

  const title = data?.title || "Tentang Puspita";
  const lead = data?.lead || "";

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
                {title}
              </h1>
              {lead && (
                <p className="lead muted">
                  {lead}
                </p>
              )}
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto", overflow: "hidden", padding: 0 }}>
              <img
                src={data?.image && !data.image.includes("placeholder") && !data.image.startsWith("data:image/svg+xml") ? data.image : "/images/artworks/javan-leopard-gouache.png"}
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
            {hasChapters && currentChapter ? (
              <>
                <nav className="chapter-nav" aria-label="Bab halaman Tentang">
                  {chapters.map((chapter) => (
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
                    {(!currentChapter.blocks || currentChapter.blocks.length === 0) && currentChapter.lead && (
                      <p className="lead" dangerouslySetInnerHTML={{ __html: currentChapter.lead }} />
                    )}
                    {currentChapter.quote && (
                      <div className="quote-block">
                        <p
                          className="hand-note"
                          dangerouslySetInnerHTML={{
                            __html: `“${currentChapter.quote.replace(/^["“]|["”]$/g, "")}”`,
                          }}
                        />
                      </div>
                    )}
                    {currentChapter.blocks && currentChapter.blocks.length > 0 ? (
                      <div className="chapter-body" style={{ lineHeight: 1.8, marginTop: "20px" }}>
                        {currentChapter.blocks.map((block, bIdx) => {
                          // Prevent duplicate render if first quote is already shown in the top quote box
                          if (block.type === "quote" && block.text === currentChapter.quote) {
                            return null;
                          }

                          if (block.type === "heading_2") {
                            return (
                              <h3
                                key={bIdx}
                                style={{
                                  fontSize: "1.45rem",
                                  lineHeight: 1.3,
                                  marginTop: "28px",
                                  marginBottom: "12px",
                                  color: "var(--foreground)",
                                }}
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            );
                          }

                          if (block.type === "heading_3") {
                            return (
                              <h4
                                key={bIdx}
                                style={{
                                  fontSize: "1.2rem",
                                  lineHeight: 1.35,
                                  marginTop: "22px",
                                  marginBottom: "8px",
                                  color: "var(--foreground)",
                                }}
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            );
                          }

                          if (block.type === "quote") {
                            return (
                              <blockquote
                                key={bIdx}
                                style={{
                                  margin: "20px 0",
                                  paddingLeft: "16px",
                                  borderLeft: "3px solid var(--delima)",
                                  fontStyle: "italic",
                                  color: "var(--foreground)",
                                }}
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            );
                          }

                          if (block.type === "bulleted_list_item") {
                            return (
                              <li
                                key={bIdx}
                                style={{ marginLeft: "20px", marginBottom: "6px" }}
                                className="muted"
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            );
                          }

                          if (block.type === "numbered_list_item") {
                            return (
                              <li
                                key={bIdx}
                                style={{ marginLeft: "24px", marginBottom: "6px" }}
                                className="muted"
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            );
                          }

                          if (block.type === "callout") {
                            return (
                              <div
                                key={bIdx}
                                style={{
                                  padding: "16px 20px",
                                  borderRadius: "12px",
                                  background: "rgba(216, 195, 157, 0.2)",
                                  border: "1px solid var(--line)",
                                  margin: "18px 0",
                                }}
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            );
                          }

                          if (block.type === "toggle") {
                            return (
                              <p
                                key={bIdx}
                                style={{
                                  fontWeight: 700,
                                  marginTop: "20px",
                                  marginBottom: "8px",
                                  color: "var(--foreground)",
                                }}
                                dangerouslySetInnerHTML={{ __html: `▶ ${block.text}` }}
                              />
                            );
                          }

                          return (
                            <p
                              key={bIdx}
                              className="muted"
                              style={{ marginBottom: "16px" }}
                              dangerouslySetInnerHTML={{ __html: block.text }}
                            />
                          );
                        })}
                      </div>
                    ) : currentChapter.content ? (
                      <div style={{ lineHeight: 1.8, marginTop: "16px", whiteSpace: "pre-line" }}>
                        <p className="muted" dangerouslySetInnerHTML={{ __html: currentChapter.content }} />
                      </div>
                    ) : null}
                    <div style={{ marginTop: "32px" }}>
                      <Link href="/pemikiran" className="btn btn-primary">
                        Lihat Pustaka Pemikiran →
                      </Link>
                    </div>
                  </article>
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ textAlign: "center", padding: "60px 20px", gridColumn: "1 / -1" }}>
                <h3>Belum ada bab cerita yang dipublikasikan.</h3>
                <p className="muted">Konten akan tampil secara otomatis setelah bab dipublikasikan di Notion.</p>
              </div>
            )}
          </div>
        </section>

        {/* Dev Debug Button (DEV environment only) */}
        {process.env.NODE_ENV === "development" && activeNotionId && (
          <div
            className="container"
            style={{
              marginTop: "40px",
              marginBottom: "40px",
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.03)",
              border: "1px dashed var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              <strong style={{ color: "var(--foreground)" }}>🛠️ DEV DEBUG</strong> · Notion ID:{" "}
              <code style={{ fontSize: "0.8rem", background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
                {activeNotionId}
              </code>
            </div>
            <a
              href={`https://www.notion.so/${activeNotionId.replace(/-/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-small"
              style={{ textDecoration: "none", fontSize: "0.82rem" }}
            >
              Buka di Notion ↗
            </a>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

