"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";

type Booking = {
  serviceId: string;
  serviceName: string;
  name: string;
  email: string;
  startsAt: string;
  endsAt: string;
  status: string;
  meetUrl: string | null;
};
type AvailabilityDay = { date: string; slots: Array<{ startUtc: string; endUtc: string }> };

const WIB = "Asia/Jakarta";

function browserTimeZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || WIB; } catch { return WIB; }
}

function dateTime(value: string, timeZone: string) {
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

function dateLabel(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${value}T12:00:00`));
}

function timeLabel(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .format(new Date(value));
}

async function json(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "Permintaan gagal.");
  return body;
}

export function ManageBookingClient({ token }: { token: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [timeZone, setTimeZone] = useState(WIB);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = (await json(await fetch(`/api/booking/manage/${encodeURIComponent(token)}`, { cache: "no-store" }))) as Booking;
      setBooking(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking tidak dapat dibaca.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTimeZone(browserTimeZone());
      void load();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    if (!booking || booking.status !== "CONFIRMED") return;
    const controller = new AbortController();
    const params = new URLSearchParams({ serviceId: booking.serviceId, timeZone });
    fetch(`/api/booking/availability?${params}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: { "x-booking-manage-token": token },
    })
      .then(json)
      .then((body) => {
        const next = (body.dates || []) as AvailabilityDay[];
        setDays(next);
        if (next[0]) setSelectedDate(next[0].date);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Jadwal tidak dapat dimuat.");
      });
    return () => controller.abort();
  }, [booking, timeZone, token]);

  const reschedule = async () => {
    if (!selectedStart) { setError("Pilih waktu baru terlebih dahulu."); return; }
    setSaving(true);
    setError("");
    try {
      await json(await fetch(`/api/booking/manage/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ startUtc: selectedStart, timeZone }),
      }));
      setNotice("Jadwal berhasil diperbarui. Google telah mengirim pembaruan undangan.");
      setSelectedStart("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Jadwal tidak dapat diubah.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm("Batalkan booking ini? Google akan mengirim pemberitahuan pembatalan.")) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/booking/manage/${encodeURIComponent(token)}`, { method: "DELETE" });
      if (!response.ok) await json(response);
      setBooking((current) => current ? { ...current, status: "CANCELLED" } : current);
      setNotice("Booking sudah dibatalkan.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking tidak dapat dibatalkan.");
    } finally {
      setSaving(false);
    }
  };

  const slots = days.find((day) => day.date === selectedDate)?.slots || [];

  return (
    <>
      <SiteHeader currentKey="kerja-bersama" />
      <main className="manage-booking-page" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="narrow">
          <span className="eyebrow text-sirih">Kelola Booking</span>
          <h1 className="display-md">Atur ulang percakapan kita.</h1>
          {loading ? <div className="card card-pad booking-state">Membaca booking…</div> : null}
          {error ? <div className="booking-alert error" role="alert">{error}</div> : null}
          {notice ? <div className="booking-alert success" role="status">{notice}</div> : null}

          {booking ? (
            <div className="card card-pad manage-booking-card">
              <div className="manage-booking-summary">
                <div>
                  <span className="badge">{booking.status === "CONFIRMED" ? "Terkonfirmasi" : "Dibatalkan"}</span>
                  <h2>{booking.serviceName}</h2>
                  <p className="muted">{booking.name} · {booking.email}</p>
                </div>
                <div>
                  <strong>{dateTime(booking.startsAt, timeZone)}</strong>
                  {timeZone !== WIB ? <small className="muted">{dateTime(booking.startsAt, WIB)}</small> : null}
                </div>
              </div>

              {booking.status === "CONFIRMED" ? (
                <>
                  <hr />
                  <h3>Pilih waktu baru</h3>
                  <div className="manage-date-grid">
                    {days.map((day) => (
                      <button key={day.date} type="button" className={`date-btn ${selectedDate === day.date ? "selected" : ""}`} onClick={() => { setSelectedDate(day.date); setSelectedStart(""); }}>
                        {dateLabel(day.date, timeZone)}
                      </button>
                    ))}
                  </div>
                  <div className="time-grid">
                    {slots.map((slot) => (
                      <button key={slot.startUtc} type="button" className={`time-btn ${selectedStart === slot.startUtc ? "selected" : ""}`} onClick={() => setSelectedStart(slot.startUtc)}>
                        {timeLabel(slot.startUtc, timeZone)}
                      </button>
                    ))}
                  </div>
                  <div className="manage-booking-actions">
                    <button className="btn btn-primary" type="button" onClick={reschedule} disabled={saving || !selectedStart}>{saving ? "Memproses…" : "Perbarui Jadwal"}</button>
                    {booking.meetUrl ? <a className="btn btn-secondary" href={booking.meetUrl} target="_blank" rel="noreferrer">Buka Meet</a> : null}
                    <button className="btn btn-danger" type="button" onClick={cancel} disabled={saving}>Batalkan Booking</button>
                  </div>
                </>
              ) : (
                <p className="muted">Slot ini sudah dilepas dan tidak dapat diubah lagi.</p>
              )}
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
