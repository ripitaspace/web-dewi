export interface ThoughtItem {
  id: string;
  title: string;
  category: "Business Systems" | "Accounting" | "Technology" | "Education" | "Creative Thinking" | string;
  format: "Essay" | "Framework" | "Question" | "Field Note" | string;
  date: string;
  readingTime: number;
  status: string;
  excerpt: string;
  tags: string[];
}

export interface WorkItem {
  id: string;
  title: string;
  category: string;
  status: string;
  statusClass: "prototype" | "active" | "concept" | "ongoing";
  problem: string;
  insight: string;
  form: string;
  related: string;
  next: string;
}

export interface ProductItem {
  id: string;
  title: string;
  type: string;
  price: string;
  problem: string;
  audience: string;
  format: string;
  duration: string;
}

export interface FocusItem {
  title: string;
  status: string;
  className: "active" | "prototype" | "concept" | "ongoing";
}

export interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
}

export interface EcoNode {
  title: string;
  purpose: string;
  products: string[];
  status: string;
}

export const ROUTE_ORDER = [
  { key: "beranda", label: "Beranda", path: "/", num: "01" },
  { key: "tentang", label: "Tentang", path: "/tentang", num: "02" },
  { key: "pemikiran", label: "Pemikiran", path: "/pemikiran", num: "03" },
  { key: "karya", label: "Karya", path: "/karya", num: "04" },
  { key: "belajar", label: "Belajar", path: "/belajar", num: "05" },
  { key: "kerja-bersama", label: "Kerja Bersama", path: "/kerja-bersama", num: "06" },
  { key: "ripita", label: "RIPITA", path: "/ripita", num: "07" },
] as const;

export const CHAPTERS = [
  {
    id: "world",
    number: "Bab 01",
    title: "Cara Aku Melihat Dunia",
    lead: "Aku sering melihat pekerjaan bukan sebagai daftar tugas, tetapi sebagai hubungan antara keputusan, manusia, dokumen, informasi, dan konsekuensi.",
    quote: "“Ketika sesuatu terlihat berantakan, biasanya ada pola yang belum ditemukan.”",
    note: "[Draft narasi personal akan dilengkapi di Notion.]",
  },
  {
    id: "questions",
    number: "Bab 02",
    title: "Hal yang Selalu Membuatku Bertanya",
    lead: "Mengapa organisasi terus menambah pekerjaan, tetapi jarang mengurangi kebingungan? Mengapa laporan tersedia, tetapi keputusan tetap dibuat tanpa pemahaman?",
    note: "[Tambahkan daftar pertanyaan yang menjadi sumber proyek dan tulisan.]",
  },
  {
    id: "numbers",
    number: "Bab 03",
    title: "Dari Angka Menuju Sistem",
    lead: "Accounting membantuku melihat jejak. Konsultasi membawaku melihat konteks. Technology membuatku bertanya apakah pemahaman itu dapat dijadikan sistem.",
    note: "[Tambahkan perjalanan pendidikan, pengalaman, dan peralihan menuju product building.]",
  },
  {
    id: "why-ripita",
    number: "Bab 04",
    title: "Mengapa Aku Membangun RIPITA",
    lead: "Karena pengetahuan seharusnya tidak berhenti sebagai teori, file pribadi, atau pengalaman yang hanya dimiliki satu orang.",
    note: "RIPITA menjadi tempat pengalaman kerja, proses bisnis, produk digital, tools, education, dan community memperoleh bentuk yang dapat dipakai.",
  },
  {
    id: "indonesia",
    number: "Bab 05",
    title: "Indonesia yang Ingin Kubawa ke Dunia",
    lead: "Indonesia yang tidak hanya tampil melalui ornamentasi, tetapi melalui keluwesan, kecerdasan membaca konteks, kemampuan membangun hubungan, dan keberanian menciptakan sistem sendiri.",
    note: "[Tambahkan narasi aspirasi global dan posisi profesional Indonesia.]",
  },
  {
    id: "next",
    number: "Bab 06",
    title: "Apa yang Sedang Kubangun Berikutnya",
    lead: "Sebuah ekosistem accounting, technology, education, product, dan community yang memungkinkan pengetahuan profesional tumbuh melampaui satu perusahaan atau satu negara.",
    note: "Menyambungkan setiap simpul pengetahuan menjadi dampak nyata.",
    cta: { label: "Lihat Peta RIPITA", path: "/ripita" },
  },
];

