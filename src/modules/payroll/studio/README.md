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

## Verifikasi implementasi (3 November 2026)

- 19 tes modul lulus; 112 skenario perhitungan dibandingkan langsung dengan HTML sumber dan hasilnya sama.
- Kelima adapter XML cocok dengan nama root dan urutan elemen contoh resmi DJP dari halaman [template XML Coretax](https://www.pajak.go.id/reformdjp/coretax/template-xml-dan-converter-excel-ke-xml). Ini bukan bukti penerimaan impor langsung di Coretax.
- TypeScript, lint berkas yang diubah, dan build produksi lulus.
- Uji browser: layout mobile 390px tanpa overflow halaman, navigasi tab, Escape/fokus panel, tambah penerima/penghasilan dengan pembaruan ringkasan, perhitungan contoh, pemblokiran XML identitas tidak lengkap, backup/reload/restore, CSV (13 duplikat dilewati), dan pratinjau slip. Halaman Bea Cukai juga tetap tampil.
- Tombol cetak membuka dialog sistem. Layout cetak memakai portal khusus, CSS A4, dan menyembunyikan elemen website lain; inspeksi visual dialog cetak sistem belum dapat dilakukan pada browser pengujian.
- Perintah tes seluruh proyek menjalankan 104 tes yang lulus, tetapi gagal pada skrip lama `tests/invoice-retur-parser.test.cjs` karena bukan suite Vitest. Skrip tersebut lulus lewat `npm run test:invoice-retur`.
- Lint seluruh proyek masih memiliki error yang sudah ada di luar modul ini.

Jalankan regresi modul dengan `npx vitest run src/modules/payroll/studio/studio.test.ts`.
