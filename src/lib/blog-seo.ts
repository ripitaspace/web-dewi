export type BlogSeoFaq = { question: string; answer: string };

export type BlogSeoOverride = {
  /** Search-facing title and visible H1, written the way people phrase the query. */
  title: string;
  description: string;
  keywords: string[];
  faq: BlogSeoFaq[];
};

/** Hand-written SEO for articles whose Notion title/excerpt are not search-oriented. Keyed by slug. */
export const BLOG_SEO_OVERRIDES: Record<string, BlogSeoOverride> = {
  "Cancel-Chubb": {
    title: "Cara Batalkan Asuransi Chubb Dental Care Plan via Halo BCA",
    description:
      "Bingung cara batalin asuransi Chubb? Panduan langkah demi langkah: template email ke Halo BCA, script telepon CS Chubb 14087, masa mempelajari polis 15 hari, dan bukti yang harus disimpan.",
    keywords: [
      "cara batalin asuransi chubb",
      "cara membatalkan asuransi chubb",
      "batalkan chubb dental care plan",
      "pembatalan polis chubb halo bca",
      "cancel asuransi chubb",
      "nomor cs chubb",
      "masa mempelajari polis 15 hari",
      "email pembatalan asuransi chubb",
    ],
    faq: [
      {
        question: "Bagaimana cara membatalkan asuransi Chubb Dental Care Plan dari Halo BCA?",
        answer:
          "Kirim email pembatalan ke halobca@bca.co.id dengan CC contact.id@chubb.com, lalu telepon Halo BCA di 1500888. Jika diarahkan, hubungi CS Chubb lewat sambungan 14087. Catat nama CS dan nomor laporan, lalu minta konfirmasi tertulis.",
      },
      {
        question: "Apakah polis Chubb tetap harus dibatalkan jika premi belum terdebit?",
        answer:
          "Ya. Polis yang sudah terbit tetap perlu dibatalkan secara resmi, walaupun premi belum terdebit. Minta bukti tertulis bahwa pembatalan diterima dan tidak ada penagihan atau autodebit berikutnya.",
      },
      {
        question: "Berapa lama masa mempelajari polis Chubb?",
        answer:
          "Berdasarkan ketentuan polis, ada waktu 15 hari kalender sejak dokumen polis diterima untuk mengajukan pembatalan dalam masa mempelajari polis. Sebutkan hal ini saat email atau telepon.",
      },
      {
        question: "Data apa yang perlu disiapkan saat menelepon untuk membatalkan Chubb?",
        answer:
          "Siapkan nama lengkap, tanggal lahir, alamat, nama ibu kandung, NIK, nomor polis, dan nama perusahaan asuransi PT Chubb General Insurance Indonesia.",
      },
      {
        question: "Bukti apa yang harus disimpan setelah mengajukan pembatalan?",
        answer:
          "Simpan screenshot email terkirim dan balasannya, riwayat telepon, nomor laporan, konfirmasi pembatalan polis, serta bukti tidak ada autodebit atau penagihan.",
      },
    ],
  },
};

export function getBlogSeoOverride(slug: string): BlogSeoOverride | undefined {
  return BLOG_SEO_OVERRIDES[slug];
}
