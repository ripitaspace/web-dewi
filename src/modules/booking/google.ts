import { createHash, randomUUID } from "node:crypto";
import type { CalendarConnection, BookingSettings } from "../../../prisma/generated/client";
import { db, hasDatabaseConfig } from "@/lib/db";
import { SERVICES } from "@/lib/site-data";
import { DEFAULT_OWNER_TIME_ZONE, getPublicBaseUrl, requireServerEnv } from "./config";
import { decryptSecret, encryptSecret } from "./security";
import type { CalendarOption, GoogleCalendarEvent, TimeRange } from "./types";
import { BookingApiError } from "./types";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.calendars",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

export type CalendarContext = {
  connection: CalendarConnection;
  settings: BookingSettings;
};

function parseCalendarIds(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item))
      : [];
  } catch {
    return [];
  }
}

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GoogleListResponse<T> = {
  items?: T[];
  nextPageToken?: string;
  nextSyncToken?: string;
};

function redirectUri(): string {
  return `${getPublicBaseUrl()}/api/admin/google/callback`;
}

export function buildGoogleAuthorizationUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: requireServerEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: redirectUri(),
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: GOOGLE_OAUTH_SCOPES.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function tokenRequest(params: URLSearchParams): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  const body = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || body.error) {
    throw new BookingApiError(
      "GOOGLE_AUTH_FAILED",
      body.error_description || "Google tidak dapat mengotorisasi koneksi kalender.",
      502,
    );
  }
  return body;
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<GoogleTokenResponse> {
  return tokenRequest(
    new URLSearchParams({
      client_id: requireServerEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireServerEnv("GOOGLE_CLIENT_SECRET"),
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(),
    }),
  );
}

export async function refreshAccessToken(encryptedRefreshToken: string): Promise<string> {
  const token = await tokenRequest(
    new URLSearchParams({
      client_id: requireServerEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireServerEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: decryptSecret(encryptedRefreshToken),
      grant_type: "refresh_token",
    }),
  );
  if (!token.access_token) {
    throw new BookingApiError(
      "CALENDAR_DISCONNECTED",
      "Koneksi Google Calendar perlu disambungkan ulang.",
      503,
    );
  }
  return token.access_token;
}

async function googleRequest<T>(
  accessToken: string,
  pathOrUrl: string,
  init: RequestInit = {},
): Promise<T> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${CALENDAR_API}${pathOrUrl}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  const body = text ? (JSON.parse(text) as T & { error?: { message?: string } }) : ({} as T);
  if (!response.ok) {
    const message =
      (body as { error?: { message?: string } }).error?.message ||
      `Google Calendar merespons ${response.status}.`;
    if (response.status === 401 || response.status === 403) {
      throw new BookingApiError("CALENDAR_DISCONNECTED", message, 503);
    }
    const error = new BookingApiError("GOOGLE_CALENDAR_ERROR", message, 502);
    Object.assign(error, { googleStatus: response.status });
    throw error;
  }
  return body;
}

export async function getGoogleUser(accessToken: string): Promise<{ email: string }> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new BookingApiError("GOOGLE_AUTH_FAILED", "Profil akun Google tidak dapat dibaca.", 502);
  }
  return (await response.json()) as { email: string };
}

export async function getCalendarContext(): Promise<CalendarContext> {
  if (!hasDatabaseConfig()) {
    throw new BookingApiError(
      "CALENDAR_DISCONNECTED",
      "Sistem booking belum dikonfigurasi.",
      503,
    );
  }
  const connection = await db.calendarConnection.findFirst({ include: { settings: true } });
  if (!connection || !connection.settings) {
    throw new BookingApiError(
      "CALENDAR_DISCONNECTED",
      "Google Calendar belum tersambung atau belum selesai diatur.",
      503,
    );
  }
  return { connection, settings: connection.settings };
}

export async function listCalendars(connection: CalendarConnection): Promise<CalendarOption[]> {
  const accessToken = await refreshAccessToken(connection.encryptedRefreshToken);
  const calendars: CalendarOption[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ maxResults: "250", showHidden: "false" });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await googleRequest<GoogleListResponse<{
      id: string;
      summary?: string;
      primary?: boolean;
      accessRole?: string;
      timeZone?: string;
      deleted?: boolean;
    }>>(accessToken, `/users/me/calendarList?${params}`);
    for (const item of response.items ?? []) {
      if (!item.deleted && item.id) {
        calendars.push({
          id: item.id,
          summary: item.summary || item.id,
          primary: Boolean(item.primary),
          accessRole: item.accessRole || "reader",
          timeZone: item.timeZone || null,
        });
      }
    }
    pageToken = response.nextPageToken;
  } while (pageToken);

  return calendars.sort((left, right) => Number(right.primary) - Number(left.primary));
}

export async function createCalendar(
  connection: CalendarConnection,
  summary: string,
): Promise<CalendarOption> {
  const accessToken = await refreshAccessToken(connection.encryptedRefreshToken);
  const result = await googleRequest<{ id: string; summary?: string; timeZone?: string }>(
    accessToken,
    "/calendars",
    {
      method: "POST",
      body: JSON.stringify({ summary, timeZone: DEFAULT_OWNER_TIME_ZONE }),
    },
  );
  return {
    id: result.id,
    summary: result.summary || summary,
    primary: false,
    accessRole: "owner",
    timeZone: result.timeZone || DEFAULT_OWNER_TIME_ZONE,
  };
}

