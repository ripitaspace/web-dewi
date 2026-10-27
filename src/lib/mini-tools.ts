export type MiniToolStatus = "available" | "maintenance";

export interface MiniTool {
  number: string;
  category: "Business Essentials" | "Finance Essentials" | "Tax Essentials" | "Audit Essentials" | "Document Essentials" | "Kalkulator";
  title: string;
  description: string;
  icon: string;
  iconSrc?: string;
  status: MiniToolStatus;
  href: string;
}

export const MINI_TOOL_FILTERS = [
  { value: "Kalkulator", label: "Kalkulator" },
  { value: "Business Essentials", label: "Business" },
  { value: "Finance Essentials", label: "Finance" },
  { value: "Tax Essentials", label: "Tax" },
  { value: "Audit Essentials", label: "Audit" },
  { value: "Document Essentials", label: "Document" },
] as const;

export const MINI_TOOLS: MiniTool[] = [
  { number: "09", category: "Tax Essentials", title: "Coretax Invoice Scraper & Renamer", description: "Ekstrak data dan rename faktur pajak.", icon: "▤", iconSrc: "/images/artworks/tool-coretax-scraper.png", status: "available", href: "/karya/pajak/coretax" },
  { number: "01", category: "Business Essentials", title: "Quotation Generator", description: "Membuat surat penawaran harga.", icon: "“", iconSrc: "/images/artworks/tool-quotation-generator.png", status: "available", href: "/karya/tools/quotation-generator" },
  { number: "02", category: "Business Essentials", title: "Invoice Generator", description: "Membuat invoice atau tagihan pelanggan.", icon: "▤", iconSrc: "/images/artworks/tool-invoice-generator.png", status: "maintenance", href: "/karya/tools/invoice-generator" },
  { number: "03", category: "Business Essentials", title: "Kuitansi Generator", description: "Membuat bukti penerimaan pembayaran.", icon: "✓", iconSrc: "/images/artworks/tool-kuitansi-generator.png", status: "maintenance", href: "/karya/tools/kuitansi-generator" },
  { number: "04", category: "Business Essentials", title: "Purchase Order Generator", description: "Membuat surat pesanan pembelian.", icon: "↗", iconSrc: "/images/artworks/tool-purchase-order.png", status: "maintenance", href: "/karya/tools/purchase-order-generator" },
  { number: "05", category: "Business Essentials", title: "Surat Jalan Generator", description: "Membuat dokumen pengiriman barang.", icon: "→", iconSrc: "/images/artworks/tool-surat-jalan.png", status: "maintenance", href: "/karya/tools/surat-jalan-generator" },
  { number: "06", category: "Finance Essentials", title: "Bukti Kas & Bank Generator", description: "Membuat bukti kas/bank masuk dan keluar.", icon: "↔", iconSrc: "/images/artworks/tool-bukti-kas-bank.png", status: "maintenance", href: "/karya/tools/bukti-kas-bank-generator" },
  { number: "07", category: "Finance Essentials", title: "Kas & Pengeluaran Tracker", description: "Membuat rekap kas dan pengeluaran dari Excel.", icon: "⌁", iconSrc: "/images/artworks/tool-cash-tracker.png", status: "maintenance", href: "/karya/tools/kas-pengeluaran-tracker" },
  { number: "08", category: "Finance Essentials", title: "Laporan Keuangan Sederhana", description: "Membuat laba rugi dan neraca dari data terstruktur.", icon: "≋", iconSrc: "/images/artworks/tool-financial-report.png", status: "maintenance", href: "/karya/tools/laporan-keuangan-sederhana" },
  { number: "10", category: "Tax Essentials", title: "PPN Calculator", description: "Menghitung PPN keluaran, masukan, dan nilai transaksi.", icon: "%", iconSrc: "/images/artworks/tool-ppn-calculator.png", status: "maintenance", href: "/karya/tools/ppn-calculator" },
  { number: "22", category: "Kalkulator", title: "Bea Cukai Calculator", description: "Baru pulang dari luar negeri? Hitung perkiraan bea masuk dan pajak belanjaanmu sebelum tiba di Indonesia.", icon: "✈", iconSrc: "/images/artworks/tool-bea-cukai-calculator.png", status: "available", href: "/karya/tools/kalkulator-bea-cukai" },
  { number: "13", category: "Tax Essentials", title: "Extension Download Faktur Otomatis", description: "Membantu mengunduh Faktur Pajak secara otomatis dari Coretax.", icon: "↓", status: "available", href: "/karya/tools/extension-download-faktur-otomatis" },
  { number: "18", category: "Tax Essentials", title: "Download Faktur untuk Laptop Kentang", description: "Unduh Faktur Pajak dari Coretax dengan bookmarklet ringan untuk browser desktop.", icon: "↓", iconSrc: "/images/artworks/laptop-kentang-ripita-mark.png", status: "available", href: "/karya/tools/download-faktur-laptop-kentang" },
  { number: "19", category: "Tax Essentials", title: "Download Bukti Potong Otomatis", description: "Unduh PDF bukti potong Coretax secara berurutan dari tabel yang sedang dibuka.", icon: "↓", iconSrc: "/images/artworks/tool-download-bupot.png", status: "available", href: "/karya/tools/download-bukti-potong-otomatis" },
  { number: "20", category: "Tax Essentials", title: "Cetak BUPOT", description: "Buat dokumen BUPOT dari ekspor Excel Coretax dengan cap RIPITA yang jelas.", icon: "▧", iconSrc: "/images/artworks/tool-cetak-bupot.png", status: "available", href: "/karya/tools/cetak-bupot" },
  { number: "14", category: "Tax Essentials", title: "PPH 21 Calculator", description: "Payroll lokal untuk banyak penerima: hitung PPh 21/26 dan cetak slip atau bukti pembayaran.", icon: "₨", iconSrc: "/images/artworks/tool-pph21-calculator.png", status: "available", href: "/karya/tools/pph-21-calculator" },
  { number: "11", category: "Audit Essentials", title: "Confirmation Generator", description: "Membuat surat konfirmasi audit bank, utang, dan piutang.", icon: "✓", iconSrc: "/images/artworks/tool-confirmation.png", status: "maintenance", href: "/karya/tools/confirmation-generator" },
  { number: "12", category: "Audit Essentials", title: "Sampling Picker", description: "Memilih sampel audit dari data Excel atau CSV.", icon: "⊙", iconSrc: "/images/artworks/tool-sampling-picker.png", status: "maintenance", href: "/karya/tools/sampling-picker" },
  { number: "15", category: "Document Essentials", title: "Compress Data", description: "Mengecilkan ukuran file data agar lebih ringkas untuk disimpan atau dibagikan.", icon: "⇣", iconSrc: "/images/artworks/tool-compress-data.png", status: "maintenance", href: "/karya/tools/compress-data" },
  { number: "16", category: "Document Essentials", title: "Compile Dokumen", description: "Menggabungkan PDF dan gambar menjadi satu file yang rapi.", icon: "▣", iconSrc: "/images/artworks/tool-compile-dokumen.png", status: "available", href: "/karya/tools/compile-dokumen" },
  { number: "17", category: "Document Essentials", title: "Digital Signing", description: "Membubuhkan tanda tangan digital pada dokumen secara praktis.", icon: "✦", iconSrc: "/images/artworks/tool-digital-signing.png", status: "maintenance", href: "/karya/tools/digital-signing" },
  { number: "21", category: "Document Essentials", title: "Makalah Generator", description: "Membantu menyusun makalah menjadi dokumen yang rapi dan terstruktur.", icon: "✎", iconSrc: "/images/artworks/tool-makalah-generator.png", status: "available", href: "/karya/tools/makalah-generator" },
];
