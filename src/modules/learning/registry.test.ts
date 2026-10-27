import { describe, expect, it } from "vitest";
import {
  breadcrumbs,
  getDescendantTopicIds,
  getChildTopics,
  learningModuleRegistry,
  getModulesForDomain,
  getModulesForTopic,
  getTopicTree,
  legacyCatalogRedirect,
  resolveCatalogRoute,
  validateLearningRegistry,
} from "./registry";

describe("learning catalog registry", () => {
  it("keeps the published catalog valid and gives each domain an honest module count", () => {
    expect(() => validateLearningRegistry()).not.toThrow();
    expect(learningModuleRegistry.find((module) => module.id === "aset-tetap")?.publicCode).toBe("MOD-AKT-001");
    expect(getModulesForDomain("akuntansi")).toHaveLength(1);
    const auditModules = getModulesForDomain("audit");
    expect(auditModules).toHaveLength(8);
    expect(auditModules.map((module) => module.publicCode)).toEqual(
      Array.from({ length: 8 }, (_, index) => `MOD-AUD-${String(index + 1).padStart(3, "0")}`),
    );
    expect(auditModules.every((module) => (module.estimatedMinutes || 0) <= 20)).toBe(true);
  });

  it("requires every module to use a unique public code in the expected format", () => {
    const registration = learningModuleRegistry[0]!;
    expect(() =>
      validateLearningRegistry([{ ...registration, publicCode: "aset-tetap" }]),
    ).toThrow("invalid public code");
    expect(() =>
      validateLearningRegistry([
        registration,
        { ...registration, id: "aset-tetap-2", slug: "aset-tetap-2" },
      ]),
    ).toThrow("duplicate module public code");
  });

  it("resolves recursive topic URLs and counts their published descendants", () => {
    const route = resolveCatalogRoute("akuntansi", ["akuntansi-menengah", "aset-tetap"]);
    expect(route?.topic?.id).toBe("accounting-fixed-assets");
    expect(getDescendantTopicIds("accounting-intermediate")).toContain("accounting-fixed-assets");
    expect(getModulesForTopic("accounting-intermediate", { descendants: true })).toHaveLength(1);
    expect(getTopicTree("akuntansi").find((topic) => topic.id === "accounting-intermediate")?.moduleCount).toBe(1);
  });

  it("returns stable breadcrumbs and rejects paths outside the topic tree", () => {
    const route = resolveCatalogRoute("pajak", ["ppn", "faktur-pajak"]);
    expect(breadcrumbs(route!.domain, route!.topic).map((item) => item.label)).toEqual(["Belajar", "Pajak", "PPN", "Faktur Pajak"]);
    expect(resolveCatalogRoute("akuntansi", ["ppn"])).toBeUndefined();
  });

  it("maps Audit & Asurans into seven ordered paths and 32 coming-soon subtopics", () => {
    const paths = getChildTopics("audit", "audit-assurance");
    expect(paths.map((topic) => topic.id)).toEqual([
      "audit-foundations", "audit-planning-risk", "audit-evidence-controls", "audit-cycles",
      "audit-completion-reporting", "audit-other-assurance", "audit-special",
    ]);
    expect(paths.flatMap((path) => getChildTopics("audit", path.id))).toHaveLength(32);
    expect(getModulesForTopic("audit-foundations", { descendants: true })).toHaveLength(8);
    expect(getModulesForTopic("audit-planning-risk", { descendants: true })).toHaveLength(0);
    const route = resolveCatalogRoute("audit", ["audit-dan-asurans", "perencanaan-dan-risiko-audit", "risiko-kecurangan"]);
    expect(route?.topic?.id).toBe("audit-fraud");
    expect(breadcrumbs(route!.domain, route!.topic).map((item) => item.label)).toEqual([
      "Belajar", "Audit", "Audit & Asurans", "Perencanaan & Risiko Audit", "Risiko Kecurangan",
    ]);
  });

  it("redirects legacy audit URLs to their new recursive locations", () => {
    expect(legacyCatalogRedirect("audit", ["audit-dan-asurans", "pengantar-audit"])).toBe(
      "/belajar/audit/audit-dan-asurans/fondasi-dan-profesi-audit/pengantar-audit",
    );
    expect(legacyCatalogRedirect("audit", ["audit-dan-asurans", "perencanaan-audit", "risiko-audit"])).toBe(
      "/belajar/audit/audit-dan-asurans/perencanaan-dan-risiko-audit/risiko-audit",
    );
  });
});
