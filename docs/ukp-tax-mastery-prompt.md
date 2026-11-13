# MASTER PROMPT — UKP Tax Mastery (disesuaikan dengan Ruang Belajar PuspitaCore)

## Misi

Kembangkan card **Pajak → UKP** di Ruang Belajar (`/belajar/pajak/ukp`) menjadi sistem latihan kompetensi interaktif untuk UKP Tingkat A, B, dan C. Jangan membangun sistem baru. Perluas yang sudah ada.

Tujuan akhirnya adalah kemampuan memahami, menghitung, memeriksa, menganalisis, dan memutuskan perkara pajak, bukan sekadar kumpulan soal online.

## 1. Kondisi yang sudah ada (wajib dipakai ulang)

Jangan membuat ulang atau mengubah desain global. Semua berikut sudah tersedia:

**Katalog** — `src/modules/learning/registry.ts` adalah satu-satunya sumber metadata.
- Topik `tax-ukp` (UKP) di domain `pajak`.
- Subtopik `tax-ukp-a`, `tax-ukp-b`, `tax-ukp-c`.
- Mata uji A: 5 kartu (Bea Meterai; KUP/PPSP/PP; PPh OP; PPh Pemotongan/Pemungutan; PPN dan SPT PPN). Statusnya baru metadata.
- Mata uji B: 8 kartu (Akuntansi Perpajakan; Bea Meterai; KUP/PPSP/PP; PBB-P5L; PPh OP; PPh Pemotongan/Pemungutan; PPh Badan; PPN dan SPT PPN). Statusnya baru metadata.
- Mata uji C: 9 kartu, semua berisi modul.
- Rute dan breadcrumb dibuat otomatis dari `slug`. **Jangan membuat file halaman baru untuk kategori.**
- Modul C terdaftar sebagai MOD-PJK-301 sampai 309 dengan `status: "published"`.

**Engine dan player** (`src/modules/learning/`, `src/components/learning/`)
- `engine.ts`: penilaian, kebijakan percobaan, penyelesaian, validasi sesi, dan laporan.
- `learning-player.tsx`, `activity.tsx`, `report.tsx`: player, aktivitas, dan laporan.
- `schemas/plf-module-v1.1.schema.json`: schema PLF Module JSON v1.1 yang berlaku.
- Tipe blok yang ada: `reading`, `image`, `video`, `audio`, `single_choice`, `multiple_choice`, `true_false`, `number_input`, `matching`, `ordering`, `journal_entry`, `case_decision`, `reflection`, `markdown`, `glossary`, `worked_example`, `callout`, `comparison_table`, `deep_dive`, `reference`, `audit_workpaper`.
- `role` blok mengikuti tahapan Learning Blueprint (`discover`, `understand`, `independent_practice`, dan seterusnya).
- Pemetaan tipe di prompt lama: Single Choice → `single_choice`; Multiple Choice → `multiple_choice`; True/False → `true_false`; Numeric → `number_input`; Matching → `matching`; Ordering → `ordering`; Journal Entry → `journal_entry`; Case Decision → `case_decision`; Open Analysis → `reflection` (**tidak diberi skor otomatis**, perlu tinjauan manual); Worked Example → `worked_example`; Deep Dive → `deep_dive`.
- Belum ada padanannya: Table Input, Calculation Steps, dan Document Review. `audit_workpaper` dapat dipertimbangkan sebagai dasar tabel input. Tambahkan tipe baru hanya jika perlu, lewat revisi schema yang kompatibel mundur.

**Pola konten UKP C** (`content/ukp-c-builder.ts`, `content/ukp-c-specs/*.ts`, `content/ukp-c/*.json`)
- Satu `UkpModuleSpec` per mata uji: `number`, `slug`, `title`, `summary`, `minutes`, `questions`, `intro`, `summaries`, `review`.
- Soal dalam JSON `{ n, sub, q, o[], ans, exp }`. Jawaban rupiah murni otomatis menjadi `number_input`, sisanya `single_choice`.
- Pelengkapnya: ringkasan per submateri, tabel rangkuman, dan pasangan `matching`.
- Pendaftaran modul ada di `content/ukp-c-modules.ts` dan `catalog.ts`.
- Referensi implementasi: `ukp-c.test.ts`.

**Penyimpanan dan laporan**
- Sesi default hanya di memori. Penyimpanan lokal hanya untuk modul dengan `experience.allowResume: true` (contoh: Audit SME), diberi cakupan per revisi.
- Laporan mengikuti `plf.sessionReport` v1, bisa diunduh sebagai JSON, dan PDF lewat dialog cetak.
- Tidak ada login, backend progres, sinkronisasi, atau sertifikat. Pertahankan ini.
- Cache offline: `public/learning-sw.js`.

## 2. Pekerjaan yang diminta

Kerjakan bertahap. Setiap tahap harus berfungsi dan lulus uji sebelum lanjut.

### Tahap 1 — Audit singkat dan peta kurikulum
1. Baca `src/modules/learning/README.md`, schema v1.1, dan satu spec C (`bea-meterai.ts`).
2. Cari PDF "Cakupan Materi Uji Kompetensi Perpajakan". Jika tidak ada, **jangan mengarang isinya**. Pakai deskripsi registry A/B/C sebagai peta sementara dan tandai "belum diselaraskan dengan PDF".
3. Buat checklist cakupan: mata uji dan submateri → modul → status (tersedia / metadata saja / belum diverifikasi).

