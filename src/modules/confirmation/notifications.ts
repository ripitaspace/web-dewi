import tls from "node:tls";
import { smtpConfigured } from "./config";
import type { ConfirmationRecord, ConfirmationSettings, AnswerInput } from "./types";

export async function notifyReceipt(input: { settings: ConfirmationSettings; record: ConfirmationRecord; answer: AnswerInput; receivedAt: string; driveFileId: string }): Promise<"SENT" | "SKIPPED" | "FAILED"> {
  if (!input.settings.emailEnabled || !input.settings.emailNotifikasi.length || !smtpConfigured()) return "SKIPPED";
  try {
    if (process.env.SMTP_SECURE !== "true") return "FAILED";
    const text = [
        `Klien: ${input.settings.namaKlien} (${input.settings.kodeKlien})`, `Jenis: ${input.record.type}`,
        `Kode konfirmasi: ${input.record.confirmationCode}`, `Responden: ${input.answer.respondentName}`,
        `Metode: ${input.answer.method}`, `Diterima: ${input.receivedAt}`,
        `Drive: https://drive.google.com/open?id=${input.driveFileId}`,
      ].join("\n");
    await sendSecureSmtp({ from: process.env.SMTP_FROM!, to: input.settings.emailNotifikasi, subject: `[Konfirmasi] ${input.record.confirmationCode} diterima`, text });
    return "SENT";
  } catch (error) {
    console.error("[Confirmation] email notification failed", error instanceof Error ? error.message : error);
    return "FAILED";
  }
}

async function sendSecureSmtp(input: { from: string; to: string[]; subject: string; text: string }): Promise<void> {
  const socket = tls.connect({ host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT), servername: process.env.SMTP_HOST! });
  let buffer = "";
  const response = () => new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("SMTP timeout")), 10_000);
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\r\n");
      const completed = lines.find((line) => /^\d{3} /.test(line));
      if (completed) { socket.off("data", onData); clearTimeout(timeout); buffer = ""; resolve(completed); }
    };
    socket.on("data", onData); socket.once("error", reject);
  });
  const command = async (value: string, expected: number[]) => {
    socket.write(`${value}\r\n`); const line = await response();
    if (!expected.includes(Number(line.slice(0, 3)))) throw new Error(`SMTP rejected ${value}`);
  };
  try {
    await response();
    await command("EHLO puspita.local", [250]);
    if (process.env.SMTP_USER) {
      await command("AUTH LOGIN", [334]);
      await command(Buffer.from(process.env.SMTP_USER).toString("base64"), [334]);
      await command(Buffer.from(process.env.SMTP_PASSWORD || "").toString("base64"), [235]);
    }
    await command(`MAIL FROM:<${input.from}>`, [250]);
    for (const address of input.to) await command(`RCPT TO:<${address}>`, [250, 251]);
    await command("DATA", [354]);
    const headers = [`From: ${input.from}`, `To: ${input.to.join(", ")}`, `Subject: ${input.subject}`, "Content-Type: text/plain; charset=UTF-8", "", input.text.replace(/^\./gm, ".."), "."].join("\r\n");
    await command(headers, [250]);
    await command("QUIT", [221]);
  } finally { socket.end(); }
}
