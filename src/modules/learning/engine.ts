import type {
  Answer,
  Attempt,
  Block,
  LearningModule,
  MediaRecord,
  Session,
  SelfLearningUnit,
  Worksheet,
} from "./types";

export const storageKey = (module: { id: string; revision: number }) =>
  `puspita:learning:${module.id}@${module.revision}`;
export const blocksOf = (module: LearningModule) =>
  module.pages.flatMap((page) => page.blocks);
export const unitForPage = (module: LearningModule, pageId: string) =>
  module.learningUnits?.find((unit) => unit.pageIds.includes(pageId));
export const formatNumber = (n: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
export const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;

export function createSession(module: LearningModule): Session {
  return {
    sessionId: `PC-${crypto.randomUUID()}`,
    moduleId: module.id,
    revision: module.revision,
    startedAt: new Date().toISOString(),
    endedAt: null,
    pageIndex: 0,
    answers: {},
    attempts: {},
    completed: {},
    media: {},
    activeSeconds: 0,
    activitySeconds: {},
  };
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const nonnegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
function validAnswer(value: unknown): value is Answer {
  if (!record(value)) return false;
  for (const key of ["selected", "value", "text"])
    if (key in value && typeof value[key] !== "string") return false;
  if ("truth" in value && typeof value.truth !== "boolean") return false;
  for (const key of ["selections", "order"])
    if (
      key in value &&
      (!Array.isArray(value[key]) ||
        !value[key].every((x) => typeof x === "string"))
    )
      return false;
  if (
    "matches" in value &&
    (!record(value.matches) ||
      !Object.values(value.matches).every((x) => typeof x === "string"))
  )
    return false;
  if (
    "lines" in value &&
    (!Array.isArray(value.lines) ||
      !value.lines.every(
        (x) =>
          record(x) &&
          typeof x.accountId === "string" &&
          typeof x.debit === "number" &&
          Number.isFinite(x.debit) &&
          typeof x.credit === "number" &&
          Number.isFinite(x.credit),
      ))
  )
    return false;
  return true;
}

export function restoreSession(
  raw: string | null,
  module: LearningModule,
): Session | null {
  if (!raw) return null;
  try {
    const s: unknown = JSON.parse(raw);
    if (
      !record(s) ||
      s.moduleId !== module.id ||
      s.revision !== module.revision ||
      typeof s.sessionId !== "string" ||
      typeof s.startedAt !== "string" ||
      !Number.isFinite(Date.parse(s.startedAt))
    )
      return null;
    if (
      s.endedAt !== null &&
      (typeof s.endedAt !== "string" || !Number.isFinite(Date.parse(s.endedAt)))
    )
      return null;
    if (
      !Number.isInteger(s.pageIndex) ||
      (s.pageIndex as number) < 0 ||
      (s.pageIndex as number) >= module.pages.length ||
      !nonnegative(s.activeSeconds)
    )
      return null;
    if (
      !record(s.answers) ||
      !Object.values(s.answers).every(validAnswer) ||
      !record(s.completed) ||
      !Object.values(s.completed).every((x) => typeof x === "boolean")
    )
      return null;
    if (
      !record(s.activitySeconds) ||
      !Object.values(s.activitySeconds).every(nonnegative)
    )
      return null;
    if (
      !record(s.attempts) ||
      !Object.values(s.attempts).every(
        (attempts) =>
          Array.isArray(attempts) &&
          attempts.every(
            (a) =>
              record(a) &&
              validAnswer(a.answer) &&
              nonnegative(a.earned) &&
              nonnegative(a.max) &&
              a.earned <= a.max &&
              typeof a.feedback === "string" &&
              typeof a.at === "string",
          ),
      )
    )
      return null;
    if (
      !record(s.media) ||
      !Object.values(s.media).every(
        (m) =>
          record(m) &&
          nonnegative(m.duration) &&
          nonnegative(m.coverage) &&
          m.coverage <= 1 &&
          nonnegative(m.playbackSeconds) &&
          Number.isInteger(m.seeks) &&
          nonnegative(m.seeks) &&
          Array.isArray(m.ranges) &&
          m.ranges.every(
            (r) =>
              Array.isArray(r) &&
              r.length === 2 &&
              nonnegative(r[0]) &&
              nonnegative(r[1]) &&
              r[1] >= r[0],
          ),
      )
    )
      return null;
    return s as unknown as Session;
  } catch {
    return null;
  }
}

export function evaluate(
  block: Block,
  answer: Answer,
): Omit<Attempt, "at" | "answer"> | null {
  const g = block.grading;
  if (!g) return null;
  let ratio = 0;
  let feedback = g.explanation || "";
  switch (block.type) {
    case "single_choice":
    case "case_decision":
      if (!block.options?.some((o) => o.id === answer.selected)) return null;
      ratio =
        block.type === "single_choice"
          ? Number(answer.selected === g.correctOptionId)
          : g.optionScores?.[answer.selected!] || 0;
      if (block.type === "single_choice" && answer.selected)
        feedback = g.feedbackByOption?.[answer.selected] || feedback;
      break;
    case "multiple_choice": {
      const selected = [...new Set(answer.selections || [])];
      if (
        !selected.length ||
        selected.some((id) => !block.options?.some((o) => o.id === id))
      )
        return null;
      const correct = g.correctOptionIds || [];
      const yes = selected.filter((id) => correct.includes(id)).length;
      const no = selected.length - yes;
      ratio =
        yes === correct.length && no === 0
          ? 1
          : g.partialCredit
            ? Math.max(
                0,
                yes / correct.length -
                  no / Math.max(1, block.options!.length - correct.length),
              )
            : 0;
      break;
    }
    case "true_false":
      if (typeof answer.truth !== "boolean") return null;
      ratio = Number(answer.truth === g.correct);
      break;
    case "number_input":
      if (!answer.value?.trim() || !Number.isFinite(Number(answer.value)))
        return null;
      ratio = Number(
        Math.abs(Number(answer.value) - g.correctValue!) <= (g.tolerance || 0),
      );
      break;
    case "matching": {
      const pairs = block.pairs || [];
      if (
        !pairs.every((p) =>
          pairs.some((option) => option.id === answer.matches?.[p.id]),
        )
      )
        return null;
      const yes = pairs.filter((p) => answer.matches?.[p.id] === p.id).length;
      ratio = g.partialCredit
        ? yes / pairs.length
        : Number(yes === pairs.length);
      feedback = `${yes} dari ${pairs.length} pasangan tepat.`;
      break;
    }
    case "ordering": {
      const correct = g.correctOrder || [];
      if (
        answer.order?.length !== correct.length ||
        new Set(answer.order).size !== correct.length ||
        answer.order.some((id) => !correct.includes(id))
      )
        return null;
      const yes = correct.filter((id, i) => answer.order![i] === id).length;
      ratio = g.partialCredit
        ? yes / correct.length
        : Number(yes === correct.length);
      feedback = `${yes} dari ${correct.length} langkah berada pada posisi yang benar.`;
      break;
    }
    case "journal_entry": {
      const lines = (answer.lines || []).filter(
        (l) => l.accountId || l.debit || l.credit,
      );
      if (
        !lines.length ||
        lines.some(
          (l) =>
            !block.accounts?.includes(l.accountId) ||
            !nonnegative(l.debit) ||
            !nonnegative(l.credit) ||
            (l.debit > 0 && l.credit > 0) ||
            (l.debit === 0 && l.credit === 0),
        )
      )
        return null;
      const expected = g.expectedLines || [];
      const pool = [...lines];
      let points = 0;
      for (const target of expected) {
        let best = 0,
          bestIndex = -1;
        pool.forEach((line, i) => {
          const score =
            line.accountId === target.accountId
              ? 0.4 +
                (Math.abs(line.debit - target.debit) < 0.01 ? 0.3 : 0) +
                (Math.abs(line.credit - target.credit) < 0.01 ? 0.3 : 0)
              : 0;
          if (score > best) {
            best = score;
            bestIndex = i;
          }
        });
        if (bestIndex >= 0) {
          points += best;
          pool.splice(bestIndex, 1);
        }
      }
      // Extra entries must not earn a perfect score simply by containing the expected pair.
      ratio = points / Math.max(expected.length, lines.length);
      const debit = lines.reduce((sum, l) => sum + l.debit, 0),
        credit = lines.reduce((sum, l) => sum + l.credit, 0);
      if (Math.abs(debit - credit) >= 0.01) {
        ratio = Math.min(ratio, 0.5);
        feedback =
          "Debit dan kredit belum seimbang. Periksa akun serta nominal jurnal.";
      } else
        feedback = `Debit dan kredit seimbang: Rp${formatNumber(debit)}. ${ratio >= 0.999 ? "Akun dan nominal sudah tepat." : "Periksa lagi akun, nominal, dan baris tambahan."}`;
      if (!g.partialCredit) ratio = Number(ratio >= 0.999);
      break;
    }
    default:
      return null;
  }
  return {
    earned: Math.round(Math.min(1, Math.max(0, ratio)) * g.points * 100) / 100,
    max: g.points,
    feedback,
  };
}

export function bestAttempt(
  module: LearningModule,
  session: Session,
  id: string,
) {
  const attempts = session.attempts[id] || [];
  if (!attempts.length) return undefined;
  if (module.assessment.attemptPolicy === "first") return attempts[0];
  if (module.assessment.attemptPolicy === "latest") return attempts.at(-1);
  return attempts.reduce((best, a) => (a.earned > best.earned ? a : best));
}

export function summarize(module: LearningModule, session: Session) {
  const blocks = blocksOf(module),
    required = blocks.filter((b) => b.required);
  const requiredCompleted = required.filter(
    (b) => session.completed[b.id],
  ).length;
  const maxScore = blocks.reduce((sum, b) => sum + (b.grading?.points || 0), 0);
  const score =
    Math.round(
      blocks.reduce(
        (sum, b) => sum + (bestAttempt(module, session, b.id)?.earned || 0),
        0,
      ) * 100,
    ) / 100;
  const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0;
  return {
    requiredCompleted,
    requiredTotal: required.length,
    completion: required.length
      ? Math.round((requiredCompleted / required.length) * 100)
      : 100,
    score,
    maxScore,
    percentage,
    passed:
      percentage >= module.assessment.passingScore &&
      (!module.assessment.requireAllRequired ||
        requiredCompleted === required.length),
    pendingManual: blocks.some(
      (b) => b.type === "reflection" && b.reviewMode !== "self" && session.completed[b.id],
    ),
  };
}

export function worksheetResult(
  module: LearningModule,
  session: Session,
  worksheet: Worksheet,
) {
  const blocks = blocksOf(module).filter((block) => worksheet.blockIds.includes(block.id));
  const max = blocks.reduce((sum, block) => sum + (block.grading?.points || 0), 0);
  const score = blocks.reduce((sum, block) => sum + (bestAttempt(module, session, block.id)?.earned || 0), 0);
  const completed = blocks.filter((block) => session.completed[block.id]).length;
  return { score, max, percentage: max ? Math.round((score / max) * 100) : 0, completed, total: blocks.length };
}

export function unitResult(module: LearningModule, session: Session, unit: SelfLearningUnit) {
  const worksheets = unit.worksheets.map((worksheet) => worksheetResult(module, session, worksheet));
  const weighted = unit.worksheets.reduce((sum, worksheet, index) => sum + worksheets[index]!.percentage * worksheet.scoreWeight, 0);
  const weights = unit.worksheets.reduce((sum, worksheet) => sum + worksheet.scoreWeight, 0);
  const percentage = weights ? Math.round(weighted / weights) : 0;
  const required = new Set(unit.masteryCriteria.requiredWorksheetIds);
  const requiredDone = unit.worksheets.filter((worksheet, index) => !required.has(worksheet.id) || worksheets[index]!.completed === worksheets[index]!.total).length === unit.worksheets.length;
  return { percentage, mastered: percentage >= unit.masteryCriteria.minimumScore && requiredDone, worksheets };
}

export function unmetPrerequisites(module: LearningModule, session: Session, unit?: SelfLearningUnit) {
  if (!unit) return [];
  return unit.prerequisiteUnitIds.filter((id) => {
    const prerequisite = module.learningUnits?.find((candidate) => candidate.id === id);
    return prerequisite && !unitResult(module, session, prerequisite).mastered;
  });
}

/** Returns authoring errors for PLF 1.1 self-learning modules without affecting v1.0 modules. */
export function validateSelfLearningModule(module: LearningModule) {
  if (module.schemaVersion !== "1.1.0") return [];
  const errors: string[] = [];
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) errors.push(`duplicate ${label}`);
  };
  const pages = new Set(module.pages.map((page) => page.id));
  const blockIds = blocksOf(module).map((block) => block.id);
  const units = module.learningUnits || [];
  const references = new Set((module.references || []).map((reference) => reference.id));
  unique(blockIds, "block ID");
  unique(units.map((unit) => unit.id), "unit ID");
  for (const unit of units) {
    if (unit.pageIds.some((id) => !pages.has(id))) errors.push(`unit ${unit.id} has unknown page`);
    if (unit.prerequisiteUnitIds.some((id) => !units.some((candidate) => candidate.id === id))) errors.push(`unit ${unit.id} has unknown prerequisite`);
    unique(unit.worksheets.map((worksheet) => worksheet.id), `worksheet ID in ${unit.id}`);
    for (const worksheet of unit.worksheets)
      if (worksheet.blockIds.some((id) => !blockIds.includes(id))) errors.push(`worksheet ${worksheet.id} has unknown block`);
  }
  for (const block of blocksOf(module)) {
    if (block.referenceIds?.some((id) => !references.has(id))) errors.push(`block ${block.id} has unknown reference`);
    if (block.remediation && !blockIds.includes(block.remediation.onIncorrect.targetBlockId)) errors.push(`block ${block.id} has unknown remediation target`);
  }
  return errors;
}

