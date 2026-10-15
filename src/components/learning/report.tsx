"use client";

import type { LearningModule, Session } from "@/modules/learning/types";
import {
  bestAttempt,
  blocksOf,
  formatDuration,
  formatNumber,
  makeReport,
  summarize,
} from "@/modules/learning/engine";
import { activityLabels } from "./activity";
import styles from "./learning.module.css";

export function LearningReport({
  module,
  session,
  onBack,
  onReset,
}: {
  module: LearningModule;
  session: Session;
  onBack: () => void;
  onReset: () => void;
}) {
  const result = summarize(module, session),
    blocks = blocksOf(module);
  function download() {
    const report = makeReport(
      module,
      session,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `Puspita-Laporan-${session.sessionId}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className={styles.report} aria-labelledby="report-title">
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Catatan perjalanan belajar</span>
        <h1 id="report-title" tabIndex={-1}>
          Dari mencoba,
          <br />
          <em>menjadi memahami.</em>
        </h1>
        <p>{module.metadata.title}</p>
        <span className={styles.pill}>
          {result.passed
            ? "Skor otomatis memenuhi kriteria"
            : "Masih ada yang perlu dilengkapi"}
        </span>
        {result.pendingManual && <p>Refleksi menunggu peninjauan manual.</p>}
      </header>
      <div className={styles.reportActions}>
        <button className={styles.secondaryButton} onClick={onBack}>
          ← Kembali ke materi
        </button>
        <button className={styles.primaryButton} onClick={download}>
          Unduh JSON report
        </button>
        <button
          className={styles.secondaryButton}
          onClick={() => window.print()}
        >
          Cetak / simpan PDF
        </button>
        <button className={styles.quietButton} onClick={onReset}>
          Mulai sesi baru
        </button>
      </div>
      <div className={styles.reportStats}>
        <div>
          <span>Skor latihan</span>
          <strong>
            {formatNumber(result.score)} <small>/ {result.maxScore}</small>
          </strong>
        </div>
        <div>
          <span>Aktivitas wajib</span>
          <strong>
            {result.requiredCompleted} <small>/ {result.requiredTotal}</small>
          </strong>
        </div>
        <div>
          <span>Waktu aktif perkiraan</span>
          <strong>{formatDuration(session.activeSeconds)}</strong>
        </div>
      </div>
      <section className={styles.reportSection}>
        <h2>Ringkasan sesi</h2>
        <dl className={styles.sessionDetails}>
          <div>
            <dt>ID sesi</dt>
            <dd>{session.sessionId}</dd>
          </div>
          <div>
            <dt>Mulai</dt>
            <dd>{new Date(session.startedAt).toLocaleString("id-ID")}</dd>
          </div>
          <div>
            <dt>Status sesi</dt>
            <dd>
              {session.endedAt
                ? `Diselesaikan ${new Date(session.endedAt).toLocaleString("id-ID")}`
                : "Masih berlangsung"}
            </dd>
          </div>
          <div>
            <dt>Aturan kelulusan</dt>
            <dd>
              Skor minimal {module.assessment.passingScore}%
              {module.assessment.requireAllRequired
                ? " dan seluruh aktivitas wajib selesai"
                : ""}
              .
            </dd>
          </div>
        </dl>
        <p className={styles.note}>
          Nilai mengikuti kebijakan{" "}
          {module.assessment.attemptPolicy === "best"
            ? "percobaan terbaik"
            : module.assessment.attemptPolicy === "first"
              ? "percobaan pertama"
              : "percobaan terakhir"}
          . Refleksi dinilai terpisah secara manual.
        </p>
      </section>
      <section className={styles.reportSection}>
        <h2>Rincian aktivitas</h2>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Aktivitas</th>
                <th>Status</th>
                <th>Nilai</th>
                <th>Percobaan</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => {
                const attempt = bestAttempt(module, session, block.id);
                return (
                  <tr key={block.id}>
                    <td>
                      {block.title}
                      <small>
                        {activityLabels[block.type]} ·{" "}
                        {block.required ? "Wajib" : "Opsional"}
                      </small>
                    </td>
                    <td>{session.completed[block.id] ? "Selesai" : "Belum"}</td>
                    <td>
                      {block.grading
                        ? `${attempt ? formatNumber(attempt.earned) : "—"} / ${block.grading.points}`
                        : block.type === "reflection" &&
                            session.completed[block.id]
                          ? "Review manual"
                          : "—"}
                    </td>
                    <td>{session.attempts[block.id]?.length || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className={styles.reportSection}>
        <h2>Tujuan belajar</h2>
        {module.competencies.map((c) => {
          const activities = blocks.filter(
            (b) => b.competencyIds?.includes(c.id) && b.grading,
          );
          const max = activities.reduce((s, b) => s + b.grading!.points, 0),
            earned = activities.reduce(
              (s, b) => s + (bestAttempt(module, session, b.id)?.earned || 0),
              0,
            );
          return (
            <div key={c.id} className={styles.competency}>
              <div>
                <span>{c.title}</span>
                <strong>
                  {max
                    ? `${Math.round((earned / max) * 100)}%`
                    : "Review manual"}
                </strong>
              </div>
              <progress max={max || 1} value={earned} aria-label={c.title} />
            </div>
          );
        })}
      </section>
      <section className={styles.reportSection}>
        <h2>Catatan pemutaran media</h2>
        {blocks
          .filter((b) => b.type === "audio" || b.type === "video")
          .map((b) => {
            const media = session.media[b.id];
            return (
              <div key={b.id} className={styles.competency}>
                <strong>{b.title}</strong>
                <progress
                  value={media?.coverage || 0}
                  max={1}
                  aria-label={`Bagian diputar: ${b.title}`}
                />
                <p className={styles.note}>
                  {Math.round((media?.coverage || 0) * 100)}% diputar · durasi
                  pemutaran {formatDuration(media?.playbackSeconds || 0)} ·{" "}
                  {media?.seeks || 0} perpindahan posisi.
                </p>
              </div>
            );
          })}
        <p className={styles.note}>
          Pemutaran media tidak membuktikan perhatian atau pemahaman.
        </p>
      </section>
      {blocks
        .filter((b) => b.type === "reflection" && session.answers[b.id]?.text)
        .map((b) => (
          <section className={styles.reportSection} key={b.id}>
            <h2>{b.title}</h2>
            <p className={styles.reflectionText}>
              {session.answers[b.id].text}
            </p>
            <p className={styles.note}>
              {session.completed[b.id]
                ? "Tersimpan untuk peninjauan manual."
                : "Draf — belum ditandai selesai."}
            </p>
          </section>
        ))}
      <p className={styles.note}>
        Laporan dibuat dan disimpan di browser ini. Tidak dikirim otomatis ke
        Puspita. Hasil belajar mandiri ini bukan sertifikat profesi.
      </p>
    </section>
  );
}
