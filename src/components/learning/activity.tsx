"use client";

import {
  Fragment,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import type {
  Answer,
  Attempt,
  Block,
  BlockType,
  JournalLine,
  MediaRecord,
} from "@/modules/learning/types";
import {
  emptyMedia,
  formatNumber,
  mergeRanges,
} from "@/modules/learning/engine";
import styles from "./learning.module.css";

export const activityLabels: Record<BlockType, string> = {
  reading: "Bacaan",
  image: "Diagram",
  video: "Video",
  audio: "Audio",
  single_choice: "Pilihan tunggal",
  multiple_choice: "Pilihan jamak",
  true_false: "Benar / salah",
  number_input: "Hitung angka",
  matching: "Cocokkan pasangan",
  ordering: "Susun urutan",
  journal_entry: "Praktik jurnal",
  case_decision: "Studi kasus",
  reflection: "Refleksi",
};
const icons: Record<BlockType, string> = {
  reading: "▤",
  image: "▧",
  video: "▶",
  audio: "♫",
  single_choice: "◉",
  multiple_choice: "☷",
  true_false: "✓",
  number_input: "∑",
  matching: "⇄",
  ordering: "↕",
  journal_entry: "Rp",
  case_decision: "◇",
  reflection: "✎",
};

function inline(text: string) {
  return text
    .split(/(\*\*.*?\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}

export function Reading({ text = "" }: { text?: string }) {
  const elements: ReactNode[] = [];
  let items: string[] = [];
  const flush = () => {
    if (items.length) {
      elements.push(
        <ul key={elements.length}>
          {items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
      items = [];
    }
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      items.push(line.slice(2));
      continue;
    }
    flush();
    if (!line) continue;
    elements.push(
      line.startsWith("# ") ? (
        <h3 key={elements.length}>{inline(line.slice(2))}</h3>
      ) : line.startsWith("## ") ? (
        <h4 key={elements.length}>{inline(line.slice(3))}</h4>
      ) : (
        <p key={elements.length}>{inline(line)}</p>
      ),
    );
  }
  flush();
  return <div className={styles.reading}>{elements}</div>;
}

function Media({
  block,
  source,
  value,
  onChange,
}: {
  block: Block;
  source: string;
  value?: MediaRecord;
  onChange: (value: MediaRecord) => void;
}) {
  const latest = useRef(value || emptyMedia());
  const lastTick = useRef<number | null>(null);
  const [failed, setFailed] = useState(false);
  function sync(event: SyntheticEvent<HTMLMediaElement>, seek = false) {
    const el = event.currentTarget;
    if (!Number.isFinite(el.duration) || el.duration <= 0) return;
    const previous = latest.current;
    const ranges: [number, number][] = [...previous.ranges];
    for (let i = 0; i < el.played.length; i++)
      ranges.push([el.played.start(i), el.played.end(i)]);
    const merged = mergeRanges(ranges, el.duration);
    const now = performance.now();
    const elapsed =
      lastTick.current !== null && !el.paused && !el.seeking && !seek
        ? Math.min(1, Math.max(0, (now - lastTick.current) / 1000))
        : 0;
    lastTick.current = el.paused || el.seeking || seek ? null : now;
    const next: MediaRecord = {
      ranges: merged,
      duration: el.duration,
      coverage: Math.min(
        1,
        merged.reduce((sum, [a, b]) => sum + b - a, 0) / el.duration,
      ),
      playbackSeconds: previous.playbackSeconds + elapsed,
      seeks: previous.seeks + Number(seek),
    };
    latest.current = next;
    onChange(next);
  }
  const props = {
    controls: true,
    preload: "metadata",
    src: source,
    "aria-label": block.title,
    onTimeUpdate: sync,
    onLoadedMetadata: sync,
    onPlay: () => {
      lastTick.current = performance.now();
    },
    onPause: sync,
    onEnded: sync,
    onSeeking: (e: SyntheticEvent<HTMLMediaElement>) => sync(e, true),
    onError: () => setFailed(true),
  };
  return (
    <div className={styles.media}>
      {block.type === "video" ? (
        <video {...props} playsInline />
      ) : (
        <>
          <span className={styles.audioArt} aria-hidden="true">
            ♫
          </span>
          <audio {...props} />
        </>
      )}
      {failed ? (
        <p role="alert">
          Media belum bisa diputar. <a href={source}>Buka file media</a> untuk
          mencoba lagi.
        </p>
      ) : (
        <p>
          {Math.round((value?.coverage || 0) * 100)}% diputar · target{" "}
          {Math.round((block.minCoverage ?? 0.8) * 100)}%
        </p>
      )}
      <small>
        {block.type === "audio"
          ? "Audio contoh menggunakan narasi sintetis."
          : "Bagian yang diputar dicatat; melompat ke akhir tidak menyelesaikan video."}
      </small>
    </div>
  );
}

export function initialAnswer(block: Block): Answer {
  if (block.type === "ordering")
    return { order: (block.items || []).map((item) => item.id).reverse() };
  if (block.type === "journal_entry")
    return {
      lines: [
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 },
      ],
    };
  return {};
}

export function Activity({
  block,
  answer,
  completed,
  attempts,
  media,
  source,
  onAnswer,
  onComplete,
  onGrade,
  onMedia,
}: {
  block: Block;
  answer: Answer;
  completed: boolean;
  attempts: Attempt[];
  media?: MediaRecord;
  source: string;
  onAnswer: (answer: Answer) => void;
  onComplete: () => void;
  onGrade: () => string | null;
  onMedia: (value: MediaRecord) => void;
}) {
  const [error, setError] = useState("");
  const last = attempts.at(-1);
  const feedbackId = `feedback-${block.id}`;
  const titleId = `title-${block.id}`;
  const choice = (
    id: string,
    label: string,
    checked: boolean,
    change: () => void,
    multiple = false,
  ) => (
    <label className={styles.choice} key={id}>
      <input
        type={multiple ? "checkbox" : "radio"}
        name={block.id}
        value={id}
        checked={checked}
        onChange={change}
      />
      <span>{label}</span>
    </label>
  );
  const lines = answer.lines || [];
  function updateLine(index: number, patch: Partial<JournalLine>) {
    onAnswer({
      lines: lines.map((line, i) =>
        i === index ? { ...line, ...patch } : line,
      ),
    });
  }
  const total = (side: "debit" | "credit") =>
    lines.reduce((sum, line) => sum + (line[side] || 0), 0);

  return (
    <article
      className={styles.activity}
      data-activity={block.id}
      aria-labelledby={titleId}
    >
      <header className={styles.activityHeading}>
        <span className={styles.activityIcon} aria-hidden="true">
          {icons[block.type]}
        </span>
        <div>
          <span className={styles.eyebrow}>{activityLabels[block.type]}</span>
          <h3 id={titleId}>{block.title}</h3>
        </div>
        <span className={styles.activityStatus}>
          {completed ? "✓ Selesai" : block.required ? "Wajib" : "Opsional"}
        </span>
      </header>
      <div className={styles.activityBody}>
        {block.scenario && (
          <div className={styles.scenario}>
            <Reading text={block.scenario} />
          </div>
        )}
        {block.prompt && <p className={styles.prompt}>{block.prompt}</p>}
        {block.type === "reading" && <Reading text={block.markdown} />}
        {block.type === "image" && (
          <figure className={styles.figure}>
            {/* Diagram from the module's bundled assets, rendered at its native aspect ratio. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={source} alt={block.alt || "Diagram materi"} />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        )}
        {(block.type === "video" || block.type === "audio") && (
          <Media
            block={block}
            source={source}
            value={media}
            onChange={onMedia}
          />
        )}
        {(
          ["single_choice", "multiple_choice", "case_decision"] as string[]
        ).includes(block.type) && (
          <fieldset className={styles.choices}>
            <legend className="sr-only">{block.prompt}</legend>
            {block.type === "multiple_choice" && (
              <p className={styles.note}>Pilih semua jawaban yang benar.</p>
            )}
            {block.options?.map((o) =>
              block.type === "multiple_choice"
                ? choice(
                    o.id,
                    o.text,
                    (answer.selections || []).includes(o.id),
                    () =>
                      onAnswer({
                        selections: (answer.selections || []).includes(o.id)
                          ? answer.selections!.filter((id) => id !== o.id)
                          : [...(answer.selections || []), o.id],
                      }),
                    true,
                  )
                : choice(o.id, o.text, answer.selected === o.id, () =>
                    onAnswer({ selected: o.id }),
                  ),
            )}
          </fieldset>
        )}
        {block.type === "true_false" && (
          <fieldset className={styles.choices}>
            <legend className="sr-only">{block.prompt}</legend>
            {choice("true", "Benar", answer.truth === true, () =>
              onAnswer({ truth: true }),
            )}
            {choice("false", "Salah", answer.truth === false, () =>
              onAnswer({ truth: false }),
            )}
          </fieldset>
        )}
        {block.type === "number_input" && (
          <label className={styles.field}>
            Jawaban {block.unit === "IDR" ? "dalam rupiah" : block.unit}
            <input
              type="number"
              inputMode="decimal"
              value={answer.value ?? ""}
              placeholder="Ketik angka tanpa pemisah ribuan"
              onChange={(e) => onAnswer({ value: e.target.value })}
            />
          </label>
        )}
        {block.type === "matching" && (
          <div className={styles.matching}>
            {block.pairs?.map((pair) => (
              <label className={styles.matchRow} key={pair.id}>
                <span>{pair.left}</span>
                <select
                  value={answer.matches?.[pair.id] || ""}
                  onChange={(e) =>
                    onAnswer({
                      matches: { ...answer.matches, [pair.id]: e.target.value },
                    })
                  }
                >
                  <option value="">Pilih kategorinya…</option>
                  {[...(block.pairs || [])].reverse().map((option) => (
                    <option value={option.id} key={option.id}>
                      {option.right}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        {block.type === "ordering" && (
          <ol className={styles.orderList}>
            {answer.order?.map((id, index, order) => (
              <li key={id}>
                <span className={styles.orderNumber}>{index + 1}</span>
                <span>{block.items?.find((item) => item.id === id)?.text}</span>
                <div className={styles.moveButtons}>
                  {[-1, 1].map((direction) => (
                    <button
                      type="button"
                      key={direction}
                      disabled={
                        index + direction < 0 ||
                        index + direction >= order.length
                      }
                      aria-label={`${direction < 0 ? "Naikkan" : "Turunkan"} ${block.items?.find((item) => item.id === id)?.text}`}
                      onClick={() => {
                        const next = [...order];
                        [next[index], next[index + direction]] = [
                          next[index + direction],
                          next[index],
                        ];
                        onAnswer({ order: next });
                      }}
                    >
                      {direction < 0 ? "↑" : "↓"}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
        {block.type === "journal_entry" && (
          <>
            <div className={styles.journalRows}>
              {lines.map((line, index) => (
                <fieldset key={index} className={styles.journalRow}>
                  <legend>Baris {index + 1}</legend>
                  <label className={styles.accountField}>
                    Akun
                    <select
                      value={line.accountId}
                      onChange={(e) =>
                        updateLine(index, { accountId: e.target.value })
                      }
                    >
                      <option value="">Pilih akun…</option>
                      {block.accounts?.map((account) => (
                        <option key={account} value={account}>
                          {account.replaceAll("-", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Debit (Rp)
                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={line.debit || ""}
                      placeholder="0"
                      onChange={(e) =>
                        updateLine(index, { debit: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Kredit (Rp)
                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={line.credit || ""}
                      placeholder="0"
                      onChange={(e) =>
                        updateLine(index, { credit: Number(e.target.value) })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.quietButton}
                    aria-label={`Hapus baris ${index + 1}`}
                    disabled={lines.length <= 2}
                    onClick={() =>
                      onAnswer({ lines: lines.filter((_, i) => i !== index) })
                    }
                  >
                    ×
                  </button>
                </fieldset>
              ))}
            </div>
            <div className={styles.journalTotals}>
              <span>Debit: Rp{formatNumber(total("debit"))}</span>
              <span>Kredit: Rp{formatNumber(total("credit"))}</span>
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={lines.length >= 8}
              onClick={() =>
                onAnswer({
                  lines: [...lines, { accountId: "", debit: 0, credit: 0 }],
                })
              }
            >
              + Tambah baris
            </button>
            <p className={styles.note}>
              Pilih akun dan isi salah satu sisi pada setiap baris. Debit harus
              sama dengan kredit.
            </p>
          </>
        )}
        {block.type === "reflection" && (
          <>
            <label className={styles.field}>
              Memo untuk supervisor
              <textarea
                rows={6}
                value={answer.text || ""}
                placeholder="Tuliskan pemahamanmu dengan bahasamu sendiri…"
                onChange={(e) => onAnswer({ text: e.target.value })}
              />
            </label>
            <div className={styles.scenario}>
              <strong>Panduan refleksi</strong>
              <ul>{block.rubric?.map((item) => <li key={item}>{item}</li>)}</ul>
              <p className={styles.note}>
                Refleksi tidak dinilai otomatis. Jawaban akan disertakan dalam
                laporan untuk ditinjau pembimbing.
              </p>
            </div>
          </>
        )}
        <div className={styles.activityActions}>
          {(["reading", "image"] as string[]).includes(block.type) && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onComplete}
              disabled={completed}
            >
              {completed
                ? "✓ Sudah selesai"
                : block.type === "reading"
                  ? "Tandai sudah dibaca"
                  : "Tandai sudah dipahami"}
            </button>
          )}
          {block.grading && (
            <>
              <button
                type="button"
                className={styles.primaryButton}
                aria-describedby={error || last ? feedbackId : undefined}
                onClick={() => setError(onGrade() || "")}
              >
                {last ? "Periksa lagi" : "Periksa jawaban"} →
              </button>
              <small>
                Maks. {block.grading.points} poin · {attempts.length} percobaan
              </small>
            </>
          )}
          {block.type === "reflection" && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                if ((answer.text || "").trim().length < 20) {
                  setError(
                    "Tulis setidaknya 20 karakter sebelum menyimpan refleksi.",
                  );
                  return;
                }
                setError("");
                onComplete();
              }}
            >
              {completed ? "Perbarui refleksi" : "Simpan refleksi"}
            </button>
          )}
        </div>
        <div id={feedbackId} aria-live="polite">
          {error && <p className={styles.error}>{error}</p>}
          {last && (
            <div className={styles.feedback}>
              <strong>
                {last.earned === last.max
                  ? "✓ Tepat!"
                  : "Masih bisa ditingkatkan"}{" "}
                · {formatNumber(last.earned)} / {last.max} poin
              </strong>
              <p>{last.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