export const THOUGHTS: ThoughtItem[] = [
  {
    id: "systems-grow",
    title: "Mengapa bisnis bisa tumbuh tetapi sistemnya semakin rapuh?",
    category: "Business Systems",
    format: "Essay",
    date: "2026-08-05",
    readingTime: 7,
    status: "Pemikiran Terbuka",
    excerpt: "Pertumbuhan sering menambah transaksi lebih cepat daripada kemampuan organisasi memahami prosesnya.",
    tags: ["business", "systems", "operations"],
  },
  {
    id: "cash-profit",
    title: "Laba dan kas sedang menceritakan dua hal yang berbeda",
    category: "Accounting",
    format: "Framework",
    date: "2026-07-16",
    readingTime: 5,
    status: "Framework Awal",
    excerpt: "Perbedaan laba dan kas bukan hanya masalah angka, tetapi jejak dari keputusan, timing, dan struktur kerja.",
    tags: ["cashflow", "accounting", "decision"],
  },
  {
    id: "flexible-system",
    title: "Seberapa fleksibel sebuah sistem boleh dibangun?",
    category: "Technology",
    format: "Question",
    date: "2026-07-12",
    readingTime: 4,
    status: "Masih Diuji",
    excerpt: "Terlalu kaku membuat sistem ditolak manusia. Terlalu fleksibel membuatnya kehilangan kontrol.",
    tags: ["product", "technology", "ux"],
  },
  {
    id: "professional-learning",
    title: "Mengapa pendidikan profesional perlu lebih dekat dengan pekerjaan nyata",
    category: "Education",
    format: "Essay",
    date: "2026-06-27",
    readingTime: 8,
    status: "Essay Draft",
    excerpt: "Kompetensi tidak tumbuh hanya dari teori atau praktik, tetapi dari hubungan yang jelas di antara keduanya.",
    tags: ["education", "professional", "accounting"],
  },
  {
    id: "visual-thinking",
    title: "Visual bukan hiasan; ia membantu manusia memahami struktur",
    category: "Creative Thinking",
    format: "Field Note",
    date: "2026-06-11",
    readingTime: 3,
    status: "Catatan Lapangan",
    excerpt: "Diagram, route map, dan hierarchy dapat memperlihatkan hubungan yang sulit dijelaskan oleh paragraf panjang.",
    tags: ["visual", "design", "thinking"],
  },
  {
    id: "small-tools",
    title: "Tidak semua masalah membutuhkan software yang besar",
    category: "Technology",
    format: "Framework",
    date: "2026-05-28",
    readingTime: 6,
    status: "Framework Awal",
    excerpt: "Kadang pekerjaan hanya membutuhkan aturan penamaan, urutan tindakan, dan alat kecil yang sangat spesifik.",
    tags: ["tools", "automation", "ripita"],
  },
];

