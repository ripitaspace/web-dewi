import { BookingApiError } from "./types";

export async function verifyTurnstile(token: string, remoteIp: string): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new BookingApiError(
        "BOOKING_UNAVAILABLE",
        "Proteksi formulir booking belum dikonfigurasi.",
        503,
      );
    }
    return;
  }
  if (!token) throw new BookingApiError("TURNSTILE_REQUIRED", "Selesaikan verifikasi keamanan.");

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
    cache: "no-store",
  });
  const body = (await response.json()) as { success?: boolean };
  if (!response.ok || !body.success) {
    throw new BookingApiError(
      "TURNSTILE_FAILED",
      "Verifikasi keamanan gagal atau kedaluwarsa. Silakan coba lagi.",
    );
  }
}
