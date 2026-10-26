import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import moduleSchema from "./schemas/plf-module-v1.schema.json";
import selfLearningSchema from "./schemas/plf-module-v1.1.schema.json";
import reportSchema from "./schemas/plf-report-v1.schema.json";
import { getLearningModule, learningCatalog, mediaSource } from "./catalog";
import { auditMicroModules } from "./content/audit-micro-modules";
import {
  bestAttempt,
  blocksOf,
  createSession,
  evaluate,
  makeReport,
  mergeRanges,
  restoreSession,
  storageKey,
  summarize,
  unitResult,
  validateSelfLearningModule,
} from "./engine";
import type { Answer, BlockType } from "./types";

const lesson = getLearningModule("aset-tetap")!;
const selfLearning = getLearningModule("template-self-learning")!;
const blocks = blocksOf(lesson);
const block = (type: BlockType) => blocks.find((b) => b.type === type)!;
const answers: Partial<Record<BlockType, Answer>> = {
  single_choice: { selected: "opsi-instalasi" },
  multiple_choice: { selections: ["harga", "angkut", "install"] },
  true_false: { truth: false },
  number_input: { value: "24000000" },
  matching: {
    matches: {
      "pasang-mesin": "pasang-mesin",
      "pasang-angkut": "pasang-angkut",
      "pasang-latih": "pasang-latih",
      "pasang-servis": "pasang-servis",
    },
  },
  ordering: {
    order: ["tentukan-biaya", "estimasi", "dasar", "beban", "jurnal"],
  },
  journal_entry: {
    lines: [
      { accountId: "beban-penyusutan", debit: 24000000, credit: 0 },
      { accountId: "akumulasi-penyusutan", debit: 0, credit: 24000000 },
    ],
  },
  case_decision: { selected: "koreksi" },
};
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
const validateReport = ajv.compile(reportSchema);

function completedSession() {
  const session = createSession(lesson);
  for (const b of blocks) {
    const answer = answers[b.type];
    if (answer) {
      const grade = evaluate(b, answer)!;
      session.answers[b.id] = answer;
      session.attempts[b.id] = [{ ...grade, answer, at: session.startedAt }];
    }
    if (b.required) session.completed[b.id] = true;
  }
  session.answers[block("reflection").id] = {
    text: "Biaya perolehan Rp128 juta, penyusutan Rp24 juta per tahun. Pelatihan dibebankan.",
  };
  return session;
}

