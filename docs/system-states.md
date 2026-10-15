# PuspitaCore — Bandeng & Udang states

Kelima state menggunakan ilustrasi Nusantara Gouache dengan judul, deskripsi, label, status, dan tombol sebagai HTML. Teks default dan alt text ada di `src/components/system-state/config.ts`. Tidak ada tulisan yang tertanam dalam PNG.

## File dan integrasi

| File | Peran |
| --- | --- |
| `src/components/system-state/system-state.tsx` | Komponen reusable untuk loading, 404, 500, offline, empty; fallback gambar dan aksi navigasi |
| `src/components/system-state/config.ts` | Copy, aset, alt text, dan status koneksi terpusat |
| `src/components/system-state/system-state.module.css` | Palet resmi, layout responsif, animasi CSS, reduced motion, delay visual loading 180 ms |
| `src/components/system-state/route-loading.tsx` | Fallback Suspense tanpa menunda penyelesaian pekerjaan |
| `src/components/system-state/connection.ts` | Verifikasi koneksi melalui endpoint same-origin tanpa cache |
| `src/components/system-state/use-connection.ts` | Event online/offline, timeout 5 detik, pemeriksaan ulang saat tab aktif, polling saat belum terhubung |
| `src/components/system-state/connection-notice.tsx` | Pemberitahuan koneksi yang dapat dibuka tanpa menghalangi konten lokal |
| `src/components/system-state/showcase.tsx` | Preview kelima state dan simulasi retry |
| `src/app/not-found.tsx` | Halaman 404, noindex, navigasi pulang dan kembali |
| `src/app/error.tsx`, `src/app/global-error.tsx` | Error boundary; retry memakai API `retry()` Next.js 16.4.1 |
| `src/app/api/health/route.ts` | Probe jangkauan aplikasi, JSON dengan penanda layanan dan no-store |
| `src/app/dev/system-states/page.tsx` | Preview hanya development; `notFound()` pada production |
| `src/app/layout.tsx` | Pemberitahuan koneksi global; splash lama dengan durasi minimum digantikan loading pekerjaan nyata |
| `src/app/{pemikiran,tentang,kerja-bersama,ripita}/loading.tsx` | Integrasi loader route |
| `src/app/{karya,belajar}/page.tsx` | Suspense lokal saat mengambil data |
| `src/components/pages/{karya,pemikiran}-client.tsx` | Empty state kontekstual, tombol reset filter bila relevan |
| `src/app/blog/page.tsx` | Empty state arsip artikel dengan navigasi pulang |
| `src/modules/cms/services/blog.service.ts` | Kegagalan CMS dilempar ke error boundary, hasil sukses kosong tetap empty, slug tidak ditemukan tetap 404 |
| `src/components/system-state/connection.test.ts` | Tes hasil probe dan kegagalan jaringan |
| `src/modules/cms/services/blog.service.test.ts` | Tes pemisahan kosong, error, dan not-found |

Root `src/app/loading.tsx` dihapus. Loading yang membungkus seluruh pohon route dapat mengirim respons streaming 200 sebelum slug dinyatakan tidak ditemukan. Suspense lokal pada halaman indeks menjaga validasi slug modul/tool sebelum streaming. Untuk route detail baru, panggil `notFound()` sebelum Suspense yang mengirim respons.

## Aset

Empat ilustrasi dibuat melalui built-in ImageGen, lalu disalin ke `public/images/mascots/`: `loading.png`, `error-500.png`, `offline.png`, dan `empty.png`. Prompt lengkap tersedia di [mascot-prompts.md](mascot-prompts.md). 404 memakai `loading.png` dengan angka dekoratif HTML. Ilustrasi dibatasi 410 px pada desktop dan menyatu dengan permukaan krem melalui mask tepi.

## Penggunaan

```tsx
<SystemState type="404" />
<SystemState type="500" primaryAction={{ label: "Coba Lagi", onClick: retry }} />
<SystemState type="offline" />
<SystemState type="empty" size="section" title="Belum ada dokumen."
  description="Dokumen yang ditambahkan akan muncul di sini."
  primaryAction={canCreate ? { label: "Mulai Tambahkan", onClick: openForm } : null} />
```

API: `type`, `title`, `description`, `image`, `imageAlt`, `primaryAction`, `secondaryAction`, `size` (`page`, `section`, `compact`), `className`, dan `connectionStatus`. Aksi berupa `{label, href}` atau `{label, onClick, disabled?}`. `null` menyembunyikan aksi default. Default empty tidak memiliki CTA karena halaman publik tidak menyediakan fitur tambah.

Untuk Server Component, gunakan aksi `href`. Handler fungsi harus dibuat di Client Component.

## Koneksi

`navigator.onLine === false` menandakan offline. Nilai `true` tetap diverifikasi dengan `/api/health`, termasuk status HTTP dan penanda JSON agar halaman captive portal tidak dianggap sukses. Respons gagal server dibedakan dari koneksi yang tidak dapat menjangkau situs. Probe ini memeriksa aplikasi, bukan kesehatan CMS eksternal; error CMS ditangani oleh error boundary.

Notifikasi mempertahankan konten halaman. Gambar offline dimuat saat aplikasi masih terhubung. Mekanisme ini bekerja setelah aplikasi dimuat; membuka situs pertama kali tanpa jaringan masih bergantung pada browser karena tidak menambahkan service worker atau cache seluruh aplikasi.

## Preview dan hasil pemeriksaan (15 Oktober 2026)

Jalankan `npm run dev`, lalu buka `/dev/system-states`. Tombol retry pada preview merupakan simulasi, sementara error boundary produksi menggunakan retry framework. Preview menghasilkan HTTP 404 pada mode produksi.

- `npm run build`: lulus, termasuk TypeScript dan prerender. Dijalankan dengan Node 22.13.1; Node 16 bawaan shell terlalu lama untuk versi Next proyek ini.
- `npm test`: 38 tes lulus pada workspace lengkap. Pemeriksaan terpisah atas calon commit (tanpa pekerjaan modul belajar lain yang belum di-commit) menghasilkan 18 tes lulus dalam 4 berkas, termasuk 11 tes baru untuk koneksi dan CMS.
- ESLint terarah pada komponen state, boundary, health, preview, layout, tes baru, dan halaman blog: tanpa error; halaman blog memiliki dua warning `<img>` lama.
- `npm run lint`: masih gagal karena 25 error `@typescript-eslint/no-explicit-any` yang sudah ada pada modul CMS. Perubahan state tidak menambahkan penggunaan `any`.
- HTTP produksi: URL tak dikenal, slug tool/modul tak dikenal, dan preview internal menghasilkan 404; health dan keempat PNG menghasilkan 200.
- Browser: perpindahan kelima state, aset termuat, teks HTML, retry preview 500, serta perubahan indikator koneksi berhasil diperiksa.
- Responsif: kelima state diperiksa pada lebar CSS 520, 1024, dan 1920 px tanpa overflow horizontal; 404 juga diperiksa pada 320 px. Tombol tersusun vertikal pada layar sempit.
- Reduced motion tersedia melalui media query CSS. Pemulihan koneksi diuji melalui unit test dan simulasi preview; jaringan perangkat tidak sengaja diputus saat pengujian.

Screenshot hasil: [puspita-state-preview.jpg](../../puspita-state-preview.jpg).