export async function listAvailabilityBlocks(
  context: CalendarContext,
  timeMin: Date,
  timeMax: Date,
): Promise<TimeRange[]> {
  const accessToken = await refreshAccessToken(context.connection.encryptedRefreshToken);
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    showDeleted: "false",
    maxResults: "2500",
  });
  const response = await googleRequest<GoogleListResponse<GoogleCalendarEvent>>(
    accessToken,
    `/calendars/${encodeURIComponent(context.settings.availabilityCalendarId)}/events?${params}`,
  );
  return (response.items ?? []).flatMap((event) => {
    if (!event.start?.dateTime || !event.end?.dateTime) return [];
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    return Number.isFinite(start.getTime()) && end > start ? [{ start, end }] : [];
  });
}

export async function queryBusyRanges(
  context: CalendarContext,
  timeMin: Date,
  timeMax: Date,
  excludeGoogleEventId?: string,
): Promise<TimeRange[]> {
  const accessToken = await refreshAccessToken(context.connection.encryptedRefreshToken);
  const ids = new Set(parseCalendarIds(context.settings.busyCalendarIds));
  ids.add(context.settings.bookingCalendarId);
  ids.delete(context.settings.availabilityCalendarId);
  if (excludeGoogleEventId) ids.delete(context.settings.bookingCalendarId);
  const response = await googleRequest<{
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
  }>(accessToken, "/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: "UTC",
      items: [...ids].slice(0, 50).map((id) => ({ id })),
    }),
  });
  const busy = Object.values(response.calendars ?? {}).flatMap((calendar) =>
    (calendar.busy ?? []).map((range) => ({ start: new Date(range.start), end: new Date(range.end) })),
  );
  if (!excludeGoogleEventId) return busy;

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    showDeleted: "false",
    maxResults: "2500",
  });
  const bookingEvents = await googleRequest<GoogleListResponse<GoogleCalendarEvent>>(
    accessToken,
    `/calendars/${encodeURIComponent(context.settings.bookingCalendarId)}/events?${params}`,
  );
  return [
    ...busy,
    ...(bookingEvents.items ?? []).flatMap((event) => {
      if (event.id === excludeGoogleEventId || !event.start?.dateTime || !event.end?.dateTime) return [];
      return [{ start: new Date(event.start.dateTime), end: new Date(event.end.dateTime) }];
    }),
  ];
}

function googleEventId(bookingId: string): string {
  return `p${createHash("sha256").update(bookingId).digest("hex").slice(0, 31)}`;
}

function meetingUrl(event: GoogleCalendarEvent): string | null {
  return (
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    null
  );
}

export async function createGoogleBookingEvent(input: {
  context: CalendarContext;
  bookingId: string;
  serviceId: string;
  name: string;
  email: string;
  organization?: string | null;
  role?: string | null;
  message: string;
  start: Date;
  end: Date;
  manageUrl: string;
}): Promise<{ eventId: string; meetUrl: string | null; htmlLink: string | null }> {
  const service = SERVICES.find((item) => item.id === input.serviceId);
  if (!service) throw new BookingApiError("VALIDATION_ERROR", "Layanan tidak valid.");
  const accessToken = await refreshAccessToken(input.context.connection.encryptedRefreshToken);
  const description = [
    input.message,
    "",
    `Nama: ${input.name}`,
    `Email: ${input.email}`,
    input.organization ? `Organisasi: ${input.organization}` : null,
    input.role ? `Peran: ${input.role}` : null,
    "",
    `Kelola booking: ${input.manageUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  let event = await googleRequest<GoogleCalendarEvent>(
    accessToken,
    `/calendars/${encodeURIComponent(input.context.settings.bookingCalendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      body: JSON.stringify({
        id: googleEventId(input.bookingId),
        summary: `PUSPITA · ${service.name} · ${input.name}`,
        description,
        start: { dateTime: input.start.toISOString(), timeZone: "UTC" },
        end: { dateTime: input.end.toISOString(), timeZone: "UTC" },
        attendees: [{ email: input.email, displayName: input.name }],
        conferenceData: { createRequest: { requestId: input.bookingId } },
        extendedProperties: { private: { bookingId: input.bookingId } },
      }),
    },
  );

  if (!event.id) throw new BookingApiError("GOOGLE_CALENDAR_ERROR", "Google tidak mengembalikan ID event.", 502);
  const eventId = event.id;
  if (!meetingUrl(event)) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    event = await getGoogleEvent(input.context, eventId);
  }
  return { eventId, meetUrl: meetingUrl(event), htmlLink: event.htmlLink || null };
}

export async function getGoogleEvent(
  context: CalendarContext,
  eventId: string,
): Promise<GoogleCalendarEvent> {
  const accessToken = await refreshAccessToken(context.connection.encryptedRefreshToken);
  return googleRequest<GoogleCalendarEvent>(
    accessToken,
    `/calendars/${encodeURIComponent(context.settings.bookingCalendarId)}/events/${encodeURIComponent(eventId)}`,
  );
}

