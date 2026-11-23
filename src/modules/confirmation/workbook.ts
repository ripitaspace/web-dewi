import * as XLSX from "xlsx";
import { timingSafeEqual } from "node:crypto";
import { ConfirmationError, INVALID_CONFIRMATION_MESSAGE } from "./errors";
import { CONFIRMATION_TYPES, type ConfirmationRecord, type ConfirmationSettings, type ConfirmationType } from "./types";

const COMMON_COLUMNS = [
  "kode_konfirmasi", "token_akses", "nama_penerima", "email_penerima", "nama_entitas",
  "jenis_konfirmasi", "tanggal_konfirmasi", "tanggal_saldo", "mata_uang", "nilai_saldo",
  "keterangan", "tanggal_kedaluwarsa", "status_akses",
] as const;

type Row = Record<string, unknown>;

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function normalizedKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function yes(value: unknown): boolean {
  return ["ya", "y", "true", "1"].includes(text(value).toLowerCase());
}

function toIsoDate(value: unknown, label: string): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString().slice(0, 10);
  const raw = text(value);
  if (!raw) throw new ConfirmationError("WORKBOOK_INVALID", `Kolom ${label} belum diisi.`, 503);
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) throw new ConfirmationError("WORKBOOK_INVALID", `Kolom ${label} tidak valid.`, 503);
  return date.toISOString().slice(0, 10);
}

function rowsFor(workbook: XLSX.WorkBook, sheetName: string): Row[] {
  const name = workbook.SheetNames.find((item) => item.trim().toUpperCase() === sheetName);
  if (!name) throw new ConfirmationError("WORKBOOK_INVALID", `Sheet ${sheetName} tidak ditemukan.`, 503);
  const rows = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[name], { defval: "", raw: true });
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizedKey(key), value])));
}

function firstValue(row: Row, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = row[normalizedKey(key)];
    if (text(value)) return value;
  }
  return "";
}

export function parseWorkbook(buffer: Buffer, clientCode: string): { settings: ConfirmationSettings; records: ConfirmationRecord[] } {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch {
    throw new ConfirmationError("WORKBOOK_INVALID", "Workbook tidak dapat dibaca.", 503);
  }
  const settingRow = rowsFor(workbook, "PENGATURAN")[0];
  if (!settingRow) throw new ConfirmationError("WORKBOOK_INVALID", "Sheet PENGATURAN belum memiliki data.", 503);
  const settings: ConfirmationSettings = {
    kodeKlien: text(firstValue(settingRow, "kode_klien")),
    namaKlien: text(firstValue(settingRow, "nama_klien")),
    emailNotifikasi: [firstValue(settingRow, "email_notifikasi"), firstValue(settingRow, "email_notifikasi_tambahan")]
      .map(text).filter(Boolean),
    whatsappNotifikasi: text(firstValue(settingRow, "whatsapp_notifikasi")),
    folderJawabanId: text(firstValue(settingRow, "folder_jawaban_id")) || undefined,
    emailEnabled: yes(firstValue(settingRow, "notifikasi_email")),
    whatsappEnabled: yes(firstValue(settingRow, "notifikasi_whatsapp")),
  };
  if (settings.kodeKlien !== clientCode || !settings.namaKlien) {
    throw new ConfirmationError("WORKBOOK_INVALID", "Workbook tidak sesuai kode klien.", 503);
  }

  const records: ConfirmationRecord[] = [];
  for (const type of CONFIRMATION_TYPES) {
    for (const row of rowsFor(workbook, type)) {
      const confirmationCode = text(row.kode_konfirmasi);
      const token = text(row.token_akses);
      if (!confirmationCode && !token) continue;
      for (const column of COMMON_COLUMNS) {
        if (!text(row[column])) throw new ConfirmationError("WORKBOOK_INVALID", `Data ${type} belum lengkap.`, 503);
      }
      if (!/^[A-Za-z0-9_-]{22,}$/.test(token)) {
        throw new ConfirmationError("WORKBOOK_INVALID", "Token akses pada workbook tidak memenuhi standar keamanan.", 503);
      }
      const extra = Object.fromEntries(Object.entries(row)
        .filter(([key]) => !COMMON_COLUMNS.includes(key as (typeof COMMON_COLUMNS)[number]))
        .filter(([, value]) => text(value))
        .map(([key, value]) => [key, text(value)]));
      records.push({
        clientCode,
        confirmationCode,
        token,
        recipientName: text(row.nama_penerima),
        recipientEmail: text(row.email_penerima),
        entityName: text(row.nama_entitas),
        type: type as ConfirmationType,
        confirmationDate: toIsoDate(row.tanggal_konfirmasi, "tanggal_konfirmasi"),
        balanceDate: toIsoDate(row.tanggal_saldo, "tanggal_saldo"),
        currency: text(row.mata_uang).toUpperCase(),
        balance: text(row.nilai_saldo) === "" ? null : Number(row.nilai_saldo),
        description: text(row.keterangan),
        expiresAt: toIsoDate(row.tanggal_kedaluwarsa, "tanggal_kedaluwarsa"),
        status: text(row.status_akses).toUpperCase(),
        extra,
      });
    }
  }
  if (!records.length) throw new ConfirmationError("WORKBOOK_INVALID", "Tidak ada permintaan konfirmasi pada workbook.", 503);
  return { settings, records };
}

export function findActiveRecord(records: ConfirmationRecord[], token: string): ConfirmationRecord {
  const matching = records.filter((record) => {
    const a = Buffer.from(record.token);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  });
  const record = matching[0];
  if (!record || matching.length !== 1 || record.status !== "AKTIF" || new Date(`${record.expiresAt}T23:59:59.999Z`) < new Date()) {
    throw new ConfirmationError("INVALID_CONFIRMATION", INVALID_CONFIRMATION_MESSAGE, 404);
  }
  return record;
}
