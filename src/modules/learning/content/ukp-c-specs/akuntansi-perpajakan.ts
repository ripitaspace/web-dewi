import data from "../ukp-c/akuntansi-perpajakan.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const akuntansiPerpajakanSpec: UkpModuleSpec = {
  number: 1,
  slug: "akuntansi-perpajakan",
  title: "Akuntansi Perpajakan",
  summary: "40 soal latihan UKP Tingkat C: jurnal PPh, aspek pajak akun neraca, koreksi fiskal, pajak tangguhan, dan rekonsiliasi fiskal.",
  minutes: 90,
  questions: data,
  intro: "# Akuntansi Perpajakan\n\nMata uji ini mencakup **jurnal PPh pemotongan/pemungutan, aspek pajak akun neraca, organisasi nirlaba, pendapatan dan biaya, rekonsiliasi fiskal, lembaga keuangan, jasa konstruksi, merger dan likuidasi, serta hubungan laporan keuangan fiskal dengan komersial**.\n\nSoal hitungan dijawab dengan **mengetik angka**. Setelah menjawab, pembahasan menjelaskan alasan dan dasar hukumnya. Angka pada soal bersifat ilustratif.",
  summaries: {
    "Jurnal PPh Pot/Put": {
      title: "Mencatat PPh yang dipotong, dibayar, dan ditanggung",
      markdown: "Posisi pajak menentukan akunnya. **PPh yang dipotong pemberi kerja/pembayar** dicatat sebagai **utang pajak** sampai disetor. **PPh yang dipotong pihak lain atas penghasilan kita** (PPh 22, 23, 25) adalah **kredit pajak**, dicatat sebagai pajak dibayar di muka. Pendapatan tetap diakui bruto. PPh yang **ditanggung** pemberi kerja bukan tunjangan PPh menjadi koreksi positif (beda tetap). Pajak yang dibayar di luar negeri dapat dikreditkan sebagai PPh 24 dalam batas maksimum kredit.",
    },
    "Aspek pajak akun neraca": {
      title: "Perlakuan fiskal akun piutang, persediaan, dan aset",
      markdown: "Cadangan (CKPN, penurunan nilai persediaan, imbalan kerja) pada umumnya **tidak boleh dibebankan** sampai realisasi, sehingga menjadi koreksi positif dan beda temporer (aset pajak tangguhan). Persediaan dinilai dengan **rata-rata atau FIFO**. Goodwill diamortisasi (Pasal 11A). Dividen adalah pembagian laba yang tidak boleh dikurangkan, dan setoran modal serta agio bukan objek PPh.",
      table: { title: "Beda tetap dan beda temporer", columns: ["Pos", "Perlakuan fiskal", "Jenis beda"], rows: [["PPh 21 ditanggung (bukan tunjangan)", "Tidak boleh dibebankan", "Tetap"], ["CKPN piutang (non-bank)", "Hanya penghapusan riil yang memenuhi syarat", "Temporer"], ["Penurunan nilai persediaan", "Persediaan diakui sebesar harga perolehan", "Temporer"], ["Penyusutan komersial melebihi fiskal", "Mengikuti kelompok harta Pasal 11", "Temporer"], ["Sanksi administrasi perpajakan", "Tidak boleh dibebankan", "Tetap"]] },
    },
    "Organisasi nirlaba": {
      title: "Entitas nirlaba",
      markdown: "Sisa lebih lembaga pendidikan dan/atau litbang yang ditanamkan kembali dalam jangka waktu paling lama **4 tahun** dikecualikan dari objek PPh (PMK 68/2020). Pelaporan keuangan nonlaba mengikuti **ISAK 35**, yang menggantikan PSAK 45 sejak 2020.",
    },
    "Pendapatan & biaya": {
      title: "Penghasilan final, entertainment, natura, dan selisih kurs",
      markdown: "Penghasilan yang telah dikenai PPh final dikeluarkan dari PKP (**koreksi negatif**), dan biaya untuk memperolehnya tidak boleh dikurangkan (**koreksi positif**). Entertainment boleh dibebankan bila ada **daftar nominatif**. Natura boleh dibiayakan pemberi kerja sejak UU HPP dan menjadi penghasilan penerima. Selisih kurs diakui mengikuti standar akuntansi yang diterapkan secara taat asas.",
    },
    "Rekonsiliasi fiskal": {
      title: "Dari laba komersial ke PKP, PPh 29, dan beban pajak",
      markdown: "Urutan penghitungan: laba komersial + koreksi positif − koreksi negatif = **PKP**. PPh terutang dikurangi kredit pajak (PPh 22, 23, 25) menghasilkan **PPh 29**. Beban pajak total = beban pajak kini ± pajak tangguhan. Peredaran bruto di atas Rp50 miliar tidak berhak fasilitas Pasal 31E.",
      table: { title: "Jurnal pajak tangguhan", columns: ["Jenis beda temporer", "Akibat", "Akun"], rows: [["Dapat dikurangkan", "Aset pajak tangguhan", "Aset Pajak Tangguhan / Manfaat Pajak Tangguhan"], ["Kena pajak", "Liabilitas pajak tangguhan", "Beban Pajak Tangguhan / Liabilitas Pajak Tangguhan"]] },
    },
    "Lembaga keuangan": {
      title: "Bank dan perusahaan pembiayaan",
      markdown: "Bank boleh membentuk cadangan kerugian penurunan nilai sepanjang sesuai ketentuan PMK. Pada **finance lease**, lessor tidak menyusutkan barang modal dan penghasilannya adalah **bagian imbalan jasa/bunga**.",
    },
    "Jasa konstruksi": {
      title: "PPh final jasa konstruksi",
      markdown: "PPh final jasa konstruksi (PP 9/2022) terutang atas **pembayaran yang diterima**, bukan atas pendapatan menurut persentase penyelesaian. Karena final, penghasilannya dikoreksi negatif dan biaya terkait dikoreksi positif.",
      table: { title: "Tarif PPh final jasa konstruksi (PP 9/2022)", columns: ["Jenis pekerjaan", "Tarif"], rows: [["Pelaksana kualifikasi kecil atau perorangan bersertifikat", "1,75%"], ["Pelaksana kualifikasi menengah/besar bersertifikat", "2,65%"], ["Pelaksana tanpa sertifikat", "4%"], ["Konsultansi bersertifikat", "3,5%"], ["Konsultansi tanpa sertifikat", "6%"]] },
    },
    "Merger & likuidasi": {
      title: "Penggabungan usaha, likuidasi, dan konsolidasi",
      markdown: "Penggabungan dengan nilai buku (PMK 56/2021) mensyaratkan **business purpose test**, dan kerugian fiskal tidak dapat dikompensasikan penerima penggabungan. Sisa hasil likuidasi di atas modal disetor adalah dividen, yang bagi OP DN dikenai PPh final 10% bila tidak diinvestasikan kembali. Tidak ada konsolidasi fiskal: setiap badan melapor sendiri.",
    },
    "LK fiskal vs komersial": {
      title: "Laporan keuangan fiskal dan komersial",
      markdown: "Tidak diperlukan pembukuan ganda. Laporan fiskal disusun dari laporan komersial melalui **koreksi fiskal** (lampiran rekonsiliasi dalam SPT), dengan prinsip taat asas.",
    },
  },
  review: {
    table: { title: "Rangkuman perlakuan fiskal", columns: ["Transaksi", "Perlakuan"], rows: [["PPh 21 yang dipotong dari gaji", "Utang pajak bagi pemberi kerja"], ["PPh 23 yang dipotong atas penghasilan kita", "Pajak dibayar di muka (kredit pajak)"], ["PPh 22 impor ber-API", "2,5% dari nilai impor, aset (bukan harga perolehan)"], ["PPh 21 ditanggung bukan tunjangan", "Koreksi positif, beda tetap"], ["Sanksi administrasi perpajakan", "Koreksi positif, beda tetap"], ["Penghasilan kena PPh final", "Koreksi negatif; biaya terkait koreksi positif"], ["Dividen", "Tidak boleh dikurangkan oleh pembagi"], ["Bangunan permanen", "20 tahun, 5% garis lurus"]] },
    pairs: [["Sanksi bunga STP", "Beda tetap"], ["Penyusutan komersial lebih besar dari fiskal", "Beda temporer, aset pajak tangguhan"], ["Biaya entertainment tanpa daftar nominatif", "Koreksi positif seluruhnya"], ["Bunga deposito yang dipotong PPh final", "Koreksi negatif"], ["Cadangan imbalan kerja", "Dikoreksi positif, dibebankan saat dibayar"], ["Konsolidasi grup", "Tidak dikenal secara fiskal"]],
  },
};
