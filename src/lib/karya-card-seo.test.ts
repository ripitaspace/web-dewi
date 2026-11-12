import { describe, expect, it } from "vitest";
import { getIndexableKaryaCards, KARYA_CARD_SEO } from "./karya-card-seo";
import { MINI_TOOLS } from "./mini-tools";

describe("Karya card SEO registry", () => {
  it("covers every card and indexes only tools that are available", () => {
    expect(Object.keys(KARYA_CARD_SEO)).toHaveLength(MINI_TOOLS.length);
    expect(getIndexableKaryaCards()).toHaveLength(11);
    expect(getIndexableKaryaCards().every((tool) => tool.status === "available")).toBe(true);
  });

  it("gives each indexable card a distinct search title and intent", () => {
    const cards = getIndexableKaryaCards().map((tool) => KARYA_CARD_SEO[tool.href]);
    expect(new Set(cards.map((card) => card.title)).size).toBe(cards.length);
    expect(new Set(cards.map((card) => card.intent)).size).toBe(cards.length);
  });

  it("keeps maintenance cards available in the catalogue but out of the indexable set", () => {
    const maintenanceTool = MINI_TOOLS.find((tool) => tool.href === "/karya/tools/invoice-generator");
    expect(maintenanceTool).toBeDefined();
    expect(KARYA_CARD_SEO[maintenanceTool!.href].indexable).toBe(false);
  });
});
