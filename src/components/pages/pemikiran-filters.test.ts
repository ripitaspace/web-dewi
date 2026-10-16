import { describe, expect, it } from "vitest";
import type { BlogPost } from "../../modules/cms/types/blog.types";
import { filterThoughts, getThoughtTopics } from "./pemikiran-filters";

function post(title: string, dateISO?: string | null, topics: string[] = []): BlogPost {
  return { id: title, slug: title, title, dateISO, topics, date: "31 Agt 2026", excerpt: "",
    content: "", author: "pus", category: "Umum", type: "pemikiran", image: "" };
}

describe("Pemikiran filters", () => {
  const posts = [
    post("Agustus", "2026-08-31T10:00:00Z"),
    post("Oktober", "2026-10-16T10:00:00Z"),
    post("Tahun lalu", "2025-12-31T10:00:00Z"),
    post("Tahun depan", "2027-01-01T10:00:00Z"),
  ];

  it("sorts chronologically across months and years without mutating the source", () => {
    expect(filterThoughts(posts, "", "", "newest").map(p => p.title))
      .toEqual(["Tahun depan", "Oktober", "Agustus", "Tahun lalu"]);
    expect(filterThoughts(posts, "", "", "oldest").map(p => p.title))
      .toEqual(["Tahun lalu", "Agustus", "Oktober", "Tahun depan"]);
    expect(posts[0].title).toBe("Agustus");
  });

  it.each(["newest", "oldest"] as const)("puts unknown dates last and breaks ties by title for %s", sort => {
    const items = [post("Z", null), post("B", "2026-01-01"), post("Y", "invalid"),
      post("A", "2026-01-01"), post("X")];
    expect(filterThoughts(items, "", "", sort).map(p => p.title)).toEqual(["A", "B", "X", "Y", "Z"]);
  });

  it("sorts by title independently of dates", () => {
    expect(filterThoughts(posts, "", "", "title").map(p => p.title))
      .toEqual(["Agustus", "Oktober", "Tahun depan", "Tahun lalu"]);
  });

  it("offers only unique nonempty topics in alphabetical order", () => {
    const items = [post("A", null, [" VAT  IN ", "CORETAX", ""]),
      post("B", null, ["vat in", " coretax ", "Education"])];
    expect(getThoughtTopics(items)).toEqual([
      { value: "coretax", label: "CORETAX" }, { value: "education", label: "Education" },
      { value: "vat in", label: "VAT IN" },
    ]);
  });

  it("combines topic and search, including normalized titles, excerpts and topics", () => {
    const items = [post("Faktur Excel", null, [" CORETAX "]), post("Download Faktur", null, ["Coretax"]),
      post("Excel lainnya", null, ["Education"])];
    items[1].excerpt = "Petunjuk otomatis";
    expect(filterThoughts(items, "  EXCEL ", "coretax", "newest").map(p => p.title)).toEqual(["Faktur Excel"]);
    expect(filterThoughts(items, "otomatis", "coretax", "newest").map(p => p.title)).toEqual(["Download Faktur"]);
    expect(filterThoughts(items, "coretax", "", "newest")).toHaveLength(2);
    expect(filterThoughts(items, "umum", "", "newest")).toEqual([]);
    expect(filterThoughts(items, "pemikiran", "", "newest")).toEqual([]);
    expect(filterThoughts(items, "tidak-ada-hasil-xyz", "coretax", "newest")).toEqual([]);
    expect(filterThoughts(items, "", "", "newest")).toHaveLength(3);
  });

  it("handles an empty library", () => {
    expect(getThoughtTopics([])).toEqual([]);
    expect(filterThoughts([], "", "", "newest")).toEqual([]);
  });
});
