import { describe, expect, it } from "vitest";
import {
  breadcrumbs,
  getDescendantTopicIds,
  getModulesForDomain,
  getModulesForTopic,
  getTopicTree,
  resolveCatalogRoute,
  validateLearningRegistry,
} from "./registry";

describe("learning catalog registry", () => {
  it("keeps the published catalog valid and gives each domain an honest module count", () => {
    expect(() => validateLearningRegistry()).not.toThrow();
    expect(getModulesForDomain("akuntansi")).toHaveLength(1);
    expect(getModulesForDomain("audit")).toHaveLength(0);
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
});
