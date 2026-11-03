# Payroll & PPh 21 Studio v2

Implementasi React dari `RIPITAX_PPh21_Studio_v2_Offline.html`, pada
`/karya/tools/pph-21-calculator`. UI mengikuti token tema PuspitaCore.

## Data dan batas penggunaan

- Format backup: `ripitax-pph21-local-v2`. Data hanya hidup dalam sesi halaman dan tidak disimpan di browser.
- Kunci penyimpanan lama `ripitax-payroll-v1` dihapus saat Studio dibuka. Tidak ada migrasi v1.
- Satu workspace berisi satu tahun; perubahan tahun memberi label tahun baru kepada seluruh data. UI meminta konfirmasi.
- Perhitungan dan dokumen dibuat di browser. Halaman memerlukan koneksi untuk dimuat pertama kali.
- Restore memvalidasi struktur, tipe, identitas unik, dan hubungan penerima/penghasilan sebelum mengganti data.
- Gross-up otomatis, fasilitas khusus, kondisi disetahunkan, dan riwayat tahunan yang belum lengkap tetap ditahan untuk review sesuai modul sumber.

## Susunan

- `catalog.js`: tarif, komponen, kategori dan metadata dokumen dari sumber HTML.
- `engine.js`: perhitungan dan pembentukan XML tanpa DOM.
- `data.ts`: default, penyimpanan schema, validasi backup dan salin gaji.
- `csv.ts`, `zip.js`: impor/ekspor lokal.
- `official-xml-shapes.json`: root, list, item dan urutan elemen dari lima contoh XML DJP; URL sumber tercatat dalam berkas.
- `studio.test.ts`: regresi perhitungan, batas TER, XML, backup, CSV dan ZIP.

## Verifikasi implementasi awal (3 November 2026)

