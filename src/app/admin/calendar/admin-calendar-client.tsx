"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Calendar = {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
  timeZone: string | null;
};

type SettingsResponse = {
  calendars: Calendar[];
  settings: {
    availabilityCalendarId: string;
    bookingCalendarId: string;
    busyCalendarIds: string[];
    ownerTimeZone: string;
  } | null;
  watch: { active: boolean; expiresAt: string | null };
};

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "Permintaan gagal.");
  return body;
}

export function AdminCalendarClient({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [availabilityCalendarId, setAvailabilityCalendarId] = useState("");
  const [bookingCalendarId, setBookingCalendarId] = useState("");
  const [busyCalendarIds, setBusyCalendarIds] = useState<string[]>([]);
  const [ownerTimeZone, setOwnerTimeZone] = useState("Asia/Jakarta");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const next = (await readJson(await fetch("/api/admin/calendar-settings", { cache: "no-store" }))) as SettingsResponse;
      setData(next);
      if (next.settings) {
        setAvailabilityCalendarId(next.settings.availabilityCalendarId);
        setBookingCalendarId(next.settings.bookingCalendarId);
        setBusyCalendarIds(next.settings.busyCalendarIds);
        setOwnerTimeZone(next.settings.ownerTimeZone);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pengaturan tidak dapat dibaca.");
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const createRecommended = async () => {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const created = await readJson(await fetch("/api/admin/calendars", { method: "POST" }));
      await load();
      setAvailabilityCalendarId(created.availability.id);
      setBookingCalendarId(created.booking.id);
      setBusyCalendarIds((current) => [...new Set([...current, created.booking.id])]);
      setStatus("Dua kalender rekomendasi berhasil dibuat. Simpan pengaturan untuk mengaktifkannya.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kalender tidak dapat dibuat.");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await readJson(
        await fetch("/api/admin/calendar-settings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            availabilityCalendarId,
            bookingCalendarId,
            busyCalendarIds,
            ownerTimeZone,
          }),
        }),
      );
      setStatus("Pengaturan tersimpan dan sinkronisasi Google Calendar aktif.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pengaturan tidak dapat disimpan.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm("Putuskan Google Calendar dan nonaktifkan booking publik?")) return;
    setBusy(true);
    try {
      await readJson(await fetch("/api/admin/google/disconnect", { method: "POST" }));
      router.replace("/admin/calendar");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Koneksi tidak dapat diputus.");
      setBusy(false);
    }
  };

  const writableCalendars = data?.calendars.filter((calendar) =>
    ["owner", "writer"].includes(calendar.accessRole),
  );

  return (
    <div className="card card-pad admin-calendar-card">
      <div className="admin-calendar-heading">
        <div>
          <span className="badge">Terhubung</span>
          <h2>{adminEmail}</h2>
        </div>
        <button className="btn btn-secondary btn-small" type="button" onClick={disconnect} disabled={busy}>
          Putuskan
        </button>
      </div>

      {error ? <p className="booking-alert error" role="alert">{error}</p> : null}
      {error ? (
        <p>
          <a className="btn btn-secondary btn-small" href="/api/admin/google/connect">
            Hubungkan ulang Google
          </a>
        </p>
      ) : null}
      {status ? <p className="booking-alert success" role="status">{status}</p> : null}

      {!data ? (
        <p className="muted">Membaca kalender…</p>
      ) : (
        <div className="admin-calendar-form">
          <div className="admin-recommended-box">
            <strong>Belum memiliki kalender khusus?</strong>
            <p className="muted">
              Buat kalender “Open for Booking” dan “Bookings”, lalu tambahkan blok waktu pada kalender pertama.
            </p>
            <button className="btn btn-secondary btn-small" type="button" onClick={createRecommended} disabled={busy}>
              Buat kalender rekomendasi
            </button>
          </div>

          <div className="form-field">
            <label htmlFor="availabilityCalendar">Kalender blok tersedia</label>
            <select id="availabilityCalendar" value={availabilityCalendarId} onChange={(event) => setAvailabilityCalendarId(event.target.value)}>
              <option value="">Pilih kalender</option>
              {data.calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>{calendar.summary}</option>
              ))}
            </select>
            <small className="muted">Semua event berjam di kalender ini dianggap sebagai waktu yang boleh dipesan.</small>
          </div>

          <div className="form-field">
            <label htmlFor="bookingCalendar">Kalender tujuan booking</label>
            <select id="bookingCalendar" value={bookingCalendarId} onChange={(event) => setBookingCalendarId(event.target.value)}>
              <option value="">Pilih kalender</option>
              {writableCalendars?.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>{calendar.summary}</option>
              ))}
            </select>
          </div>

          <fieldset className="admin-calendar-fieldset">
            <legend>Kalender yang memblokir slot</legend>
            <div className="admin-calendar-list">
              {data.calendars
                .filter((calendar) => calendar.id !== availabilityCalendarId)
                .map((calendar) => (
                  <label key={calendar.id}>
                    <input
                      type="checkbox"
                      checked={busyCalendarIds.includes(calendar.id)}
                      onChange={(event) =>
                        setBusyCalendarIds((current) =>
                          event.target.checked
                            ? [...new Set([...current, calendar.id])]
                            : current.filter((id) => id !== calendar.id),
                        )
                      }
                    />
                    <span>{calendar.summary}{calendar.primary ? " · utama" : ""}</span>
                  </label>
                ))}
            </div>
          </fieldset>

          <div className="form-field">
            <label htmlFor="ownerTimeZone">Zona waktu pemilik</label>
            <input id="ownerTimeZone" value={ownerTimeZone} onChange={(event) => setOwnerTimeZone(event.target.value)} />
          </div>

          <div className="admin-calendar-actions">
            <button className="btn btn-primary" type="button" onClick={save} disabled={busy || !availabilityCalendarId || !bookingCalendarId}>
              {busy ? "Menyimpan…" : "Simpan & Aktifkan"}
            </button>
            <span className="muted">
              Webhook: {data.watch.active ? "aktif" : "belum aktif"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
