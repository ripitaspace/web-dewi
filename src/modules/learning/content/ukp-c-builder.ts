import type { Block, LearningModule } from "../types";

/** One question from the UKP Tingkat C question bank. Order of `o` is the original A-D order. */
export type UkpQuestion = { n: number; sub: string; q: string; o: string[]; ans: number; exp: string };

export type UkpSummary = { title: string; markdown: string; table?: { title: string; columns: string[]; rows: string[][] } };

export type UkpModuleSpec = {
  /** Mata uji number (1-9). */
  number: number;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  questions: UkpQuestion[];
  /** Numbers of questions whose options are all rupiah but test a threshold, so they stay lettered choices. */
  choiceOnly?: number[];
  intro: string;
  /** Summary shown before a sub-topic's questions, keyed by the question bank's sub-topic label. */
  summaries: Record<string, UkpSummary>;
  review: { table: { title: string; columns: string[]; rows: string[][] }; pairs: [string, string][] };
};

const prefixes: Record<string, string> = { DN: "Dalam Negeri", OP: "Orang Pribadi", TI: "Transaksi Internasional" };
const OPTION_IDS = ["a", "b", "c", "d"];

/** Pure rupiah answers become typed-number activities; everything else stays a lettered choice. */
export function rupiahValue(text: string): number | null {
  const match = /^Rp\s?(\d{1,3}(?:\.\d{3})*|\d+)$/.exec(text.trim());
  return match ? Number(match[1]!.replaceAll(".", "")) : null;
}

export function pageTitleFor(sub: string) {
  const [first, ...rest] = sub.split(" - ");
  const label = prefixes[first!];
  return label && rest.length ? `${label} · ${rest.join(" - ")}` : sub;
}

function questionBlock(spec: UkpModuleSpec, question: UkpQuestion, competencyId: string): Block {
  const id = `${spec.slug}-soal-${String(question.n).padStart(2, "0")}`;
  const values = question.o.map(rupiahValue);
  const correctText = question.o[question.ans]!;
  const base = { id, required: false, title: `Soal ${question.n}`, competencyIds: [competencyId], prompt: question.q };
  if (values.every((value) => value !== null) && !spec.choiceOnly?.includes(question.n)) {
    return {
      ...base,
      type: "number_input",
      role: "independent_practice",
      unit: "IDR",
      hints: ["Tulis angka rupiah saja, tanpa titik pemisah ribuan."],
      grading: { correctValue: values[question.ans]!, tolerance: 0, points: 5, explanation: `Jawaban: ${correctText}. ${question.exp}` },
    };
  }
  return {
    ...base,
    type: "single_choice",
    role: "independent_practice",
    options: question.o.map((text, index) => ({ id: OPTION_IDS[index]!, text })),
    grading: { correctOptionId: OPTION_IDS[question.ans]!, points: 5, explanation: `Jawaban: ${"ABCD"[question.ans]}. ${correctText}. ${question.exp}` },
  };
}

