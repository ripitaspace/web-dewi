"use client";

import { ChangeEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./makalah-generator.module.css";
import { paginatePaper, type PaperPage } from "./makalah-pagination";

type View = "import" | "editor" | "preview" | "xml";
type HeadingLevel = 1 | 2 | 3 | 4 | 5;
type Block =
  | { type: "heading"; level: HeadingLevel; text: string; breakBefore?: boolean }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; caption: string; rows: string[][] }
  | { type: "bibliography"; entries: string[] }
  | { type: "pagebreak" };

type Author = { id: string; name: string };

type DocumentState = {
  title: string;
  subtitle: string;
  course: string;
  lecturer: string;
  institution: string;
  program: string;
  city: string;
  year: string;
  purpose: string;
  authors: Author[];
  logoSrc: string;
  showToc: boolean;
  showPageNumbers: boolean;
  fontSize: string;
  lineHeight: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  blocks: Block[];
};

const sample: DocumentState = {
  title: "ANALISIS PENGELOLAAN KEUANGAN PADA UMKM KULINER",
  subtitle: "Makalah Akademik",
  course: "Pengantar Manajemen Keuangan",
  lecturer: "Dr. Rina Wulandari, S.E., M.M.",
  institution: "Sekolah Tinggi Ilmu Ekonomi Nusantara",
  program: "Program Studi Manajemen",
  city: "Surabaya",
  year: "2026",
  purpose: "Disusun untuk memenuhi tugas mata kuliah",
  authors: [{ id: "202600123", name: "Aulia Pratama" }, { id: "202600124", name: "Bima Santosa" }, { id: "202600125", name: "Citra Lestari" }],
  logoSrc: "",
  showToc: true,
  showPageNumbers: true,
  fontSize: "12",
  lineHeight: "1.5",
  marginTop: "30",
  marginRight: "30",
  marginBottom: "30",
  marginLeft: "40",
  blocks: [
    { type: "heading", level: 1, text: "Pendahuluan" },
    { type: "heading", level: 2, text: "Latar Belakang" },
    { type: "paragraph", text: "Usaha mikro, kecil, dan menengah atau UMKM mempunyai peran penting dalam menggerakkan ekonomi daerah. Usaha kuliner khususnya tumbuh karena kebutuhan masyarakat terhadap makanan praktis, ragam produk lokal, dan layanan pesan antar yang semakin mudah dijangkau. Di balik pertumbuhan tersebut, pemilik usaha tetap perlu memahami kondisi keuangan sehari-hari agar peningkatan penjualan tidak hanya terlihat ramai di kasir, tetapi juga benar-benar menghasilkan laba yang dapat dipertahankan." },
    { type: "paragraph", text: "Banyak UMKM kuliner memulai kegiatan usaha dengan modal pribadi dan pengelolaan yang sangat dekat dengan kebutuhan rumah tangga. Kondisi ini membuat uang hasil penjualan sering digunakan untuk membeli bahan baku, membayar kebutuhan keluarga, atau menutup pengeluaran mendadak tanpa dicatat secara terpisah. Akibatnya, pemilik usaha sulit mengetahui jumlah modal yang masih tersedia, biaya produksi per menu, dan keuntungan yang sesungguhnya diperoleh pada akhir bulan." },
    { type: "paragraph", text: "Pencatatan keuangan tidak harus langsung menggunakan aplikasi yang rumit. Catatan penjualan harian, bukti pembelian bahan, daftar utang pemasok, dan rekap biaya operasional sudah dapat menjadi dasar pengelolaan yang lebih tertib. Ketika data tersebut dikumpulkan secara konsisten, pemilik usaha dapat membandingkan kondisi antarbulan, mengenali menu yang paling menguntungkan, dan memutuskan kapan pembelian bahan perlu dikurangi atau ditambah." },
    { type: "heading", level: 2, text: "Rumusan Masalah" },
    { type: "list", items: ["Bagaimana kondisi pencatatan keuangan pada UMKM kuliner?", "Langkah apa yang dapat membantu pelaku usaha mengelola arus kas secara lebih tertib?"] },
    { type: "paragraph", text: "Berdasarkan keadaan tersebut, pembahasan dalam makalah ini berfokus pada cara sederhana yang dapat digunakan untuk memisahkan transaksi usaha dan pribadi, mencatat arus uang masuk serta keluar, dan menyusun ringkasan laba rugi. Pendekatan yang digunakan tidak dimaksudkan untuk menggantikan laporan akuntansi profesional, melainkan menjadi langkah awal agar pemilik UMKM mempunyai informasi yang cukup sebelum mengambil keputusan penting." },
    { type: "heading", level: 2, text: "Tujuan Penulisan" },
    { type: "paragraph", text: "Tujuan penulisan makalah ini adalah menjelaskan pentingnya pengelolaan keuangan bagi UMKM kuliner dan memberikan contoh pencatatan yang dapat diterapkan secara bertahap. Selain itu, makalah ini diharapkan membantu mahasiswa melihat hubungan antara teori manajemen keuangan dengan keputusan sederhana yang dihadapi pemilik usaha, seperti menentukan harga jual, mengendalikan biaya, dan menjaga ketersediaan kas." },
    { type: "paragraph", text: "Manfaat praktis dari pembahasan ini adalah tersedianya gambaran langkah kerja yang mudah dipahami. Pemilik usaha dapat memulai dari kebiasaan menyimpan bukti transaksi dan mencatat saldo kas setiap hari. Mahasiswa juga dapat menggunakan contoh ini untuk memahami bahwa laporan keuangan bukan sekadar tugas administrasi, melainkan alat untuk membaca kondisi usaha dan merencanakan tindakan berikutnya." },
    { type: "pagebreak" },
    { type: "heading", level: 2, text: "Batasan Pembahasan" },
    { type: "paragraph", text: "Pembahasan dibatasi pada UMKM kuliner skala kecil yang menjalankan transaksi tunai dan transfer sederhana. Data yang digunakan merupakan data dummy untuk keperluan latihan, sehingga angka pada tabel tidak menunjukkan kondisi satu usaha tertentu. Batasan ini diperlukan agar fokus tulisan tetap berada pada kebiasaan pencatatan dasar, arus kas harian, dan evaluasi laba rugi bulanan yang dapat diterapkan oleh pemilik usaha dengan sumber daya terbatas." },
    { type: "paragraph", text: "Aspek perpajakan, pembiayaan bank, dan penyusunan laporan keuangan sesuai standar akuntansi tidak dibahas secara mendalam. Ketiga aspek tersebut tetap penting, tetapi memerlukan data yang lebih rinci dan pendampingan lanjutan. Dalam konteks makalah ini, pemilik usaha diasumsikan membutuhkan fondasi pencatatan yang rapi sebelum masuk ke tahap pengelolaan pajak, pengajuan kredit, atau investasi usaha yang lebih besar." },
    { type: "heading", level: 2, text: "Metode Pengumpulan Data" },
    { type: "paragraph", text: "Data dummy dikembangkan dari ilustrasi transaksi penjualan, pembelian bahan baku, biaya tenaga kerja, dan biaya operasional selama dua bulan. Setiap transaksi dikelompokkan ke dalam kategori yang mudah dikenali agar perubahan biaya dapat dibaca dengan cepat. Pengelompokan tersebut membantu proses penyusunan ringkasan penjualan dan laba rugi, sekaligus menunjukkan informasi apa saja yang sebaiknya tersedia sebelum pemilik usaha menentukan langkah perbaikan." },
    { type: "paragraph", text: "Analisis dilakukan dengan membandingkan nilai penjualan dan biaya pada dua periode. Perbandingan sederhana ini tidak hanya menunjukkan kenaikan atau penurunan angka, tetapi juga memunculkan pertanyaan tentang penyebab perubahan tersebut. Contohnya, kenaikan penjualan dapat terjadi karena jumlah pesanan bertambah, sementara kenaikan biaya dapat dipengaruhi harga bahan baku, promosi, kemasan, atau jam kerja tambahan. Pertanyaan tersebut menjadi dasar untuk pembahasan pada bab berikutnya." },
    { type: "paragraph", text: "Dengan metode yang sederhana, hasil pembahasan diharapkan tetap dapat digunakan sebagai latihan pengambilan keputusan. Pemilik UMKM tidak perlu menunggu seluruh sistem sempurna untuk mulai mencatat. Kebiasaan kecil yang dilakukan setiap hari akan menghasilkan data yang semakin baik, sehingga evaluasi usaha pada akhir minggu atau akhir bulan dapat dilakukan berdasarkan bukti transaksi, bukan hanya ingatan atau perkiraan semata." },
    { type: "heading", level: 1, text: "Pembahasan", breakBefore: true },
    { type: "heading", level: 2, text: "Gambaran Pengelolaan Keuangan" },
    { type: "heading", level: 3, text: "Pemisahan Uang Usaha dan Pribadi" },
    { type: "heading", level: 4, text: "Rekening Khusus Usaha" },
    { type: "heading", level: 5, text: "Catatan Saldo Harian" },
    { type: "paragraph", text: "Contoh hierarchy ini menunjukkan lima tingkat judul yang dapat digunakan tanpa membuat halaman terasa penuh. Tingkat empat dan lima dipakai seperlunya untuk menjelaskan langkah yang sangat spesifik, sedangkan uraian tetap ditempatkan dalam paragraf agar alur tulisan mudah diikuti saat dibaca maupun dicetak." },
    { type: "paragraph", text: "Pengelolaan keuangan UMKM dimulai dari pemisahan yang jelas antara uang usaha dan uang pribadi. Pemilik dapat menyiapkan satu rekening atau dompet digital khusus untuk menerima pembayaran pelanggan dan membayar kebutuhan usaha. Pemisahan ini memudahkan proses pemeriksaan saldo karena seluruh uang yang masuk dan keluar memiliki hubungan langsung dengan kegiatan operasional. Ketika kebutuhan pribadi muncul, pemilik perlu mencatat pengambilan tersebut sebagai penarikan pemilik, bukan biaya usaha." },
    { type: "paragraph", text: "Langkah berikutnya adalah mencatat penjualan harian berdasarkan jenis produk dan metode pembayaran. Catatan tersebut tidak harus panjang, tetapi sebaiknya memuat tanggal, jumlah transaksi, total penerimaan tunai, dan total penerimaan transfer. Dengan informasi ini, pemilik dapat mengenali pola penjualan pada hari kerja dan akhir pekan. Pola tersebut bermanfaat saat menentukan jumlah bahan baku yang perlu disiapkan agar risiko bahan terbuang dapat dikurangi." },
    { type: "paragraph", text: "Biaya bahan baku perlu dibedakan dari biaya operasional lain seperti listrik, gas, ongkos kirim, kemasan, dan upah tenaga kerja. Pemisahan kategori memungkinkan pemilik usaha memahami bagian biaya yang paling besar dan paling mudah dikendalikan. Jika harga satu bahan meningkat, pemilik dapat membandingkan beberapa pemasok, menyesuaikan ukuran porsi, atau mengevaluasi kembali harga jual tanpa harus menunggu sampai keuntungan usaha menurun terlalu jauh." },
    { type: "paragraph", text: "Selain mencatat transaksi, pemilik perlu menjadwalkan waktu evaluasi yang konsisten. Evaluasi mingguan dapat digunakan untuk memeriksa kecocokan kas dengan catatan, sedangkan evaluasi bulanan digunakan untuk menyusun ringkasan laba rugi. Kebiasaan ini menciptakan siklus sederhana: transaksi dicatat, data diringkas, hasil dibandingkan, lalu keputusan perbaikan dilakukan. Siklus tersebut membantu usaha tumbuh secara lebih terukur walaupun dikelola oleh tim kecil." },
    { type: "table", caption: "Tabel 1. Ringkasan Penjualan UMKM Kuliner", rows: [["Keterangan", "Januari 2026", "Februari 2026"], ["Penjualan", "Rp12.500.000", "Rp14.200.000"], ["Biaya operasional", "Rp8.100.000", "Rp8.750.000"], ["Laba bersih", "Rp4.400.000", "Rp5.450.000"]] },
    { type: "pagebreak" },
    { type: "heading", level: 2, text: "Analisis Arus Kas dan Laba" },
    { type: "paragraph", text: "Tabel penjualan menunjukkan bahwa penerimaan Februari lebih tinggi dibandingkan Januari. Kenaikan tersebut perlu dibaca bersama biaya operasional agar kesimpulan yang dihasilkan tidak hanya berfokus pada omzet. Dalam contoh ini, biaya juga meningkat, tetapi kenaikan laba bersih lebih besar daripada kenaikan biaya. Hal ini mengindikasikan bahwa pertumbuhan penjualan masih memberikan hasil yang positif, meskipun pemilik usaha tetap perlu memeriksa sumber kenaikan biaya agar tidak berkembang tanpa kendali." },
    { type: "paragraph", text: "Arus kas yang sehat tidak selalu sama dengan laba yang tinggi. Usaha dapat menghasilkan laba di atas kertas, tetapi tetap menghadapi kesulitan apabila pelanggan banyak berutang atau pembayaran dari platform penjualan belum diterima. Karena itu, pemilik perlu mencatat jadwal penerimaan dan pengeluaran. Kalender kas sederhana akan membantu menentukan apakah saldo yang tersedia cukup untuk membeli bahan baku minggu berikutnya, membayar upah, dan menutup biaya operasional rutin." },
    { type: "paragraph", text: "Pemeriksaan arus kas juga membantu pemilik membedakan pengeluaran yang bersifat mendesak dan pengeluaran yang dapat ditunda. Misalnya, pembelian peralatan baru dapat direncanakan setelah kas operasional aman, sedangkan pembelian bahan utama harus diprioritaskan agar proses produksi tidak berhenti. Dengan cara ini, keputusan tidak lagi dibuat hanya berdasarkan perasaan ramai atau sepi, tetapi berdasarkan catatan mengenai waktu dan jumlah uang yang benar-benar tersedia." },
    { type: "heading", level: 2, text: "Rekomendasi Perbaikan" },
    { type: "paragraph", text: "UMKM dapat membuat buku kas harian dengan tiga bagian utama, yaitu uang masuk, uang keluar, dan saldo akhir. Setiap transaksi dicatat pada hari yang sama agar tidak ada bukti pembayaran yang terlupa. Pada akhir minggu, total penjualan dapat dibandingkan dengan jumlah bahan yang dibeli. Jika selisihnya terlalu besar, pemilik dapat memeriksa kemungkinan pemborosan, kesalahan harga, atau transaksi yang belum dicatat." },
    { type: "paragraph", text: "Laporan laba rugi sederhana sebaiknya dibuat setiap akhir bulan. Formatnya cukup memuat total penjualan, harga pokok bahan, biaya operasional, dan laba bersih. Setelah laporan tersedia selama beberapa bulan, pemilik dapat melihat tren yang tidak tampak dari catatan harian. Tren tersebut dapat digunakan untuk menyusun target penjualan, anggaran pembelian bahan, atau rencana promosi yang lebih realistis." },
    { type: "paragraph", text: "Penggunaan alat digital dapat dipertimbangkan setelah kebiasaan dasar berjalan. Spreadsheet, aplikasi kas, atau sistem penjualan dapat mempercepat proses rekap, tetapi hasilnya tetap bergantung pada kedisiplinan memasukkan transaksi. Oleh sebab itu, teknologi sebaiknya dipandang sebagai alat bantu, bukan pengganti pemahaman pemilik usaha terhadap kondisi keuangannya sendiri. Sistem sederhana yang dipakai konsisten biasanya lebih bermanfaat daripada sistem rumit yang hanya digunakan sesekali." },
    { type: "heading", level: 1, text: "Penutup", breakBefore: true },
    { type: "heading", level: 2, text: "Kesimpulan" },
    { type: "paragraph", text: "Pengelolaan keuangan yang disiplin membantu UMKM memahami kondisi usaha secara nyata. Pencatatan penjualan, pembelian bahan, dan biaya operasional memberikan informasi yang diperlukan untuk menilai apakah usaha menghasilkan laba. Tanpa catatan tersebut, pemilik akan kesulitan membedakan antara uang yang tersedia di kas dengan keuntungan yang benar-benar dapat digunakan untuk mengembangkan usaha." },
    { type: "paragraph", text: "Pemisahan uang usaha dan uang pribadi merupakan langkah dasar yang perlu dilakukan sejak awal. Langkah ini membuat arus kas lebih mudah ditelusuri dan mengurangi risiko penggunaan modal untuk kebutuhan yang tidak berkaitan dengan kegiatan operasional. Setelah pemisahan dilakukan, pemilik dapat menyusun rekap harian dan bulanan secara bertahap tanpa harus langsung menggunakan sistem akuntansi yang kompleks." },
    { type: "paragraph", text: "Contoh data menunjukkan bahwa evaluasi laba tidak boleh hanya melihat angka penjualan. Kenaikan omzet perlu dibandingkan dengan perubahan biaya agar pemilik memahami apakah pertumbuhan usaha benar-benar meningkatkan hasil. Dengan analisis sederhana tersebut, UMKM dapat mengambil keputusan yang lebih tepat mengenai pembelian bahan, pengendalian biaya, harga jual, dan penggunaan kas untuk kebutuhan pengembangan usaha." },
    { type: "paragraph", text: "Kebiasaan mencatat secara konsisten akan membangun dasar informasi bagi keputusan yang lebih besar pada masa depan. Ketika data transaksi sudah tersusun, pemilik usaha akan lebih siap menghadapi perubahan harga bahan, persaingan, kebutuhan modal, maupun permintaan pelanggan yang berubah. Oleh karena itu, pencatatan keuangan perlu dipahami sebagai bagian dari proses belajar dan penguatan usaha, bukan semata-mata sebagai kewajiban administrasi." },
    { type: "pagebreak" },
    { type: "heading", level: 2, text: "Saran" },
    { type: "paragraph", text: "Pemilik UMKM disarankan untuk menentukan waktu khusus setiap hari bagi pencatatan transaksi. Waktu tersebut dapat dilakukan setelah toko tutup atau setelah seluruh pesanan selesai diproses. Rutinitas singkat yang dilakukan secara teratur lebih mudah dijalankan daripada menunda pencatatan sampai akhir bulan, ketika banyak informasi sudah terlupa dan bukti transaksi tidak lagi lengkap." },
    { type: "paragraph", text: "Mahasiswa yang mempelajari manajemen keuangan dapat menggunakan studi kasus UMKM sebagai latihan membaca hubungan antara aktivitas operasional dan angka keuangan. Latihan dapat dimulai dari membuat kas harian, menghitung biaya produksi, lalu menyusun ringkasan laba rugi. Pendekatan ini membantu teori yang dipelajari di kelas menjadi lebih dekat dengan situasi nyata yang dihadapi oleh usaha kecil." },
    { type: "paragraph", text: "Pendampingan dari kampus, komunitas bisnis, atau pemerintah daerah dapat difokuskan pada alat pencatatan yang mudah digunakan. Pelatihan sebaiknya tidak hanya menjelaskan format laporan, tetapi juga mengajak pelaku usaha menggunakan catatan tersebut untuk mengambil keputusan. Ketika pemilik memahami manfaat langsungnya, kemungkinan pencatatan dilakukan secara berkelanjutan akan menjadi lebih besar." },
    { type: "paragraph", text: "Penelitian lanjutan dapat mengembangkan contoh ini dengan memasukkan variasi jenis usaha, pola pembayaran digital, dan perubahan harga bahan baku. Data yang lebih beragam akan memperlihatkan tantangan pengelolaan kas yang berbeda pada setiap usaha. Namun demikian, prinsip utama tetap sama, yaitu transaksi harus dicatat secara tepat waktu, informasi harus diringkas secara berkala, dan keputusan perlu didasarkan pada data yang tersedia." },
    { type: "bibliography", entries: [
      "Kasmir. (2021). Analisis Laporan Keuangan. Depok: Rajawali Pers.",
      "Arikunto, S. (2019). Prosedur Penelitian: Suatu Pendekatan Praktik. Jakarta: Rineka Cipta.",
      "Badan Pusat Statistik. (2024). Statistik Indonesia 2024. Jakarta: Badan Pusat Statistik.",
      "Brigham, E. F., & Houston, J. F. (2021). Dasar-Dasar Manajemen Keuangan. Jakarta: Salemba Empat.",
      "Fahmi, I. (2020). Analisis Laporan Keuangan. Bandung: Alfabeta.",
      "Hery. (2021). Analisis Laporan Keuangan: Integrated and Comprehensive Edition. Jakarta: Grasindo.",
      "Ikatan Akuntan Indonesia. (2022). Standar Akuntansi Keuangan. Jakarta: Ikatan Akuntan Indonesia.",
      "Kementerian Koperasi dan Usaha Kecil dan Menengah Republik Indonesia. (2023). Laporan Tahunan Pengembangan Usaha Mikro, Kecil, dan Menengah. Jakarta: Kemenkop UKM.",
      "Mardiasmo. (2021). Akuntansi Sektor Publik. Yogyakarta: Andi.",
      "Munawir, S. (2020). Analisis Informasi Keuangan. Yogyakarta: Liberty.",
      "Rudianto. (2021). Pengantar Akuntansi: Konsep dan Teknik Penyusunan Laporan Keuangan. Jakarta: Erlangga.",
      "Sari, D. P., & Pratama, R. A. (2022). Penerapan pencatatan keuangan sederhana pada usaha mikro dan kecil. Jurnal Akuntansi dan Bisnis, 22(2), 145–158.",
      "Sugiyono. (2022). Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Bandung: Alfabeta.",
      "Sujarweni, V. W. (2020). Analisis Laporan Keuangan: Teori, Aplikasi, dan Hasil Penelitian. Yogyakarta: Pustaka Baru Press.",
      "Sutrisno. (2021). Manajemen Keuangan: Teori, Konsep, dan Aplikasi. Yogyakarta: Ekonisia.",
      "Tambunan, T. (2021). Usaha Mikro, Kecil, dan Menengah di Indonesia: Isu-Isu Penting. Jakarta: LP3ES.",
      "Weygandt, J. J., Kimmel, P. D., & Kieso, D. E. (2021). Financial Accounting. Hoboken, NJ: Wiley.",
      "Wibowo, A., & Lestari, N. (2023). Literasi keuangan, penggunaan aplikasi kas, dan kualitas laporan UMKM. Jurnal Manajemen dan Kewirausahaan, 25(1), 34–47.",
      "World Bank. (2023). Small and Medium Enterprises Finance: Improving Access to Finance for Small Businesses. Washington, DC: World Bank.",
    ] },
  ],
};

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
const textOf = (parent: Element | Document, selector: string, fallback = "") => parent.querySelector(selector)?.textContent?.trim() || fallback;
const wordCount = (value: string) => value.trim() ? value.trim().split(/\s+/).length : 0;
const withoutHeadingNumber = (value: string) => value.replace(/^\s*\d+(?:\.\d+){0,4}\.?\s+/, "").trim();
const alphabetizeReferences = (entries: string[]) => [...entries].sort((left, right) => left.localeCompare(right, "en", { sensitivity: "base" }));
const isJournalReference = (entry: string) => /,\s*\d+(?:\(\d+\))?,\s*\d+[–-]\d+/.test(entry);
const formatReference = (entry: string) => {
  const match = entry.match(/^(.*?\(\d{4}\)\.\s)(.+?)(\.\s)(.+)$/);
  if (!match) return entry;
  const [, authorDate, title, separator, source] = match;
  if (!isJournalReference(entry)) return <>{authorDate}<em>{title}</em>{separator}{source}</>;
  const journal = source.match(/^(.+?),\s*(\d+)(\(\d+\))?(,\s*.+)$/);
  if (!journal) return entry;
  const [, journalTitle, volume, issue = "", remainder] = journal;
  return <>{authorDate}{title}{separator}<em>{journalTitle}, {volume}</em>{issue}{remainder}</>;
};
const romanNumeral = (value: number) => ([
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
 ] as Array<[number, string]>).reduce(([remaining, result], [amount, symbol]) => {
  const count = Math.floor(remaining / amount);
  return [remaining - count * amount, result + symbol.repeat(count)] as [number, string];
}, [value, ""] as [number, string])[1];
type PreviewBlock = Block & { headingNumber?: string };