- 19 tes modul lulus; 112 skenario perhitungan dibandingkan langsung dengan HTML sumber dan hasilnya sama.
- Kelima adapter XML cocok dengan nama root dan urutan elemen contoh resmi DJP dari halaman [template XML Coretax](https://www.pajak.go.id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml). Ini bukan bukti penerimaan impor langsung di Coretax.
- TypeScript, lint berkas yang diubah, dan build produksi lulus.
- Uji browser: layout mobile 390px tanpa overflow halaman, navigasi tab, Escape/fokus panel, tambah penerima/penghasilan dengan pembaruan ringkasan, perhitungan contoh, pemblokiran XML identitas tidak lengkap, backup/reload/restore, CSV (13 duplikat dilewati), dan pratinjau slip. Halaman Bea Cukai juga tetap tampil.
- Tombol cetak membuka dialog sistem. Layout cetak memakai portal khusus, CSS A4, dan menyembunyikan elemen website lain; inspeksi visual dialog cetak sistem belum dapat dilakukan pada browser pengujian.
- Perintah tes seluruh proyek menjalankan 104 tes yang lulus, tetapi gagal pada skrip lama `tests/invoice-retur-parser.test.cjs` karena bukan suite Vitest. Skrip tersebut lulus lewat `npm run test:invoice-retur`.
- Lint seluruh proyek masih memiliki error yang sudah ada di luar modul ini.

Jalankan regresi modul dengan `npx vitest run src/modules/payroll/studio/studio.test.ts`.


## Redesign Step 04 (3 November 2026)

Step 04 sekarang menjadi workspace daftar penerima dan preview dokumen. Filter dan
checkbox hanya mengatur daftar serta bulk pilihan; rekap dan XML selalu mencakup
seluruh periode aktif. Penerima aktif, pilihan tersembunyi, dan posisi daftar tetap
tersimpan saat berpindah tab atau validasi ulang. Mengganti dataset mengatur ulang
sesi dokumen. Rumus pajak, format backup, dan API engine tidak diubah.

### Berkas implementasi

- `documents.ts`: snapshot data periode, validasi pembayaran terpisah dari XML,
  nama berkas unik, pemilihan XML valid/draft, dan rekap Excel.
- `pdf.ts`: PDF slip satu penerima dan rekap A4 landscape dengan kelompok kolom.
- `zip.js`: ZIP lokal menerima teks XML maupun byte PDF tanpa konversi teks.
- `documents.test.ts`: regresi snapshot, cakupan, validasi, PDF, Excel, dan ZIP.
- `src/components/tools/pph21-document-workspace.tsx` dan CSS module: daftar,
  preview, menu unduh, progress bulk, laporan kegagalan, dan perbaikan XML.
- `src/components/tools/payroll-pdf-preview.tsx`: pdfjs menampilkan byte PDF yang
  sama dengan unduhan. Cetak merender halaman PDF ke iframe khusus tanpa UI situs.
- Komponen studio utama, bagian slip lama, dan CSS studio disederhanakan untuk
  mengganti drawer slip serta layout XML lama.

### Aturan ekspor

- Slip final memerlukan pembayaran/perhitungan yang layak. Kekurangan identitas
  atau pemetaan khusus XML tidak otomatis memblokir slip internal.
- XML valid hanya berisi tipe yang seluruh dokumennya lolos validasi lokal.
  Tipe kosong tidak dibuat. Draft perlu konfirmasi yang menampilkan masalah,
  memakai akhiran `_DRAFT.xml`, dan hanya masuk ZIP `_TERMASUK_DRAFT.zip`.
- Struktur field dibandingkan dengan fixture resmi DJP; XML yang tidak dapat
  diparse diblokir bahkan sebagai draft. Validasi lokal bukan jaminan penerimaan
  impor Coretax. Halaman referensi resmi masih memuat tautan kelima template;
  unduhan ulang arsip DJP pada audit ini terputus, sehingga isi arsip terbaru
  tidak dibandingkan ulang dengan fixture yang tersimpan.
- Bulk menghasilkan satu PDF per penerima, urut ID, dengan nama aman dan unik.
  Kegagalan sebagian dilaporkan; seluruh kegagalan tidak membuat ZIP kosong.
- Semua ekspor memakai salinan data saat aksi dimulai. Resource sementara
  dibersihkan setelah unduh/cetak atau saat workspace dilepas.

### Verifikasi terbaru

- `vitest run src`: **114/114 tes**, termasuk **33/33 tes payroll** (21 existing +
  12 regresi dokumen), lulus. Skrip `npm run test:invoice-retur` juga lulus.
- Lint berkas baru/pendukung, TypeScript, dan build produksi lulus. Komponen studio
  utama masih memiliki warning existing `no-img-element` untuk logo lokal.
- Uji browser: contoh 10 penerima, pencarian/filter, pilihan tersembunyi, validasi
  ulang, perpindahan tab, preview dan unduhan individual/rekap, XML valid/draft,
  ZIP campuran, serta bulk dua penerima dan kegagalan sebagian.
- XML demo tetap BPMP 3, BP21 6, BP26 1, BPA1 0, BPA2 0; masalah mantan pegawai
  Bagas dipertahankan. Fixture valid terpisah menguji tiga XML yang semuanya lolos.
- UI desktop dan viewport iframe 390px/768px diperiksa; tidak ada overflow
  horizontal halaman. Panel mobile, navigasi tab keyboard, dan Escape menu lulus.
- PDF slip dan seluruh kelompok rekap dirender untuk inspeksi visual. Tes membaca
  PDF seluruh 10 penerima, memeriksa pemisahan identitas dan angka, potongan,
  natura, rekonsiliasi negatif, teks panjang, CRC ZIP, serta total Excel.

### Batas yang masih berlaku

- Font PDF standar Helvetica mendukung karakter Latin/WinAnsi. Karakter di luar
  cakupan font (misalnya aksara CJK) menghasilkan pesan gagal yang jelas;
  penerima lain tetap dapat masuk ZIP parsial. Dukungan font Unicode belum ada.
- Pemanggilan cetak telah diuji hingga permintaan dialog browser. Dialog sistem
  dan hasil printer fisik belum dapat diinspeksi dalam lingkungan QA ini.
- Tidak ada impor langsung ke Coretax atau deployment dari pekerjaan ini.

Jalankan seluruh regresi payroll dengan `npx vitest run src/modules/payroll/studio`.
