import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { findActiveRecord, parseWorkbook } from "./workbook";

const common = ["kode_konfirmasi", "token_akses", "nama_penerima", "email_penerima", "nama_entitas", "jenis_konfirmasi", "tanggal_konfirmasi", "tanggal_saldo", "mata_uang", "nilai_saldo", "keterangan", "tanggal_kedaluwarsa", "status_akses"];

function workbook(expiresAt = "2099-12-31") {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([["kode_klien", "nama_klien", "notifikasi_email", "notifikasi_whatsapp"], ["K000001", "PT Contoh", "TIDAK", "TIDAK"]]), "PENGATURAN");
  for (const type of ["PIUTANG", "UTANG", "BANK", "LAINNYA"]) {
    const headers = [...common, "kolom_khusus"];
    const rows = type === "PIUTANG" ? [headers, ["KF-001", "abcdefghijklmnopqrstuv", "Ibu Rani", "rani@example.com", "PT Contoh", type, "2026-01-01", "2025-12-31", "IDR", 500000, "Saldo piutang", expiresAt, "AKTIF", "INV-001"]] : [headers];
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), type);
  }
  return Buffer.from(XLSX.write(book, { type: "buffer", bookType: "xlsx" }));
}

describe("universal confirmation workbook", () => {
  it("reads the universal sheets and returns only the matching active token", () => {
    const parsed = parseWorkbook(workbook(), "K000001");
    const record = findActiveRecord(parsed.records, "abcdefghijklmnopqrstuv");
    expect(record.confirmationCode).toBe("KF-001");
    expect(record.type).toBe("PIUTANG");
    expect(record.extra.kolom_khusus).toBe("INV-001");
  });

  it("rejects expired tokens without returning workbook data", () => {
    const parsed = parseWorkbook(workbook("2020-01-01"), "K000001");
    expect(() => findActiveRecord(parsed.records, "abcdefghijklmnopqrstuv")).toThrow(/tidak valid/i);
  });
});