export function buildUkpModule(spec: UkpModuleSpec): LearningModule {
  const id = `ukp-c-${spec.slug}`;
  const competencyId = `kompetensi-${id}`;
  const groups: { sub: string; questions: UkpQuestion[] }[] = [];
  for (const question of spec.questions) {
    const last = groups.at(-1);
    if (last && last.sub === question.sub) last.questions.push(question);
    else groups.push({ sub: question.sub, questions: [question] });
  }

  const introPage = {
    id: `${id}-pengantar`,
    title: "Pengantar mata uji",
    blocks: [
      { id: `${id}-pengantar-materi`, type: "reading" as const, role: "discover" as const, required: false, title: `UKP C · ${spec.title}`, competencyIds: [competencyId], markdown: spec.intro },
      { id: `${id}-pengantar-catatan`, type: "callout" as const, role: "understand" as const, required: false, variant: "warning" as const, title: "Bahan latihan", content: "Soal dan pembahasan disusun dari bank soal latihan UKP Tingkat C berdasarkan ketentuan per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian." },
    ],
  };

  const topicPages = groups.map((group, index) => {
    const summary = spec.summaries[group.sub];
    const blocks: Block[] = [];
    if (summary) {
      blocks.push({ id: `${id}-ringkas-${index + 1}`, type: "reading", role: "understand", required: false, title: summary.title, competencyIds: [competencyId], markdown: summary.markdown });
      if (summary.table) blocks.push({ id: `${id}-tabel-${index + 1}`, type: "comparison_table", role: "understand", required: false, title: summary.table.title, columns: summary.table.columns, rows: summary.table.rows });
    }
    blocks.push(...group.questions.map((question) => questionBlock(spec, question, competencyId)));
    return { id: `${id}-bagian-${index + 1}`, title: pageTitleFor(group.sub), blocks };
  });

  const reviewMatchingId = `${id}-rangkuman-cocokkan`;
  const reviewPage = {
    id: `${id}-rangkuman`,
    title: "Rangkuman dan cek cepat",
    blocks: [
      { id: `${id}-rangkuman-tabel`, type: "comparison_table" as const, role: "understand" as const, required: false, title: spec.review.table.title, columns: spec.review.table.columns, rows: spec.review.table.rows },
      { id: reviewMatchingId, type: "matching" as const, role: "guided_practice" as const, required: false, title: "Cocokkan ketentuan", competencyIds: [competencyId], prompt: "Pasangkan setiap transaksi dengan ketentuan yang tepat.", pairs: spec.review.pairs.map(([left, right], index) => ({ id: `pasangan-${index + 1}`, left, right })), grading: { points: 10, partialCredit: true, explanation: "Setiap pasangan diambil dari pembahasan soal pada mata uji ini." } },
    ],
  };

  const pages = [introPage, ...topicPages, reviewPage];
  const unitFor = (page: (typeof pages)[number], worksheetBlocks: string[], pageIds = [page.id]) => ({
    id: `${page.id}-unit`,
    title: page.title,
    learningObjectives: [`Menjawab soal ${spec.title} pada bagian ${page.title}.`],
    competencyIds: [competencyId],
    prerequisiteUnitIds: [] as string[],
    pageIds,
    worksheets: [{ id: `${page.id}-latihan`, title: "Latihan soal", mode: "guided" as const, difficulty: "medium" as const, complexityWeight: 1, targetMinutes: { min: 3, max: 15 }, scoreWeight: 1, blockIds: worksheetBlocks }],
    masteryCriteria: { minimumScore: 70, requiredWorksheetIds: [`${page.id}-latihan`] },
    report: { enabled: true },
  });
  const unitPages = [...topicPages, reviewPage];
  const learningUnits = unitPages.map((page, index) => unitFor(page, page.blocks.filter((block) => block.grading).map((block) => block.id), index === 0 ? [introPage.id, page.id] : [page.id]));

  return {
    kind: "plf.module",
    schemaVersion: "1.1.0",
    id,
    revision: 1,
    metadata: { title: `UKP C · ${spec.title}`, summary: spec.summary, subject: "Pajak", level: "advanced", estimatedMinutes: spec.minutes, tags: ["pajak", "UKP", "UKP C", spec.slug], author: "PuspitaCore Belajar" },
    experience: { profile: "mixed", navigation: "flexible", allowResume: false },
    prerequisites: { moduleIds: [], competencyIds: [], notes: "Disarankan memahami dasar perpajakan sebelum mengerjakan bank soal Tingkat C." },
    competencies: [{ id: competencyId, title: `Menjawab soal UKP Tingkat C pada mata uji ${spec.title}` }],
    learningPolicy: { allowRetry: true, feedbackTiming: "after_submit", hintMode: "guided_only", timerMode: "advisory", allowSkip: true, remediationEnabled: true, solutionsAfterAttempt: true },
    assessment: { passingScore: 70, requireAllRequired: true, attemptPolicy: "best" },
    reportPolicy: { scope: "learning_unit", formats: ["json", "print"], downloadOnCompletion: false, dataLocation: "client_only" },
    outline: [{ type: "section", id: `${id}-section`, title: spec.title, children: learningUnits.map((unit) => ({ type: "unit" as const, unitId: unit.id })) }],
    learningUnits,
    pages,
  };
}
