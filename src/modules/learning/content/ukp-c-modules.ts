import pphPemotongan from "./ukp-c/pph-pemotongan-pemungutan.json";
import { akuntansiPerpajakanSpec } from "./ukp-c-specs/akuntansi-perpajakan";
import { beaMeteraiSpec } from "./ukp-c-specs/bea-meterai";
import { kupSpec } from "./ukp-c-specs/kup-ppsp-pengadilan-pajak";
import { pajakInternasionalSpec } from "./ukp-c-specs/pajak-internasional";
import { pbbP5lSpec } from "./ukp-c-specs/pbb-p5l";
import { pphBadanSpec } from "./ukp-c-specs/pph-badan";
import { pphOrangPribadiSpec } from "./ukp-c-specs/pph-orang-pribadi";
import { ppnSpec } from "./ukp-c-specs/ppn-dan-spt-ppn";
import { buildUkpModule, type UkpModuleSpec } from "./ukp-c-builder";
import type { LearningModule } from "../types";

export const pemotonganSpec: UkpModuleSpec = {
  number: 8,
  slug: "pph-pemotongan-pemungutan",
  title: "PPh Pemotongan/Pemungutan",
  summary: "40 soal latihan UKP Tingkat C: PPh 21, 22, 23, 4(2), dan 26 untuk badan dalam negeri, orang pribadi, dan transaksi internasional.",
  minutes: 90,
  questions: pphPemotongan,
  intro: "# PPh Pemotongan/Pemungutan\n\nMata uji ini mencakup **PPh Pasal 21, 22, 23, 4 ayat (2), dan 26** untuk badan dalam negeri, orang pribadi, serta transaksi internasional.\n\nSetiap bagian dimulai dengan ringkasan ketentuan, lalu soal latihan. Soal hitungan dijawab dengan **mengetik angka**, bukan memilih opsi. Setelah menjawab, pembahasan menjelaskan alasan dan dasar hukumnya.\n\nTarif efektif rata-rata (TER) dan angka ilustratif disebutkan langsung di soal, seperti pada soal ujian.",
  summaries: {
    "DN - Objek PPh 21": {
      title: "Natura dan penerima penghasilan PPh 21",
      markdown: "Berdasarkan **PMK 66/2023**, sebagian natura dikecualikan dari objek PPh: makanan/minuman bagi seluruh pegawai, natura yang wajib untuk pekerjaan (seragam, APD), sarana kerja (laptop, HP), tempat tinggal komunal, bingkisan hari raya keagamaan sampai Rp3.000.000 per pegawai per tahun, dan fasilitas olahraga (kecuali golf, balap perahu bermotor, pacuan kuda, terbang layang, olahraga otomotif). Tempat tinggal individual tetap menjadi objek PPh 21.",
    },
    "DN - PPh 22": {
      title: "PPh Pasal 22: impor dan pembelian pemerintah",
      markdown: "PPh 22 impor dihitung dari **nilai impor** (CIF + bea masuk + pungutan lain). Tarif dasar atas pembelian oleh bendahara pemerintah dihitung dari harga **tidak termasuk PPN**. WP tanpa NPWP dikenai tarif lebih tinggi 100%.",
      table: { title: "Tarif PPh Pasal 22", columns: ["Transaksi", "Tarif"], rows: [["Impor dengan API", "2,5% dari nilai impor"], ["Impor tanpa API", "7,5% dari nilai impor"], ["Pembelian barang oleh bendahara pemerintah", "1,5% dari harga beli tanpa PPN"], ["Penjualan barang sangat mewah oleh badan", "5% dari harga jual tanpa PPN dan PPnBM"], ["WP tanpa NPWP", "Tarif lebih tinggi 100%"]] },
    },
    "DN - PPh 23": {
      title: "PPh Pasal 23: jasa, royalti, sewa, dan bunga",
      markdown: "Pemotong wajib menerbitkan bukti potong, menyetor paling lambat tanggal **15 bulan berikutnya**, dan melaporkan lewat SPT Masa unifikasi. PPh 23 terutang pada akhir bulan pembayaran, disediakan untuk dibayarkan, atau jatuh tempo, mana yang lebih dahulu. Tidak dipotong: penghasilan yang dibayar kepada bank, sewa guna usaha dengan hak opsi, dividen kepada badan DN, dan bagian laba anggota persekutuan.",
      table: { title: "Tarif PPh Pasal 23", columns: ["Objek", "Tarif atas bruto"], rows: [["Royalti", "15%"], ["Jasa (misalnya manajemen, konsultan)", "2%"], ["Sewa harta selain tanah/bangunan", "2%"], ["Penerima tanpa NPWP", "Tarif lebih tinggi 100% (jasa menjadi 4%)"]] },
    },
    "DN - PPh 4(2)": {
      title: "PPh final Pasal 4 ayat (2)",
      markdown: "Jika penyewa bukan pemotong pajak (misalnya orang pribadi), PPh final atas sewa dibayar sendiri oleh pihak yang menyewakan.",
      table: { title: "Tarif PPh final", columns: ["Objek", "Tarif atas bruto"], rows: [["Sewa tanah/bangunan", "10%"], ["Konstruksi: kualifikasi kecil atau perorangan bersertifikat", "1,75%"], ["Pengalihan hak atas tanah/bangunan", "2,5% (1% untuk rumah sederhana/rusun sederhana oleh pengembang; 0% kepada pemerintah)"], ["Hadiah undian", "25%"]] },
    },
    "OP - PPh 21": {
      title: "PPh 21 pegawai, bukan pegawai, dan penghasilan final",
      markdown: "**Pegawai tetap:** Januari–November dihitung dengan TER bulanan × penghasilan bruto. Masa Desember dan masa pajak terakhir dihitung dengan tarif Pasal 17 atas penghasilan neto, setelah biaya jabatan dan iuran. Kelebihan potong dikembalikan.\n\n**Kategori TER:** A untuk TK/0, TK/1, K/0. B untuk TK/2, TK/3, K/1, K/2. C untuk K/3.\n\n**Bukan pegawai:** tarif Pasal 17 × 50% × bruto; peserta kegiatan tanpa 50%. Pegawai tidak tetap dengan upah harian memakai TER harian: 0% sampai Rp450.000 per hari dan 0,5% di atas Rp450.000 sampai Rp2.500.000.\n\n**Final (PP 68/2009):** pesangon dan JHT sekaligus sampai Rp50 juta 0%, di atas itu berlapis mulai 5%.",
    },
    "TI - PPh 26": {
      title: "PPh Pasal 26 dan penerapan P3B",
      markdown: "Tanpa DGT Form yang sah, tarif P3B tidak dapat diterapkan dan berlaku tarif 20%. Syarat penerapan P3B (PER-25/PJ/2018): SKD berupa DGT Form, tidak ada penyalahgunaan P3B, dan penerima adalah pemilik manfaat.",
    },
    "TI - Pengecualian PPh 26": {
      title: "Pengecualian PPh 26 ayat (4)",
      markdown: "Penghasilan kena pajak BUT setelah dikurangi PPh tidak dikenai PPh 26 ayat (4) bila ditanamkan kembali di Indonesia sesuai PMK 14/2011, paling lambat tahun pajak berikutnya dan tidak dialihkan minimal 2 tahun.",
    },
    "TI - Branch profit tax": {
      title: "Branch profit tax BUT",
      markdown: "Dasar branch profit tax adalah penghasilan kena pajak **setelah dikurangi PPh Badan**, dengan tarif 20% atau sesuai P3B.",
    },
    "TI - Pengalihan saham": {
      title: "Pengalihan saham nonbursa oleh WPLN",
      markdown: "PPh 26 = 20% × perkiraan penghasilan neto (25% × harga jual), setara 5% dari harga jual. Dipotong oleh pembeli DN; jika pembeli WPLN, disetor oleh emiten.",
    },
    "TI - Dividen & bunga": {
      title: "Dividen dan bunga kepada WPLN",
      markdown: "Tarif P3B dipakai bila DGT Form sah dan syarat kepemilikan terpenuhi. Bunga obligasi yang diterima WPLN selain BUT dikenai PPh final 10% atau sesuai P3B (PP 91/2021).",
    },
  },
  review: {
    table: { title: "Rangkuman tarif mata uji ini", columns: ["Transaksi", "Dasar pengenaan", "Tarif"], rows: [["PPh 22 impor (API)", "Nilai impor", "2,5%"], ["PPh 22 bendahara pemerintah", "Harga beli tanpa PPN", "1,5%"], ["PPh 23 royalti", "Bruto", "15%"], ["PPh 23 jasa dan sewa harta", "Bruto", "2%"], ["PPh 4(2) sewa tanah/bangunan", "Bruto", "10%"], ["PPh 4(2) pengalihan tanah/bangunan", "Nilai pengalihan", "2,5%"], ["PPh 4(2) hadiah undian", "Bruto", "25%"], ["PPh 26 tanpa P3B", "Bruto", "20%"], ["PPh 26 bunga obligasi WPLN", "Bruto", "10% atau P3B"]] },
    pairs: [["PPh 22 impor oleh importir ber-API", "2,5% dari nilai impor"], ["PPh 23 atas royalti", "15% dari bruto"], ["PPh 23 atas jasa konsultan", "2% dari bruto"], ["PPh final sewa gedung kantor", "10% dari bruto"], ["PPh final hadiah undian", "25% dari bruto"], ["PPh 26 bunga tanpa DGT Form", "20% dari bruto"]],
  },
};

export const ukpCModulesBySlug: Record<string, LearningModule> = {
  "ukp-c-akuntansi-perpajakan": buildUkpModule(akuntansiPerpajakanSpec),
  "ukp-c-bea-meterai": buildUkpModule(beaMeteraiSpec),
  "ukp-c-kup-ppsp-pengadilan-pajak": buildUkpModule(kupSpec),
  "ukp-c-pajak-internasional": buildUkpModule(pajakInternasionalSpec),
  "ukp-c-pbb-p5l": buildUkpModule(pbbP5lSpec),
  "ukp-c-pph-badan": buildUkpModule(pphBadanSpec),
  "ukp-c-pph-orang-pribadi": buildUkpModule(pphOrangPribadiSpec),
  "ukp-c-ppn-dan-spt-ppn": buildUkpModule(ppnSpec),
  "ukp-c-pph-pemotongan-pemungutan": buildUkpModule(pemotonganSpec),
};