export const WORKS: WorkItem[] = [
  {
    id: "ripitax",
    title: "RIPITAX",
    category: "Tax Technology",
    status: "Prototype",
    statusClass: "prototype",
    problem: "File faktur pajak dalam jumlah besar sulit diunduh, dikelompokkan, dan diberi nama secara konsisten.",
    insight: "Pekerjaan repetitif tidak selalu membutuhkan software besar. Ia membutuhkan alur dan aturan yang dapat dipercaya.",
    form: "Downloader, document naming system, ZIP organizer, dan prototype rekap.",
    related: "RIPITA Tax",
    next: "Pengujian proses massal, integrasi ekstraksi data, dan penyimpanan riwayat dokumen.",
  },
  {
    id: "mangde-logistics",
    title: "Mangde Logistics System",
    category: "Logistics Systems",
    status: "Ongoing",
    statusClass: "ongoing",
    problem: "Quotation, rute, vendor, dokumen, biaya, tracking, pembayaran, dan billing berjalan sebagai potongan proses terpisah.",
    insight: "Satu pekerjaan logistik perlu dibaca sebagai perjalanan yang memiliki banyak leg, pihak, bukti, dan keputusan.",
    form: "Route pricing, quotation, shipment tracking, vendor update, payment calendar, dan control tower.",
    related: "RIPITA Logistics",
    next: "Validasi data rute, pricing aktual, integrasi dokumen, dan workflow approval.",
  },
  {
    id: "vendor-management",
    title: "Vendor & Customer Management",
    category: "Business Systems",
    status: "Concept",
    statusClass: "concept",
    problem: "Vendor, dokumen, kinerja, pembayaran, dan komunikasi sering tersimpan pada tempat berbeda.",
    insight: "Vendor management tidak boleh berdiri sendiri; ia perlu terhubung dengan transaksi dan kalender pembayaran.",
    form: "Vendor profile, kanban status, compliance, performance, CRM, dan payment connection.",
    related: "RIPITA Vendor & Customer",
    next: "Menentukan master data, scoring, dan relasi dengan payment voucher.",
  },
  {
    id: "warkop",
    title: "Warkop Stock & Shift System",
    category: "Internal Operations",
    status: "Internal Experiment",
    statusClass: "prototype",
    problem: "Pencatatan penjualan dan stok dua shift perlu tetap sederhana, dapat dicetak, dan mudah direkonsiliasi.",
    insight: "Sistem yang baik tidak selalu digital penuh; bentuknya harus sesuai kemampuan operasional pengguna.",
    form: "Kartu stok, catatan penjualan per shift, opname, dan analisis selisih.",
    related: "RIPITA Small Business Tools",
    next: "Menguji format input sederhana dan rekonsiliasi otomatis.",
  },
  {
    id: "assessment-engine",
    title: "Flexible Assessment Engine",
    category: "Education & Knowledge",
    status: "Concept",
    statusClass: "concept",
    problem: "Materi assessment berbeda-beda, tetapi platform perlu mendukung banyak gaya pertanyaan, scoring, analisis, dan rekomendasi.",
    insight: "Struktur assessment harus memisahkan konten, metode pengukuran, scoring, interpretasi, dan recommendation rules.",
    form: "Question builder, scoring logic, result analysis, report, dan product recommendation.",
    related: "RIPITA Assessment",
    next: "Mendefinisikan data model yang dapat berkembang dari kuis hingga analisis bisnis.",
  },
];

export const PRODUCTS: ProductItem[] = [
  {
    id: "cash-checklist",
    title: "Checklist Laba vs Kas",
    type: "Checklist",
    price: "Gratis",
    problem: "Membantu owner mengidentifikasi mengapa omzet atau laba tidak terlihat sebagai uang tersedia.",
    audience: "Owner dan tim finance awal",
    format: "PDF + worksheet",
    duration: "15–30 menit",
  },
  {
    id: "finance-workbook",
    title: "Finance Process Mapping Workbook",
    type: "Workbook",
    price: "Rp149.000",
    problem: "Membantu memetakan alur transaksi, dokumen, approval, dan titik kebingungan.",
    audience: "Finance lead dan consultant",
    format: "Workbook digital",
    duration: "1–2 jam",
  },
  {
    id: "seller-calculator",
    title: "Marketplace Seller Price Calculator",
    type: "Calculator",
    price: "Prototype",
    problem: "Membandingkan harga jual dan biaya seller pada beberapa marketplace.",
    audience: "Online seller",
    format: "Interactive tool",
    duration: "5–10 menit",
  },
  {
    id: "vendor-kit",
    title: "Vendor Management Starter Kit",
    type: "System Kit",
    price: "Segera hadir",
    problem: "Menyusun master vendor, compliance, evaluasi, dan hubungan pembayaran.",
    audience: "Procurement dan finance",
    format: "Template + guide",
    duration: "2–4 jam",
  },
  {
    id: "assessment",
    title: "Business System Readiness Assessment",
    type: "Assessment",
    price: "Gratis",
    problem: "Menemukan area proses yang paling membutuhkan struktur atau sistem baru.",
    audience: "Business owner",
    format: "Online assessment",
    duration: "8 menit",
  },
  {
    id: "content-framework",
    title: "Professional Content Thinking Framework",
    type: "Framework",
    price: "Rp89.000",
    problem: "Mengubah pengalaman profesional menjadi konten yang memiliki sudut pandang dan nilai belajar.",
    audience: "Professional creator",
    format: "Guide + prompts",
    duration: "45 menit",
  },
];

