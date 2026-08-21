"use client";

import { useEffect, useRef, useState } from "react";
import type { BlogPost } from "@/modules/cms";

const HERO_OBJECTS = [
  {
    key: "note",
    className: "floating-object obj-note",
    depth: 0.55,
    scrollX: -180,
    scrollY: -160,
    scrollR: -12,
    info: "Catatan Puspita",
    fromX: "20px",
    children: (
      <div className="note-card idle-b">
        <div className="label">Catatan Puspita</div>
        <p>
          Beberapa persoalan tidak membutuhkan lebih banyak jawaban, tetapi cara
          melihat yang berbeda.
        </p>
      </div>
    ),
  },
  {
    key: "kpi",
    className: "floating-object obj-kpi",
    depth: 0.8,
    scrollX: 210,
    scrollY: -90,
    scrollR: 10,
    info: "KPI Card",
    children: (
      <div className="kpi-card idle-a">
        <small>Kas · Data simulasi</small>
        <strong>Rp180 jt</strong>
        <span>↓ 42% dari periode lalu</span>
      </div>
    ),
  },
  {
    key: "balance",
    className: "floating-object obj-balance",
    depth: 0.38,
    scrollX: -250,
    scrollY: 140,
    scrollR: -7,
    info: "Balance Sheet Explorer",
    children: (
      <div className="ui-card balance-card idle-c">
        <div className="card-head">
          <span>Neraca Mini</span>
          <span className="status-dot"></span>
        </div>
        <div className="mini-table">
          <strong>Aset</strong>
          <strong>Liabilitas + Ekuitas</strong>
          <div>
            <span>Kas</span>
            <b>180</b>
          </div>
          <div>
            <span>Utang</span>
            <b>350</b>
          </div>
          <div>
            <span>Piutang</span>
            <b>620</b>
          </div>
          <div>
            <span>Ekuitas</span>
            <b>650</b>
          </div>
          <div>
            <span>Persediaan</span>
            <b>200</b>
          </div>
          <div>
            <span>Total</span>
            <b>1.000</b>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "video",
    className: "floating-object obj-video",
    depth: 0.68,
    scrollX: 260,
    scrollY: 100,
    scrollR: 12,
    info: "Video Lesson",
    children: (
      <div className="video-card idle-a">
        <div className="play">▶</div>
        <div>
          <small>Video Lesson · 03:24</small>
          <strong>Mengapa laba tidak sama dengan kas?</strong>
        </div>
      </div>
    ),
  },
  {
    key: "cash",
    className: "floating-object obj-cash",
    depth: 0.48,
    scrollX: -80,
    scrollY: 220,
    scrollR: 0,
    info: "Cash Flow Bridge",
    children: (
      <div className="ui-card cash-card idle-b">
        <div className="card-head">
          <span>Cash Flow Bridge</span>
          <span className="drag-dots">⠿</span>
        </div>
        <div className="cash-list">
          <div className="cash-row">
            <span>Laba</span>
            <span>+120</span>
          </div>
          <div className="cash-row">
            <span>Piutang</span>
            <span>−90</span>
          </div>
          <div className="cash-row">
            <span>Persediaan</span>
            <span>−40</span>
          </div>
          <div className="cash-row final">
            <span>Perubahan kas</span>
            <span>−10</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "block",
    className: "floating-object obj-block",
    depth: 0.72,
    scrollX: 260,
    scrollY: 140,
    scrollR: 12,
    info: "Builder Block",
    children: (
      <div className="ui-card builder-block idle-c">
        <div className="card-head">
          <span>RP-FIN-03</span>
          <span className="drag-dots">⠿</span>
        </div>
        <div className="body">
          <strong>Cash Flow Bridge</strong>
          <p>
            Menghubungkan laba dengan perubahan modal kerja dan arus kas
            operasi.
          </p>
          <div className="drag-copy">Drag to knowledge canvas →</div>
        </div>
      </div>
    ),
  },
  {
    key: "art-a",
    className: "floating-object obj-art-a",
    depth: 0.9,
    scrollX: -240,
    scrollY: -20,
    scrollR: -10,
    info: "Artwork Kumbang",
    children: (
      <div className="art-placeholder idle-c">
        <strong>?</strong>
        <small>Kumbang · 1:1</small>
      </div>
    ),
  },
  {
    key: "art-b",
    className: "floating-object obj-art-b",
    depth: 0.82,
    scrollX: 220,
    scrollY: 100,
    scrollR: 10,
    info: "Artwork Gurita",
    children: (
      <div className="art-placeholder idle-b">
        <strong>?</strong>
        <small>Gurita · 1:1</small>
      </div>
    ),
  },
];

const UNIQUE_OBJECT_NAMES = Array.from(
  new Set(HERO_OBJECTS.map((item) => item.info))
);

interface LandingClientProps {
  blogPosts: BlogPost[];
}

export function LandingClient({ blogPosts }: LandingClientProps) {
  const [isReady, setIsReady] = useState(false);
  const [isNavCompact, setIsNavCompact] = useState(false);
  const [isBuilderInteractive, setIsBuilderInteractive] = useState(false);
  const [demoMode, setDemoMode] = useState<"baca" | "eksplorasi">("baca");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);

  const heroScrollRef = useRef<HTMLElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const objectRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const startIntro = () => {
    setIsReady(false);
    document.body.classList.remove("is-ready");
    window.requestAnimationFrame(() => {
      setIsReady(true);
      document.body.classList.add("is-ready");
    });
  };

  const handleReplay = () => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    window.setTimeout(startIntro, reducedMotion ? 0 : 420);
  };

  const showObjectInfo = (name: string) => {
    setIsInfoOpen(true);
    setHighlightedItem(name);
    window.setTimeout(() => {
      setHighlightedItem(null);
    }, 800);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startIntro();
    }, 120);

    const updateScrollScene = () => {
      if (!heroScrollRef.current) return;
      const rect = heroScrollRef.current.getBoundingClientRect();
      const total = Math.max(
        1,
        heroScrollRef.current.offsetHeight - window.innerHeight
      );
      const progressed = clamp(-rect.top / total, 0, 1);
      const heroOut = clamp(1 - progressed * 2.15, 0, 1);
      const builderIn = clamp((progressed - 0.24) / 0.47, 0, 1);

      const root = document.documentElement.style;
      root.setProperty("--scroll-p", progressed.toFixed(4));
      root.setProperty("--hero-out", heroOut.toFixed(4));
      root.setProperty("--builder-in", builderIn.toFixed(4));
      root.setProperty("--rasa-x", `${-120 * progressed}px`);
      root.setProperty("--rasa-y", `${-70 * progressed}px`);
      root.setProperty("--rasa-r", `${-4 * progressed}deg`);
      root.setProperty("--rasa-scale", String(1 - progressed * 0.14));
      root.setProperty("--rupa-x", `${130 * progressed}px`);
      root.setProperty("--rupa-y", `${-30 * progressed}px`);
      root.setProperty("--rupa-r", `${-2 + 6 * progressed}deg`);
      root.setProperty("--rupa-scale", String(1 - progressed * 0.1));
      root.setProperty("--ide-x", `${-150 * progressed}px`);
      root.setProperty("--ide-y", `${90 * progressed}px`);
      root.setProperty("--ide-r", `${5 * progressed}deg`);
      root.setProperty("--sistem-x", `${160 * progressed}px`);
      root.setProperty("--sistem-y", `${85 * progressed}px`);
      root.setProperty("--sistem-r", `${-5 * progressed}deg`);
      root.setProperty("--copy-y", `${80 * progressed}px`);
      root.setProperty("--builder-y", `${118 - builderIn * 160}px`);
      root.setProperty("--builder-scale", String(0.88 + builderIn * 0.12));

      HERO_OBJECTS.forEach((obj) => {
        const el = objectRefs.current.get(obj.key);
        if (el) {
          el.style.setProperty("--sx", `${obj.scrollX * progressed}px`);
          el.style.setProperty("--sy", `${obj.scrollY * progressed}px`);
          el.style.setProperty("--sr", `${obj.scrollR * progressed}deg`);
        }
      });

      setIsBuilderInteractive(builderIn > 0.72);
      setIsNavCompact(window.scrollY > 40);
    };

    const updatePointer = (event: PointerEvent) => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reducedMotion || window.innerWidth < 820 || !heroStageRef.current)
        return;
      const rect = heroStageRef.current.getBoundingClientRect();
      const nx = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
      const ny = clamp(
        (event.clientY - rect.top) / rect.height - 0.5,
        -0.5,
        0.5
      );

      HERO_OBJECTS.forEach((obj) => {
        const el = objectRefs.current.get(obj.key);
        if (el) {
          el.style.setProperty("--px", `${nx * obj.depth * 24}px`);
          el.style.setProperty("--py", `${ny * obj.depth * 18}px`);
        }
      });
    };

    const resetPointer = () => {
      HERO_OBJECTS.forEach((obj) => {
        const el = objectRefs.current.get(obj.key);
        if (el) {
          el.style.setProperty("--px", "0px");
          el.style.setProperty("--py", "0px");
        }
      });
    };

    const stage = heroStageRef.current;
    const handlePointerMove = (e: Event) => updatePointer(e as PointerEvent);
    const handlePointerLeave = () => resetPointer();

    if (stage) {
      stage.addEventListener("pointermove", handlePointerMove);
      stage.addEventListener("pointerleave", handlePointerLeave);
    }

    window.addEventListener("scroll", updateScrollScene, { passive: true });
    window.addEventListener("resize", updateScrollScene);
    updateScrollScene();

    return () => {
      window.clearTimeout(timer);
      if (stage) {
        stage.removeEventListener("pointermove", handlePointerMove);
        stage.removeEventListener("pointerleave", handlePointerLeave);
      }
      window.removeEventListener("scroll", updateScrollScene);
      window.removeEventListener("resize", updateScrollScene);
    };
  }, []);

  return (
    <div className={`landing-root ${isReady ? "is-ready" : ""}`}>
      <header className={`site-nav ${isNavCompact ? "compact" : ""}`} id="siteNav">
        <a className="brand" href="#top" aria-label="PUSPITA × RIPITA">
          <span className="brand-mark">P</span>
          <span className="brand-copy">
            <strong>PUSPITA × RIPITA</strong>
            <small>Rupa Indonesia · Akal Masa Depan</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="Navigasi utama">
          <a href="#thinking">Pemikiran</a>
          <a href="#blog">Tulisan</a>
          <a href="#builder">Builder</a>
          <a href="#ripita">RIPITA</a>
        </nav>
        <div className="nav-actions">
          <button className="btn" id="replayBtn" type="button" onClick={handleReplay}>
            ↻ Putar ulang
          </button>
          <a className="btn primary" href="#builder">
            Lihat Builder
          </a>
        </div>
      </header>

      <main id="top">
        <section
          className="hero-scroll"
          aria-labelledby="hero-title"
          ref={heroScrollRef}
        >
          <div className="hero-sticky" id="heroSticky">
            <div className="hero-grid" aria-hidden="true"></div>
            <div className="paper-noise" aria-hidden="true"></div>

            <svg
              className="route-layer"
              viewBox="0 0 1400 800"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="route-main"
                d="M60 185 C250 50 370 280 555 155 S900 100 1110 255 S1270 520 1360 390"
              />
              <path d="M150 630 C310 500 430 690 610 530 S960 530 1250 690" />
              <path d="M315 95 C420 270 300 410 480 680" />
              <circle cx="60" cy="185" r="6" fill="#9E1B3F" />
              <circle cx="555" cy="155" r="5" fill="#F47B20" />
              <circle cx="1110" cy="255" r="5" fill="#2FA7A0" />
              <circle cx="1360" cy="390" r="6" fill="#245B87" />
            </svg>

            <div className="hero-stage" id="heroStage" ref={heroStageRef}>
              <div className="headline-scene">
                <span className="archive-label">Arsip 001 · Puspita × Ripita</span>
                <h1 id="hero-title" className="sr-only">
                  Rasa menjadi rupa. Ide menjadi sistem.
                </h1>
                <div className="kinetic-word word-rasa">Rasa</div>
                <span className="connector connector-a">menjadi</span>
                <div className="kinetic-word word-rupa">Rupa.</div>
                <div className="kinetic-word word-ide">Ide</div>
                <span className="connector connector-b">menjadi</span>
                <div className="kinetic-word word-sistem">Sistem.</div>
              </div>

              {HERO_OBJECTS.map((obj) => (
                <div
                  key={obj.key}
                  ref={(el) => {
                    if (el) objectRefs.current.set(obj.key, el);
                    else objectRefs.current.delete(obj.key);
                  }}
                  className={obj.className}
                  data-depth={obj.depth}
                  data-scroll-x={obj.scrollX}
                  data-scroll-y={obj.scrollY}
                  data-scroll-r={obj.scrollR}
                  data-info={obj.info}
                  aria-label={obj.info}
                  onClick={() => showObjectInfo(obj.info)}
                >
                  <div
                    className="motion-inner"
                    style={
                      obj.fromX
                        ? ({ "--from-x": obj.fromX } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {obj.children}
                  </div>
                </div>
              ))}

              <i className="spice s1" aria-hidden="true"></i>
              <i className="spice s2" aria-hidden="true"></i>
              <i className="spice s3" aria-hidden="true"></i>
              <i className="spice s4" aria-hidden="true"></i>
              <i className="spice s5" aria-hidden="true"></i>
              <i className="spice s6" aria-hidden="true"></i>

              <div className="hero-copy">
                <p>
                  Aku menghubungkan accounting, bisnis, teknologi, pendidikan,
                  dan desain untuk mengubah persoalan rumit menjadi pemahaman,
                  karya, dan sistem yang dapat terus bertumbuh.
                </p>
                <div className="hero-actions">
                  <a className="btn primary" href="#thinking">
                    Jelajahi Cara Pikirku <span>→</span>
                  </a>
                  <a className="btn" href="#builder">
                    Lihat yang Sedang Kubangun
                  </a>
                </div>
                <p className="hero-annotation">Rupa Indonesia. Akal Masa Depan.</p>
              </div>

              <div
                className={`builder-reveal ${
                  isBuilderInteractive ? "is-interactive" : ""
                }`}
                id="builderReveal"
                aria-label="Preview RIPITA Knowledge Builder"
              >
                <div className="builder-frame">
                  <div className="builder-top">
                    <div className="dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>RIPITA Knowledge Builder · Draft</span>
                    <div className="mode-switch" aria-label="Mode preview">
                      <button
                        className={`mode-chip ${
                          demoMode === "baca" ? "active" : ""
                        }`}
                        type="button"
                        onClick={() => setDemoMode("baca")}
                      >
                        Baca
                      </button>
                      <button
                        className={`mode-chip ${
                          demoMode === "eksplorasi" ? "active" : ""
                        }`}
                        type="button"
                        onClick={() => setDemoMode("eksplorasi")}
                      >
                        Eksplorasi
                      </button>
                    </div>
                  </div>
                  <div className="builder-layout">
                    <aside className="builder-panel">
                      <h3>Block Library</h3>
                      <div className="builder-search">Cari blok…</div>
                      <div className="block-stack">
                        <div className="block-mini">
                          <i>?</i>Main Question
                        </div>
                        <div className="block-mini">
                          <i>▦</i>Balance Sheet
                        </div>
                        <div className="block-mini active">
                          <i>↔</i>Cash Flow Bridge
                        </div>
                        <div className="block-mini">
                          <i>◫</i>Scenario Simulator
                        </div>
                        <div className="block-mini">
                          <i>✓</i>Knowledge Check
                        </div>
                      </div>
                    </aside>
                    <div className="builder-canvas">
                      <article className="page-preview">
                        <header className="page-preview-head">
                          <small>Ruang Pikir · Financial Playground</small>
                          <h2>Mengapa laba naik, tetapi uang tidak ada?</h2>
                        </header>
                        <div className="preview-blocks">
                          <div className="preview-block">
                            <span className="tiny-label">Pertanyaan utama</span>
                            <p
                              style={{
                                fontSize: "0.62rem",
                                lineHeight: 1.5,
                                margin: "6px 0 0",
                              }}
                            >
                              Di mana laba berubah menjadi piutang, persediaan,
                              atau kewajiban?
                            </p>
                          </div>
                          <div className="preview-block selected">
                            <span className="tiny-label">Cash Flow Bridge</span>
                            <div className="cash-mini">
                              <div>
                                Laba<strong>+120</strong>
                              </div>
                              <div>
                                Piutang<strong>−90</strong>
                              </div>
                              <div>
                                Stok<strong>−40</strong>
                              </div>
                              <div>
                                Kas<strong>−10</strong>
                              </div>
                            </div>
                          </div>
                          <div className="preview-block" id="demoDynamicBlock">
                            {demoMode === "eksplorasi" ? (
                              <>
                                <span className="tiny-label">Mode Eksplorasi</span>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: "8px",
                                    alignItems: "center",
                                    marginTop: "7px",
                                  }}
                                >
                                  <div>
                                    <small style={{ fontSize: "0.5rem" }}>
                                      Penjualan kredit
                                    </small>
                                    <div
                                      style={{
                                        height: "5px",
                                        borderRadius: "99px",
                                        background: "var(--kapuk)",
                                        marginTop: "5px",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <i
                                        style={{
                                          display: "block",
                                          width: "72%",
                                          height: "100%",
                                          background: "var(--delima)",
                                        }}
                                      ></i>
                                    </div>
                                  </div>
                                  <strong style={{ fontSize: "0.68rem" }}>
                                    +100
                                  </strong>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="tiny-label">Mode Baca</span>
                                <p
                                  style={{
                                    fontSize: "0.6rem",
                                    lineHeight: 1.45,
                                    margin: "6px 0 0",
                                  }}
                                >
                                  Penjelasan naratif menunjukkan mengapa pertumbuhan
                                  laba belum tentu meningkatkan kas.
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    </div>
                    <aside className="builder-panel right">
                      <h3>Inspector</h3>
                      <div className="inspector-tabs">
                        <button className="active" type="button">
                          Content
                        </button>
                        <button type="button">Design</button>
                        <button type="button">Data</button>
                      </div>
                      <div className="field">
                        <label>Dataset</label>
                        <div className="fake-input">cash-flow-demo-v1</div>
                      </div>
                      <div className="field">
                        <label>Variant</label>
                        <div className="fake-input">Waterfall bridge</div>
                      </div>
                      <div className="field">
                        <label>Visibility</label>
                        <div className="fake-input">
                          Baca · Eksplorasi · Presentasi
                        </div>
                      </div>
                      <div className="field">
                        <label>Data status</label>
                        <div className="fake-input">Data simulasi</div>
                      </div>
                    </aside>
                  </div>
                </div>
                <div className="builder-caption">
                  <h2>Ide yang tercecer mulai menemukan bentuk.</h2>
                  <p>
                    Menulis seperti catatan. Menampilkan seperti presentasi.
                    Menjelajah seperti laboratorium.
                  </p>
                </div>
              </div>
            </div>

            <div className="scroll-hint">
              <span>Scroll untuk menyusun sistem</span>
              <i className="scroll-line"></i>
            </div>
          </div>
        </section>

        {/* Section: Pemikiran & Prinsip */}
        <section className="after-hero" id="thinking">
          <div className="section-shell">
            <span className="section-kicker">Yang sedang dibangun</span>
            <h2>Expressive art. Disciplined systems.</h2>
            <p className="lead">
              Prototype ini memakai seluruh resource yang sudah tersedia: bahasa
              editorial PUSPITA, komponen data dan keuangan dari Ruang Pikir,
              elemen Knowledge Builder, garis rute, spice dots, serta slot
              artwork yang masih dikosongkan.
            </p>
            <div className="principle-grid">
              <article className="principle">
                <span>01</span>
                <h3>Gerak yang menjelaskan</h3>
                <p>
                  Objek tidak bergerak sekadar untuk dekorasi. Setiap kartu
                  memperlihatkan bentuk pengetahuan yang dapat dibaca,
                  dibandingkan, atau dimainkan.
                </p>
              </article>
              <article className="principle">
                <span>02</span>
                <h3>Komposisi yang berirama</h3>
                <p>
                  Tipografi, data, video, dan placeholder gouache masuk dengan
                  tempo berbeda lalu berhenti dalam satu susunan yang tenang.
                </p>
              </article>
              <article className="principle">
                <span>03</span>
                <h3>Siap menerima artwork</h3>
                <p>
                  Lingkaran putih bertanda “?” sudah memiliki peran, ukuran, dan
                  posisi sehingga dapat diganti artwork final tanpa mengubah
                  struktur hero.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Section: Blog & Catatan Terpilih (Hanya muncul jika ada data Notion) */}
        {blogPosts.length > 0 && (
          <section className="blog-section" id="blog">
            <div className="section-shell">
              <div className="blog-head">
                <div>
                  <span className="section-kicker">Notion CMS · Terkini</span>
                  <h2>Catatan, Ide & Artikel</h2>
                </div>
                <p className="blog-lead">
                  Tulisan terpilih yang terhubung langsung secara dinamis melalui Notion CMS dengan sistem caching Prisma.
                </p>
              </div>

              <div className="blog-grid">
                {blogPosts.map((post, idx) => (
                  <article className="blog-card" key={post.id || idx}>
                    <div className="blog-card-meta">
                      <span className="blog-badge">{post.category || "Arsip"}</span>
                      <time className="blog-date">{post.date}</time>
                    </div>
                    <h3 className="blog-title">
                      <a href={`/blog/${post.slug || post.id}`}>{post.title}</a>
                    </h3>
                    <p className="blog-excerpt">{post.excerpt}</p>
                    <div className="blog-card-foot">
                      <span className="blog-author">Oleh {post.author || "Admin"}</span>
                      <a className="blog-link" href={`/blog/${post.slug || post.id}`}>
                        Baca artikel <span>→</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section: Tombol Aksi Bawah */}
        <div
          className="section-shell"
          style={{
            paddingTop: "10px",
            paddingBottom: "80px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
          id="builder"
        >
          <button
            className="btn dark"
            id="inspectBtn"
            type="button"
            onClick={() => setIsInfoOpen(true)}
          >
            Lihat daftar objek hero
          </button>
          <button
            className="btn"
            id="replayBottomBtn"
            type="button"
            onClick={handleReplay}
          >
            ↻ Putar ulang opening
          </button>
        </div>
      </main>

      <aside
        className={`info-panel ${isInfoOpen ? "open" : ""}`}
        id="infoPanel"
        aria-live="polite"
        aria-label="Informasi objek hero"
      >
        <div className="info-panel-head">
          <h3>Resource hero</h3>
          <button
            className="close-btn"
            id="closeInfo"
            type="button"
            aria-label="Tutup"
            onClick={() => setIsInfoOpen(false)}
          >
            ✕
          </button>
        </div>
        <p>
          Klik atau arahkan pointer ke objek pada hero untuk mengenali komponen
          yang dipakai. Semua elemen dibuat dengan HTML, CSS, SVG, dan JavaScript
          tanpa aset gambar eksternal.
        </p>
        <div id="infoList" style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
          {UNIQUE_OBJECT_NAMES.map((name) => {
            const isHighlight = highlightedItem === name;
            return (
              <span
                key={name}
                data-name={name}
                style={{
                  border: "1px solid var(--line)",
                  background: isHighlight ? "var(--kunyit)" : "#fff",
                  borderRadius: "999px",
                  padding: "6px 9px",
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  transition: "0.2s",
                }}
              >
                {name}
              </span>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
