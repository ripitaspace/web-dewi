# Booking Schedule Setup

Sistem booking memakai SQLite lokal (`dev.db`) dan Google Calendar sebagai sumber ketersediaan. Halaman publik tetap aman dalam keadaan nonaktif sampai seluruh konfigurasi inti tersedia.

## 1. Database SQLite

1. Isi `DATABASE_URL` dengan `file:./dev.db`, atau absolute path pada volume disk yang persisten.
2. Terapkan schema:

   ```bash
   npm run db:push
   ```

Schema baru akan ditambahkan ke `dev.db` tanpa menghapus cache Notion yang telah ada.

## 2. Google Cloud

1. Buat atau pilih Google Cloud project, lalu aktifkan Google Calendar API.
2. Konfigurasikan OAuth consent screen. Untuk akun Gmail pribadi di production, publikasikan app ke status **Production**; mode Testing dapat membuat refresh token berscope Calendar kedaluwarsa setelah tujuh hari.
3. Buat OAuth client bertipe **Web application**.
4. Tambahkan callback berikut sebagai Authorized redirect URI:

   - Lokal: `http://localhost:3000/api/admin/google/callback`
   - Production: `https://DOMAIN/api/admin/google/callback`

5. Isi `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, dan satu alamat yang diizinkan pada `ADMIN_GOOGLE_EMAIL`.

OAuth meminta scope identitas, daftar kalender, FreeBusy, dan pengelolaan event. Refresh token disimpan terenkripsi AES-256-GCM.

## 3. Secret dan proteksi spam

Salin `.env.example` menjadi `.env.local`, lalu isi seluruh nilai tanpa memasukkan secret ke Git.

- `BOOKING_ENCRYPTION_KEY`: 32 byte acak dalam hex atau base64.
- `BOOKING_SESSION_SECRET`: string acak panjang untuk session admin, OAuth state, dan manage token.
- `RATE_LIMIT_SALT`: string acak independen untuk hash IP/email.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY`: pasangan key dari Cloudflare Turnstile.
- `CRON_SECRET`: secret yang juga dikonfigurasi oleh Vercel untuk request cron terautentikasi.

Contoh membuat nilai hex 32 byte:

```bash
openssl rand -hex 32
```

Tanpa key Turnstile, bypass hanya diizinkan pada environment selain production.

## 4. Sambungkan kalender

1. Jalankan aplikasi dan buka `/admin/calendar`.
2. Masuk menggunakan alamat yang sama dengan `ADMIN_GOOGLE_EMAIL`.
3. Pilih atau buat kalender `PUSPITA — Open for Booking`.
4. Pilih kalender tujuan booking dan centang semua kalender yang harus memblokir slot.
5. Simpan konfigurasi.

Setiap timed event di kalender Open for Booking menjadi blok tersedia. Event all-day diabaikan. Sistem membuat kandidat tiap 30 menit, dengan buffer 30 menit sebelum dan sesudah sesi.

## 5. Deployment satu server persisten

Tambahkan semua variable dari `.env.example` pada server. Pastikan `NEXT_PUBLIC_SITE_URL` menunjuk ke domain canonical production. Jalankan maintenance harian pada server untuk:

- membersihkan reservasi `PENDING` yang kedaluwarsa;
- memperpanjang Google Calendar watch channel;
- melakukan rekonsiliasi incremental sync.

Contoh cron harian pada server:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://DOMAIN/api/booking/maintenance
```

SQLite hanya aman untuk satu proses aplikasi yang memakai satu file database persisten. Jangan menjalankan booking pada Vercel serverless atau beberapa instance aplikasi: filesystem-nya tidak persisten dan mutex anti-bentrok hanya berlaku pada satu proses. Setelah deployment, sambungkan ulang Google Calendar dari URL production agar callback dan watch channel memakai domain production.

## 6. Smoke test

1. Buat timed event pada kalender Open for Booking minimal 24 jam dari sekarang.
2. Pastikan `/kerja-bersama` hanya menampilkan slot di dalam blok tersebut dan menghapus waktu yang bentrok dengan kalender sibuk.
3. Buat satu booking dan periksa event, undangan tamu, Google Meet, serta manage link.
4. Uji reschedule dan cancel melalui manage link.
5. Edit lalu hapus event langsung di Google Calendar dan pastikan database tersinkron saat webhook/maintenance berjalan.

Perintah verifikasi fitur booking secara lokal:

```bash
npm test
npx eslint src/app/admin src/app/api/admin src/app/api/booking src/app/booking src/components/pages/kerja-bersama-client.tsx src/modules/booking
npm run build
```
