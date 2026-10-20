import { describe, expect, it } from "vitest";
import {
  createInvoiceBookmarkletSource,
  createInvoiceBookmarkletUrl,
  INVOICE_BOOKMARKLET_URL,
} from "./invoice-bookmarklet";

type FakeRow = {
  querySelectorAll: (selector: string) => unknown[];
  querySelector: (selector: string) => unknown;
};

function invoiceRow(invoiceNumber: string, onClick: () => void, visible = true): FakeRow {
  const label = { textContent: "Nomor Faktur Pajak" };
  const cell = {
    textContent: `Nomor Faktur Pajak ${invoiceNumber}`,
    querySelector: (selector: string) => selector === ".p-column-title" ? label : null,
  };
  const button = {
    isConnected: true,
    disabled: false,
    getClientRects: () => visible ? [{}] : [],
    getAttribute: () => null,
    click: onClick,
  };

  return {
    querySelectorAll: (selector) => selector === "td" ? [cell] : [],
    querySelector: (selector) => selector === '[id="DownloadButton"]' ? button : null,
  };
}

function withholdingSlipRow(withholdingSlipNumber: string, onClick: () => void, visible = true): FakeRow {
  const label = { textContent: "Nomor Pemotongan" };
  const cell = {
    textContent: `Nomor Pemotongan ${withholdingSlipNumber}`,
    querySelector: (selector: string) => selector === ".p-column-title" ? label : null,
  };
  const button = {
    isConnected: true,
    disabled: false,
    getClientRects: () => visible ? [{}] : [],
    getAttribute: () => null,
    click: onClick,
  };

  return {
    querySelectorAll: (selector) => selector === "td" ? [cell] : [],
    querySelector: (selector) => selector === '[id="DownloadButton"]' ? button : null,
  };
}

async function runBookmarklet(getRows: () => FakeRow[], kind: "invoice" | "withholding-slip" = "invoice") {
  const alerts: string[] = [];
  const windowLike: Record<string, unknown> = {};
  const execute = new Function("window", "document", "getComputedStyle", "alert", "setTimeout", `return ${createInvoiceBookmarkletSource(kind)}`);

  await execute(
    windowLike,
    { querySelectorAll: () => getRows() },
    () => ({ visibility: "visible", display: "block" }),
    (message: string) => alerts.push(message),
    (callback: () => void) => { callback(); return 0; },
  );

  return { alerts, windowLike };
}

describe("invoice bookmarklet", () => {
  it("builds an auditable source with the fixed two-second delay", () => {
    const source = createInvoiceBookmarkletSource();

    expect(source).toContain("const CLICK_DELAY_MS = 2000;");
    expect(source).toContain("RIPITA says");
    expect(source).toContain("Sedang memproses download.");
    expect(source).toContain("Hentikan dengan aman");
    expect(source).toContain("Kalau gagal, kamu coba nabung deh biar Mbak Pus nggak pusing.");
    expect(source).toContain("window.__ripitaInvoiceDownloadRunning");
    expect(source).toContain("attemptedInvoiceNumbers");
    expect(source).toContain("getInvoiceNumber(row)");
    expect(source).toContain("TABLE_SELECTOR + ' tbody tr'");
  });

  it("encodes the readable source as a single-line bookmarklet", () => {
    const url = createInvoiceBookmarkletUrl();

    expect(url.startsWith("javascript:")).toBe(true);
    expect(url).not.toContain("\n");
    expect(decodeURIComponent(url.slice("javascript:".length))).toBe(createInvoiceBookmarkletSource());
    expect(decodeURIComponent(INVOICE_BOOKMARKLET_URL.slice("javascript:".length))).toContain("const CLICK_DELAY_MS = 2000;");
  });

  it("configures bukti potong for the Coretax table wrapper and Nomor Pemotongan", () => {
    const source = createInvoiceBookmarkletSource("withholding-slip");
    const url = createInvoiceBookmarkletUrl("withholding-slip");

    expect(source).toContain('const TABLE_SELECTOR = ".p-datatable-wrapper table";');
    expect(source).toContain('const INVOICE_LABEL = "Nomor Pemotongan";');
    expect(source).toContain('const CLICK_DELAY_MS = 2000;');
    expect(source).toContain('[id="DownloadButton"]');
    expect(decodeURIComponent(url.slice("javascript:".length))).toBe(source);
  });

  it("rechecks rerendered rows and clicks each invoice number only once", async () => {
    const clicked: string[] = [];
    let rows: FakeRow[] = [];
    const clickFirst = () => {
      clicked.push("001");
      rows = [invoiceRow("001", () => clicked.push("duplicate")), invoiceRow("002", () => clicked.push("002"))];
    };
    rows = [invoiceRow("001", clickFirst)];

    const result = await runBookmarklet(() => rows);

    expect(clicked).toEqual(["001", "002"]);
    expect(result.alerts.at(-1)).toContain("Tombol dipicu: 2");
    expect(result.windowLike.__ripitaInvoiceDownloadRunning).toBeUndefined();
  });

  it("does not retry a button that throws during its click", async () => {
    const clicked: string[] = [];
    const rows = [invoiceRow("001", () => { clicked.push("001"); throw new Error("blocked"); })];

    const result = await runBookmarklet(() => rows);

    expect(clicked).toEqual(["001"]);
    expect(result.alerts.at(-1)).toContain("Gagal dipicu: 1");
  });

  it("rechecks rerendered bukti potong rows and clicks each Nomor Pemotongan once", async () => {
    const clicked: string[] = [];
    let rows: FakeRow[] = [];
    const clickFirst = () => {
      clicked.push("2605C58O6");
      rows = [
        withholdingSlipRow("2605C58O6", () => clicked.push("duplicate")),
        withholdingSlipRow("2605C58O7", () => clicked.push("2605C58O7")),
      ];
    };
    rows = [withholdingSlipRow("2605C58O6", clickFirst)];

    const result = await runBookmarklet(() => rows, "withholding-slip");

    expect(clicked).toEqual(["2605C58O6", "2605C58O7"]);
    expect(result.alerts.at(-1)).toContain("Tombol dipicu: 2");
    expect(result.windowLike.__ripitaInvoiceDownloadRunning).toBeUndefined();
  });
});
