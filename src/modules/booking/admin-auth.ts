import { cookies } from "next/headers";
import { createAdminSession, readAdminSession } from "./security";

export const ADMIN_SESSION_COOKIE = "puspita_booking_admin";
export const OAUTH_FLOW_COOKIE = "puspita_booking_oauth";

export async function getAdminEmail(): Promise<string | null> {
  const store = await cookies();
  return readAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function setAdminSession(email: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, createAdminSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
