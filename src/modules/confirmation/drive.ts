import { createSign, randomUUID } from "node:crypto";
import { ConfirmationError } from "./errors";
import { confirmationRootFolderId, serviceAccountConfigured } from "./config";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
let cachedToken: { value: string; expiresAt: number } | null = null;

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  if (!serviceAccountConfigured()) throw new ConfirmationError("DRIVE_UNAVAILABLE", "Layanan konfirmasi belum dikonfigurasi.", 503);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/drive",
    aud: TOKEN_URL,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const assertion = `${unsigned}.${signer.sign(privateKey).toString("base64url")}`;
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!response.ok || !body.access_token) throw new ConfirmationError("DRIVE_UNAVAILABLE", "Google Drive tidak dapat diakses.", 503);
  cachedToken = { value: body.access_token, expiresAt: Date.now() + (body.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path.startsWith("http") ? path : `${DRIVE_API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${await accessToken()}`, ...(init.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new ConfirmationError("DRIVE_UNAVAILABLE", "Google Drive tidak dapat menyimpan atau membaca berkas.", 503);
  return (await response.json()) as T;
}

type DriveFile = { id: string; name: string; mimeType?: string; appProperties?: Record<string, string> };

function query(value: string): string { return value.replace(/'/g, "\\'"); }

async function listFiles(q: string, fields = "files(id,name,mimeType,appProperties)"): Promise<DriveFile[]> {
  const params = new URLSearchParams({ q, fields, spaces: "drive", pageSize: "100" });
  return (await request<{ files?: DriveFile[] }>(`/files?${params}`)).files || [];
}

export async function childFolder(parentId: string, name: string, create = false): Promise<string> {
  const files = await listFiles(`'${query(parentId)}' in parents and name = '${query(name)}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  if (files.length === 1) return files[0].id;
  if (files.length > 1) throw new ConfirmationError("DRIVE_INVALID", "Struktur Google Drive tidak valid.", 503);
  if (!create) throw new ConfirmationError("DRIVE_UNAVAILABLE", "Folder konfirmasi belum disiapkan.", 503);
  const created = await request<DriveFile>("/files", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] }) });
  return created.id;
}

export async function masterWorkbook(clientCode: string): Promise<Buffer> {
  const masterFolder = process.env.CONFIRMATION_DRIVE_MASTER_FOLDER_ID || await childFolder(confirmationRootFolderId(), "01 MASTER");
  const files = await listFiles(`'${query(masterFolder)}' in parents and name = '${query(clientCode)}.xlsx' and trashed = false`);
  if (files.length !== 1) throw new ConfirmationError("INVALID_CONFIRMATION", "Tautan konfirmasi tidak valid, sudah tidak aktif, atau sudah kedaluwarsa.", 404);
  const token = await accessToken();
  const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(files[0].id)}?alt=media`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new ConfirmationError("DRIVE_UNAVAILABLE", "Google Drive tidak dapat membaca workbook.", 503);
  return Buffer.from(await response.arrayBuffer());
}

export async function answerFolder(clientCode: string, overrideId?: string): Promise<string> {
  const root = overrideId || process.env.CONFIRMATION_DRIVE_ANSWERS_FOLDER_ID || await childFolder(confirmationRootFolderId(), "02 JAWABAN");
  return childFolder(root, clientCode, true);
}

export async function initializeDriveStructure(): Promise<{ masterFolderId: string; answersFolderId: string }> {
  const root = confirmationRootFolderId();
  const [masterFolderId, answersFolderId] = await Promise.all([
    childFolder(root, "01 MASTER", true),
    childFolder(root, "02 JAWABAN", true),
  ]);
  return { masterFolderId, answersFolderId };
}

export async function findIdempotentFile(folderId: string, idempotencyKey: string): Promise<DriveFile | null> {
  const files = await listFiles(`'${query(folderId)}' in parents and appProperties has { key='idempotency_key' and value='${query(idempotencyKey)}' } and trashed = false`);
  return files[0] || null;
}

export async function uploadFile(input: { folderId: string; name: string; mimeType: string; bytes: Uint8Array; appProperties: Record<string, string> }): Promise<DriveFile> {
  const boundary = `puspita_${randomUUID().replaceAll("-", "")}`;
  const metadata = JSON.stringify({ name: input.name, mimeType: input.mimeType, parents: [input.folderId], appProperties: input.appProperties });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${input.mimeType}\r\n\r\n`),
    Buffer.from(input.bytes), Buffer.from(`\r\n--${boundary}--`),
  ]);
  return request<DriveFile>("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,appProperties", {
    method: "POST", headers: { "content-type": `multipart/related; boundary=${boundary}` }, body,
  });
}
