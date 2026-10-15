import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { SERVICES } from "@/lib/site-data";
import { BOOKING_RULES, getPublicBaseUrl } from "./config";
import { findRequestedSlot, getAvailability } from "./availability";
import {
  createGoogleBookingEvent,
  deleteGoogleBookingEvent,
  getCalendarContext,
  updateGoogleBookingEvent,
} from "./google";
import { createManageToken, hashSensitive, hashToken } from "./security";
import { BookingApiError } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let bookingWriteQueue = Promise.resolve();

async function withBookingWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  let release: () => void = () => undefined;
  const previous = bookingWriteQueue;
  bookingWriteQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
}

export interface CreateBookingInput {
  serviceId: string;
  startUtc: string;
  timeZone?: string;
  name: string;
  email: string;
  organization?: string;
  role?: string;
  message: string;
  idempotencyKey: string;
  website?: string;
}

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function validateCreateBooking(input: CreateBookingInput): CreateBookingInput {
  const normalized = {
    serviceId: clean(input.serviceId, 80),
    startUtc: clean(input.startUtc, 80),
    timeZone: clean(input.timeZone, 100),
    name: clean(input.name, 120),
    email: clean(input.email, 200).toLowerCase(),
    organization: clean(input.organization, 160),
    role: clean(input.role, 120),
    message: clean(input.message, 2500),
    idempotencyKey: clean(input.idempotencyKey, 160),
    website: clean(input.website, 200),
  };
  if (normalized.website) throw new BookingApiError("SPAM_DETECTED", "Permintaan tidak dapat diproses.");
  if (!SERVICES.some((service) => service.id === normalized.serviceId)) {
    throw new BookingApiError("VALIDATION_ERROR", "Layanan tidak valid.");
  }
  if (!normalized.name || !EMAIL_PATTERN.test(normalized.email) || !normalized.message) {
    throw new BookingApiError(
      "VALIDATION_ERROR",
      "Nama, email yang valid, dan konteks pembahasan wajib diisi.",
    );
  }
  if (normalized.idempotencyKey.length < 16) {
    throw new BookingApiError("VALIDATION_ERROR", "Identitas permintaan booking tidak valid.");
  }
  const start = new Date(normalized.startUtc);
  if (!Number.isFinite(start.getTime())) {
    throw new BookingApiError("VALIDATION_ERROR", "Waktu booking tidak valid.");
  }
  return normalized;
}

