import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AnswerInput, ConfirmationRecord } from "./types";
import { ConfirmationError } from "./errors";

function money(value: number | null, currency: string): string {
  if (value === null || !Number.isFinite(value)) return "Tidak dicantumkan";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: currency || "IDR", maximumFractionDigits: 2 }).format(value);
}

function date(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function writeLines(page: ReturnType<PDFDocument["addPage"]>, text: string, x: number, y: number, width: number, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, size = 10): number {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let cursor = y;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > width && line) {
      page.drawText(line, { x, y: cursor, size, font, color: rgb(0.16, 0.1, 0.12) });
      cursor -= size * 1.55;
      line = word;
    } else line = candidate;
  }
  if (line) page.drawText(line, { x, y: cursor, size, font, color: rgb(0.16, 0.1, 0.12) });
  return cursor - size * 1.7;
}

async function basePdf(title: string, record: ConfirmationRecord): Promise<{ doc: PDFDocument; page: ReturnType<PDFDocument["addPage"]>; regular: Awaited<ReturnType<PDFDocument["embedFont"]>>; bold: Awaited<ReturnType<PDFDocument["embedFont"]>>; y: number }> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawRectangle({ x: 42, y: 765, width: 511, height: 34, color: rgb(0.50, 0.055, 0.176) });
  page.drawText("PUSPITACORE", { x: 57, y: 777, size: 10, font: bold, color: rgb(1, 1, 1) });
  page.drawText(title, { x: 42, y: 730, size: 18, font: bold, color: rgb(0.18, 0.08, 0.11) });
  const rows = [
    ["Kode konfirmasi", record.confirmationCode], ["Jenis", record.type], ["Entitas", record.entityName],
    ["Penerima", record.recipientName], ["Tanggal saldo", date(record.balanceDate)], ["Saldo", money(record.balance, record.currency)],
  ];
  let y = 696;
  for (const [label, value] of rows) {
    page.drawText(label, { x: 42, y, size: 9, font: bold, color: rgb(0.32, 0.25, 0.27) });
    page.drawText(value, { x: 180, y, size: 9, font: regular, color: rgb(0.16, 0.1, 0.12) });
    y -= 20;
  }
  return { doc, page, regular, bold, y: y - 8 };
}

export async function buildPrintPdf(record: ConfirmationRecord): Promise<Uint8Array> {
  const { doc, page, regular, bold, y } = await basePdf("FORMULIR JAWABAN KONFIRMASI", record);
  let cursor = writeLines(page, record.description, 42, y, 510, regular);
  cursor -= 12;
  page.drawText("Pernyataan jawaban", { x: 42, y: cursor, size: 11, font: bold });
  cursor -= 26;
  page.drawText("□ Sesuai dengan catatan kami", { x: 52, y: cursor, size: 10, font: regular });
  cursor -= 22;
  page.drawText("□ Berbeda dengan catatan kami. Penjelasan:", { x: 52, y: cursor, size: 10, font: regular });
  for (let index = 0; index < 3; index += 1) page.drawLine({ start: { x: 52, y: cursor - 18 - index * 20 }, end: { x: 540, y: cursor - 18 - index * 20 }, thickness: 0.5, color: rgb(0.65, 0.59, 0.61) });
  page.drawText("Nama / Jabatan / Tanggal / Tanda tangan", { x: 42, y: 190, size: 10, font: bold });
  page.drawLine({ start: { x: 42, y: 130 }, end: { x: 260, y: 130 }, thickness: 0.6, color: rgb(0.35, 0.28, 0.3) });
  page.drawText("Dokumen ini bukan tanda tangan elektronik tersertifikasi.", { x: 42, y: 60, size: 8, font: regular, color: rgb(0.35, 0.28, 0.3) });
  return doc.save();
}

export async function buildOnlineAnswerPdf(record: ConfirmationRecord, answer: AnswerInput): Promise<Uint8Array> {
  const { doc, page, regular, bold, y } = await basePdf("BUKTI JAWABAN KONFIRMASI", record);
  let cursor = y;
  const response = answer.responseStatus === "BERBEDA" ? "Terdapat perbedaan" : answer.responseStatus === "SESUAI" ? "Sesuai dengan catatan responden" : "Jawaban diterima secara online";
  cursor = writeLines(page, `Pernyataan responden: ${response}.`, 42, cursor, 510, regular);
  if (answer.respondentBalance !== null && answer.respondentBalance !== undefined) cursor = writeLines(page, `Nilai menurut responden: ${money(answer.respondentBalance, record.currency)}.`, 42, cursor - 4, 510, regular);
  if (answer.differenceExplanation) cursor = writeLines(page, `Penjelasan: ${answer.differenceExplanation}`, 42, cursor - 4, 510, regular);
  if (answer.notes) cursor = writeLines(page, `Catatan: ${answer.notes}`, 42, cursor - 4, 510, regular);
  cursor -= 24;
  page.drawText("Responden", { x: 42, y: cursor, size: 11, font: bold });
  cursor -= 22;
  page.drawText(`Nama: ${answer.respondentName}`, { x: 42, y: cursor, size: 10, font: regular });
  page.drawText(`Jabatan: ${answer.respondentRole}`, { x: 42, y: cursor - 20, size: 10, font: regular });
  page.drawText(`Tanggal: ${date(answer.respondentDate)}`, { x: 42, y: cursor - 40, size: 10, font: regular });
  page.drawText("Pernyataan diberikan secara elektronik dan bukan tanda tangan elektronik tersertifikasi.", { x: 42, y: 60, size: 8, font: regular, color: rgb(0.35, 0.28, 0.3) });
  return doc.save();
}

export async function normalizeUploadToPdf(bytes: Uint8Array, mimeType: string): Promise<Uint8Array> {
  if (mimeType === "application/pdf") {
    try { await PDFDocument.load(bytes, { ignoreEncryption: false }); return bytes; }
    catch { throw new ConfirmationError("UPLOAD_INVALID", "File PDF tidak dapat dibaca."); }
  }
  const doc = await PDFDocument.create();
  const image = mimeType === "image/jpeg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
  const maxWidth = 515; const maxHeight = 740; const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const page = doc.addPage([595.28, 841.89]);
  page.drawImage(image, { x: (595.28 - image.width * scale) / 2, y: (841.89 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
  return doc.save();
}
