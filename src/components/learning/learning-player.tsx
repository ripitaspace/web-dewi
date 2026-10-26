"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LearningModule, Session } from "@/modules/learning/types";
import {
  bestAttempt,
  blocksOf,
  createSession,
  evaluate,
  formatDuration,
  storageKey,
  summarize,
} from "@/modules/learning/engine";
import { Activity, initialAnswer } from "./activity";
import { LearningReport } from "./report";
import styles from "./learning.module.css";

export function LearningPlayer({
  module,
  slug,
}: {
  module: LearningModule;
  slug: string;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const current = useRef<Session | null>(null);
  const reportVisible = useRef(false);
  const visibleActivity = useRef<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const lastInteraction = useRef(0);
  const key = storageKey(module);

  const change = useCallback(
    (mutate: (next: Session) => void) => {
      if (!current.current) return;
      const next = structuredClone(current.current);
      mutate(next);
      current.current = next;
      setSession(next);
    },
    [],
  );

  useEffect(() => {
    // Learning activity is intentionally kept in memory only. Remove a
    // previous version's browser cache so it cannot be resumed accidentally.
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage access is optional because this session never depends on it.
    }
    const timer = window.setTimeout(() => {
      const next = createSession(module);
      current.current = next;
      setSession(next);
      lastInteraction.current = Date.now();
    }, 0);
    const interaction = () => {
      lastInteraction.current = Date.now();
    };
    const onVisibility = () => {
      lastInteraction.current = document.hidden ? 0 : Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    for (const event of ["pointerdown", "keydown", "scroll", "touchstart"])
      window.addEventListener(event, interaction, { passive: true });
    let previousTick = Date.now();
    const tick = window.setInterval(() => {
      const now = Date.now(),
        elapsed = Math.min(2, Math.max(0, (now - previousTick) / 1000));
      previousTick = now;
      if (
        !current.current ||
        current.current.endedAt ||
        document.hidden ||
        reportVisible.current
      )
        return;
      const mediaPlaying = Array.from(
        mainRef.current?.querySelectorAll<HTMLMediaElement>("video, audio") ||
          [],
      ).some((el) => !el.paused && !el.ended);
      if (now - lastInteraction.current > 90000 && !mediaPlaying) return;
      change((next) => {
        next.activeSeconds += elapsed;
        if (visibleActivity.current)
          next.activitySeconds[visibleActivity.current] =
            (next.activitySeconds[visibleActivity.current] || 0) + elapsed;
      });
    }, 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(tick);
      current.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
      for (const event of ["pointerdown", "keydown", "scroll", "touchstart"])
        window.removeEventListener(event, interaction);
    };
  }, [module, key, change]);

  const pageIndex = session?.pageIndex ?? 0;
  const ready = !!session;
  useEffect(() => {
    visibleActivity.current = null;
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.activity;
          if (id)
            ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        const best = [...ratios].sort((a, b) => b[1] - a[1])[0];
        visibleActivity.current = best?.[1] > 0 ? best[0] : null;
      },
      { threshold: [0, 0.1, 0.3, 0.5, 0.8, 1] },
    );
    mainRef.current
      ?.querySelectorAll("[data-activity]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pageIndex, reportOpen, ready]);

  function focusContent(id: string) {
    requestAnimationFrame(() => {
      document.getElementById(id)?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  function navigate(index: number) {
    change((next) => {
      next.pageIndex = Math.max(0, Math.min(module.pages.length - 1, index));
      next.endedAt = null;
    });
    reportVisible.current = false;
    setReportOpen(false);
    setMenuOpen(false);
    focusContent("chapter-title");
  }
  function showReport(finish = false) {
    if (finish)
      change((next) => {
        next.endedAt = new Date().toISOString();
      });
    reportVisible.current = true;
    setReportOpen(true);
    setMenuOpen(false);
    focusContent("report-title");
  }
  function resetSession() {
    if (
      !window.confirm(
        "Mulai sesi baru? Progres dan jawaban pada sesi ini akan dihapus.",
      )
    )
      return;
    const next = createSession(module);
    current.current = next;
    setSession(next);
    reportVisible.current = false;
    setReportOpen(false);
    focusContent("chapter-title");
  }
  function toggleMenu(open: boolean) {
    setMenuOpen(open);
    requestAnimationFrame(() => {
      const target = document.getElementById(
        open ? "close-chapters" : "toggle-chapters",
      );
      target?.focus();
      if (open) window.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  const result = session ? summarize(module, session) : null;
  const page = module.pages[pageIndex];
  const blocks = blocksOf(module);
  return (
    <div className={styles.room}>
      <a href="#learning-main" className={styles.skipLink}>
        Langsung ke materi
      </a>
      <aside
        id="learning-chapters"
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) toggleMenu(false);
        }}
      >
        <button
          type="button"
          id="close-chapters"
          className={styles.closeMenu}
          onClick={() => toggleMenu(false)}
        >
          Tutup daftar bab ×
        </button>
        <Link href="/belajar" className={styles.brand}>
          <span aria-hidden="true">✳</span>
          <div>
            PUSPITA<small>RUANG BELAJAR</small>
          </div>
        </Link>
        <Link href="/belajar" className={styles.backLink}>
          ← Beranda Belajar
        </Link>
        <p className={styles.eyebrow}>Modul interaktif</p>
        <h2>{module.metadata.title.split(":")[0]}</h2>
        <p className={styles.sidebarMeta}>
          {module.metadata.subject} · {module.metadata.estimatedMinutes} menit
        </p>
        <div className={styles.progressLabel}>
          <span>Aktivitas wajib</span>
          <strong>{result?.completion || 0}%</strong>
        </div>
        <progress
          aria-label="Progres aktivitas wajib"
          value={result?.completion || 0}
          max={100}
        />
        <p className={styles.eyebrow}>Daftar bab</p>
        <nav aria-label="Bab pembelajaran">
          {module.pages.map((p, i) => {
            const required = p.blocks.filter((b) => b.required);
            const done =
              session &&
              (required.length ? required : p.blocks).every(
                (b) => session.completed[b.id],
              );
            return (
              <button
                type="button"
                key={p.id}
                disabled={!session}
                aria-current={
                  !reportOpen && i === pageIndex ? "page" : undefined
                }
                onClick={() => navigate(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{p.title}</span>
                <span aria-label={done ? "Selesai" : undefined}>
                  {done ? "✓" : "·"}
                </span>
              </button>
            );
          })}
        </nav>
        <div className={styles.sidebarFoot}>
          <strong>Belajar dengan ritmemu.</strong>
          <p>
            Tanpa login. Progres hanya berlaku selama halaman ini dibuka dan
            akan direset saat disegarkan.
          </p>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <button
              type="button"
              id="toggle-chapters"
              className={styles.menuButton}
              aria-controls="learning-chapters"
              aria-expanded={menuOpen}
              onClick={() => toggleMenu(!menuOpen)}
            >
              {menuOpen ? "Tutup bab ×" : "☰ Daftar bab"}
            </button>
            <Link href="/belajar">Belajar</Link>
            <span aria-hidden="true"> / </span>
            <span>{module.metadata.title.split(":")[0]}</span>
          </div>
          <div>
            <small className={styles.saveStatus}>
              {!session
                ? "Menyiapkan sesi…"
                : "Sesi sementara · reset saat refresh"}
            </small>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={!session}
              onClick={() => showReport()}
            >
              Lihat laporan ↗
            </button>
          </div>
        </header>
        <main id="learning-main" className={styles.mainLayout} ref={mainRef}>
          <div className={styles.content}>
            {!session ? (
              <div className={styles.loading} role="status">
                Menyiapkan ruang belajarmu…
              </div>
            ) : reportOpen ? (
              <LearningReport
                module={module}
                session={session}
                onBack={() => navigate(pageIndex)}
                onReset={resetSession}
              />
            ) : (
              <>
                <header className={styles.hero}>
                  <div className={styles.heroOrnament} aria-hidden="true">
                    ✳
                  </div>
                  <span className={styles.eyebrow}>
                    Puspita · Belajar sambil mencoba
                  </span>
                  <div className={styles.heroTags}>
                    <span className={styles.pill}>PEMULA</span>
                    <span>{module.metadata.estimatedMinutes} MENIT</span>
                  </div>
                  <h1>
                    {module.metadata.title.split(":")[0]}
                    <br />
                    <em>
                      {module.metadata.title
                        .split(":")
                        .slice(1)
                        .join(":")
                        .trim()}
                    </em>
                  </h1>
                  <p>
                    Kenali konsepnya, coba praktiknya, lalu refleksikan
                    pemahamanmu.
                  </p>
                  <div className={styles.heroFoot}>
                    <span>AKUNTANSI DALAM PRAKTIK</span>
                    <span>
                      {module.pages.length} BAB · {blocks.length} AKTIVITAS
                    </span>
                  </div>
                </header>
                <div className={styles.chapterHeader}>
                  <div>
                    <span className={styles.eyebrow}>
                      Bab {String(pageIndex + 1).padStart(2, "0")} /{" "}
                      {String(module.pages.length).padStart(2, "0")}
                    </span>
                    <h2 id="chapter-title" tabIndex={-1}>
                      {page.title}
                    </h2>
                    <p>
                      Pelajari dan kerjakan aktivitas di bawah sesuai ritmemu.
                    </p>
                  </div>
                  <span aria-hidden="true">
                    {String(pageIndex + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className={styles.mobileSummary}>
                  Progres {result?.completion}% · Skor {result?.percentage}/100
                  · Waktu aktif {formatDuration(session.activeSeconds)}
                </div>
                <div className={styles.activities}>
                  {page.blocks.map((block) => (
                    <Activity
                      key={`${session.sessionId}:${block.id}`}
                      block={block}
                      answer={session.answers[block.id] || initialAnswer(block)}
                      completed={!!session.completed[block.id]}
                      attempts={session.attempts[block.id] || []}
                      media={session.media[block.id]}
                      source={
                        block.src &&
                        /^\.\/media\/[a-zA-Z0-9._-]+$/.test(block.src)
                          ? `/learning/${encodeURIComponent(slug)}/${block.src.slice(2)}`
                          : ""
                      }
                      onAnswer={(answer) =>
                        change((next) => {
                          next.answers[block.id] = answer;
                          next.endedAt = null;
                          if (block.type === "reflection")
                            next.completed[block.id] = false;
                        })
                      }
                      onComplete={() =>
                        change((next) => {
                          next.completed[block.id] = true;
                          next.endedAt = null;
                        })
                      }
                      onGrade={() => {
                        const answer =
                          current.current?.answers[block.id] ||
                          initialAnswer(block);
                        const grade = evaluate(block, answer);
                        if (!grade)
                          return block.type === "journal_entry"
                            ? "Lengkapi akun dan nominal positif pada satu sisi setiap baris jurnal."
                            : "Lengkapi jawaban terlebih dahulu.";
                        change((next) => {
                          next.answers[block.id] = answer;
                          next.attempts[block.id] ||= [];
                          next.attempts[block.id].push({
                            ...grade,
                            answer,
                            at: new Date().toISOString(),
                          });
                          next.completed[block.id] = true;
                          next.endedAt = null;
                        });
                        return null;
                      }}
                      onMedia={(media) =>
                        change((next) => {
                          next.media[block.id] = media;
                          if (media.coverage >= (block.minCoverage ?? 0.8))
                            next.completed[block.id] = true;
                        })
                      }
                    />
                  ))}
                </div>
                <nav
                  className={styles.pageNavigation}
                  aria-label="Navigasi materi"
                >
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={pageIndex === 0}
                    onClick={() => navigate(pageIndex - 1)}
                  >
                    ← Sebelumnya
                  </button>
                  <small>
                    {pageIndex + 1} dari {module.pages.length} bab
                  </small>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() =>
                      pageIndex === module.pages.length - 1
                        ? showReport(true)
                        : navigate(pageIndex + 1)
                    }
                  >
                    {pageIndex === module.pages.length - 1
                      ? "Selesaikan & lihat laporan"
                      : "Bab berikutnya →"}
                  </button>
                </nav>
              </>
            )}
            <footer className={styles.footer}>
              <Link href="/belajar">✳ PUSPITA · RUANG BELAJAR</Link>
              <span>Materi simulasi · Belajar mandiri</span>
            </footer>
          </div>
          {session && !reportOpen && (
            <aside className={styles.infoRail} aria-label="Kemajuan belajar">
              <section className={styles.railCard}>
                <span className={styles.eyebrow}>Perjalananmu</span>
                <div className={styles.railSpark} aria-hidden="true">
                  ✳
                </div>
                <dl>
                  <div>
                    <dt>Skor latihan</dt>
                    <dd>{result?.percentage} / 100</dd>
                  </div>
                  <div>
                    <dt>Aktivitas wajib</dt>
                    <dd>
                      {result?.requiredCompleted} / {result?.requiredTotal}
                    </dd>
                  </div>
                  <div>
                    <dt>Waktu aktif</dt>
                    <dd>{formatDuration(session.activeSeconds)}</dd>
                  </div>
                </dl>
                <p className={styles.note}>
                  Skor berasal dari latihan. Bacaan, media, dan refleksi
                  tercatat terpisah.
                </p>
              </section>
              <section className={styles.railCard}>
                <span className={styles.eyebrow}>Tujuan belajar</span>
                <h2>Yang akan kamu kuasai</h2>
                <ul className={styles.competencyList}>
                  {module.competencies.map((c) => {
                    const related = blocks.filter(
                      (b) => b.competencyIds?.includes(c.id) && b.grading,
                    );
                    const done =
                      related.length > 0 &&
                      related.every(
                        (b) =>
                          (bestAttempt(module, session, b.id)?.earned || 0) >=
                          0.75 * b.grading!.points,
                      );
                    return (
                      <li key={c.id}>
                        <span aria-hidden="true">{done ? "✓" : "○"}</span>
                        {c.title}
                      </li>
                    );
                  })}
                </ul>
              </section>
              <p className={styles.railNote}>
                Boleh mencoba lagi. Setiap langkah membantu membentuk pemahaman.
              </p>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
