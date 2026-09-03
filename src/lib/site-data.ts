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
