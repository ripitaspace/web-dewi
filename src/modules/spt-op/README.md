# SPT OP Studio — status integrasi

Status: workspace persiapan sudah terintegrasi; **belum selesai sebagai mesin SPT/XML terverifikasi**. Tidak ada pengiriman SPT ke Coretax.

## Acuan dan audit

- Sumber visual: `RIPITAX_SPT_OP_Studio_2025 (1).html` yang diberikan pengguna. `scripts/extract-spt-op.cjs` mengekstrak 17 SVG lokal dan katalog deklaratif; tidak menjalankan aplikasi HTML, tidak memakai iframe, CDN, atau menempelkan HTML ke React.
- Inventaris lengkap field, opsi, tabel, koordinat dan akun rekonsiliasi ada di `prototype.json`: 26 tabel, 3 kelompok pembukuan, navigasi 17 halaman, serta profil/pertanyaan/penyesuaian. Daftar ini merekam prototype; bukan penetapan field/kode resmi.
- Perilaku prototype yang diperbaiki: satu key localStorage diganti IndexedDB per draft; impor tidak melewati baris gagal diam-diam; tabel panjang memiliki lembar lanjutan; manual input tidak otomatis dijumlahkan dengan rincian; hasil buku nol tidak dianggap kosong; kredit luar negeri ganda diberi peringatan.
- Perbedaan penting: panduan XML DJP v20260310 menggunakan kode promosi berkapitalisasi seperti `Advertising` dan `Benefit`, berbeda dari prototype. Field piutang tak tertagih di panduan juga berbeda; adapter itu belum boleh mengekspor.

## Arsitektur

- `model.ts`: skema v2, reducer, ID baris, asal data, backup/migrasi v1, nilai manual sebagai override beralasan.
- `storage.ts` + `use-drafts.ts`: IndexedDB, autosave, antrean simpan, pemeriksaan revisi atomik, pencegahan identitas/periode ganda, penanganan gagal simpan dan salinan penyelamatan.
- `engine.ts`: aritmetika rekap input, rekonsiliasi dasar, status dan validasi. Hasil membawa versi/sumber/status verifikasi. Tidak mengeluarkan PPh final ketika ruleset belum disahkan.
- `rules-2025.ts`: registry sumber dan fungsi tarif progresif terpisah yang diuji dengan empat contoh DJP. Lulus fungsi tarif tidak berarti seluruh SPT tervalidasi.
- `import-export.ts`: xlsx lokal, pemilihan sheet/header/pemetaan, tanggal Excel 1900/1904, leading zero, kandidat duplikat, CSV dan JSON.
- `form-layout.ts` + `document.tsx`: koordinat native SVG dan pembagian baris lanjutan, overlay React serta rincian cetak lengkap.
- `xml.ts`: daftar adapter dan alasan blokir per format. Tag dan skema belum ditebak; belum ada serializer yang dinyatakan siap Coretax.
- Komponen UI dipisah menjadi chrome/topbar/navigasi, workspace, editor, field, dialog, impor, pratinjau, serta pengelolaan draft.

## Yang dapat dipakai

1. Buka `/karya/tools/spt-op`. Hero dan navigasi PuspitaCore tampil di atas workspace navy–kuning; topbar studio memakai logo PuspitaCore dengan palet studio.
2. Isi identitas/tahun/pembetulan. Tambah, edit, duplikasi, cari, dan hapus baris melalui editor. Harta bisa difilter aktif/dilepas; salinan tahun sebelumnya meminta peninjauan nilai.
3. Gunakan Draft untuk membuat/membuka draft lain. Kegagalan simpan tidak menutup draft. Konflik tab tidak menimpa perubahan tab lain; pilih muat terbaru atau salinan penyelamatan.
4. Import menerima XLSX, CSV/TSV, dan backup JSON. Pilih worksheet, header, tujuan dan pemetaan; hanya baris valid yang dipilih masuk. Kandidat duplikat tidak dipilih otomatis. Kesalahan diperbaiki di sumber atau pemetaan lalu dipratinjau lagi.
5. Backup v2 mempertahankan ID baris, asal data, catatan, penandaan harta dan override. Backup v1 memigrasikan data, catatan dan pembayaran bulanan. Key HTML lama tidak dihapus. Draft dari `file://` harus dipindahkan lewat backup JSON.
6. Preview memilih halaman aktif/semua/subset, menyertakan lembar lanjutan dan rincian seluruh data. CSS cetak menggunakan **F4 210 × 330 mm**, lanskap **330 × 210 mm**; gambar sumber diperkecil proporsional dari 612 × 936 / 936 × 612 unit. Header, hero, footer, navigasi dan tombol tidak ikut dicetak.

