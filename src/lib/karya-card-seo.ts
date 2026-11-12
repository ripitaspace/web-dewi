import { MINI_TOOLS, type MiniTool } from "@/lib/mini-tools";

export type KaryaCardSeo = {
  title: string;
  description: string;
  h1: string;
  intent: string;
  indexable: boolean;
  guideTitle?: string;
  steps?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  relatedHrefs?: string[];
};

type ActiveSeo = Omit<KaryaCardSeo, "indexable">;

const activeSeo: Record<string, ActiveSeo> = {
  "/karya/pajak/coretax": {
    title: "Coretax Invoice Scraper dan Renamer", h1: "Coretax Invoice Scraper dan Renamer",
    description: "Ekstrak detail faktur pajak PDF, periksa item, lalu buat rekap Excel atau arsip PDF dengan nama rapi.",
    intent: "ekstrak faktur pajak PDF ke Excel", relatedHrefs: ["/karya/tools/extension-download-faktur-otomatis", "/karya/tools/cetak-bupot", "/karya/tools/spt-op"],
  },
  "/karya/tools/quotation-generator": {
    title: "Quotation Generator", h1: "Quotation Generator untuk Surat Penawaran Harga",
    description: "Buat surat penawaran harga yang rapi dari data bisnis Anda langsung di browser.",
    intent: "membuat surat penawaran harga", guideTitle: "Cara membuat surat penawaran harga",
    steps: ["Masukkan identitas perusahaan, pelanggan, dan detail penawaran.", "Tinjau item, harga, dan ketentuan sebelum membuat dokumen.", "Unduh atau bagikan hasil setelah seluruh data diperiksa."],
    faqs: [{ question: "Apakah data penawaran disimpan di server?", answer: "Tidak. Tool memproses data di browser pengguna." }, { question: "Apa yang perlu diperiksa sebelum dibagikan?", answer: "Periksa identitas pihak, item, harga, pajak, dan ketentuan penawaran." }],
    relatedHrefs: ["/karya/tools/compile-dokumen", "/karya/tools/makalah-generator", "/karya/tools/kalkulator-bea-cukai"],
  },
  "/karya/tools/kalkulator-bea-cukai": {
    title: "Kalkulator Bea Cukai", h1: "Kalkulator Bea Cukai untuk Perkiraan Belanja dari Luar Negeri",
    description: "Hitung perkiraan bea masuk dan pajak atas barang bawaan dari luar negeri sebelum tiba di Indonesia.",
    intent: "hitung perkiraan bea masuk barang bawaan", guideTitle: "Gunakan kalkulator sebagai perkiraan awal",
    steps: ["Masukkan nilai dan jenis barang sesuai informasi yang Anda miliki.", "Tinjau perkiraan biaya yang ditampilkan oleh kalkulator.", "Cocokkan kembali dengan ketentuan dan pemeriksaan resmi saat perjalanan."],
    faqs: [{ question: "Apakah hasil kalkulator adalah keputusan resmi?", answer: "Tidak. Hasilnya hanya perkiraan awal dan bukan keputusan kepabeanan." }, { question: "Kapan data perlu diperbarui?", answer: "Perbarui input saat nilai, jumlah, atau jenis barang berubah." }],
    relatedHrefs: ["/karya/pajak/coretax", "/karya/tools/compile-dokumen", "/karya/tools/spt-op"],
  },
  "/karya/tools/extension-download-faktur-otomatis": {
    title: "Download Faktur Pajak Coretax Otomatis", h1: "Download Faktur Pajak Coretax Otomatis",
    description: "Panduan bookmarklet untuk membantu menjalankan klik download Faktur Pajak Keluaran dan Pajak Masukan secara berurutan.",
    intent: "download faktur pajak Coretax otomatis", relatedHrefs: ["/karya/tools/download-faktur-laptop-kentang", "/karya/pajak/coretax", "/karya/tools/cetak-bupot"],
  },
  "/karya/tools/download-faktur-laptop-kentang": {
    title: "Download Faktur Coretax untuk Laptop Lemot", h1: "Download Faktur Coretax di Laptop Lemot",
    description: "Panduan bookmarklet Coretax untuk mengatur satu halaman tabel dan satu antrean download ketika laptop responsnya lambat.",
    intent: "download faktur Coretax di laptop lemot", relatedHrefs: ["/karya/tools/extension-download-faktur-otomatis", "/karya/pajak/coretax", "/karya/tools/cetak-bupot"],
  },
  "/karya/tools/download-bukti-potong-otomatis": {
    title: "Download Bukti Potong Coretax Otomatis", h1: "Download Bukti Potong Coretax Otomatis",
    description: "Unduh PDF bukti potong dari tabel Coretax secara berurutan di browser desktop.",
    intent: "download bukti potong Coretax otomatis", relatedHrefs: ["/karya/tools/cetak-bupot", "/karya/tools/extension-download-faktur-otomatis", "/karya/pajak/coretax"],
  },
  "/karya/tools/cetak-bupot": {
    title: "Cetak BUPOT dari Excel Coretax", h1: "Cetak BUPOT dari Excel Coretax",
    description: "Siapkan dokumen acuan BUPOT dari ekspor Excel Coretax langsung di browser.",
    intent: "cetak BUPOT dari Excel Coretax", relatedHrefs: ["/karya/tools/download-bukti-potong-otomatis", "/karya/tools/pph-21-calculator", "/karya/pajak/coretax"],
  },
  "/karya/tools/pph-21-calculator": {
    title: "Payroll dan PPh 21 Studio", h1: "Payroll dan PPh 21 Studio",
    description: "Kelola data penerima, telusuri PPh 21/26, lalu siapkan slip pembayaran dan XML Coretax.",
    intent: "kalkulator payroll dan PPh 21", relatedHrefs: ["/karya/tools/cetak-bupot", "/karya/tools/spt-op", "/karya/pajak/coretax"],
  },
  "/karya/tools/spt-op": {
    title: "SPT Orang Pribadi", h1: "Siapkan SPT Orang Pribadi",
    description: "Siapkan data, lampiran, dan draft SPT Tahunan Orang Pribadi secara lebih terstruktur.",
    intent: "persiapan SPT Orang Pribadi", relatedHrefs: ["/karya/tools/pph-21-calculator", "/karya/tools/cetak-bupot", "/karya/pajak/coretax"],
  },
  "/karya/tools/compile-dokumen": {
    title: "Compile Dokumen", h1: "Gabungkan PDF dan Gambar dengan Compile Dokumen",
    description: "Gabungkan PDF dan gambar menjadi satu dokumen rapi langsung di browser.",
    intent: "gabungkan PDF dan gambar online", guideTitle: "Cara menggabungkan dokumen",
    steps: ["Tambahkan PDF atau gambar yang ingin digabungkan.", "Tinjau urutan dan halaman dokumen sebelum membuat hasil akhir.", "Unduh PDF gabungan lalu periksa kembali hasilnya."],
    faqs: [{ question: "Apakah dokumen diunggah ke server?", answer: "Tidak. Pemrosesan berlangsung langsung di browser." }, { question: "Format apa yang dapat dimasukkan?", answer: "Tool menerima PDF serta format gambar yang ditampilkan pada area unggah." }],
    relatedHrefs: ["/karya/tools/makalah-generator", "/karya/tools/quotation-generator", "/karya/tools/kalkulator-bea-cukai"],
  },
  "/karya/tools/makalah-generator": {
    title: "Makalah Generator", h1: "Makalah Generator untuk Dokumen Akademik",
    description: "Susun makalah akademik dengan struktur, format, dan ekspor dokumen yang lebih rapi.",
    intent: "buat makalah akademik rapi", guideTitle: "Cara menyiapkan makalah akademik",
    steps: ["Isi identitas dokumen dan susun struktur bab sesuai kebutuhan.", "Tinjau isi, format, dan daftar pustaka sebelum ekspor.", "Unduh dokumen lalu periksa tata letaknya sebelum dikumpulkan."],
    faqs: [{ question: "Apakah hasilnya dapat langsung dikumpulkan?", answer: "Periksa kembali isi, sumber, dan ketentuan kampus sebelum menggunakan hasil akhir." }, { question: "Untuk apa template digunakan?", answer: "Template membantu menjaga struktur dokumen tetap konsisten saat disusun." }],
    relatedHrefs: ["/karya/tools/compile-dokumen", "/karya/tools/quotation-generator", "/belajar"],
  },
};

function fallbackSeo(tool: MiniTool): KaryaCardSeo {
  return {
    title: tool.title,
    h1: tool.title,
    description: tool.description,
    intent: tool.title.toLocaleLowerCase("id-ID"),
    indexable: tool.status === "available",
  };
}

export const KARYA_CARD_SEO: Record<string, KaryaCardSeo> = Object.fromEntries(
  MINI_TOOLS.map((tool) => [tool.href, { ...fallbackSeo(tool), ...activeSeo[tool.href], indexable: tool.status === "available" }]),
);

export function getKaryaCardSeo(href: string) {
  return KARYA_CARD_SEO[href];
}

export function getIndexableKaryaCards() {
  return MINI_TOOLS.filter((tool) => KARYA_CARD_SEO[tool.href]?.indexable);
}
