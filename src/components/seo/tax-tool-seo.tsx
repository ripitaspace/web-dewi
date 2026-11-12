import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export type TaxToolSeoKey =
  | "coretax"
  | "spt-op"
  | "cetak-bupot"
  | "pph-21-calculator"
  | "extension-download-faktur-otomatis"
  | "download-faktur-laptop-kentang"
  | "download-bukti-potong-otomatis";

type TaxToolContent = {
  title: string;
  metadataTitle?: string;
  heading?: string;
  guideTitle?: string;
  path: string;
  description: string;
  steps: string[];
  faqs: Array<{ question: string; answer: string }>;
  alternative?: { href: string; label: string };
};

const tools: Record<TaxToolSeoKey, TaxToolContent> = {
  coretax: {
    title: "Coretax Invoice Scraper",
    path: "/karya/pajak/coretax",
    description: "Membantu mengekstrak detail barang dari faktur pajak PDF agar data lebih mudah diperiksa dan direkap.",
    steps: ["Masukkan PDF, ZIP, atau folder faktur yang ingin diperiksa.", "Tinjau data barang dan dokumen pada workspace.", "Unduh rekap Excel atau arsip PDF dengan nama yang lebih rapi."],
    faqs: [
      { question: "Apakah faktur diunggah ke server?", answer: "Tidak. Pemrosesan dilakukan di browser dan data sesi hilang saat halaman dimuat ulang." },
      { question: "Apakah hasil ekstraksi menggantikan pengecekan dokumen?", answer: "Tidak. Gunakan hasilnya sebagai bantuan rekap dan tetap periksa dokumen sumber sebelum dipakai." },
    ],
  },
  "spt-op": {
    title: "SPT Orang Pribadi",
    path: "/karya/tools/spt-op",
    description: "Ruang kerja untuk menyiapkan data, lampiran, dan draft SPT Tahunan Orang Pribadi secara lebih terstruktur.",
    steps: ["Lengkapi data pada formulir dan lampiran yang relevan.", "Simpan draft lokal untuk melanjutkan pekerjaan berikutnya.", "Tinjau kembali sebelum mengimpor atau mencetak persiapan."],
    faqs: [
      { question: "Apakah tool ini mengirimkan SPT?", answer: "Tidak. Tool ini membantu tahap persiapan; pelaporan dilakukan pada kanal resmi yang berlaku." },
      { question: "Di mana data disimpan?", answer: "Draft diproses dan disimpan secara lokal di perangkat sesuai pilihan pengguna." },
    ],
  },
  "cetak-bupot": {
    title: "Cetak BUPOT",
    path: "/karya/tools/cetak-bupot",
    description: "Membantu menyiapkan dokumen acuan BUPOT dari ekspor Excel Coretax langsung di browser.",
    steps: ["Siapkan ekspor Excel dari sumber data Anda.", "Masukkan data ke ruang kerja Cetak BUPOT.", "Tinjau hasil sebelum menyimpan dokumen acuan."],
    faqs: [
      { question: "Apakah ini menggantikan dokumen resmi?", answer: "Tidak. Hasilnya adalah dokumen acuan kerja dan tetap perlu dicocokkan dengan data serta ketentuan resmi." },
      { question: "Apakah file diproses secara lokal?", answer: "Ya, proses kerja berlangsung di browser." },
    ],
  },
  "pph-21-calculator": {
    title: "Payroll & PPh 21 Studio",
    path: "/karya/tools/pph-21-calculator",
    description: "Ruang kerja untuk menelusuri penghasilan, PPh 21/26, slip pembayaran, dan XML Coretax.",
    steps: ["Masukkan data penerima dan komponen penghasilan.", "Tinjau perhitungan serta data pendukungnya.", "Siapkan slip atau XML setelah verifikasi internal."],
    faqs: [
      { question: "Apakah hasil hitung langsung menjadi bukti pelaporan?", answer: "Tidak. Selalu lakukan verifikasi terhadap data, status wajib pajak, dan ketentuan yang berlaku." },
      { question: "Untuk apa XML disiapkan?", answer: "XML membantu menyiapkan data untuk proses lanjutan sesuai kebutuhan pengguna." },
    ],
  },
  "extension-download-faktur-otomatis": {
    title: "Download Faktur Pajak Coretax Otomatis",
    path: "/karya/tools/extension-download-faktur-otomatis",
    description: "Panduan bookmarklet untuk membantu menjalankan klik download Faktur Pajak Keluaran dan Pajak Masukan secara berurutan dari tabel Coretax yang sedang dibuka.",
    guideTitle: "Cara download faktur Coretax secara otomatis",
    steps: [
      "Simpan bookmarklet pada Bookmark Bar browser desktop, lalu login ke Coretax.",
      "Buka tabel Pajak Keluaran atau Pajak Masukan dan pastikan nomor faktur serta tombol download terlihat pada halaman aktif.",
      "Jalankan bookmarklet sekali untuk memicu unduhan berurutan, lalu periksa progres dan daftar Download browser sebelum memproses halaman berikutnya.",
    ],
    faqs: [
      { question: "Apakah bookmarklet dapat dipakai untuk Pajak Masukan dan Pajak Keluaran?", answer: "Ya. Jalankan dari tabel Coretax yang sedang aktif setelah nomor faktur dan tombol download terlihat." },
      { question: "Apa yang dilakukan jika browser meminta izin beberapa unduhan?", answer: "Tinjau izin browser terlebih dahulu. Setelah itu, periksa daftar Download untuk memastikan setiap file benar-benar tersimpan." },
      { question: "Mengapa ada faktur yang tidak ikut terunduh?", answer: "Bookmarklet hanya memicu tombol download yang terlihat pada halaman tabel aktif. Periksa baris terkait dan proses halaman berikutnya secara terpisah." },
    ],
    alternative: {
      href: "/karya/tools/download-faktur-laptop-kentang",
      label: "Laptop terasa lambat saat membuka Coretax? Coba panduan download faktur untuk laptop kentang.",
    },
  },
  "download-faktur-laptop-kentang": {
    title: "Download Faktur Coretax untuk Laptop Lemot",
    heading: "Download Faktur Coretax di Laptop Lemot",
    path: "/karya/tools/download-faktur-laptop-kentang",
    description: "Panduan penggunaan bookmarklet Coretax pada laptop dengan respons lambat, dengan fokus pada satu halaman tabel dan satu antrean download dalam satu waktu.",
    guideTitle: "Panduan bookmarklet saat laptop terasa lambat",
    steps: [
      "Gunakan satu tab Coretax untuk tabel yang sedang diproses. Hindari menjalankan bookmarklet kedua kali sebelum antrean dan daftar Download diperiksa.",
      "Jika Coretax menyediakan pilihan jumlah baris per halaman, pilih jumlah yang dapat Anda tinjau sekaligus dan jangan mengubahnya ketika antrean download sedang berjalan.",
      "Proses satu halaman tabel sampai selesai. Bila tab tidak merespons, tunggu proses browser selesai dan periksa unduhan terakhir sebelum memuat ulang atau mencoba kembali.",
    ],
    faqs: [
      { question: "Apakah mode Laptop Kentang memakai teknologi yang berbeda?", answer: "Tidak. Mode ini menggunakan bookmarklet yang sama dengan mode standar, tetapi panduannya ditujukan untuk mengatur proses secara lebih bertahap pada perangkat yang responsnya lambat." },
      { question: "Bagaimana jika tab Coretax tidak responsif?", answer: "Jangan memulai antrean kedua. Tunggu beberapa saat, periksa daftar Download, lalu verifikasi baris terakhir sebelum memuat ulang tab atau melanjutkan halaman berikutnya." },
      { question: "Apakah jumlah baris per halaman harus diubah?", answer: "Tidak ada angka yang berlaku untuk semua perangkat. Jika pengaturan tersedia di Coretax, pilih jumlah yang masih nyaman untuk Anda tinjau dan selesaikan satu halaman sebelum berpindah." },
    ],
    alternative: {
      href: "/karya/tools/extension-download-faktur-otomatis",
      label: "Menggunakan PC dengan performa normal? Lihat download faktur Coretax mode standar.",
    },
  },
  "download-bukti-potong-otomatis": {
    title: "Download Bukti Potong Otomatis",
    path: "/karya/tools/download-bukti-potong-otomatis",
    description: "Membantu mengunduh PDF bukti potong Coretax secara berurutan dari tabel yang sedang dibuka.",
    steps: ["Buka tabel bukti potong yang ingin diproses.", "Jalankan alat dari browser desktop.", "Cek kelengkapan file PDF hasil unduhan."],
    faqs: [
      { question: "Apakah semua file langsung valid untuk pelaporan?", answer: "Tidak. Kelengkapan dan ketepatan dokumen tetap menjadi tanggung jawab pengguna." },
      { question: "Apakah ada data yang dikirim ke PuspitaCore?", answer: "Tidak. Tool bekerja pada browser pengguna." },
    ],
  },
};

