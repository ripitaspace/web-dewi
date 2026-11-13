import data from "../ukp-c/ppn-dan-spt-ppn.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const ppnSpec: UkpModuleSpec = {
  number: 9,
  slug: "ppn-dan-spt-ppn",
  title: "PPN dan SPT PPN",
  summary: "40 soal latihan UKP Tingkat C: objek PPN, DPP dan tarif 12% (DPP nilai lain), faktur pajak, pengkreditan Pajak Masukan, dan PPN untuk orang pribadi.",
  minutes: 90,
  questions: data,
  intro: "# PPN dan SPT PPN\n\nMata uji ini mencakup **objek PPN, DPP dan tarif, faktur pajak, pengkreditan Pajak Masukan, serta PPN untuk badan dalam negeri dan orang pribadi**.\n\nKetentuan yang dipakai: tarif PPN **12% dengan DPP nilai lain 11/12** untuk barang/jasa non-mewah (PMK 131/2024), dan PPN KMS efektif **2,2%** (PMK 11/2025). Soal hitungan dijawab dengan mengetik angka.",
  summaries: {
    "DN - Objek": {
      title: "Penyerahan yang terutang PPN",
      markdown: "Syarat penyerahan BKP terutang PPN: **BKP, di dalam Daerah Pabean, dalam rangka kegiatan usaha atau pekerjaan**. Status pembeli tidak menjadi syarat. **Pemakaian sendiri dan pemberian cuma-cuma** BKP termasuk penyerahan. Pemanfaatan JKP dari luar Daerah Pabean dipungut dan disetor sendiri oleh pemanfaat. Penyerahan aktiva yang tidak untuk diperjualbelikan terutang PPN hanya bila Pajak Masukannya dapat dikreditkan (Pasal 16D).",
      table: { title: "Bukan BKP dan bukan JKP", columns: ["Kelompok", "Contoh"], rows: [["Bukan BKP", "Makanan/minuman di hotel dan restoran, uang dan emas batangan untuk cadangan devisa, surat berharga"], ["Bukan JKP", "Jasa keagamaan, kesenian dan hiburan, perhotelan, pemerintahan umum, parkir, jasa boga/katering"], ["JKP dibebaskan (Pasal 16B)", "Jasa kesehatan, pendidikan, dan keuangan"]] },
    },
    "DN - DPP & tarif": {
      title: "DPP, tarif 12%, dan DPP nilai lain",
      markdown: "Untuk BKP/JKP **non-mewah**: DPP nilai lain = 11/12 × harga jual, sehingga PPN = 12% × 11/12 × harga jual = 11% dari harga jual. Untuk **barang mewah**: PPN = 12% × harga jual, ditambah PPnBM. Berlaku juga untuk impor. DPP impor = nilai pabean (CIF) + pungutan kepabeanan dan cukai, tidak termasuk PPN, PPnBM, dan PPh 22. Potongan harga di faktur mengurangi harga jual. Ekspor BKP dan JKP tertentu dikenai **tarif 0%** dan Pajak Masukan tetap dikreditkan.",
    },
    "DN - Faktur": {
      title: "Faktur pajak: saat dibuat, isi, dan koreksi",
      markdown: "Faktur pajak dibuat saat **penyerahan, penerimaan pembayaran sebelum penyerahan, atau penerimaan termin**. Penandatanganan kontrak tanpa penyerahan atau pembayaran belum menimbulkan kewajiban. Faktur yang salah dibetulkan dengan **faktur pajak pengganti**; transaksi yang batal dibuktikan dengan **pembatalan faktur pajak**. Faktur yang tidak lengkap tidak dapat dikreditkan dan penjual dikenai denda **1% dari DPP**. Retur mengurangi Pajak Keluaran penjual dan Pajak Masukan pembeli pada masa retur.",
    },
    "DN - Pajak Masukan": {
      title: "Mengkreditkan Pajak Masukan",
      markdown: "PM dikreditkan dengan PK pada **masa pajak yang sama**. Pengkreditan dapat ditunda paling lama **3 masa pajak** berikutnya. PPN yang harus disetor = PK − PM yang dapat dikreditkan. Kelebihan dikompensasikan atau direstitusi pada akhir tahun buku; PKP tertentu (misalnya eksportir) dapat restitusi tiap masa.",
      table: { title: "Pajak Masukan yang tidak dapat dikreditkan", columns: ["Kondisi", "Dasar"], rows: [["Sedan atau station wagon (bukan barang dagangan/disewakan)", "Pasal 9 ayat (8) huruf c"], ["Faktur tidak lengkap, jelas, dan benar", "Pasal 9 ayat (8) huruf f"], ["Penyerahan yang dibebaskan dari PPN (Pasal 16B)", "Pasal 16B ayat (3)"], ["Perolehan sebelum pengukuhan PKP", "Dapat dikreditkan dengan pedoman 80% dari PK"]] },
    },
    "OP - Objek": {
      title: "PPN untuk orang pribadi",
      markdown: "**Pengusaha kecil** dengan peredaran bruto **≤ Rp4,8 miliar** tidak wajib dikukuhkan PKP tetapi dapat memilih. Penjualan barang pribadi oleh non-pengusaha bukan objek PPN. Impor BKP terutang PPN tanpa memandang status PKP. **KMS** (kegiatan membangun sendiri) terutang PPN bila konstruksi utama kayu/beton/batu bata/baja, untuk tempat tinggal atau usaha, luas **minimal 200 m²**. PPN KMS efektif **2,2%** dari biaya (tanpa tanah).",
    },
  },
  review: {
    table: { title: "Rangkuman PPN", columns: ["Hal", "Ketentuan"], rows: [["Tarif umum", "12%"], ["DPP nilai lain (non-mewah)", "11/12 × harga jual (PPN efektif 11%)"], ["Barang mewah", "PPN 12% × harga jual, ditambah PPnBM"], ["Ekspor BKP dan JKP tertentu", "Tarif 0%"], ["Batas pengusaha kecil", "Peredaran bruto ≤ Rp4,8 miliar"], ["PPN KMS", "2,2% dari biaya, luas minimal 200 m²"], ["Pengkreditan PM", "Masa yang sama; paling lama 3 masa berikutnya"]] },
    pairs: [["Penjualan BKP non-mewah Rp100 juta", "PPN Rp11.000.000"], ["Ekspor barang berwujud oleh PKP", "Tarif PPN 0%"], ["Pemakaian sendiri BKP", "Termasuk penyerahan terutang PPN"], ["Sedan direksi", "Pajak Masukan tidak dapat dikreditkan"], ["Faktur salah isi harga jual", "Faktur pajak pengganti"], ["Transaksi dibatalkan setelah faktur dibuat", "Pembatalan faktur pajak"]],
  },
};
