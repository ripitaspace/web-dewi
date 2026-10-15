"use client";

import Script from "next/script";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SERVICES } from "@/lib/site-data";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

type AvailabilitySlot = { startUtc: string; endUtc: string };
type AvailabilityDay = { date: string; slots: AvailabilitySlot[] };
type BookingResult = {
  bookingId: string;
  startsAt: string;
  endsAt: string;
  meetUrl: string | null;
  manageUrl: string;
  source: "google" | "local";
};

declare global {
  interface Window {
    puspitaTurnstileCallback?: (token: string) => void;
    puspitaTurnstileExpired?: () => void;
    turnstile?: { reset: () => void };
  }
}

const DATE_PAGE_SIZE = 10;
const WIB = "Asia/Jakarta";

function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || WIB;
  } catch {
    return WIB;
  }
}

function formatDay(date: string, timeZone: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone, ...options }).format(
    new Date(`${date}T12:00:00`),
  );
}

function formatDateTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function formatTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-booking`;
}

export function KerjaBersamaClient() {
  const [selectedService, setSelectedService] = useState(SERVICES[0].id);
  const [timeZone, setTimeZone] = useState(WIB);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [datePage, setDatePage] = useState(0);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilitySource, setAvailabilitySource] = useState<"google" | "local">("local");

  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingOrg, setBookingOrg] = useState("");
  const [bookingRole, setBookingRole] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const [collabName, setCollabName] = useState("");
  const [collabEmail, setCollabEmail] = useState("");
  const [collabPurpose, setCollabPurpose] = useState("");
  const [collabMessage, setCollabMessage] = useState("");
  const [collabErrors, setCollabErrors] = useState<Record<string, string>>({});
  const [isCollabSuccess, setIsCollabSuccess] = useState(false);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const currentService = SERVICES.find((service) => service.id === selectedService)!;
  const currentDay = availability.find((day) => day.date === selectedDate);
  const visibleDates = availability.slice(
    datePage * DATE_PAGE_SIZE,
    datePage * DATE_PAGE_SIZE + DATE_PAGE_SIZE,
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTimeZone(getBrowserTimeZone());
      setIdempotencyKey(newIdempotencyKey());
    }, 0);
    window.puspitaTurnstileCallback = (token) => setTurnstileToken(token);
    window.puspitaTurnstileExpired = () => setTurnstileToken("");
    return () => {
      window.clearTimeout(timeout);
      delete window.puspitaTurnstileCallback;
      delete window.puspitaTurnstileExpired;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAvailability() {
      setIsLoadingSlots(true);
      setAvailabilityError("");
      setSelectedDate("");
      setSelectedStart("");
      setDatePage(0);
      try {
        const params = new URLSearchParams({ serviceId: selectedService, timeZone });
        const response = await fetch(`/api/booking/availability?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message || "Jadwal tidak dapat dimuat.");
        const dates = (body.dates || []) as AvailabilityDay[];
        setAvailability(dates);
        setAvailabilitySource(body.source === "google" ? "google" : "local");
        if (dates[0]) setSelectedDate(dates[0].date);
      } catch (error) {
        if (!controller.signal.aborted) {
          setAvailability([]);
          setAvailabilityError(
            error instanceof Error ? error.message : "Jadwal tidak dapat dimuat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingSlots(false);
      }
    }
    void loadAvailability();
    return () => controller.abort();
  }, [selectedService, timeZone]);

  const selectionSummary = useMemo(() => {
    if (!selectedStart) return "Pilih tanggal dan jam yang tersedia.";
    const local = formatDateTime(selectedStart, timeZone);
    const wib = timeZone === WIB ? "" : ` · ${formatDateTime(selectedStart, WIB)}`;
    return `${currentService.name} · ${local}${wib}`;
  }, [currentService.name, selectedStart, timeZone]);

  const validateBooking = () => {
    const errors: Record<string, string> = {};
    if (!selectedStart) errors.schedule = "Pilih tanggal dan jam terlebih dahulu.";
    if (!bookingName.trim()) errors.name = "Nama wajib diisi.";
    if (!bookingEmail.trim()) errors.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingEmail)) {
      errors.email = "Format email tidak valid.";
    }
    if (!bookingMessage.trim()) errors.message = "Ceritakan singkat hal yang ingin dibahas.";
    if (turnstileSiteKey && !turnstileToken) errors.turnstile = "Selesaikan verifikasi keamanan.";
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateBooking()) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          startUtc: selectedStart,
          timeZone,
          name: bookingName,
          email: bookingEmail,
          organization: bookingOrg,
          role: bookingRole,
          message: bookingMessage,
          website: form.get("website") || "",
          turnstileToken: turnstileToken || "dev-bypass",
          idempotencyKey: idempotencyKey || newIdempotencyKey(),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Booking tidak dapat diproses.");
      setBookingResult(body as BookingResult);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Booking tidak dapat diproses.");
      setIdempotencyKey(newIdempotencyKey());
      setTurnstileToken("");
      window.turnstile?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBookingResult(null);
    setBookingName("");
    setBookingEmail("");
    setBookingOrg("");
    setBookingRole("");
    setBookingMessage("");
    setSelectedStart("");
    setIdempotencyKey(newIdempotencyKey());
    setTurnstileToken("");
    window.turnstile?.reset();
  };

  const handleCollabSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!collabName.trim()) errors.name = "Nama wajib diisi.";
    if (!collabEmail.trim()) errors.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collabEmail)) errors.email = "Format email tidak valid.";
    if (!collabPurpose) errors.purpose = "Pilih tujuan komunikasi.";
    if (!collabMessage.trim()) errors.message = "Konteks singkat wajib diisi.";
    setCollabErrors(errors);
    if (!Object.keys(errors).length) setIsCollabSuccess(true);
  };

  return (
    <>
      {turnstileSiteKey ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      ) : null}
      <SiteHeader currentKey="kerja-bersama" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="page-hero">
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow text-sirih">Kerja Bersama</span>
              <h1 className="display-lg">Kita bisa memulai dari satu percakapan yang memiliki konteks.</h1>
              <p className="lead muted">Pilih jenis kebutuhan, waktu yang sesuai, lalu ceritakan persoalan yang ingin dibahas.</p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto", overflow: "hidden", padding: 0 }}>
              <Image
                src="/images/artworks/trigona-bee-gouache.png"
                alt="Lebah Trigona Kolaborasi"
                fill
                sizes="(max-width: 720px) 80vw, 320px"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
                style={{ objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>Trigona · Kerja Bersama</span>
            </div>
          </div>
        </section>

        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container booking-shell">
            <div>
              <span className="eyebrow text-sirih">01 · Pilih Percakapan</span>
              <div className="service-options" style={{ marginTop: "16px" }}>
                {SERVICES.map((service) => {
                  const selected = selectedService === service.id;
                  return (
                    <label key={service.id} className={`service-option ${selected ? "selected" : ""}`}>
                      <input type="radio" name="service" value={service.id} checked={selected} onChange={() => setSelectedService(service.id)} />
                      <span>
                        <strong style={{ fontSize: "1.05rem" }}>{service.name}</strong>
                        <small className="muted" style={{ display: "block", marginTop: "4px" }}>{service.description}</small>
                      </span>
                      <span style={{ textAlign: "right" }}>
                        <strong style={{ display: "block" }}>{service.duration}</strong>
                        <small className="muted" style={{ display: "block" }}>{service.price}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="card booking-panel">
              {!bookingResult ? (
                <div>
                  <div className="calendar-head">
                    <div>
                      <span className="eyebrow text-selat">02 · Pilih Jadwal</span>
                      <h3 style={{ margin: "4px 0 0" }}>
                        {visibleDates[0]
                          ? formatDay(visibleDates[0].date, timeZone, { month: "long", year: "numeric" })
                          : "Jadwal tersedia"}
                      </h3>
                    </div>
                    <span className="badge">{timeZone}</span>
                  </div>

                  {isLoadingSlots ? <div className="booking-state">Mencari waktu yang tersedia…</div> : null}
                  {!isLoadingSlots && availabilityError ? (
                    <div className="booking-alert error" role="alert">{availabilityError}</div>
                  ) : null}
                  {!isLoadingSlots && !availabilityError && availabilitySource === "local" ? (
                    <p className="booking-local-note">
                      Jadwal lokal aktif · Senin–Jumat, 09.00–17.00 WIB. Google Calendar belum terhubung.
                    </p>
                  ) : null}
                  {!isLoadingSlots && !availabilityError && !availability.length ? (
                    <div className="booking-state">Belum ada blok waktu yang dapat dipesan untuk layanan ini.</div>
                  ) : null}

                  {visibleDates.length ? (
                    <>
                      <div className="date-grid">
                        {visibleDates.map((day) => (
                          <button
                            key={day.date}
                            className={`date-btn ${selectedDate === day.date ? "selected" : ""}`}
                            onClick={() => { setSelectedDate(day.date); setSelectedStart(""); }}
                            type="button"
                          >
                            <small>{formatDay(day.date, timeZone, { weekday: "short" })}</small>
                            {formatDay(day.date, timeZone, { day: "numeric" })}
                          </button>
                        ))}
                      </div>
                      <div className="booking-date-nav">
                        <button className="btn btn-secondary btn-small" type="button" disabled={datePage === 0} onClick={() => setDatePage((page) => page - 1)}>← Sebelumnya</button>
                        <span className="muted">{datePage + 1} / {Math.ceil(availability.length / DATE_PAGE_SIZE)}</span>
                        <button className="btn btn-secondary btn-small" type="button" disabled={(datePage + 1) * DATE_PAGE_SIZE >= availability.length} onClick={() => setDatePage((page) => page + 1)}>Berikutnya →</button>
                      </div>
                    </>
                  ) : null}

                  <div className="time-grid">
                    {(currentDay?.slots || []).map((slot) => (
                      <button
                        key={slot.startUtc}
                        className={`time-btn ${selectedStart === slot.startUtc ? "selected" : ""}`}
                        onClick={() => setSelectedStart(slot.startUtc)}
                        type="button"
                      >
                        {formatTime(slot.startUtc, timeZone)}
                      </button>
                    ))}
                  </div>
                  {bookingErrors.schedule ? <span className="field-error">{bookingErrors.schedule}</span> : null}

                  <form onSubmit={handleBookingSubmit} noValidate style={{ marginTop: "24px" }}>
                    <input className="booking-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="bookingName">Nama Lengkap *</label>
                        <input id="bookingName" value={bookingName} onChange={(event) => setBookingName(event.target.value)} autoComplete="name" />
                        <span className="field-error">{bookingErrors.name}</span>
                      </div>
                      <div className="form-field">
                        <label htmlFor="bookingEmail">Email *</label>
                        <input id="bookingEmail" type="email" value={bookingEmail} onChange={(event) => setBookingEmail(event.target.value)} autoComplete="email" />
                        <span className="field-error">{bookingErrors.email}</span>
                      </div>
                      <div className="form-field">
                        <label htmlFor="bookingOrg">Organisasi / Bisnis</label>
                        <input id="bookingOrg" value={bookingOrg} onChange={(event) => setBookingOrg(event.target.value)} autoComplete="organization" />
                      </div>
                      <div className="form-field">
                        <label htmlFor="bookingRole">Peran</label>
                        <input id="bookingRole" value={bookingRole} onChange={(event) => setBookingRole(event.target.value)} autoComplete="organization-title" />
                      </div>
                      <div className="form-field full">
                        <label htmlFor="bookingMessage">Apa yang ingin dibahas? *</label>
                        <textarea id="bookingMessage" value={bookingMessage} onChange={(event) => setBookingMessage(event.target.value)} placeholder="Jelaskan konteks singkat masalah atau tujuan percakapan…" />
                        <span className="field-error">{bookingErrors.message}</span>
                      </div>
                    </div>

                    <div className="booking-summary"><strong>Pilihanmu:</strong> {selectionSummary}</div>
                    {turnstileSiteKey ? (
                      <div>
                        <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-callback="puspitaTurnstileCallback" data-expired-callback="puspitaTurnstileExpired" data-theme="light" />
                        <span className="field-error">{bookingErrors.turnstile}</span>
                      </div>
                    ) : null}
                    <p className="booking-privacy muted">Dengan mengirim booking, Anda menyetujui penggunaan data ini untuk penjadwalan dan komunikasi sesi.</p>
                    {submitError ? <div className="booking-alert error" role="alert">{submitError}</div> : null}
                    <button className="btn btn-primary" type="submit" disabled={isSubmitting || isLoadingSlots}>
                      {isSubmitting ? "Mengonfirmasi…" : "Konfirmasi Booking →"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="success-box booking-success">
                  <div className="booking-success-icon">✓</div>
                  <h3>Booking Terkonfirmasi</h3>
                  <p className="lead">
                    Terima kasih, <strong>{bookingName}</strong>. {bookingResult.source === "google"
                      ? <>Undangan Google Calendar dikirim ke <strong>{bookingEmail}</strong>.</>
                      : <>Booking disimpan pada jadwal lokal.</>}
                  </p>
                  <p className="muted">{formatDateTime(bookingResult.startsAt, timeZone)}{timeZone !== WIB ? ` · ${formatDateTime(bookingResult.startsAt, WIB)}` : ""}</p>
                  <div className="booking-success-actions">
                    {bookingResult.meetUrl ? <a className="btn btn-primary" href={bookingResult.meetUrl} target="_blank" rel="noreferrer">Buka Google Meet</a> : null}
                    <a className="btn btn-secondary" href={bookingResult.manageUrl}>Kelola Jadwal</a>
                  </div>
                  <button className="btn btn-dark btn-small" onClick={resetBooking} type="button">Ajukan Jadwal Lain</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section" style={{ background: "rgba(184, 204, 145, 0.22)" }}>
          <div className="narrow">
            <span className="eyebrow text-sirih">Kolaborasi Lain</span>
            <h2 className="display-md">Belum membutuhkan jadwal? Kirim konteks awal.</h2>
            {!isCollabSuccess ? (
              <form className="card card-pad" onSubmit={handleCollabSubmit} noValidate style={{ marginTop: "28px" }}>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="collabName">Nama *</label>
                    <input id="collabName" value={collabName} onChange={(event) => setCollabName(event.target.value)} />
                    <span className="field-error">{collabErrors.name}</span>
                  </div>
                  <div className="form-field">
                    <label htmlFor="collabEmail">Email *</label>
                    <input id="collabEmail" type="email" value={collabEmail} onChange={(event) => setCollabEmail(event.target.value)} />
                    <span className="field-error">{collabErrors.email}</span>
                  </div>
                  <div className="form-field full">
                    <label htmlFor="collabPurpose">Tujuan Kolaborasi *</label>
                    <select id="collabPurpose" value={collabPurpose} onChange={(event) => setCollabPurpose(event.target.value)}>
                      <option value="">-- Pilih tujuan --</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Speaking">Speaking & Workshop</option>
                      <option value="Education">Education & Training</option>
                      <option value="Product Development">Product & Technology</option>
                      <option value="Research & Discussion">Research & Discussion</option>
                      <option value="Professional Opportunity">Professional Opportunity</option>
                    </select>
                    <span className="field-error">{collabErrors.purpose}</span>
                  </div>
                  <div className="form-field full">
                    <label htmlFor="collabMessage">Konteks Singkat *</label>
                    <textarea id="collabMessage" value={collabMessage} onChange={(event) => setCollabMessage(event.target.value)} placeholder="Jelaskan kebutuhan, ruang kolaborasi, atau latar belakang…" />
                    <span className="field-error">{collabErrors.message}</span>
                  </div>
                </div>
                <button className="btn btn-dark" type="submit" style={{ marginTop: "16px" }}>Kirim Konteks Sekarang →</button>
              </form>
            ) : (
              <div className="card card-pad success-box" style={{ marginTop: "28px", textAlign: "center" }}>
                <h3 style={{ color: "var(--sirih)" }}>Pesan Terkirim!</h3>
                <p className="lead" style={{ fontSize: "1rem" }}>Terima kasih atas konteks yang Anda kirimkan. Tim akan mempelajari dan membalas melalui email Anda secepatnya.</p>
                <button className="btn btn-dark btn-small" onClick={() => setIsCollabSuccess(false)} type="button" style={{ marginTop: "16px" }}>Kirim Pesan Baru</button>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