export const FOCUS_ITEMS: FocusItem[] = [
  { title: "RIPITA Logistics", status: "Active Prototype", className: "active" },
  { title: "RIPITAX", status: "Prototype", className: "prototype" },
  { title: "Vendor & Customer Management", status: "Concept", className: "concept" },
  { title: "Knowledge & Assessment System", status: "Being Designed", className: "ongoing" },
  { title: "PUSPITA Personal Ecosystem", status: "Current Build", className: "active" },
];

export const SERVICES: ServiceItem[] = [
  {
    id: "exploration",
    name: "Perkenalan & Eksplorasi",
    duration: "30 menit",
    price: "Tanpa biaya",
    description: "Untuk saling mengenal konteks dan melihat apakah ada ruang kerja bersama.",
  },
  {
    id: "business-system",
    name: "Konsultasi Sistem Bisnis",
    duration: "60 menit",
    price: "Harga menyusul",
    description: "Membahas proses, data, dokumen, peran, dan peluang perbaikan sistem.",
  },
  {
    id: "accounting",
    name: "Accounting & Finance Discussion",
    duration: "60 menit",
    price: "Harga menyusul",
    description: "Membahas laporan, alur finance, kontrol, atau kebutuhan tools accounting.",
  },
  {
    id: "product",
    name: "Product & Technology Collaboration",
    duration: "45 menit",
    price: "Diskusi awal",
    description: "Untuk ide produk, prototype, integration, atau partnership.",
  },
  {
    id: "speaking",
    name: "Speaking & Education",
    duration: "30 menit",
    price: "Diskusi awal",
    description: "Untuk kelas, seminar, workshop, atau institutional collaboration.",
  },
];

export const ECOSYSTEM: Record<string, EcoNode> = {
  core: {
    title: "RIPITA Core",
    purpose: "Menghubungkan pengetahuan, produk, user, transaksi, operasional, dan pengembangan sebagai satu ekosistem.",
    products: ["Shared account", "Product catalog", "Booking", "Assessment", "Knowledge library"],
    status: "Ecosystem Concept",
  },
  finance: {
    title: "Finance & Accounting",
    purpose: "Membantu organisasi memahami transaksi, approval, cash flow, reporting, dan hubungan antarproses.",
    products: ["Payment Voucher", "Payment Calendar", "Cash Flow Tools", "Accounting Workflows"],
    status: "Concept & Prototype",
  },
  tax: {
    title: "Tax",
    purpose: "Mengurangi pekerjaan repetitif dan meningkatkan konsistensi pengelolaan dokumen pajak.",
    products: ["RIPITAX Downloader", "Tax Document Organizer", "Invoice Extraction"],
    status: "Active Prototype",
  },
  logistics: {
    title: "Logistics",
    purpose: "Menghubungkan quotation, rute, vendor, dokumen, tracking, biaya, dan billing dalam satu perjalanan pekerjaan.",
    products: ["Route Pricing", "Shipment", "Control Tower", "Vendor Updates", "Payment Calendar"],
    status: "Active Prototype",
  },
  vendor: {
    title: "Vendor & Customer",
    purpose: "Mengelola profil, dokumen, status, kinerja, komunikasi, transaksi, dan hubungan jangka panjang.",
    products: ["Vendor Management", "Customer Management", "CRM", "Compliance"],
    status: "Concept",
  },
  education: {
    title: "Education",
    purpose: "Membawa teori profesional lebih dekat dengan proses dan keputusan di dunia kerja.",
    products: ["Mini Course", "Workbook", "Learning Path", "Professional Programs"],
    status: "Planned",
  },
  knowledge: {
    title: "Knowledge & Assessment",
    purpose: "Mengubah pemikiran menjadi artikel, framework, assessment, rekomendasi, dan resource yang dapat digunakan.",
    products: ["Knowledge Library", "Assessment Engine", "Recommendation Rules", "Digital Products"],
    status: "Being Designed",
  },
  projects: {
    title: "Projects & Operations",
    purpose: "Menghubungkan pekerjaan, owner, status, waktu, risiko, dokumen, dan keputusan.",
    products: ["Project Tracker", "Kanban", "Operating Calendar", "Document Studio"],
    status: "Prototype",
  },
};

export function formatIdDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${isoDate}T12:00:00`));
  } catch {
    return isoDate;
  }
}