## Batas yang belum diselesaikan

- Status kewajiban `Wajib`/`Selesai` yang ditetapkan aturan resmi belum diaktifkan. `Berlaku`/`Tidak Berlaku` mengikuti jawaban pengguna; status pemeriksaan terpisah dan data tetap disimpan.
- Pemetaan overlay mengikuti bagian yang tersedia di prototype. Seluruh checkbox Induk A–K, rincian rekonsiliasi L3A dan hasil L4 belum semuanya dipetakan ke posisi resmi; datanya tetap dapat diedit dan tersedia pada rincian cetak. Jangan menyebutnya formulir resmi yang terisi lengkap.
- PTKP/PKP/PPh final, PH/MT, kelayakan UMKM/NPPN, PPh 24, angsuran, kompensasi rugi dan pembetulan menunggu ruleset serta contoh tahunan resmi. Tahun selain 2025 dapat disimpan; tidak mendapat hasil pajak final.
- Seluruh format XML masih diblokir. Diperlukan template/converter serta sample VALID XML untuk masing-masing kelompok harta L1A, L3C dan L3D.
- Format print F4 sudah diatur, tetapi kesesuaian milimeter dengan PDF resmi dan hasil PDF/printer lintas browser belum disahkan. In-app browser membuka jalur print dengan timeout pada otomasi; hasil print fisik/PDF tidak dinyatakan lulus.
- Navigasi bertingkat Induk → A–K → field, minimize panel, dan pencarian navigasi merupakan permintaan lanjutan dengan rico-plan; belum diterapkan dalam snapshot ini.

## Bukti pengujian 4 November 2026

- Tes modul: 33 lulus, 4 `todo` yang eksplisit untuk referensi pajak tahunan dan XML resmi.
- TypeScript dan ESLint pada file yang berubah lulus. Production build berhasil dan mencantumkan rute statis `/karya/tools/spt-op`.
- Uji UI dengan data dummy: semua 17 halaman dapat dibuka; input penghasilan menghasilkan neto pada editor/formulir; Save + reload mempertahankan data.
- Impor CSV berisi satu duplikat, satu valid dan satu rusak: hanya satu baris valid dipilih; identitas dengan nol di depan tetap utuh.
- Download backup dan restore kembali berhasil dengan konfirmasi. Dua tab yang mengubah draft sama menghasilkan pesan konflik pada tab lama tanpa menimpa draft terbaru.
- Enam baris pada kapasitas lima menghasilkan dua lembar formulir; keenam baris muncul dalam rincian; tidak ada tombol pada formulir pratinjau cetak.
- Desktop sekitar 1440 CSS px dan navigasi ringkas sekitar 727 CSS px diperiksa. Pengujian telepon 390 px belum tuntas karena batas viewport/zoom in-app browser.
- Tes memakai draft bertanda DUMMY; tidak memasukkan identitas nyata. Draft dummy dibiarkan sebagai bukti uji, bukan data bawaan aplikasi.

## Referensi untuk melanjutkan

- [DJP — ilustrasi tarif progresif dan TK/0](https://www.pajak.go.id/index.php/id/siaran-pers/gaji-rp5-juta-kini-kena-pajak): empat expected result fungsi tarif, bukan pengesahan seluruh SPT.
- [DJP — Panduan XML versi 20260310](https://pajak.go.id/sites/default/files/2026-03/Tata%20Cara%20Pembuatan%20XML%20SPT%20OP%20v20260310.pdf): kelompok lampiran dan petunjuk converter/unggah manual/XML Monitoring.
- Belum dilampirkan: Formulir SPT OP 2025 PDF, Panduan Coretax Form V25022026, materi SPT OP Karyawan, worksheet Pak Eko, contoh SPT dilaporkan, ZIP harta/penyusutan, template L3D dan sample VALID XML.

Semua perubahan pada turn ini terpisah dari payroll; tidak ada amend commit atau push.
