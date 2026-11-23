# Workbook Konfirmasi Universal

Simpan satu workbook per klien dengan nama `KODE_KLIEN.xlsx`, misalnya `K000013.xlsx`. Upload workbook tersebut ke folder `01 MASTER` di Google Drive privat.

## 1. Isi pengaturan

Di sheet `PENGATURAN`, isi satu baris untuk identitas klien, email notifikasi, nomor WhatsApp opsional, dan pilihan `YA` atau `TIDAK` untuk notifikasi. `folder_jawaban_id` boleh kosong agar sistem membuat folder jawaban menurut kode klien.

## 2. Isi permintaan konfirmasi

Gunakan sheet sesuai jenisnya: `PIUTANG`, `UTANG`, `BANK`, atau `LAINNYA`. Satu baris adalah satu penerima. Jangan mengubah nama kolom umum. Isi `status_akses` dengan `AKTIF` dan gunakan tanggal Excel atau format `YYYY-MM-DD`.

Sheet `LAINNYA` menyediakan tiga pasangan label dan nilai untuk kebutuhan khusus. Sheet `BANK` menyediakan bank, cabang, nomor rekening, dan jenis rekening.

## 3. Buat token dan tautan

Setelah data selesai, jalankan dari folder `web-dewi`:

```bash
node scripts/generate-confirmation-links.mjs --file /path/K000013.xlsx --base-url https://domain-anda
```

Skrip membuat token acak 256-bit, mengisi kode kosong, menampilkan tautan unik, lalu memperbarui workbook. Kirim tautan tersebut hanya kepada penerima yang tepat.

## 4. Google Drive dan environment

Bagikan folder `KONFIRMASI` kepada email service account sebagai Editor. Folder itu harus memiliki `01 MASTER` untuk workbook dan `02 JAWABAN` untuk respons. Atur `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, dan opsional `CONFIRMATION_DRIVE_ROOT_FOLDER_ID` pada server.

Untuk membuat dua subfolder tersebut sekali tanpa halaman admin, panggil `POST /api/confirmation/initialize` dengan header `Authorization: Bearer <CRON_SECRET>` setelah environment diatur.

Untuk email, atur `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, dan opsional `SMTP_SECURE=true`. WhatsApp disimpan sebagai konfigurasi masa depan dan tidak menghambat penerimaan jawaban.
