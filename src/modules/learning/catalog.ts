import asetTetap from "./content/aset-tetap.plf.json";
import type { LearningModule, ModuleCard } from "./types";

const modules: Record<string, LearningModule> = {
  "aset-tetap": asetTetap as LearningModule,
};

export function getLearningModule(slug: string) {
  return Object.hasOwn(modules, slug) ? modules[slug] : undefined;
}

export const learningCatalog: ModuleCard[] = Object.entries(modules).map(
  ([slug, module]) => ({
    slug,
    id: module.id,
    revision: module.revision,
    title: module.metadata.title,
    summary:
      "Kenali biaya perolehan, hitung penyusutan, dan coba pencatatan jurnal lewat satu kasus yang saling terhubung.",
    subject: module.metadata.subject,
    minutes: module.metadata.estimatedMinutes,
    level:
      module.metadata.level === "beginner" ? "Pemula" : module.metadata.level,
    pages: module.pages.length,
    activities: module.pages.reduce(
      (total, page) => total + page.blocks.length,
      0,
    ),
  }),
);

export function mediaSource(slug: string, source = "") {
  // Published modules use their own local assets; no arbitrary imported markup or URLs.
  if (!/^\.\/media\/[a-zA-Z0-9._-]+$/.test(source)) return "";
  return `/learning/${encodeURIComponent(slug)}/${source.slice(2)}`;
}
