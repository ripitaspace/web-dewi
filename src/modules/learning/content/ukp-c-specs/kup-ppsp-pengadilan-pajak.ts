import data from "../ukp-c/kup-ppsp-pengadilan-pajak.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const kupSpec: UkpModuleSpec = {
  number: 3,
  slug: "kup-ppsp-pengadilan-pajak",
  title: "KUP, PPSP, dan Pengadilan Pajak",
  summary: "40 soal latihan UKP Tingkat C: STP dan SKP, pembetulan dan keberatan, sanksi administratif, penagihan pajak (PPSP), dan banding.",
  minutes: 90,
  questions: data,
  choiceOnly: [36],
  intro: "# KUP, PPSP, dan Pengadilan Pajak\n\nMata uji ini mencakup **STP dan SKP, pembetulan dan keberatan, sanksi administratif, penagihan pajak dengan surat paksa (PPSP), dan banding ke Pengadilan Pajak** untuk badan dalam negeri dan orang pribadi.\n\nBanyak soal menguji **jangka waktu**, **tarif sanksi**, dan **urutan tindakan**. Soal hitungan dijawab dengan mengetik angka. Tarif bunga sanksi (KMK bulanan) disebutkan langsung di soal.",
  summaries: {
    "STP dan SKP": {
      title: "Jenis surat ketetapan dan sanksi dasarnya",
      markdown: "STP diterbitkan antara lain untuk PPh tahun berjalan yang kurang dibayar, salah tulis/hitung, sanksi denda/bunga, dan pelanggaran faktur pajak. **Kurang bayar hasil pemeriksaan → SKPKB; data baru → SKPKBT; kredit lebih besar dari terutang → SKPLB; nihil → SKPN.** Pelunasan STP, SKPKB, dan SKPKBT paling lama **1 bulan** sejak diterbitkan. Bunga SKPKB dihitung sejak berakhirnya tahun pajak sampai SKP terbit, maksimal 24 bulan, bagian bulan dihitung penuh.",
      table: { title: "Sanksi pada ketetapan pajak", columns: ["Ketetapan", "Sanksi"], rows: [["SKPKB karena SPT tidak disampaikan setelah ditegur, atau tidak menyelenggarakan pembukuan", "Kenaikan 75% dari pajak kurang dibayar"], ["SKPKBT (data baru, dalam 5 tahun)", "Kenaikan 100% dari kekurangan pajak"], ["PKP tidak membuat faktur pajak (STP)", "Denda 1% dari DPP"], ["Restitusi: surat ketetapan paling lama", "12 bulan sejak permohonan lengkap"]] },
    },
    "Pembetulan & keberatan": {
      title: "Pembetulan SPT, keberatan, dan banding",
      markdown: "Pembetulan SPT atas kemauan sendiri bisa dilakukan sebelum DJP memeriksa. Pembetulan yang menyatakan rugi atau lebih bayar disampaikan paling lama 2 tahun sebelum daluwarsa penetapan. **Atas STP tidak dapat diajukan keberatan**; upayanya melalui Pasal 36. Pasal 36 ayat (1) huruf b hanya untuk SKP yang tidak diajukan keberatan. Pembatalan hasil pemeriksaan (huruf d) dapat dimohonkan bila pemeriksaan tanpa SPHP atau tanpa pembahasan akhir.",
      table: { title: "Jangka waktu upaya hukum", columns: ["Upaya", "Jangka waktu"], rows: [["Mengajukan keberatan atas SKP", "3 bulan sejak SKP dikirim"], ["Syarat sebelum keberatan", "Lunasi paling sedikit yang disetujui di pembahasan akhir"], ["DJP memutus keberatan", "12 bulan sejak diterima (lewat: dianggap dikabulkan)"], ["Mengajukan banding", "3 bulan sejak keputusan keberatan diterima"]] },
    },
    "Sanksi": {
      title: "Denda, bunga, dan pidana pajak",
      markdown: "Bunga sanksi memakai tarif KMK bulanan, paling lama **24 bulan**, bagian bulan dihitung penuh 1 bulan. Denda keberatan yang ditolak sebagian adalah **30%**, banding **60%**, dihitung dari pajak menurut keputusan dikurangi yang sudah dibayar sebelum keberatan. Denda keberatan tidak dikenakan bila WP mengajukan banding.",
      table: { title: "Denda keterlambatan SPT (Pasal 7)", columns: ["SPT", "Denda"], rows: [["SPT Masa PPN", "Rp500.000"], ["SPT Masa lainnya", "Rp100.000"], ["SPT Tahunan PPh Badan", "Rp1.000.000"], ["SPT Tahunan PPh Orang Pribadi", "Rp100.000"]] },
    },
    "PPSP": {
      title: "Urutan penagihan pajak",
      markdown: "Urutan penagihan: **Surat Teguran → Surat Paksa → SPMP/penyitaan → pengumuman lelang → lelang**. Penyanderaan hanya untuk utang pajak minimal Rp100 juta dengan itikad baik yang diragukan, atas izin Menteri/Gubernur. Hak penagihan daluwarsa 5 tahun sejak penerbitan surat ketetapan.",
      table: { title: "Tenggat penagihan", columns: ["Tahap", "Waktu"], rows: [["Surat Teguran diterbitkan", "7 hari setelah jatuh tempo"], ["Surat Paksa diterbitkan", "21 hari setelah Surat Teguran"], ["Penyitaan (SPMP)", "2 × 24 jam setelah Surat Paksa diberitahukan"], ["Penyanderaan", "Paling lama 6 bulan, dapat diperpanjang 6 bulan"], ["Penagihan seketika dan sekaligus", "Sebelum jatuh tempo, misalnya WP akan meninggalkan Indonesia selamanya"]] },
    },
    "OP - STP dan SKP": {
      title: "STP dan SKP orang pribadi",
      markdown: "Prinsip yang sama berlaku untuk orang pribadi: denda SPT Tahunan OP Rp100.000, bunga angsuran dihitung per bulan penuh, dan pengembalian pendahuluan (SKPPKP) dapat diberikan bagi OP tertentu. Bunga atas utang pajak yang tidak dilunasi pada jatuh tempo mengacu Pasal 19 ayat (1), paling lama 24 bulan.",
    },
  },
  review: {
    table: { title: "Rangkuman KUP, PPSP, dan Pengadilan Pajak", columns: ["Hal", "Ketentuan"], rows: [["Jatuh tempo pelunasan STP/SKP", "1 bulan sejak diterbitkan"], ["Kenaikan SKPKB (SPT tidak disampaikan)", "75%"], ["Kenaikan SKPKBT", "100%"], ["Denda keberatan / banding", "30% / 60%"], ["Keberatan dan banding", "3 bulan dan 3 bulan"], ["Daluwarsa penagihan", "5 tahun"]] },
    pairs: [["Surat Teguran", "7 hari setelah jatuh tempo"], ["Surat Paksa", "21 hari setelah Surat Teguran"], ["Keberatan atas SKP", "3 bulan sejak SKP dikirim"], ["Putusan keberatan oleh DJP", "12 bulan sejak diterima"], ["Denda SPT Masa PPN terlambat", "Rp500.000"], ["Denda SPT Tahunan Badan terlambat", "Rp1.000.000"]],
  },
};
