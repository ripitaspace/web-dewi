export const BOOKING_RULES = {
  bufferMinutes: 30,
  stepMinutes: 30,
  minimumNoticeHours: 24,
  maximumAdvanceDays: 60,
  pendingMinutes: 10,
  maxBookingsPerEmailPerDay: 3,
  maxAttemptsPerIpPerHour: 10,
} as const;

export const DEFAULT_OWNER_TIME_ZONE = "Asia/Jakarta";

export function getPublicBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

export function bookingEnvironmentReady(): boolean {
  const turnstileReady =
    process.env.NODE_ENV !== "production" ||
    Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const maintenanceReady = process.env.NODE_ENV !== "production" || Boolean(process.env.CRON_SECRET);
  return Boolean(
    /^file:/.test(process.env.DATABASE_URL || "file:./dev.db") &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.BOOKING_ENCRYPTION_KEY &&
      process.env.BOOKING_SESSION_SECRET &&
      process.env.RATE_LIMIT_SALT &&
      process.env.ADMIN_GOOGLE_EMAIL &&
      turnstileReady &&
      maintenanceReady,
  );
}

export function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function normalizeTimeZone(value: string | null | undefined): string {
  const candidate = value || DEFAULT_OWNER_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en", { timeZone: candidate }).format();
    return candidate;
  } catch {
    return DEFAULT_OWNER_TIME_ZONE;
  }
}
