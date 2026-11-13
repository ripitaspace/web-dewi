import data from "../ukp-c/bea-meterai.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const beaMeteraiSpec: UkpModuleSpec = {
  number: 2,
  slug: "bea-meterai",
  title: "Bea Meterai",
  summary: "40 soal latihan UKP Tingkat C: objek, tarif, saat terutang, pihak yang terutang, dan pengecualian Bea Meterai menurut UU 10/2020.",
  minutes: 60,
  questions: data,
  choiceOnly: [3],
  intro: "# Bea Meterai\n\nMata uji ini mencakup **objek, tarif, saat terutang, pihak yang terutang, dan pengecualian** Bea Meterai berdasarkan **UU 10/2020**.\n\nBanyak soal menguji ketelitian pada batas nilai, saat terutang, dan siapa yang menanggung. Baca ringkasan tiap bagian sebelum menjawab, lalu cocokkan dengan pembahasan.",
  summaries: {
    "Objek": {
      title: "Dokumen yang menjadi objek Bea Meterai",
      markdown: "Bea Meterai dikenakan atas (a) dokumen yang dibuat sebagai alat untuk menerangkan kejadian **bersifat perdata** dan (b) dokumen yang **digunakan sebagai alat bukti di pengadilan**. Dokumen mencakup bentuk **kertas maupun elektronik**. Dikenakan **satu kali untuk setiap dokumen**; surat perjanjian beserta rangkapnya masing-masing dihitung sebagai dokumen. Dokumen luar negeri terutang saat digunakan di Indonesia.",
      table: { title: "Objek Bea Meterai (Pasal 3 ayat 2)", columns: ["Dokumen", "Keterangan"], rows: [["Surat perjanjian, keterangan, pernyataan, dan sejenisnya", "Terutang tanpa batasan nilai"], ["Akta notaris dan akta PPAT", "Beserta grosse, salinan, dan kutipan"], ["Dokumen lelang", "Kutipan, minuta, salinan, grosse risalah lelang"], ["Surat berharga (termasuk cek dan bilyet giro)", "Tarif tetap Rp10.000"], ["Dokumen transaksi surat berharga dan kontrak berjangka", "Dalam bentuk apa pun"], ["Dokumen yang menyatakan jumlah uang", "Nilai lebih dari Rp5.000.000"]] },
    },
    "Tarif": {
      title: "Tarif tetap dan sanksi pemeteraian kemudian",
      markdown: "Tarif Bea Meterai adalah **tarif tetap Rp10.000** per dokumen (Pasal 5), tidak dipengaruhi nilai transaksi. Perubahan batas nilai dan tarif dilakukan dengan **Peraturan Pemerintah** setelah dikonsultasikan dengan DPR. Bea Meterai yang tidak atau kurang dibayar dilunasi melalui **pemeteraian kemudian** dengan sanksi administratif **100%** dari Bea Meterai yang kurang dibayar.",
    },
    "Saat terutang": {
      title: "Kapan Bea Meterai terutang",
      markdown: "Hak negara atas Bea Meterai **kedaluwarsa 5 tahun** sejak saat terutang.",
      table: { title: "Saat terutang (Pasal 8)", columns: ["Dokumen", "Saat terutang"], rows: [["Surat perjanjian, akta notaris, akta PPAT", "Dokumen dibubuhi tanda tangan"], ["Surat berharga dan dokumen transaksinya", "Dokumen selesai dibuat"], ["Surat keterangan/pernyataan, dokumen lelang, dokumen jumlah uang", "Dokumen diserahkan kepada pihak untuk siapa dokumen dibuat"], ["Dokumen alat bukti di pengadilan", "Dokumen diajukan ke pengadilan"], ["Dokumen luar negeri", "Dokumen digunakan di Indonesia"]] },
    },
    "Pihak terutang": {
      title: "Siapa yang menanggung Bea Meterai",
      markdown: "Pihak yang terutang dapat **ditentukan lain berdasarkan kesepakatan** para pihak. Bea Meterai dibayar dengan meterai tempel, meterai elektronik, meterai dalam bentuk lain, atau surat setoran pajak.",
      table: { title: "Pihak yang terutang (Pasal 9)", columns: ["Jenis dokumen", "Pihak terutang"], rows: [["Dibuat sepihak (misalnya kuitansi)", "Pihak yang menerima dokumen"], ["Dibuat dua pihak atau lebih", "Masing-masing pihak atas dokumen yang diterimanya"], ["Surat berharga", "Pihak yang menerbitkan"], ["Alat bukti di pengadilan", "Pihak yang mengajukan dokumen"], ["Dibuat di luar negeri, digunakan di Indonesia", "Pihak yang menerima manfaat"]] },
    },
    "Pengecualian": {
      title: "Dokumen yang dikecualikan dan fasilitas pembebasan",
      markdown: "Dokumen yang **tidak dikenai** Bea Meterai (Pasal 7): dokumen lalu lintas orang dan barang (misalnya konosemen), ijazah, tanda terima pembayaran gaji dan pembayaran lain terkait hubungan kerja, bukti penerimaan uang negara dan kuitansi pajak, tanda penerimaan uang untuk keperluan intern organisasi, dokumen simpanan oleh bank dan sejenisnya, surat gadai, serta tanda pembagian keuntungan, bunga, atau imbal hasil surat berharga.\n\n**Fasilitas pembebasan** (Pasal 22) dapat diberikan untuk penanganan bencana alam, kegiatan keagamaan/sosial nonkomersial, program pemerintah/kebijakan moneter/sektor keuangan, dan pelaksanaan perjanjian internasional.",
    },
  },
  review: {
    table: { title: "Rangkuman Bea Meterai", columns: ["Hal", "Ketentuan"], rows: [["Tarif", "Tetap Rp10.000 per dokumen"], ["Batas dokumen jumlah uang", "Lebih dari Rp5.000.000"], ["Sanksi pemeteraian kemudian", "100% dari Bea Meterai yang kurang dibayar"], ["Kedaluwarsa", "5 tahun sejak saat terutang"], ["Perjanjian 2 rangkap", "2 × Rp10.000"], ["Dasar hukum utama", "UU 10/2020"]] },
    pairs: [["Surat perjanjian beserta rangkapnya", "Terutang saat tanda tangan"], ["Surat berharga", "Terutang saat dokumen selesai dibuat"], ["Dokumen alat bukti di pengadilan", "Terutang saat diajukan ke pengadilan"], ["Kuitansi dibuat sepihak", "Terutang oleh penerima dokumen"], ["Konosemen", "Dikecualikan dari Bea Meterai"], ["Ijazah", "Dikecualikan dari Bea Meterai"]],
  },
};
