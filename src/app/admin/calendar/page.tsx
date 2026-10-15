import type { Metadata } from "next";
import { getAdminEmail } from "@/modules/booking/admin-auth";
import { bookingEnvironmentReady } from "@/modules/booking/config";
import { AdminCalendarClient } from "./admin-calendar-client";

export const metadata: Metadata = {
  title: "Pengaturan Booking — PUSPITA",
  robots: { index: false, follow: false },
};

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const ready = bookingEnvironmentReady();
  const adminEmail = ready ? await getAdminEmail() : null;
  const error = typeof query.error === "string" ? query.error : null;

  return (
    <main className="admin-calendar-page">
      <section className="narrow">
        <span className="eyebrow text-sirih">PUSPITA Booking</span>
        <h1 className="display-md">Pengaturan Google Calendar</h1>
        <p className="lead muted">
          Sambungkan akun pemilik, tentukan kalender jam tersedia, lalu pilih kalender yang harus
          mencegah bentrok.
        </p>

        {!ready ? (
          <div className="card card-pad admin-calendar-card">
            <h2>Konfigurasi server belum lengkap</h2>
            <p className="muted">
              Tambahkan environment variable pada panduan deployment sebelum menghubungkan akun
              Google.
            </p>
          </div>
        ) : !adminEmail ? (
          <div className="card card-pad admin-calendar-card">
            <h2>Hubungkan akun admin</h2>
            {error ? (
              <p className="booking-alert error" role="alert">
                Koneksi Google gagal ({error}). Pastikan akun yang dipilih adalah akun admin.
              </p>
            ) : null}
            <p className="muted">
              Hanya alamat yang tercantum pada <code>ADMIN_GOOGLE_EMAIL</code> yang dapat masuk.
            </p>
            <a className="btn btn-primary" href="/api/admin/google/connect">
              Hubungkan Google Calendar →
            </a>
          </div>
        ) : (
          <AdminCalendarClient adminEmail={adminEmail} />
        )}
      </section>
    </main>
  );
}