function numberHeadings(blocks: Block[]): PreviewBlock[] {
  const counters = [0, 0, 0, 0, 0];
  return blocks.map((block) => {
    if (block.type !== "heading") return block;
    counters[block.level - 1] += 1;
    for (let index = block.level; index < counters.length; index += 1) counters[index] = 0;
    const headingNumber = block.level === 1 ? `BAB ${romanNumeral(counters[0])}` : counters.slice(0, block.level).join(".");
    return { ...block, text: withoutHeadingNumber(block.text), headingNumber };
  });
}


function qualityHints(doc: DocumentState) {
  const hints: string[] = [];
  const titleWords = wordCount(doc.title);
  if (titleWords < 5 || titleWords > 18) hints.push(`Judul cover berisi ${titleWords} kata; gunakan 5–18 kata agar proporsional.`);
  const headingLimits = [8, 12, 14, 16, 18];
  doc.blocks.forEach((block, index) => {
    if (block.type === "heading" && wordCount(block.text) > headingLimits[block.level - 1]) hints.push(`Heading ${index + 1} terlalu panjang untuk level ${block.level}; gunakan maksimal ${headingLimits[block.level - 1]} kata.`);
    if (block.type === "paragraph") { const words = wordCount(block.text); if (words >= 20 && (words < 60 || words > 180)) hints.push(`Paragraf ${index + 1} berisi ${words} kata; target yang nyaman adalah 60–180 kata.`); }
    if (block.type === "list") block.items.forEach((item, itemIndex) => { if (wordCount(item) > 25) hints.push(`Poin daftar ${index + 1}.${itemIndex + 1} terlalu panjang; gunakan maksimal 25 kata.`); });
    if (block.type === "table") { if (wordCount(block.caption) > 12) hints.push(`Judul tabel ${index + 1} terlalu panjang; gunakan maksimal 12 kata.`); block.rows.forEach((row, rowIndex) => row.forEach((cell, cellIndex) => { if (wordCount(cell) > 15) hints.push(`Sel tabel ${index + 1}.${rowIndex + 1}.${cellIndex + 1} terlalu panjang; gunakan maksimal 15 kata.`); })); }
    if (block.type === "bibliography") {
      if (!block.entries.length) hints.push("Daftar pustaka belum memiliki referensi.");
      if (block.entries.some((entry, position) => entry !== alphabetizeReferences(block.entries)[position])) hints.push("Daftar pustaka akan diurutkan menurut alfabet saat dipreview dan diekspor.");
      if (block.entries.some((entry) => !/\(\d{4}\)/.test(entry))) hints.push("Periksa tahun terbit pada setiap referensi APA.");
    }
  });
  return hints;
}

