import asetTetap from "./content/aset-tetap.plf.json";
import selfLearningTemplate from "./content/template-self-learning.plf.json";
import { getPublishedModuleCards } from "./registry";
import type { LearningModule, LearningNode, ModuleCard } from "./types";

const modules: Record<string, LearningModule> = {
  "aset-tetap": asetTetap as LearningModule,
  "template-self-learning": selfLearningTemplate as LearningModule,
};

export function getLearningModule(slug: string) {
  return Object.hasOwn(modules, slug) ? modules[slug] : undefined;
}

/** Metadata is safe for catalog pages; PLF content remains imported only by module routes. */
export const learningCatalog: ModuleCard[] = getPublishedModuleCards();

/** Compatibility adapter for the future node renderer. Existing pages remain untouched. */
export function legacyModuleNodes(module: LearningModule): LearningNode[] {
  return module.pages.map((page) => ({
    id: `unit-${page.id}`,
    type: "unit" as const,
    unit: {
      id: page.id,
      title: page.title,
      learningObjectives: [],
      content: page.blocks,
      reportEnabled: true,
    },
  }));
}

export function mediaSource(slug: string, source = "") {
  // Published modules use their own local assets; no arbitrary imported markup or URLs.
  if (!/^\.\/media\/[a-zA-Z0-9._-]+$/.test(source)) return "";
  return `/learning/${encodeURIComponent(slug)}/${source.slice(2)}`;
}