export function mergeRanges(
  ranges: [number, number][],
  duration: number,
): [number, number][] {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const sorted = ranges
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a)
    .map(([a, b]): [number, number] => [
      Math.max(0, Math.min(a, duration)),
      Math.max(0, Math.min(b, duration)),
    ])
    .sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1] + 0.05)
      last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

export const emptyMedia = (): MediaRecord => ({
  ranges: [],
  duration: 0,
  coverage: 0,
  playbackSeconds: 0,
  seeks: 0,
});

export function makeReport(
  module: LearningModule,
  session: Session,
  timezone: string,
  now = new Date().toISOString(),
) {
  const result = summarize(module, session),
    endedAt = session.endedAt || now;
  return {
    kind: "plf.sessionReport",
    schemaVersion: "1.0.0",
    sessionId: session.sessionId,
    moduleId: module.id,
    moduleRevision: module.revision,
    startedAt: session.startedAt,
    endedAt,
    timezone,
    durationSeconds: Math.max(
      0,
      (Date.parse(endedAt) - Date.parse(session.startedAt)) / 1000,
    ),
    activeSeconds: session.activeSeconds,
    completion: {
      requiredCompleted: result.requiredCompleted,
      requiredTotal: result.requiredTotal,
      status:
        result.requiredCompleted === result.requiredTotal
          ? "completed"
          : "incomplete",
    },
    assessment: {
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.maxScore ? result.percentage : null,
      status: result.pendingManual
        ? "pending_manual"
        : !result.maxScore
          ? "not_scored"
          : result.passed
            ? "passed"
            : "failed",
    },
    activities: blocksOf(module).map((b) => {
      const attempt = bestAttempt(module, session, b.id),
        media = session.media[b.id];
      return {
        activityId: b.id,
        type: b.type,
        attempts: session.attempts[b.id]?.length || 0,
        activeSeconds: session.activitySeconds[b.id] || 0,
        completed: !!session.completed[b.id],
        ...(b.grading ? { maxScore: b.grading.points } : {}),
        ...(attempt ? { score: attempt.earned } : {}),
        ...(session.answers[b.id] ? { answer: session.answers[b.id] } : {}),
        ...(b.type === "video" && media
          ? {
              videoMetrics: {
                durationSeconds: media.duration,
                playbackSeconds: media.playbackSeconds,
                uniqueCoverage: media.coverage,
                seekCount: media.seeks,
                playedRanges: media.ranges,
              },
            }
          : {}),
      };
    }),
    learningUnits: module.learningUnits?.map((unit) => ({
      unitId: unit.id,
      title: unit.title,
      mastery: unitResult(module, session, unit).percentage,
      mastered: unitResult(module, session, unit).mastered,
      worksheets: unit.worksheets.map((worksheet) => ({
        worksheetId: worksheet.id,
        title: worksheet.title,
        ...worksheetResult(module, session, worksheet),
      })),
    })),
    disclaimer:
      "Laporan belajar mandiri dari browser peserta, tidak dikirim otomatis. Waktu, jawaban, dan pemutaran media belum diverifikasi server; bukan sertifikat profesi.",
  };
}
