export type SystemStateType = "loading" | "404" | "500" | "offline" | "empty";

// All visitor-facing copy and illustration paths live here. A dedicated 404 PNG
// can replace loading.png later without changing the page or the decorative type.
export const SYSTEM_STATES = {
  loading: {
    eyebrow: "A LITTLE MOMENT",
    title: "Sedang menyelam...",
    description: "Bandeng dan Udang lagi menyiapkan semuanya. Sebentar lagi ya!",
    image: "/images/mascots/loading.png",
    alt: "Bandeng bermotif batik dan Udang menyelam bersama di antara gelembung.",
  },
  "404": {
    eyebrow: "LOST IN THE OCEAN",
    title: "Lho, kok nyasar?",
    description: "Sepertinya halaman yang kamu cari terbawa arus. Yuk, kita cari jalan pulang!",
    image: "/images/mascots/loading.png",
    alt: "Bandeng dan Udang mencari jalan pulang di antara ombak Nusantara.",
  },
  "500": {
    eyebrow: "UNDER REPAIR",
    title: "Waduh, mesinnya lagi rewel.",
    description: "Udang lagi membenahi sesuatu di balik layar. Coba lagi sebentar, ya!",
    image: "/images/mascots/error-500.png",
    alt: "Udang membenahi mesin kecil bersama Bandeng.",
  },
  offline: {
    eyebrow: "CONNECTION LOST",
    title: "Koneksinya lagi hanyut.",
    description: "Bandeng kehilangan arus internet. Periksa koneksimu, lalu kita coba berlayar lagi!",
    image: "/images/mascots/offline.png",
    alt: "Bandeng dan Udang berusaha menyambungkan kembali koneksi yang terputus.",
  },
  empty: {
    eyebrow: "NOTHING HERE YET",
    title: "Masih sepi di sini.",
    description: "Belum ada apa-apa di tempat ini. Tapi setiap hal besar selalu dimulai dari sesuatu yang kecil.",
    image: "/images/mascots/empty.png",
    alt: "Bandeng dan Udang menengok keranjang kosong dengan tunas kecil di sisinya.",
  },
} as const;

export const CONNECTION_COPY = {
  checking: "Sedang memeriksa koneksi…",
  online: "Koneksi tersedia. Siap berlayar!",
  offline: "Perangkat sedang offline.",
  unreachable: "Situs belum dapat dijangkau. Periksa koneksi, lalu coba lagi.",
  "server-error": "Internet terhubung, tetapi layanan sedang bermasalah.",
} as const;
export type ConnectionStatus = keyof typeof CONNECTION_COPY;
