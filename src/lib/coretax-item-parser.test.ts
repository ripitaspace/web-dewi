import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type ParsedItem = { name: string; no: number; sourcePage: number };
type Parser = (pages: Array<{ text: string; sourcePage: number }>) => { foundTable: boolean; items: ParsedItem[] };

function loadWorkspaceParser(): Parser {
  const source = readFileSync(resolve(process.cwd(), "public/tools/coretax/puspita-ux.js"), "utf8");
  const start = source.indexOf("  function parseCurrency");
  const end = source.indexOf("  function itemSequenceIssues");
  if (start < 0 || end < 0) throw new Error("Coretax item parser tidak ditemukan.");
  const parserSource = source.slice(start, end);
  return new Function(`${parserSource}\nreturn parseTableItems;`)() as Parser;
}

function item(number: number) {
  return [`Produk ${number}`, `${number} 845000 1000,00 x 1,00 Piece 1000,00`].join("\n");
}

describe("Coretax PDF item parser", () => {
  it("continues a scanned item table across pages without repeated headings", () => {
    const parseTableItems = loadWorkspaceParser();
    const pages = Array.from({ length: 9 }, (_, pageIndex) => {
      const firstItem = pageIndex * 14 + 1;
      const lastItem = Math.min(firstItem + 13, 119);
      const heading = pageIndex === 0 ? "Nama Barang Kena Pajak / Jasa Kena Pajak\n" : "";
      return {
        sourcePage: pageIndex + 1,
        text: heading + Array.from({ length: lastItem - firstItem + 1 }, (_, offset) => item(firstItem + offset)).join("\n"),
      };
    });
    pages.push({
      sourcePage: 10,
      text: "Harga Jual / Penggantian / Uang Muka / Termin\n999 845000 1000,00 x 1,00 Piece 1000,00",
    });

    const result = parseTableItems(pages);

    expect(result.foundTable).toBe(true);
    expect(result.items).toHaveLength(119);
    expect(result.items[0]).toMatchObject({ no: 1, name: "Produk 1", sourcePage: 1 });
    expect(result.items[118]).toMatchObject({ no: 119, name: "Produk 119", sourcePage: 9 });
  });

  it("keeps a product name that starts on one page until its price is on the next", () => {
    const parseTableItems = loadWorkspaceParser();
    const result = parseTableItems([
      { sourcePage: 1, text: "Nama Barang Kena Pajak / Jasa Kena Pajak\nProduk lintas halaman" },
      { sourcePage: 2, text: "1 845000 1000,00 x 1,00 Piece 1000,00" },
    ]);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ no: 1, name: "Produk lintas halaman", sourcePage: 2 });
  });
});
