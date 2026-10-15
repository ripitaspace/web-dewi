import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { requireServerEnv } from "./config";

function base64Url(value: Buffer): string {
  return value.toString("base64url");
}

function encryptionKey(): Buffer {
  return createHash("sha256")
    .update(requireServerEnv("BOOKING_ENCRYPTION_KEY"))
    .digest();
}

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", base64Url(iv), base64Url(tag), base64Url(encrypted)].join(".");
}

export function decryptSecret(payload: string): string {
  const [version, ivPart, tagPart, encryptedPart] = payload.split(".");
  if (version !== "v1" || !ivPart || !tagPart || !encryptedPart) {
    throw new Error("Encrypted secret has an unsupported format.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function randomToken(bytes = 32): string {
  return base64Url(randomBytes(bytes));
}

export function hashSensitive(value: string): string {
  const secret = process.env.RATE_LIMIT_SALT || requireServerEnv("BOOKING_ENCRYPTION_KEY");
  return createHmac("sha256", secret).update(value.trim().toLowerCase()).digest("hex");
}

export function hashToken(value: string): string {
  return createHmac("sha256", requireServerEnv("BOOKING_ENCRYPTION_KEY"))
    .update(value)
    .digest("hex");
}

export function createManageToken(bookingId: string): string {
  return createHmac("sha256", requireServerEnv("BOOKING_ENCRYPTION_KEY"))
    .update(`manage:${bookingId}`)
    .digest("base64url");
}

export function signValue(payload: string): string {
  const signature = createHmac("sha256", requireServerEnv("BOOKING_SESSION_SECRET"))
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySignedValue(value: string | undefined): string | null {
  if (!value) return null;
  const [payloadPart, signature] = value.split(".");
  if (!payloadPart || !signature) return null;

  try {
    const payload = Buffer.from(payloadPart, "base64url").toString("utf8");
    const expected = createHmac("sha256", requireServerEnv("BOOKING_SESSION_SECRET"))
      .update(payload)
      .digest();
    const received = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSession(email: string): string {
  return signValue(
    JSON.stringify({ email: email.toLowerCase(), expiresAt: Date.now() + 8 * 60 * 60 * 1000 }),
  );
}

export function readAdminSession(value: string | undefined): string | null {
  const payload = verifySignedValue(value);
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as { email?: string; expiresAt?: number };
    if (!parsed.email || !parsed.expiresAt || parsed.expiresAt <= Date.now()) return null;
    const allowed = process.env.ADMIN_GOOGLE_EMAIL?.trim().toLowerCase();
    return allowed && parsed.email === allowed ? parsed.email : null;
  } catch {
    return null;
  }
}

export function sha256Base64Url(value: string): string {
  return createHash("sha256").update(value).digest("base64url");
}
