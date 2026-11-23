import { getPublicBaseUrl } from "@/modules/booking/config";

const DEFAULT_ROOT_FOLDER_ID = "1xv0q2NNBFO8_DzaIiMn9yUCkhusA0YUM";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function confirmationRootFolderId(): string {
  return process.env.CONFIRMATION_DRIVE_ROOT_FOLDER_ID || DEFAULT_ROOT_FOLDER_ID;
}

export function confirmationPublicUrl(clientCode: string, token: string): string {
  return `${getPublicBaseUrl()}/kerja-bersama/konfirmasi/${encodeURIComponent(clientCode)}/${encodeURIComponent(token)}`;
}

export function serviceAccountConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
}

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
}