export async function enforceRateLimit(ip: string, email: string): Promise<{
  ipHash: string;
  emailHash: string;
}> {
  const ipHash = hashSensitive(ip || "unknown");
  const emailHash = hashSensitive(email);
  const [ipAttempts, emailBookings] = await Promise.all([
    db.bookingAttempt.count({
      where: {
        ipHash,
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    }),
    db.booking.count({
      where: {
        email,
        status: "CONFIRMED",
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  if (
    ipAttempts >= BOOKING_RULES.maxAttemptsPerIpPerHour ||
    emailBookings >= BOOKING_RULES.maxBookingsPerEmailPerDay
  ) {
    await db.bookingAttempt.create({ data: { ipHash, emailHash, outcome: "RATE_LIMITED" } });
    throw new BookingApiError(
      "RATE_LIMITED",
      "Terlalu banyak percobaan booking. Silakan coba kembali nanti.",
      429,
    );
  }
  return { ipHash, emailHash };
}

async function reserveBooking(
  input: CreateBookingInput,
  start: Date,
  end: Date,
): Promise<{ id: string; existing: boolean }> {
  const bufferMs = BOOKING_RULES.bufferMinutes * 60_000;
  const blockedStartAt = new Date(start.getTime() - bufferMs);
  const blockedEndAt = new Date(end.getTime() + bufferMs);
  const now = new Date();

  return withBookingWriteLock(() => db.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return { id: existing.id, existing: true };

    const conflict = await tx.booking.findFirst({
      where: {
        blockedStartAt: { lt: blockedEndAt },
        blockedEndAt: { gt: blockedStartAt },
        OR: [
          { status: "CONFIRMED" },
          { status: "PENDING", pendingExpiresAt: { gt: now } },
        ],
      },
      select: { id: true },
    });
    if (conflict) {
      throw new BookingApiError(
        "SLOT_UNAVAILABLE",
        "Slot baru saja diambil. Silakan pilih waktu lain.",
        409,
      );
    }

    const id = randomUUID();
    const manageToken = createManageToken(id);
    await tx.booking.create({
      data: {
        id,
        serviceId: input.serviceId,
        name: input.name,
        email: input.email,
        organization: input.organization || null,
        role: input.role || null,
        message: input.message,
        startAt: start,
        endAt: end,
        blockedStartAt,
        blockedEndAt,
        status: "PENDING",
        manageTokenHash: hashToken(manageToken),
        idempotencyKey: input.idempotencyKey,
        pendingExpiresAt: new Date(Date.now() + BOOKING_RULES.pendingMinutes * 60_000),
      },
    });
    return { id, existing: false };
  }));
}

function bookingResult(booking: {
  id: string;
  status: string;
  startAt: Date;
  endAt: Date;
  meetUrl: string | null;
}, source: "google" | "local") {
  return {
    bookingId: booking.id,
    status: booking.status,
    startsAt: booking.startAt.toISOString(),
    endsAt: booking.endAt.toISOString(),
    meetUrl: booking.meetUrl,
    source,
    manageUrl: `${getPublicBaseUrl()}/booking/manage/${createManageToken(booking.id)}`,
  };
}

export async function createBooking(input: CreateBookingInput) {
  const normalized = validateCreateBooking(input);
  const requestedStart = new Date(normalized.startUtc);
  const availability = await getAvailability({
    serviceId: normalized.serviceId,
    timeZone: normalized.timeZone,
  });
  const slot = findRequestedSlot(availability.dates, requestedStart);
  if (!slot) {
    throw new BookingApiError(
      "SLOT_UNAVAILABLE",
      "Slot tidak lagi tersedia. Silakan pilih waktu lain.",
      409,
    );
  }

  const reservation = await reserveBooking(normalized, slot.start, slot.end);
  if (reservation.existing) {
    const existing = await db.booking.findUniqueOrThrow({ where: { id: reservation.id } });
    if (existing.status === "CONFIRMED") {
      return bookingResult(existing, existing.googleEventId ? "google" : "local");
    }
    throw new BookingApiError(
      "BOOKING_IN_PROGRESS",
      "Booking ini sedang diproses. Silakan tunggu sesaat.",
      409,
    );
  }

  if (!availability.context) {
    const booking = await db.booking.update({
      where: { id: reservation.id },
      data: { status: "CONFIRMED", pendingExpiresAt: null },
    });
    return bookingResult(booking, "local");
  }

  let createdEventId: string | null = null;
  try {
    const manageUrl = `${getPublicBaseUrl()}/booking/manage/${createManageToken(reservation.id)}`;
    const event = await createGoogleBookingEvent({
      context: availability.context,
      bookingId: reservation.id,
      serviceId: normalized.serviceId,
      name: normalized.name,
      email: normalized.email,
      organization: normalized.organization,
      role: normalized.role,
      message: normalized.message,
      start: slot.start,
      end: slot.end,
      manageUrl,
    });
    createdEventId = event.eventId;
    const booking = await db.booking.update({
      where: { id: reservation.id },
      data: {
        status: "CONFIRMED",
        googleEventId: event.eventId,
        meetUrl: event.meetUrl,
        pendingExpiresAt: null,
      },
    });
    return bookingResult(booking, "google");
  } catch (error) {
    if (createdEventId) {
      try {
        await deleteGoogleBookingEvent(availability.context, createdEventId);
      } catch {
        // Reconciliation will identify an orphaned event if compensation fails.
      }
    }
    await db.booking.update({
      where: { id: reservation.id },
      data: { status: "FAILED", pendingExpiresAt: null },
    });
    throw error;
  }
}

export async function getManagedBooking(token: string) {
  const booking = await db.booking.findUnique({ where: { manageTokenHash: hashToken(token) } });
  if (!booking) throw new BookingApiError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404);
  if (booking.endAt <= new Date()) {
    throw new BookingApiError("MANAGE_LINK_EXPIRED", "Tautan kelola booking sudah kedaluwarsa.", 410);
  }
  const service = SERVICES.find((item) => item.id === booking.serviceId);
  return {
    booking,
    public: {
      bookingId: booking.id,
      serviceId: booking.serviceId,
      serviceName: service?.name || booking.serviceId,
      name: booking.name,
      email: booking.email,
      startsAt: booking.startAt.toISOString(),
      endsAt: booking.endAt.toISOString(),
      status: booking.status,
      meetUrl: booking.meetUrl,
    },
  };
}

export async function rescheduleBooking(token: string, startUtc: string, timeZone?: string) {
  const { booking } = await getManagedBooking(token);
  if (booking.status !== "CONFIRMED") {
    throw new BookingApiError("BOOKING_NOT_ACTIVE", "Booking ini tidak dapat dijadwal ulang.", 409);
  }
  const requestedStart = new Date(startUtc);
  if (!Number.isFinite(requestedStart.getTime())) {
    throw new BookingApiError("VALIDATION_ERROR", "Waktu baru tidak valid.");
  }
  const availability = await getAvailability({
    serviceId: booking.serviceId,
    timeZone,
    excludedBookingId: booking.id,
  });
  const slot = findRequestedSlot(availability.dates, requestedStart);
  if (!slot) throw new BookingApiError("SLOT_UNAVAILABLE", "Slot baru tidak tersedia.", 409);

  const old = {
    startAt: booking.startAt,
    endAt: booking.endAt,
    blockedStartAt: booking.blockedStartAt,
    blockedEndAt: booking.blockedEndAt,
  };
  const bufferMs = BOOKING_RULES.bufferMinutes * 60_000;
  await withBookingWriteLock(() => db.$transaction(async (tx) => {
    const conflict = await tx.booking.findFirst({
      where: {
        id: { not: booking.id },
        blockedStartAt: { lt: new Date(slot.end.getTime() + bufferMs) },
        blockedEndAt: { gt: new Date(slot.start.getTime() - bufferMs) },
        OR: [
          { status: "CONFIRMED" },
          { status: "PENDING", pendingExpiresAt: { gt: new Date() } },
        ],
      },
    });
    if (conflict) throw new BookingApiError("SLOT_UNAVAILABLE", "Slot baru tidak tersedia.", 409);
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "PENDING",
        startAt: slot.start,
        endAt: slot.end,
        blockedStartAt: new Date(slot.start.getTime() - bufferMs),
        blockedEndAt: new Date(slot.end.getTime() + bufferMs),
        pendingExpiresAt: new Date(Date.now() + BOOKING_RULES.pendingMinutes * 60_000),
      },
    });
  }));

  if (!availability.context || !booking.googleEventId) {
    const updated = await db.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED", pendingExpiresAt: null },
    });
    return bookingResult(updated, "local");
  }

  try {
    const event = await updateGoogleBookingEvent(
      availability.context,
      booking.googleEventId,
      booking.id,
      slot.start,
      slot.end,
    );
    const updated = await db.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED", meetUrl: event.meetUrl, pendingExpiresAt: null },
    });
    return bookingResult(updated, "google");
  } catch (error) {
    await db.booking.update({
      where: { id: booking.id },
      data: { ...old, status: "CONFIRMED", pendingExpiresAt: null },
    });
    throw error;
  }
}

export async function cancelBooking(token: string): Promise<void> {
  const { booking } = await getManagedBooking(token);
  if (booking.status === "CANCELLED") return;
  if (booking.googleEventId) {
    await deleteGoogleBookingEvent(await getCalendarContext(), booking.googleEventId);
  }
  await db.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED", pendingExpiresAt: null },
  });
}