export async function updateGoogleBookingEvent(
  context: CalendarContext,
  eventId: string,
  bookingId: string,
  start: Date,
  end: Date,
): Promise<{ meetUrl: string | null }> {
  const accessToken = await refreshAccessToken(context.connection.encryptedRefreshToken);
  const event = await googleRequest<GoogleCalendarEvent>(
    accessToken,
    `/calendars/${encodeURIComponent(context.settings.bookingCalendarId)}/events/${encodeURIComponent(eventId)}?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "PATCH",
      body: JSON.stringify({
        start: { dateTime: start.toISOString(), timeZone: "UTC" },
        end: { dateTime: end.toISOString(), timeZone: "UTC" },
        extendedProperties: { private: { bookingId } },
      }),
    },
  );
  return { meetUrl: meetingUrl(event) };
}

export async function deleteGoogleBookingEvent(
  context: CalendarContext,
  eventId: string,
): Promise<void> {
  const accessToken = await refreshAccessToken(context.connection.encryptedRefreshToken);
  try {
    await googleRequest<void>(
      accessToken,
      `/calendars/${encodeURIComponent(context.settings.bookingCalendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: "DELETE" },
    );
  } catch (error) {
    if (
      error instanceof BookingApiError &&
      [404, 410].includes((error as BookingApiError & { googleStatus?: number }).googleStatus ?? 0)
    ) {
      return;
    }
    throw error;
  }
}

export async function revokeGoogleConnection(connection: CalendarConnection): Promise<void> {
  try {
    const refreshToken = decryptSecret(connection.encryptedRefreshToken);
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      cache: "no-store",
    });
  } catch {
    // Local cleanup still proceeds if Google has already revoked the token.
  }
}

export async function startCalendarWatch(context: CalendarContext): Promise<void> {
  const accessToken = await refreshAccessToken(context.connection.encryptedRefreshToken);
  if (context.connection.watchChannelId && context.connection.watchResourceId) {
    try {
      await googleRequest<void>(accessToken, "/channels/stop", {
        method: "POST",
        body: JSON.stringify({
          id: context.connection.watchChannelId,
          resourceId: context.connection.watchResourceId,
        }),
      });
    } catch {
      // An expired channel cannot be stopped and can safely be replaced.
    }
  }

  const watchToken = randomUUID();
  const channelId = randomUUID();
  const expiration = Date.now() + 6 * 24 * 60 * 60 * 1000;
  const response = await googleRequest<{
    id: string;
    resourceId: string;
    expiration?: string;
  }>(
    accessToken,
    `/calendars/${encodeURIComponent(context.settings.bookingCalendarId)}/events/watch`,
    {
      method: "POST",
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: `${getPublicBaseUrl()}/api/booking/google-webhook`,
        token: watchToken,
        expiration,
      }),
    },
  );

  await db.calendarConnection.update({
    where: { id: context.connection.id },
    data: {
      watchChannelId: response.id,
      watchResourceId: response.resourceId,
      encryptedWatchToken: encryptSecret(watchToken),
      watchExpiresAt: new Date(Number(response.expiration || expiration)),
    },
  });
}

export async function listGoogleBookingChanges(
  context: CalendarContext,
  syncToken?: string | null,
): Promise<{ events: GoogleCalendarEvent[]; nextSyncToken: string; fullSync: boolean }> {
  const accessToken = await refreshAccessToken(context.connection.encryptedRefreshToken);
  const events: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;
  let nextSyncToken = "";
  let currentSyncToken = syncToken || undefined;

  for (;;) {
    const params = new URLSearchParams({ showDeleted: "true", maxResults: "2500" });
    if (currentSyncToken) params.set("syncToken", currentSyncToken);
    if (pageToken) params.set("pageToken", pageToken);
    try {
      const response = await googleRequest<GoogleListResponse<GoogleCalendarEvent>>(
        accessToken,
        `/calendars/${encodeURIComponent(context.settings.bookingCalendarId)}/events?${params}`,
      );
      events.push(...(response.items ?? []));
      pageToken = response.nextPageToken;
      if (response.nextSyncToken) nextSyncToken = response.nextSyncToken;
      if (!pageToken) break;
    } catch (error) {
      if (currentSyncToken && (error as { googleStatus?: number }).googleStatus === 410) {
        currentSyncToken = undefined;
        pageToken = undefined;
        events.length = 0;
        continue;
      }
      throw error;
    }
  }

  if (!nextSyncToken) {
    throw new BookingApiError("GOOGLE_CALENDAR_ERROR", "Google tidak mengembalikan sync token.", 502);
  }
  return { events, nextSyncToken, fullSync: !syncToken || !currentSyncToken };
}

export async function getStoredConnection(adminEmail?: string): Promise<CalendarConnection | null> {
  if (!hasDatabaseConfig()) return null;
  return adminEmail
    ? db.calendarConnection.findUnique({ where: { adminEmail } })
    : db.calendarConnection.findFirst();
}