### Tahap 2 — Lengkapi UKP A (prioritas utama)
1. Buat modul untuk 5 mata uji A mengikuti pola builder C: `ukp-a-specs/`, `ukp-a/*.json`, `ukp-a-modules.ts`. Gunakan ulang `buildUkpModule` dan generalisasikan prefix `ukp-c-` menjadi parameter tingkat dengan perubahan sekecil mungkin.
2. Daftarkan di `registry.ts` (kode publik berikutnya setelah MOD-PJK-309 yang masih bebas) dan `catalog.ts`.
3. Mulai dari **UKP A — Bea Meterai**, tahap Learning, Level 1. Jadikan ini unit lengkap pertama yang dikerjakan dari awal sampai laporan.
4. Tambahkan tombol atau tautan **"MULAI DARI NOL"** di card UKP A yang membuka modul tersebut.
5. Modul A dan B hanya boleh berstatus `published` bila isi soalnya diverifikasi. Bila belum, biarkan `draft` atau metadata saja.

### Tahap 3 — Delapan tahap Learning Blueprint pada satu unit
Terapkan pada unit contoh lewat `role` blok yang sudah ada:
`discover` → `understand` → `observe` (`worked_example`) → `guided_practice` (hint bertingkat) → `independent_practice` → `deep_dive` → `self_evaluation` (soal baru, bukan data worked example) → `reflect_report`.

Cek nilai `role` yang valid di `types.ts` terlebih dahulu. Jangan menambah role tanpa alasan.

### Tahap 4 — Mode latihan (hanya bila kebutuhan nyata)
- **Learning**: sudah ada lewat player.
- **Drill 20 soal** dan **Exam 50 soal**: bangun sebagai komposisi dari bank soal yang sama, bukan engine kedua. Exam harus menyembunyikan kunci sampai submit, memiliki navigasi soal, tanda ragu-ragu, dan review sebelum submit. Jangan mengklaim identik dengan ujian resmi.
- **Case Study** terintegrasi (misalnya PT Nusantara Prima): gunakan `case_decision`, `journal_entry`, dan `number_input`. Tunda sampai konten terverifikasi.

### Tahap 5 — Mastery dan progres
- Tetap pakai laporan engine. Tambahkan klasifikasi skor (0–59 Belum Menguasai, 60–74 Pemahaman Dasar, 75–84 Cukup Kompeten, 85–94 Kompeten, 95–100 Sangat Kompeten) **hanya sebagai tampilan laporan**.
- Status unit (Belum Dipelajari, Sedang Dipelajari, Perlu Pengulangan, Dikuasai) butuh penyimpanan lokal. Aktifkan `allowResume` per modul UKP secara sadar, dengan cakupan per revisi (pola Audit SME), dan nyatakan jelas bahwa progres hilang bila data browser dihapus.
- Kesulitan adaptif lima level: simpan sebagai metadata soal (`difficulty`) lebih dulu. Logika adaptif ditunda sampai data soal cukup.

## 3. Aturan konten dan hukum

- Setiap aturan, tarif, dan batas nilai harus sesuai tahun/masa pajak. Konten C saat ini berbasis ketentuan per Oktober 2026. Pertahankan label itu.
- Prioritas sumber: peraturan perundang-undangan, JDIH Kemenkeu, DJP, lalu sumber resmi lain.
- Jangan mengarang nomor peraturan, pasal, atau tarif. Bila tidak bisa diverifikasi, tandai **Perlu Verifikasi**.
- Untuk tiap soal numerik, hitung ulang jawabannya secara independen sebelum dipublikasikan.
- Soal adalah latihan, **bukan soal ujian asli**. Pertahankan callout "Bahan latihan" seperti pada modul C.
- Laporan adalah bukti aktivitas belajar, bukan sertifikat.

## 4. Batasan

- Jangan ubah desain global, header, atau halaman `/karya`.
- Jangan buat backend, login, atau sinkronisasi.
- Jangan buat question engine kedua.
- Ikuti `AGENTS.md`: versi Next.js ini punya perubahan besar, jadi baca `node_modules/next/dist/docs/` sebelum menyentuh rute atau halaman.
- Jangan refactor besar di luar modul learning.

## 5. Pengujian (jalankan sebelum menyatakan selesai)

```sh
npm test -- src/modules/learning
npx tsc --noEmit
npm run build
```

- Tambahkan tes modul A mengikuti `ukp-c.test.ts`: jumlah soal, ID unik, kunci jawaban valid, dan semua kompetensi terhubung.
- Periksa manual: katalog `/belajar/pajak/ukp/ukp-a`, mulai modul, jawab benar dan salah, hint, retry, laporan, tampilan mobile, dan muat ulang.

## 6. Laporan akhir

Laporkan secara ringkas:
A. Komponen yang dipakai ulang.
B. Fitur yang benar-benar dibangun.
C. Cakupan kurikulum (A/B/C) dan celahnya, termasuk status PDF.
D. Konten terverifikasi vs perlu verifikasi.
E. Hasil test, tsc, dan build.
F. Pekerjaan tersisa berdasarkan prioritas.

Jangan menyebut fitur selesai bila masih placeholder.