function readXml(source: string, fallback: DocumentState): DocumentState {
  const xml = new DOMParser().parseFromString(source, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("XML tidak dapat dibaca. Periksa tag yang belum ditutup.");
  const root = xml.documentElement;
  if (!root || !["paper", "ripidoc"].includes(root.tagName.toLowerCase())) throw new Error("Root XML harus menggunakan <paper> atau <ripidoc>.");
  const content = root.querySelector("content") || root;
  let blocks: Block[] = Array.from(content.children).flatMap((item): Block[] => {
    const tag = item.tagName.toLowerCase();
    if (tag === "heading") {
      const level = Number(item.getAttribute("level"));
      return [{ type: "heading", level: level >= 1 && level <= 5 ? level as HeadingLevel : 1, text: withoutHeadingNumber(item.textContent?.trim() || "Judul"), breakBefore: item.getAttribute("breakBefore") === "true" }];
    }
    if (tag === "paragraph") return [{ type: "paragraph", text: item.textContent?.trim() || "" }];
    if (tag === "list") return [{ type: "list", items: Array.from(item.querySelectorAll(":scope > item")).map((entry) => entry.textContent?.trim() || "") }];
    if (tag === "table") {
      const rows = Array.from(item.querySelectorAll("row")).map((row) => Array.from(row.querySelectorAll(":scope > cell")).map((cell) => cell.textContent?.trim() || ""));
      return [{ type: "table", caption: item.getAttribute("caption") || "Judul Tabel", rows: rows.length ? rows : [["Kolom 1", "Kolom 2"], ["Data", "Data"]] }];
    }
    if (tag === "pagebreak") return [{ type: "pagebreak" }];
    return [];
  });
  const references = Array.from(root.querySelectorAll(":scope > references > reference")).map((reference) => reference.textContent?.trim() || "").filter(Boolean);
  if (references.length) blocks = [...blocks.filter((block) => !(block.type === "heading" && /^(daftar pustaka|references)$/i.test(block.text))), { type: "bibliography", entries: references }];
  const bodyStyle = root.querySelector("styles > body");
  const pageStyle = root.querySelector("styles > page");
  const authors = Array.from(root.querySelectorAll("meta > authors > author")).map((author) => ({ id: textOf(author, "id"), name: textOf(author, "name") })).filter((author) => author.id || author.name);
  const settings = root.querySelector("settings");
  return {
    ...fallback,
    title: textOf(root, "meta > title", fallback.title), subtitle: textOf(root, "meta > subtitle", fallback.subtitle),
    course: textOf(root, "meta > course", fallback.course), lecturer: textOf(root, "meta > lecturer", fallback.lecturer),
    institution: textOf(root, "meta > institution", fallback.institution), program: textOf(root, "meta > program", fallback.program), city: textOf(root, "meta > city", fallback.city),
    year: textOf(root, "meta > year", fallback.year), purpose: textOf(root, "meta > purpose", fallback.purpose), authors: authors.length ? authors : fallback.authors,
    logoSrc: root.querySelector("assets > asset[id='institution_logo']")?.getAttribute("src") || fallback.logoSrc,
    showToc: settings?.querySelector("toc")?.textContent?.trim() !== "false",
    showPageNumbers: settings?.querySelector("pageNumber")?.textContent?.trim() !== "false",
    fontSize: bodyStyle?.getAttribute("fontSize")?.replace("pt", "") || fallback.fontSize,
    lineHeight: bodyStyle?.getAttribute("lineHeight") || fallback.lineHeight,
    marginTop: pageStyle?.getAttribute("marginTop")?.replace("mm", "") || fallback.marginTop,
    marginRight: pageStyle?.getAttribute("marginRight")?.replace("mm", "") || fallback.marginRight,
    marginBottom: pageStyle?.getAttribute("marginBottom")?.replace("mm", "") || fallback.marginBottom,
    marginLeft: pageStyle?.getAttribute("marginLeft")?.replace("mm", "") || fallback.marginLeft,
    blocks: blocks.length ? blocks : fallback.blocks,
  };
}

function toXml(doc: DocumentState) {
  const authors = doc.authors.map((author) => `      <author><id>${escapeXml(author.id)}</id><name>${escapeXml(author.name)}</name></author>`).join("\n");
  const bibliography = doc.blocks.find((block): block is Extract<Block, { type: "bibliography" }> => block.type === "bibliography");
  const content = doc.blocks.filter((block) => block.type !== "bibliography").map((block) => {
    if (block.type === "heading") return `    <heading level="${block.level}"${block.breakBefore ? " breakBefore=\"true\"" : ""}>${escapeXml(block.text)}</heading>`;
    if (block.type === "paragraph") return `    <paragraph>${escapeXml(block.text)}</paragraph>`;
    if (block.type === "list") return `    <list type="bullet">\n${block.items.map((item) => `      <item>${escapeXml(item)}</item>`).join("\n")}\n    </list>`;
    if (block.type === "table") return `    <table caption="${escapeXml(block.caption)}">\n${block.rows.map((row, rowIndex) => `      <row${rowIndex === 0 ? " header=\"true\"" : ""}>${row.map((cell) => `<cell>${escapeXml(cell)}</cell>`).join("")}</row>`).join("\n")}\n    </table>`;
    return "    <pagebreak />";
  }).join("\n\n");
  const references = bibliography ? `\n  <references role="bibliography" title="DAFTAR PUSTAKA" style="apa7">\n${alphabetizeReferences(bibliography.entries).map((entry) => `    <reference type="${isJournalReference(entry) ? "journal" : "book"}">${escapeXml(entry)}</reference>`).join("\n")}\n  </references>` : "";
  const aiGuide = `  <aiGuide language="id">\n    <purpose>Gunakan template ini untuk membuat makalah akademik Indonesia yang siap diimpor ke Makalah Generator. Isi hanya elemen yang didukung di dalam content dan jangan ubah struktur metadata, styles, maupun settings.</purpose>\n    <documentTarget totalWords="2000-3500" minimumChapters="3" minimumPagesPerChapter="2">Buat cover, daftar isi, minimal tiga BAB utama, dan daftar pustaka. Setiap BAB utama idealnya cukup untuk sedikitnya dua halaman A4.</documentTarget>\n    <headingRules numbering="auto">\n      <rule level="1" label="BAB" maxWords="8">BAB tampil otomatis sebagai BAB I, BAB II, dan seterusnya. Jangan ketik nomor atau kata BAB di teks heading.</rule>\n      <rule level="2" label="Subbab" maxWords="12">Subbab bernomor otomatis 1.1, 1.2, dan seterusnya.</rule>\n      <rule level="3" label="Sub-subbab" maxWords="14">Gunakan hanya sebagai rincian langsung dari level 2.</rule>\n      <rule level="4" label="Tingkat 4" maxWords="16">Gunakan hanya bila rincian level 3 memang diperlukan.</rule>\n      <rule level="5" label="Tingkat 5" maxWords="18">Gunakan seperlunya dan jangan melompati urutan hierarchy.</rule>\n    </headingRules>\n    <contentRules>\n      <rule type="coverTitle" targetWords="5-18">Judul cover ringkas, spesifik, dan tanpa nomor heading.</rule>\n      <rule type="paragraph" targetWords="60-180">Setiap paragraf membahas satu gagasan dan tetap proporsional saat dicetak A4.</rule>\n      <rule type="list" maxWordsPerItem="25">Gunakan daftar untuk poin singkat sebanyak 2-6 item.</rule>\n      <rule type="table" maxCaptionWords="12" maxCellWords="15">Tabel ringkas, dengan judul jelas dan isi sel tidak berupa paragraf panjang.</rule>\n    </contentRules>\n    <layoutRules>Gunakan pagebreak sebelum BAB baru bila diperlukan. Jangan buat heading tanpa isi setelahnya. Pertahankan A4, Times New Roman 12 pt, spasi 1.5, margin atas/kanan/bawah 30 mm dan kiri 40 mm. Cover tidak bernomor; daftar isi memakai i; BAB I dimulai dari halaman 1.</layoutRules>\n  </aiGuide>\n`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<paper>\n  <meta>\n    <title>${escapeXml(doc.title)}</title>\n    <subtitle>${escapeXml(doc.subtitle)}</subtitle>\n    <purpose>${escapeXml(doc.purpose)}</purpose>\n    <course>${escapeXml(doc.course)}</course>\n    <lecturer>${escapeXml(doc.lecturer)}</lecturer>\n    <institution>${escapeXml(doc.institution)}</institution>\n    <program>${escapeXml(doc.program)}</program>\n    <city>${escapeXml(doc.city)}</city>\n    <year>${escapeXml(doc.year)}</year>\n    <authors>\n${authors}\n    </authors>\n  </meta>\n  <assets>\n    <asset id="institution_logo" type="logo" src="${escapeXml(doc.logoSrc)}" />\n  </assets>\n  <styles>\n    <page size="A4" marginTop="${doc.marginTop}mm" marginRight="${doc.marginRight}mm" marginBottom="${doc.marginBottom}mm" marginLeft="${doc.marginLeft}mm" />\n    <body fontFamily="Times New Roman" fontSize="${doc.fontSize}pt" lineHeight="${doc.lineHeight}" align="justify" firstLineIndent="1.25cm" />\n    <bibliography fontFamily="Times New Roman" fontSize="${doc.fontSize}pt" lineHeight="${doc.lineHeight}" align="left" firstLineIndent="0" hangingIndent="1.25cm" entrySpacing="0" />\n  </styles>\n  <settings>\n    <toc>${doc.showToc}</toc>\n    <pageNumber>${doc.showPageNumbers}</pageNumber>\n    <headingNumbering>auto</headingNumbering>\n  </settings>\n${aiGuide}  <content>\n${content}\n  </content>${references}\n</paper>\n`;
}

function downloadXml(xml: string, filename = "makalah.xml") {
  const href = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
  const link = document.createElement("a"); link.href = href; link.download = filename; link.click(); URL.revokeObjectURL(href);
}

export function MakalahGeneratorClient() {
  const [previewReady, setPreviewReady] = useState(false);
  const [printRequested, setPrintRequested] = useState(false);
  useEffect(() => {
    if (!printRequested || !previewReady) return;
    let cancelled = false;
    void (async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>("[data-paper-page] img")).map((img) => img.decode().catch(() => undefined)));
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      if (cancelled) return;
      setPrintRequested(false);
      document.body.classList.add("makalah-printing");
      window.print();
    })();
    return () => { cancelled = true; };
  }, [previewReady, printRequested]);
  const [view, setView] = useState<View>("import");
  const [doc, setDoc] = useState<DocumentState>(sample);
  const [paste, setPaste] = useState("");
  const [notice, setNotice] = useState("Mulai dari contoh, unggah file XML, atau tempel XML dari AI.");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const finishPrinting = () => document.body.classList.remove("makalah-printing");
    window.addEventListener("afterprint", finishPrinting);
    return () => { window.removeEventListener("afterprint", finishPrinting); document.body.classList.remove("makalah-printing"); };
  }, []);
  const xml = useMemo(() => toXml(doc), [doc]);
  const templateXml = useMemo(() => toXml(sample), []);
  const hints = useMemo(() => qualityHints(doc), [doc]);
  const update = <K extends keyof DocumentState>(key: K, value: DocumentState[K]) => setDoc((current) => ({ ...current, [key]: value }));
  const updateBlock = (index: number, value: Block) => setDoc((current) => ({ ...current, blocks: current.blocks.map((block, position) => position === index ? value : block) }));
  const addBlock = (type: Exclude<Block["type"], "bibliography">) => setDoc((current) => ({ ...current, blocks: [...current.blocks, type === "heading" ? { type, level: 2, text: "Subbab Baru" } : type === "paragraph" ? { type, text: "Tulis paragraf di sini." } : type === "list" ? { type, items: ["Poin baru"] } : type === "table" ? { type, caption: "Judul Tabel", rows: [["Kolom 1", "Kolom 2"], ["Data", "Data"]] } : { type }] }));
  const removeBlock = (index: number) => setDoc((current) => ({ ...current, blocks: current.blocks.filter((_, position) => position !== index) }));
  const moveBlock = (index: number, direction: -1 | 1) => setDoc((current) => {
    const next = [...current.blocks]; const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return { ...current, blocks: next };
  });
  const importXml = (source: string) => {
    try { setDoc((current) => readXml(source, current)); setNotice("XML berhasil diimpor. Periksa hasilnya pada Editor atau Preview A4."); setView("editor"); }
    catch (error) { setNotice(error instanceof Error ? error.message : "XML tidak dapat diimpor."); }
  };
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => importXml(String(reader.result || "")); reader.readAsText(file); event.target.value = "";
  };
  const handlePrint = () => {
    setView("preview");
    setPrintRequested(true);
  };
  const headings: Record<View, [string, string]> = {
    import: ["Import XML & Style", "Masukkan struktur makalah, lalu atur identitas dan format halaman."], editor: ["Structured Editor", "Edit isi makalah tanpa perlu menulis kode XML secara manual."],
    preview: ["Preview A4", "Tinjau hasil akhir makalah sebelum dicetak atau disimpan sebagai PDF."], xml: ["XML Output", "Salin atau unduh XML hasil penyusunan makalah."],
  };
  return <div className={styles.studio}>
    <header className={styles.topbar}><div><span className={styles.kicker}>RIPITA · DOCUMENT ESSENTIALS</span><h2>{headings[view][0]}</h2><p>{headings[view][1]}</p></div><div className={styles.topActions}><button type="button" className={styles.button} onClick={() => downloadXml(templateXml, "template-makalah-lengkap.xml")}>Download Template XML</button><button type="button" className={styles.button} onClick={() => downloadXml(xml)}>Export XML</button><button type="button" className={`${styles.button} ${styles.primary}`} onClick={handlePrint}>Print / PDF</button></div></header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}><div className={styles.brand}><span aria-hidden="true">✦</span><div><strong>Makalah Generator</strong><small>RIPITA Studio</small></div></div><p className={styles.sidebarLabel}>RUANG KERJA</p><nav aria-label="Tahap penyusunan makalah">{(["import", "editor", "preview", "xml"] as View[]).map((item, index) => <button key={item} type="button" className={view === item ? styles.active : ""} onClick={() => setView(item)}><b>{index + 1}</b>{headings[item][0]}</button>)}</nav><p className={styles.sidebarFoot}>Data makalah diproses di perangkatmu dan tidak disimpan ke server.</p></aside>
      <section className={styles.workspace}>
        {view === "import" && <><div className={styles.importGrid}><section className={styles.card}><h3>Unggah file XML</h3><p>Gunakan XML dari studio sebelumnya atau template yang sesuai struktur makalah.</p><div className={styles.dropzone} onClick={() => fileInput.current?.click()}><strong>Pilih file XML</strong><span>Klik untuk memilih file dari perangkatmu.</span><input ref={fileInput} type="file" accept=".xml,text/xml,application/xml" onChange={onFile} /></div><div className={styles.actions}><button className={styles.button} type="button" onClick={() => { setDoc(sample); setNotice("Contoh makalah dimuat."); setView("editor"); }}>Muat Contoh</button><button className={styles.button} type="button" onClick={() => { setDoc(sample); setPaste(""); setNotice("Dokumen direset ke contoh awal."); }}>Reset</button></div><p className={styles.notice}>{notice}</p></section><section className={styles.card}><h3>Paste XML</h3><p>Tempel struktur XML dari AI atau dokumen sebelumnya.</p><textarea value={paste} onChange={(event) => setPaste(event.target.value)} placeholder="Paste XML di sini..." /><div className={styles.actions}><button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => importXml(paste)}>Import XML dari teks</button><button className={styles.button} type="button" onClick={() => { try { readXml(paste, doc); setNotice("Struktur XML valid dan siap diimpor."); } catch (error) { setNotice(error instanceof Error ? error.message : "XML tidak valid."); } }}>Validasi XML</button></div></section></div><DocumentSettings doc={doc} update={update} /></>}
        {view === "editor" && <><div className={styles.editorActions}>{(["heading", "paragraph", "list", "table", "pagebreak"] as Exclude<Block["type"], "bibliography">[]).map((type) => <button className={styles.button} type="button" key={type} onClick={() => addBlock(type)}>+ {type === "heading" ? "Subbab" : type === "paragraph" ? "Paragraf" : type === "list" ? "Daftar" : type === "table" ? "Tabel" : "Page Break"}</button>)}</div><QualityPanel doc={doc} hints={hints} /><div className={styles.editor}>{doc.blocks.map((block, index) => <BlockEditor key={`${block.type}-${index}`} block={block} index={index} onChange={updateBlock} onRemove={removeBlock} onMove={moveBlock} />)}</div></>}
        {view === "preview" && <><div className={styles.previewActions}><button className={`${styles.button} ${styles.primary}`} type="button" onClick={handlePrint}>Print / Save PDF</button><button className={styles.button} type="button" onClick={() => setView("editor")}>Kembali ke Editor</button></div><PaperPreview doc={doc} onReady={setPreviewReady} /></>}
        {view === "xml" && <section className={styles.xmlCard}><div className={styles.actions}><button className={styles.button} type="button" onClick={() => navigator.clipboard?.writeText(xml).then(() => setNotice("XML disalin ke clipboard."))}>Copy XML</button><button className={`${styles.button} ${styles.primary}`} type="button" onClick={() => downloadXml(xml)}>Download XML</button></div><textarea aria-label="XML output" readOnly value={xml} /></section>}
      </section>
    </div>
  </div>;
}

function QualityPanel({ doc, hints }: { doc: DocumentState; hints: string[] }) {
  const totalWords = doc.blocks.reduce((total, block) => total + (block.type === "paragraph" ? wordCount(block.text) : block.type === "heading" ? wordCount(block.text) : block.type === "list" ? block.items.reduce((count, item) => count + wordCount(item), 0) : block.type === "table" ? wordCount(block.caption) + block.rows.flat().reduce((count, cell) => count + wordCount(cell), 0) : 0), 0);
  const visibleHints = hints.slice(0, 5);
  return <section className={styles.qualityPanel} aria-label="Kelayakan tampilan"><div><span>KELAYAKAN TAMPILAN</span><strong>{totalWords.toLocaleString("id-ID")} kata</strong></div><p>Target paragraf 60–180 kata. Saran ini tidak akan menghalangi ekspor atau cetak.</p>{hints.length ? <><ul>{visibleHints.map((hint) => <li key={hint}>{hint}</li>)}</ul>{hints.length > visibleHints.length && <p>+ {hints.length - visibleHints.length} saran tambahan; ringkas atau perluas teks bila diperlukan.</p>}</> : <p className={styles.qualityGood}>Panjang judul, paragraf, daftar, dan tabel sudah proporsional.</p>}</section>;
}

function DocumentSettings({ doc, update }: { doc: DocumentState; update: <K extends keyof DocumentState>(key: K, value: DocumentState[K]) => void }) {
  const logoInput = useRef<HTMLInputElement>(null);
  const metadataKeys = ["title", "subtitle", "purpose", "course", "lecturer", "institution", "program", "city", "year"] as const;
  const marginKeys = ["marginTop", "marginRight", "marginBottom", "marginLeft"] as const;
  const labels: Record<(typeof metadataKeys)[number] | (typeof marginKeys)[number], string> = {
    title: "Judul", subtitle: "Judul cover", purpose: "Tujuan penyusunan", course: "Mata kuliah", lecturer: "Dosen", institution: "Institusi", program: "Program studi", city: "Kota", year: "Tahun",
    marginTop: "Margin atas (mm)", marginRight: "Margin kanan (mm)", marginBottom: "Margin bawah (mm)", marginLeft: "Margin kiri (mm)",
  };
  const onLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => update("logoSrc", String(reader.result || ""));
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  return <section className={styles.settings} aria-label="Pengaturan dokumen dan halaman"><div className={styles.settingsHeading}><span>01B · PENGATURAN</span><h3>Dokumen & Halaman</h3><p>Atur identitas, anggota, dan format A4 sebelum masuk ke editor.</p></div><div className={styles.card}><h3>Metadata Makalah</h3><div className={styles.fieldGrid}>{metadataKeys.map((key) => <label key={key}>{labels[key]}<input value={doc[key]} onChange={(event) => update(key, event.target.value)} /></label>)}</div></div><div className={styles.card}><h3>Anggota Penyusun</h3><p className={styles.logoHelp}>Nama dan NIM akan tersusun dua kolom pada cover formal.</p><AuthorsEditor authors={doc.authors} onChange={(authors) => update("authors", authors)} /></div><div className={styles.card}><h3>Logo Institusi</h3><p className={styles.logoHelp}>Logo akan muncul pada cover makalah dan tersimpan bersama XML.</p><div className={styles.logoUpload}><div className={styles.logoPreview}>{doc.logoSrc ? <img src={doc.logoSrc} alt="Preview logo institusi" /> : <span>Belum ada logo</span>}</div><div><input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogoChange} className={styles.visuallyHidden} /><div className={styles.actions}><button className={styles.button} type="button" onClick={() => logoInput.current?.click()}>Pilih Logo</button><button className={styles.button} type="button" onClick={() => update("logoSrc", "")} disabled={!doc.logoSrc}>Hapus Logo</button></div><p className={styles.logoHelp}>Gunakan PNG, JPG, WebP, atau SVG. File diproses di browser.</p></div></div></div><div className={styles.card}><h3>Dokumen, Tipografi & Margin</h3><div className={styles.toggleRow}><label><input type="checkbox" checked={doc.showToc} onChange={(event) => update("showToc", event.target.checked)} /> Tambahkan daftar isi</label><label><input type="checkbox" checked={doc.showPageNumbers} onChange={(event) => update("showPageNumbers", event.target.checked)} /> Tampilkan nomor halaman</label></div><div className={styles.fieldGrid}><label>Ukuran teks<select value={doc.fontSize} onChange={(event) => update("fontSize", event.target.value)}><option value="11">11 pt</option><option value="12">12 pt</option><option value="13">13 pt</option></select></label><label>Spasi baris<select value={doc.lineHeight} onChange={(event) => update("lineHeight", event.target.value)}><option value="1.15">1.15</option><option value="1.5">1.5</option><option value="2">2.0</option></select></label>{marginKeys.map((key) => <label key={key}>{labels[key]}<input type="number" min="10" value={doc[key]} onChange={(event) => update(key, event.target.value)} /></label>)}</div></div></section>;
}

function AuthorsEditor({ authors, onChange }: { authors: Author[]; onChange: (authors: Author[]) => void }) {
  return <div className={styles.authorsEditor}>{authors.map((author, index) => <div className={styles.authorRow} key={`${author.id}-${index}`}><input aria-label={`NIM anggota ${index + 1}`} value={author.id} placeholder="NIM" onChange={(event) => onChange(authors.map((current, position) => position === index ? { ...current, id: event.target.value } : current))} /><input aria-label={`Nama anggota ${index + 1}`} value={author.name} placeholder="Nama anggota" onChange={(event) => onChange(authors.map((current, position) => position === index ? { ...current, name: event.target.value } : current))} /><button className={styles.removeAuthor} type="button" onClick={() => onChange(authors.filter((_, position) => position !== index))} disabled={authors.length === 1} aria-label={`Hapus anggota ${index + 1}`}>×</button></div>)}<button className={styles.textButton} type="button" onClick={() => onChange([...authors, { id: "", name: "" }])}>+ Tambah anggota</button></div>;
}

function BlockEditor({ block, index, onChange, onRemove, onMove }: { block: Block; index: number; onChange: (index: number, block: Block) => void; onRemove: (index: number) => void; onMove: (index: number, direction: -1 | 1) => void }) {
  const controls = <div className={styles.blockControls}><button type="button" onClick={() => onMove(index, -1)} aria-label="Naikkan blok">↑</button><button type="button" onClick={() => onMove(index, 1)} aria-label="Turunkan blok">↓</button><button type="button" onClick={() => onRemove(index)} aria-label="Hapus blok">×</button></div>;
  if (block.type === "heading") return <article className={styles.block}><div className={styles.blockTop}><span>HEADING {block.level}</span>{controls}</div><div className={styles.inlineFields}><select value={block.level} onChange={(event) => onChange(index, { ...block, level: Number(event.target.value) as HeadingLevel })}><option value="1">BAB</option><option value="2">Subbab</option><option value="3">Sub-subbab</option><option value="4">Tingkat 4</option><option value="5">Tingkat 5</option></select><label><input type="checkbox" checked={Boolean(block.breakBefore)} onChange={(event) => onChange(index, { ...block, breakBefore: event.target.checked })} /> Halaman baru</label></div><input value={block.text} onChange={(event) => onChange(index, { ...block, text: withoutHeadingNumber(event.target.value) })} /></article>;
  if (block.type === "paragraph") return <article className={styles.block}><div className={styles.blockTop}><span>PARAGRAF</span>{controls}</div><textarea value={block.text} onChange={(event) => onChange(index, { ...block, text: event.target.value })} /></article>;
  if (block.type === "list") return <article className={styles.block}><div className={styles.blockTop}><span>DAFTAR</span>{controls}</div>{block.items.map((item, itemIndex) => <div className={styles.listRow} key={itemIndex}><span>•</span><input value={item} onChange={(event) => onChange(index, { ...block, items: block.items.map((current, position) => position === itemIndex ? event.target.value : current) })} /><button type="button" onClick={() => onChange(index, { ...block, items: block.items.filter((_, position) => position !== itemIndex) })}>×</button></div>)}<button className={styles.textButton} type="button" onClick={() => onChange(index, { ...block, items: [...block.items, "Poin baru"] })}>+ Tambah poin</button></article>;
  if (block.type === "bibliography") return <article className={styles.block}><div className={styles.blockTop}><span>DAFTAR PUSTAKA</span>{controls}</div>{block.entries.map((entry, entryIndex) => <div className={styles.listRow} key={entryIndex}><span>•</span><input value={entry} onChange={(event) => onChange(index, { ...block, entries: block.entries.map((current, position) => position === entryIndex ? event.target.value : current) })} /><button type="button" onClick={() => onChange(index, { ...block, entries: block.entries.filter((_, position) => position !== entryIndex) })}>×</button></div>)}<button className={styles.textButton} type="button" onClick={() => onChange(index, { ...block, entries: [...block.entries, "Referensi baru."] })}>+ Tambah referensi</button></article>;
  if (block.type === "table") return <article className={styles.block}><div className={styles.blockTop}><span>TABEL</span>{controls}</div><input value={block.caption} onChange={(event) => onChange(index, { ...block, caption: event.target.value })} aria-label="Judul tabel" /><div className={styles.tableEditor}>{block.rows.map((row, rowIndex) => <div key={rowIndex}>{row.map((cell, cellIndex) => <input key={cellIndex} value={cell} onChange={(event) => onChange(index, { ...block, rows: block.rows.map((existing, position) => position === rowIndex ? existing.map((value, cellPosition) => cellPosition === cellIndex ? event.target.value : value) : existing) })} />)}</div>)}</div><button className={styles.textButton} type="button" onClick={() => onChange(index, { ...block, rows: [...block.rows, block.rows[0]?.map(() => "Data") || ["Data"]] })}>+ Tambah baris</button></article>;
  return <article className={`${styles.block} ${styles.pageBreak}`}><div className={styles.blockTop}><span>PAGE BREAK</span>{controls}</div><p>Halaman berikutnya dimulai setelah blok ini.</p></article>;
}


function renderBlock(block: PreviewBlock, key: number) {
  if (block.type === "heading") { const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5"; return <Tag key={key}>{block.headingNumber} {block.text}</Tag>; }
  if (block.type === "paragraph") return <p key={key}>{block.text}</p>;
  if (block.type === "bibliography") return <section className={styles.bibliography} key={key} aria-labelledby="bibliography-title"><h1 id="bibliography-title">DAFTAR PUSTAKA</h1>{alphabetizeReferences(block.entries).map((entry, index) => <p key={`${entry}-${index}`}>{formatReference(entry)}</p>)}</section>;
  if (block.type === "list") return <ul key={key}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>;
  if (block.type === "table") return <figure key={key}><figcaption>{block.caption}</figcaption><table><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => rowIndex === 0 ? <th key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></figure>;
  return null;
}

function PaperPreview({ doc, onReady }: { doc: DocumentState; onReady: (ready: boolean) => void }) {
  const paperStyle = { "--paper-font-size": `${doc.fontSize}pt`, "--paper-line-height": doc.lineHeight, "--paper-top": `${doc.marginTop}mm`, "--paper-right": `${doc.marginRight}mm`, "--paper-bottom": `${doc.marginBottom}mm`, "--paper-left": `${doc.marginLeft}mm` } as React.CSSProperties;
  const blocks = useMemo(() => numberHeadings(doc.blocks), [doc.blocks]);
  const sourceRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const tocSourceRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{ pages: PaperPage[]; toc: PaperPage[]; error?: string }>({ pages: [], toc: [] });
  useLayoutEffect(() => {
    let cancelled = false;
    onReady(false);
    const paginate = () => {
      if (cancelled || !sourceRef.current || !probeRef.current || !tocSourceRef.current) return;
      try {
        const pages = paginatePaper(sourceRef.current, probeRef.current);
        const tocSource = tocSourceRef.current;
        tocSource.replaceChildren();
        const title = document.createElement("h1"); title.textContent = "DAFTAR ISI"; tocSource.append(title);
        pages.forEach((page, pageIndex) => page.headings.forEach((entry) => {
          const row = document.createElement("div"); row.className = styles.tocEntry;
          row.style.paddingLeft = `${(entry.level - 1) * 8}mm`;
          const text = document.createElement("span"); text.textContent = entry.text;
          const dots = document.createElement("i"); dots.setAttribute("aria-hidden", "true");
          const number = document.createElement("b"); number.textContent = String(pageIndex + 1);
          row.append(text, dots, number); tocSource.append(row);
        }));
        const toc = doc.showToc ? paginatePaper(tocSource, probeRef.current) : [];
        // The source is React-escaped content. Only serialized clones from that DOM are rendered.
        setResult({ pages, toc }); onReady(true);
      } catch (error) {
        setResult({ pages: [], toc: [], error: error instanceof Error ? error.message : "Halaman belum dapat disusun." });
      }
    };
    void document.fonts.ready.then(paginate);
    document.fonts.addEventListener("loadingdone", paginate);
    return () => { cancelled = true; document.fonts.removeEventListener("loadingdone", paginate); };
  }, [blocks, doc.fontSize, doc.lineHeight, doc.marginTop, doc.marginRight, doc.marginBottom, doc.marginLeft, doc.showToc, onReady]);

  const sourceNodes = blocks.flatMap((block, index) => {
    if (block.type === "pagebreak") return [<div key={index} data-page-break />];
    if (block.type === "heading") {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5";
      return [<Tag key={index} data-heading-index={index} data-break-before={block.level === 1 || Boolean(block.breakBefore)}>{block.headingNumber} {block.text}</Tag>];
    }
    if (block.type === "bibliography") return [
      <h1 key={`ref-title-${index}`} data-break-before="true">DAFTAR PUSTAKA</h1>,
      ...alphabetizeReferences(block.entries).map((entry, entryIndex) => <p className={styles.referenceEntry} key={`ref-${index}-${entryIndex}`}>{formatReference(entry)}</p>),
    ];
    return [renderBlock(block, index)];
  });
  return <div className={styles.previewScroll}>
    <section className={styles.previewDocument} style={paperStyle} data-pagination-ready={result.pages.length > 0 && !result.error}>
      <div className={styles.measurement} aria-hidden="true">
        <div className={styles.paper}><div className={styles.paperContent}><div className={styles.pageFlow} ref={sourceRef} data-pagination-source>{sourceNodes}</div></div></div>
        <div className={styles.paper}><div className={styles.paperContent}><div className={styles.pageFlow} ref={probeRef} /></div></div>
        <div ref={tocSourceRef} />
      </div>
      {result.error && <p className={styles.paginationError} role="alert">{result.error} Isi belum dicetak agar tidak terpotong.</p>}
      <article className={`${styles.paper} ${styles.cover}`} data-paper-page="cover">
        <div className={styles.coverHeader}><h2>{doc.subtitle}</h2><h1>{doc.title}</h1></div>
        <div className={styles.coverMeta}><p>{doc.purpose}</p><p>{doc.course}</p><strong>Dosen Pengampu: {doc.lecturer}</strong></div>
        {doc.logoSrc ? <img className={styles.coverLogo} src={doc.logoSrc} alt={`Logo ${doc.institution}`} /> : <div className={styles.coverLogoPlaceholder}>LOGO<br />INSTITUSI</div>}
        <div className={styles.coverAuthors}><b>Disusun Oleh:</b>{doc.authors.map((author, index) => <div key={index}><span>{author.id || "-"}</span><span>{author.name || "Nama anggota"}</span></div>)}</div>
        <footer>{doc.program}<br />{doc.institution}<br />{doc.city}<br />{doc.year}</footer>
      </article>
      {result.toc.map((page, index) => <article className={`${styles.paper} ${styles.tocPage}`} key={`toc-${index}`} data-paper-page="toc">
        <section className={styles.paperContent}><div className={styles.pageFlow} data-page-flow dangerouslySetInnerHTML={{ __html: page.html }} /></section>
        {doc.showPageNumbers && <div className={styles.pageNumber} aria-label="Nomor halaman daftar isi">{romanNumeral(index + 1).toLowerCase()}</div>}
      </article>)}
      {result.pages.map((page, index) => <article className={`${styles.paper} ${styles.contentPage}`} key={`page-${index}`} data-paper-page="content">
        <section className={styles.paperContent}><div className={styles.pageFlow} data-page-flow dangerouslySetInnerHTML={{ __html: page.html }} /></section>
        {doc.showPageNumbers && <div className={styles.pageNumber} aria-label={`Nomor halaman ${index + 1}`}>{index + 1}</div>}
      </article>)}
    </section>
  </div>;
}
