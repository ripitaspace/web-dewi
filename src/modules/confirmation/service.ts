import { randomUUID } from "node:crypto";
import { MAX_UPLOAD_BYTES, ALLOWED_UPLOAD_TYPES } from "./config";
import { answerFolder, findIdempotentFile, masterWorkbook, uploadFile } from "./drive";
import { ConfirmationError, INVALID_CONFIRMATION_MESSAGE } from "./errors";
import { notifyReceipt } from "./notifications";
import { buildOnlineAnswerPdf, buildPrintPdf, normalizeUploadToPdf } from "./pdf";
import type { AnswerInput, ConfirmationRecord, ConfirmationSettings, PublicConfirmation, SubmissionResult } from "./types";
import { findActiveRecord, parseWorkbook } from "./workbook";

const attempts = new Map<string, number[]>();
const activeSubmissions = new Map<string, Promise<SubmissionResult>>();

function publicRecord(record: ConfirmationRecord, clientName: string): PublicConfirmation {
  return { ...record, settings: { kodeKlien: record.clientCode, namaKlien: clientName } };
}

function validatePathPart(value: string): void {
  if (!/^[A-Za-z0-9_-]{3,100}$/.test(value)) throw new ConfirmationError("INVALID_CONFIRMATION", INVALID_CONFIRMATION_MESSAGE, 404);
}

function enforceRateLimit(key: string): void {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((value) => value > now - 60_000);
  if (recent.length >= 10) throw new ConfirmationError("RATE_LIMITED", "Terlalu banyak percobaan. Silakan tunggu sebentar.", 429);
  recent.push(now); attempts.set(key, recent);
}

export async function getConfirmation(clientCode: string, token: string): Promise<{ record: ConfirmationRecord; settings: ConfirmationSettings }> {
  validatePathPart(clientCode); validatePathPart(token);
  try {
    const { settings, records } = parseWorkbook(await masterWorkbook(clientCode), clientCode);
    return { record: findActiveRecord(records, token), settings };
  } catch (error) {
    if (error instanceof ConfirmationError) throw error;
    throw new ConfirmationError("INVALID_CONFIRMATION", INVALID_CONFIRMATION_MESSAGE, 404);
  }
}

export async function getPublicConfirmation(clientCode: string, token: string): Promise<PublicConfirmation> {
  const confirmation = await getConfirmation(clientCode, token);
  return publicRecord(confirmation.record, confirmation.settings.namaKlien);
}

export async function printableConfirmation(clientCode: string, token: string): Promise<Uint8Array> {
  return buildPrintPdf((await getConfirmation(clientCode, token)).record);
}

function validateAnswer(input: AnswerInput, record: ConfirmationRecord): void {
  if (!/^[0-9a-f-]{36}$/i.test(input.idempotencyKey)) throw new ConfirmationError("VALIDATION_ERROR", "Kunci pengiriman tidak valid.");
  if (!input.respondentName.trim() || !input.respondentRole.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.respondentDate) || !input.agreed) {
    throw new ConfirmationError("VALIDATION_ERROR", "Nama, jabatan, tanggal, dan persetujuan wajib diisi.");
  }
  if (input.method === "ONLINE") {
    if (!input.responseStatus) throw new ConfirmationError("VALIDATION_ERROR", "Pilih jawaban konfirmasi.");
    if ((record.type === "PIUTANG" || record.type === "UTANG") && input.responseStatus === "BERBEDA" && (!input.differenceExplanation?.trim() || input.respondentBalance === null)) {
      throw new ConfirmationError("VALIDATION_ERROR", "Nilai dan penjelasan perbedaan wajib diisi.");
    }
  }
}

function detectedMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "application/pdf";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}

async function uploadedPdf(file: File | null): Promise<Uint8Array> {
  if (!file || !file.size) throw new ConfirmationError("UPLOAD_REQUIRED", "Pilih dokumen jawaban untuk diunggah.");
  if (file.size > MAX_UPLOAD_BYTES) throw new ConfirmationError("UPLOAD_TOO_LARGE", "Ukuran berkas maksimal 10 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectedMime(bytes);
  if (!mimeType || !ALLOWED_UPLOAD_TYPES.has(mimeType)) throw new ConfirmationError("UPLOAD_INVALID", "Unggah PDF, JPG, atau PNG yang valid.");
  return normalizeUploadToPdf(bytes, mimeType);
}

export async function submitConfirmation(input: { clientCode: string; token: string; answer: AnswerInput; file: File | null; rateKey: string }): Promise<SubmissionResult> {
  enforceRateLimit(input.rateKey);
  const lockKey = `${input.clientCode}:${input.token}:${input.answer.idempotencyKey}`;
  const inFlight = activeSubmissions.get(lockKey);
  if (inFlight) return inFlight;
  const task = submitOnce(input).finally(() => activeSubmissions.delete(lockKey));
  activeSubmissions.set(lockKey, task);
  return task;
}

async function submitOnce(input: { clientCode: string; token: string; answer: AnswerInput; file: File | null }): Promise<SubmissionResult> {
  const { record, settings } = await getConfirmation(input.clientCode, input.token);
  validateAnswer(input.answer, record);
  const folderId = await answerFolder(input.clientCode, settings.folderJawabanId);
  const previous = await findIdempotentFile(folderId, input.answer.idempotencyKey);
  if (previous) return { receiptId: previous.appProperties?.receipt_id || previous.id, receivedAt: previous.appProperties?.received_at || "", duplicate: true, notification: "SKIPPED" };

  const pdf = input.answer.method === "UPLOAD" ? await uploadedPdf(input.file) : await buildOnlineAnswerPdf(record, input.answer);
  const receiptId = randomUUID();
  const receivedAt = new Date().toISOString();
  const file = await uploadFile({
    folderId, name: `${record.confirmationCode}_Jawaban_${receiptId.slice(0, 8)}.pdf`, mimeType: "application/pdf", bytes: pdf,
    appProperties: { idempotency_key: input.answer.idempotencyKey, receipt_id: receiptId, received_at: receivedAt, confirmation_code: record.confirmationCode, answer_method: input.answer.method },
  });
  const notification = await notifyReceipt({
    settings,
    record, answer: input.answer, receivedAt, driveFileId: file.id,
  });
  const metadata = new TextEncoder().encode(JSON.stringify({ receiptId, receivedAt, confirmationCode: record.confirmationCode, clientCode: record.clientCode, method: input.answer.method, respondent: { name: input.answer.respondentName, role: input.answer.respondentRole, date: input.answer.respondentDate }, notification, documentFileId: file.id }, null, 2));
  await uploadFile({ folderId, name: `${record.confirmationCode}_Metadata_${receiptId.slice(0, 8)}.json`, mimeType: "application/json", bytes: metadata, appProperties: { receipt_id: receiptId, confirmation_code: record.confirmationCode } });
  return { receiptId, receivedAt, duplicate: false, notification };
}
