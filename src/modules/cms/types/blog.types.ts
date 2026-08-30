export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Raw block content for react-notion-x fallback
  date: string;
  author: string;
  category: string;
  type: "pemikiran" | "karya" | "belajar" | "tentang" | string;
  topics: string[];
  image: string;
  recordMap?: any; // For react-notion-x
}

export interface TentangChapter {
  id: string;
  number: string;
  title: string;
  lead: string;
  quote?: string;
  note?: string;
  content: string;
}

export interface TentangPageData {
  title: string;
  lead: string;
  image: string;
  chapters: TentangChapter[];
}

export const fallbackTentangData: TentangPageData = {
  title: "Bukan biografi. Ini cerita tentang bagaimana cara berpikirku terbentuk.",
  lead: "Dari angka menuju proses, dari proses menuju sistem, dan dari sistem menuju ekosistem yang dapat digunakan banyak orang.",
  image: "/images/artworks/javan-leopard-gouache.png",
  chapters: [
    {
      id: "world",
      number: "Bab 01",
      title: "Cara Aku Melihat Dunia",
      lead: "Aku sering melihat pekerjaan bukan sebagai daftar tugas, tetapi sebagai hubungan antara keputusan, manusia, dokumen, informasi, dan konsekuensi.",
      quote: "“Ketika sesuatu terlihat berantakan, biasanya ada pola yang belum ditemukan.”",
      content: "Aku sering melihat pekerjaan bukan sebagai daftar tugas, tetapi sebagai hubungan antara keputusan, manusia, dokumen, informasi, dan konsekuensi.",
    },
    {
      id: "questions",
      number: "Bab 02",
      title: "Hal yang Selalu Membuatku Bertanya",
      lead: "Mengapa organisasi terus menambah pekerjaan, tetapi jarang mengurangi kebingungan? Mengapa laporan tersedia, tetapi keputusan tetap dibuat tanpa pemahaman?",
      content: "Mengapa organisasi terus menambah pekerjaan, tetapi jarang mengurangi kebingungan? Mengapa laporan tersedia, tetapi keputusan tetap dibuat tanpa pemahaman?",
    },
    {
      id: "numbers",
      number: "Bab 03",
      title: "Dari Angka Menuju Sistem",
      lead: "Accounting membantuku melihat jejak. Konsultasi membawaku melihat konteks. Technology membuatku bertanya apakah pemahaman itu dapat dijadikan sistem.",
      content: "Accounting membantuku melihat jejak. Konsultasi membawaku melihat konteks. Technology membuatku bertanya apakah pemahaman itu dapat dijadikan sistem.",
    },
    {
      id: "why-ripita",
      number: "Bab 04",
      title: "Mengapa Aku Membangun RIPITA",
      lead: "Karena pengetahuan seharusnya tidak berhenti sebagai teori, file pribadi, atau pengalaman yang hanya dimiliki satu orang.",
      content: "RIPITA menjadi tempat pengalaman kerja, proses bisnis, produk digital, tools, education, dan community memperoleh bentuk yang dapat dipakai.",
    },
    {
      id: "indonesia",
      number: "Bab 05",
      title: "Indonesia yang Ingin Kubawa ke Dunia",
      lead: "Indonesia yang tidak hanya tampil melalui ornamentasi, tetapi melalui keluwesan, kecerdasan membaca konteks, kemampuan membangun hubungan, dan keberanian menciptakan sistem sendiri.",
      content: "Indonesia yang tidak hanya tampil melalui ornamentasi, tetapi melalui keluwesan, kecerdasan membaca konteks, kemampuan membangun hubungan, dan keberanian menciptakan sistem sendiri.",
    },
    {
      id: "next",
      number: "Bab 06",
      title: "Apa yang Sedang Kubangun Berikutnya",
      lead: "Sebuah ekosistem accounting, technology, education, product, dan community yang memungkinkan pengetahuan profesional tumbuh melampaui satu perusahaan atau satu negara.",
      content: "Sebuah ekosistem accounting, technology, education, product, dan community yang memungkinkan pengetahuan profesional tumbuh melampaui satu perusahaan atau satu negara.",
    },
  ],
};