export function hasTaxToolSeo(slug: string): slug is TaxToolSeoKey {
  return slug in tools;
}

export function getTaxToolSeo(toolKey: TaxToolSeoKey) {
  return tools[toolKey];
}

export function TaxToolSeo({ toolKey }: { toolKey: TaxToolSeoKey }) {
  const tool = getTaxToolSeo(toolKey);
  const related = Object.entries(tools).filter(([key]) => key !== toolKey).slice(0, 3);

  return (
    <section className="tax-tool-seo section-tight" aria-labelledby={`${toolKey}-guide-title`}>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: tool.title,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: tool.description,
          url: absoluteUrl(tool.path),
          publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl() },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tool.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        },
      ]} />
      <div className="container tax-tool-seo__grid">
        <div>
          <span className="eyebrow text-rempah">PANDUAN SINGKAT</span>
          <h2 id={`${toolKey}-guide-title`}>{tool.guideTitle || `${tool.title} untuk alur kerja yang lebih rapi`}</h2>
          <p>{tool.description}</p>
          <ol>{tool.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </div>
        <div className="tax-tool-seo__aside">
          <h3>Pertanyaan umum</h3>
          {tool.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
          <p className="tax-tool-seo__notice">Tool ini membantu pekerjaan administratif, bukan pengganti pengecekan data, penilaian profesional, atau ketentuan resmi perpajakan.</p>
          {tool.alternative ? <p className="tax-tool-seo__alternative"><Link href={tool.alternative.href}>{tool.alternative.label}</Link></p> : null}
          <nav aria-label="Tool pajak terkait"><strong>Tool terkait</strong><ul>{related.map(([key, relatedTool]) => <li key={key}><Link href={relatedTool.path}>{relatedTool.title}</Link></li>)}</ul></nav>
        </div>
      </div>
    </section>
  );
}