describe("published PLF content", () => {
  it("matches the supplied module schema and ships all referenced assets", () => {
    const validate = ajv.compile(lesson.schemaVersion === "1.1.0" ? selfLearningSchema : moduleSchema);
    expect(validate(lesson), JSON.stringify(validate.errors)).toBe(true);
    expect(validateSelfLearningModule(lesson)).toEqual([]);
    expect(new Set(blocks.map((b) => b.type)).size).toBe(20);
    const ids = [...lesson.pages.map((p) => p.id), ...blocks.map((b) => b.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const b of blocks) {
      for (const id of b.competencyIds || [])
        expect(lesson.competencies.some((c) => c.id === id)).toBe(true);
      if (b.src)
        expect(
          existsSync(
            resolve("public", mediaSource("aset-tetap", b.src).slice(1)),
          ),
        ).toBe(true);
    }
  });
  it("rejects unknown routes and unsafe media paths", () => {
    expect(getLearningModule("unknown")).toBeUndefined();
    expect(getLearningModule("__proto__")).toBeUndefined();
    expect(mediaSource("aset-tetap", "javascript:alert(1)")).toBe("");
    expect(mediaSource("aset-tetap", "./media/../../private")).toBe("");
    expect(learningCatalog.find((module) => module.slug === "aset-tetap")?.activities).toBe(13);
  });
});

describe("PLF self-learning v1.1", () => {
  it("validates the draft template and its unit relationships", () => {
    const validate = ajv.compile(selfLearningSchema);
    expect(validate(selfLearning), JSON.stringify(validate.errors)).toBe(true);
    expect(validateSelfLearningModule(selfLearning)).toEqual([]);
  });

  it("calculates weighted worksheet mastery and accepts open navigation", () => {
    const session = createSession(selfLearning);
    const firstUnit = selfLearning.learningUnits![0]!;
    expect(unitResult(selfLearning, session, firstUnit).mastered).toBe(false);
    expect(selfLearning.learningPolicy?.allowSkip).toBe(true);
  });

  it("rejects broken worksheet and remediation relationships", () => {
    const broken = structuredClone(selfLearning);
    broken.learningUnits![0]!.worksheets[0]!.blockIds.push("missing-block");
    const choice = broken.pages[0]!.blocks.find((entry) => entry.id === "pilihan-tunggal")!;
    choice.remediation = { onIncorrect: { targetBlockId: "missing-material" } };
    expect(validateSelfLearningModule(broken)).toEqual(expect.arrayContaining([
      "worksheet ws-jurnal-terpandu has unknown block",
      "block pilihan-tunggal has unknown remediation target",
    ]));
  });
});

describe("audit micro-learning series", () => {
  it("keeps all 12 audit modules valid, short, and available through their public slugs", () => {
    expect(auditMicroModules).toHaveLength(12);
    for (const module of auditMicroModules) {
      const validate = ajv.compile(selfLearningSchema);
      expect(validate(module), JSON.stringify(validate.errors)).toBe(true);
      expect(validateSelfLearningModule(module)).toEqual([]);
      expect(module.metadata.estimatedMinutes).toBeLessThanOrEqual(20);
      expect(module.pages).toHaveLength(3);
      expect(module.learningUnits?.[0]?.worksheets).toHaveLength(2);
    }
    expect(getLearningModule("dasar-audit")?.metadata.estimatedMinutes).toBe(18);
    expect(getLearningModule("jenis-audit-dan-peran-auditor")?.metadata.estimatedMinutes).toBe(20);
  });
});

describe("assessment", () => {
  it.each(Object.entries(answers))(
    "awards full credit for a correct %s answer",
    (type, answer) => {
      const b = block(type as BlockType);
      expect(evaluate(b, answer)?.earned).toBe(b.grading!.points);
    },
  );
  it("rejects blank answers, including a blank number when the target is zero", () => {
    for (const type of Object.keys(answers))
      expect(evaluate(block(type as BlockType), {})).toBeNull();
    const numeric = {
      ...block("number_input"),
      grading: { points: 10, correctValue: 0, tolerance: 0 },
    };
    expect(evaluate(numeric, { value: " " })).toBeNull();
    expect(evaluate(numeric, { value: "0" })?.earned).toBe(10);
    expect(evaluate(numeric, { value: "Infinity" })).toBeNull();
  });
  it("penalizes wrong selections and allows partial credit without duplicate inflation", () => {
    const b = block("multiple_choice");
    expect(evaluate(b, { selections: ["harga"] })?.earned).toBe(5);
    expect(evaluate(b, { selections: ["harga", "harga"] })?.earned).toBe(5);
    expect(
      evaluate(b, { selections: b.options!.map((o) => o.id) })?.earned,
    ).toBe(0);
    expect(evaluate(block("true_false"), { truth: true })?.earned).toBe(0);
    expect(
      evaluate(block("case_decision"), { selected: "amortisasi" })?.earned,
    ).toBe(1);
  });
  it("rejects incomplete matching and invalid ordering permutations", () => {
    expect(
      evaluate(block("matching"), {
        matches: { "pasang-mesin": "pasang-mesin" },
      }),
    ).toBeNull();
    expect(
      evaluate(block("ordering"), { order: Array(5).fill("beban") }),
    ).toBeNull();
  });
  it("caps unbalanced journals and never fully rewards extra entries", () => {
    const b = block("journal_entry"),
      correct = answers.journal_entry!.lines!;
    expect(
      evaluate(b, { lines: [correct[0], { ...correct[1], credit: 100 }] })!
        .earned,
    ).toBeLessThanOrEqual(10);
    expect(
      evaluate(b, {
        lines: [
          ...correct,
          { accountId: "kas", debit: 5, credit: 0 },
          { accountId: "mesin", debit: 0, credit: 5 },
        ],
      })!.earned,
    ).toBeLessThan(20);
    expect(
      evaluate(b, { lines: [{ ...correct[0], debit: -1 }, correct[1]] }),
    ).toBeNull();
    expect(
      evaluate(b, { lines: [{ ...correct[0], credit: 10 }, correct[1]] }),
    ).toBeNull();
  });
  it("keeps the best score after a worse retry and respects alternative attempt policies", () => {
    const session = completedSession(),
      b = block("single_choice");
    session.attempts[b.id].push({ ...session.attempts[b.id][0], earned: 0 });
    expect(bestAttempt(lesson, session, b.id)?.earned).toBe(10);
    expect(
      bestAttempt(
        {
          ...lesson,
          assessment: { ...lesson.assessment, attemptPolicy: "latest" },
        },
        session,
        b.id,
      )?.earned,
    ).toBe(0);
    expect(
      bestAttempt(
        {
          ...lesson,
          assessment: { ...lesson.assessment, attemptPolicy: "first" },
        },
        session,
        b.id,
      )?.earned,
    ).toBe(10);
  });
});

describe("progress and reporting", () => {
  it("restores the current page and unsubmitted drafts, isolated by module revision", () => {
    const session = createSession(lesson);
    session.pageIndex = 3;
    session.answers[block("number_input").id] = { value: "123" };
    expect(restoreSession(JSON.stringify(session), lesson)).toEqual(session);
    expect(
      restoreSession(JSON.stringify(session), { ...lesson, revision: 2 }),
    ).toBeNull();
    expect(storageKey(lesson)).not.toBe(storageKey({ ...lesson, revision: 2 }));
  });
  it("recovers from corrupted storage instead of crashing", () => {
    expect(restoreSession("not json", lesson)).toBeNull();
    expect(
      restoreSession(
        JSON.stringify({
          ...createSession(lesson),
          answers: { bad: { order: 10 } },
        }),
        lesson,
      ),
    ).toBeNull();
    expect(
      restoreSession(
        JSON.stringify({ ...createSession(lesson), attempts: { bad: {} } }),
        lesson,
      ),
    ).toBeNull();
    expect(
      restoreSession(
        JSON.stringify({ ...createSession(lesson), pageIndex: 99 }),
        lesson,
      ),
    ).toBeNull();
  });
  it("separates full automatic scores, required completion, and manual reflection", () => {
    const session = completedSession();
    expect(summarize(lesson, session)).toMatchObject({
      score: 100,
      maxScore: 100,
      completion: 100,
      requiredTotal: 10,
      passed: true,
      pendingManual: true,
    });
    session.completed[block("reflection").id] = false;
    expect(summarize(lesson, session)).toMatchObject({
      score: 100,
      completion: 90,
      passed: false,
      pendingManual: false,
    });
  });
  it("exports valid PLF reports for both incomplete and completed sessions", () => {
    for (const session of [createSession(lesson), completedSession()]) {
      session.media[block("video").id] = {
        duration: 10,
        coverage: 0.5,
        playbackSeconds: 6,
        seeks: 1,
        ranges: [[0, 5]],
      };
      const report = makeReport(lesson, session, "Asia/Jakarta");
      expect(
        validateReport(report),
        JSON.stringify(validateReport.errors),
      ).toBe(true);
      expect(report.activities).toHaveLength(blocks.length);
    }
    const report = makeReport(lesson, completedSession(), "Asia/Jakarta");
    expect(report.assessment.status).toBe("pending_manual");
    expect(report.assessment.percentage).toBe(100);
  });
  it("merges repeated media playback without counting skipped gaps", () => {
    expect(
      mergeRanges(
        [
          [0, 2],
          [1, 3],
          [8, 10],
          [8, 10],
        ],
        10,
      ),
    ).toEqual([
      [0, 3],
      [8, 10],
    ]);
    expect(mergeRanges([[0, 20]], 10)).toEqual([[0, 10]]);
    expect(mergeRanges([[0, 2]], NaN)).toEqual([]);
  });
});
