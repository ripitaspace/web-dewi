import { describe, expect, it } from "vitest";
import { getLearningModule } from "./catalog";
import { ukpCModulesBySlug } from "./content/ukp-c-modules";
import { learningModuleRegistry } from "./registry";
import { rupiahValue } from "./content/ukp-c-builder";

describe("UKP C modules", () => {
  it("keeps every bank question exactly once with a valid answer key", () => {
    for (const [slug, module] of Object.entries(ukpCModulesBySlug)) {
      const blocks = module.pages.flatMap((page) => page.blocks);
      const ids = blocks.map((block) => block.id);
      expect(new Set(ids).size, slug).toBe(ids.length);
      const questions = blocks.filter((block) => /-soal-\d{2}$/.test(block.id));
      expect(questions.map((block) => block.id.slice(-2)), slug).toEqual(Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(2, "0")));
      for (const block of questions) {
        expect(block.prompt?.length, block.id).toBeGreaterThan(10);
        if (block.type === "single_choice") {
          expect(block.options, block.id).toHaveLength(4);
          expect(block.options!.map((option) => option.id)).toContain(block.grading!.correctOptionId);
          expect(block.options!.every((option) => option.text.length > 0), block.id).toBe(true);
        } else {
          expect(block.type, block.id).toBe("number_input");
          expect(Number.isFinite(block.grading!.correctValue), block.id).toBe(true);
        }
        expect(block.grading!.explanation!.length, block.id).toBeGreaterThan(20);
      }
      const registration = learningModuleRegistry.find((entry) => entry.slug === slug);
      expect(registration, slug).toBeDefined();
      expect(registration!.activityCount, slug).toBe(blocks.filter((block) => block.grading).length);
      expect(registration!.learningUnitCount, slug).toBe(module.learningUnits!.length);
      expect(getLearningModule(slug)).toBe(module);
    }
  });

  it("has a summary for every sub-topic and uses all nine mata uji", () => {
    expect(Object.keys(ukpCModulesBySlug)).toHaveLength(9);
    for (const [slug, module] of Object.entries(ukpCModulesBySlug)) {
      const pages = module.pages.filter((page) => /-bagian-\d+$/.test(page.id));
      for (const page of pages) {
        expect(page.blocks.some((block) => block.type === "reading"), `${slug}: ${page.title}`).toBe(true);
      }
    }
  });

  it("parses rupiah answers only when the option is purely a rupiah amount", () => {
    expect(rupiahValue("Rp13.750.000")).toBe(13750000);
    expect(rupiahValue("Rp0")).toBe(0);
    expect(rupiahValue("Rp40.000.000 dan Rp100.000.000")).toBeNull();
    expect(rupiahValue("10% dari harga jual")).toBeNull();
  });
});

describe("UKP A and B modules", () => {
  it("builds every original-practice module with valid keys, counts, and a verification warning", async () => {
    const { ukpAModulesBySlug } = await import("./content/ukp-a-modules");
    const { ukpBModulesBySlug } = await import("./content/ukp-b-modules");
    expect(Object.keys(ukpAModulesBySlug)).toHaveLength(5);
    expect(Object.keys(ukpBModulesBySlug)).toHaveLength(8);
    for (const [slug, module] of Object.entries({ ...ukpAModulesBySlug, ...ukpBModulesBySlug })) {
      const blocks = module.pages.flatMap((page) => page.blocks);
      const ids = blocks.map((block) => block.id);
      expect(new Set(ids).size, slug).toBe(ids.length);
      const questions = blocks.filter((block) => /-soal-\d{2}$/.test(block.id));
      expect(questions.length, slug).toBeGreaterThanOrEqual(15);
      expect(questions.map((block) => Number(block.id.slice(-2))), slug).toEqual(questions.map((_, i) => i + 1));
      for (const block of questions) {
        if (block.type === "single_choice") {
          expect(block.options, block.id).toHaveLength(4);
          expect(block.options!.map((option) => option.id)).toContain(block.grading!.correctOptionId);
        } else {
          expect(block.type, block.id).toBe("number_input");
          expect(Number.isFinite(block.grading!.correctValue), block.id).toBe(true);
        }
      }
      expect(blocks.some((block) => block.type === "callout" && block.content?.includes("Perlu Verifikasi")), slug).toBe(true);
      const registration = learningModuleRegistry.find((entry) => entry.slug === slug);
      expect(registration, slug).toBeDefined();
      expect(registration!.activityCount, slug).toBe(blocks.filter((block) => block.grading).length);
      expect(registration!.learningUnitCount, slug).toBe(module.learningUnits!.length);
      expect(getLearningModule(slug)).toBe(module);
    }
  });
});
