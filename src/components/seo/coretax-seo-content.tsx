import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

const faqs = [
  { question: "Bagaimana cara rekap Faktur Pajak Coretax ke Excel?", answer: "Masukkan PDF, ZIP, atau folder faktur ke workspace, periksa antrean dan detail barang, lalu gunakan tindakan Unduh rekap Excel." },
  { question: "Apakah bisa memproses banyak PDF sekaligus?", answer: "Ya. Workspace menerima banyak PDF dalam satu batch, termasuk PDF yang dikumpulkan melalui ZIP atau folder." },
  { question: "Apakah file ZIP didukung?", answer: "Ya. ZIP yang berisi PDF dapat dimasukkan untuk dibaca sebagai satu batch." },
  { question: "Apakah detail barang ikut diekstrak?", answer: "Workspace menampilkan hasil per barang untuk diperiksa dan dapat memasukkannya ke rekap Excel bila informasi tersebut dapat dibaca dari dokumen." },
  { question: "Apakah dokumen dikirim ke server?", answer: "Tidak. Dokumen diproses di browser pada perangkat Anda dan hasil sesi tidak disimpan oleh PuspitaCore." },
  { question: "Apakah semua format PDF bisa dibaca?", answer: "Tidak selalu. PDF yang tidak dapat dibaca atau memiliki hasil yang perlu perhatian akan ditandai agar dapat diperiksa secara manual." },
  { question: "Apa bedanya Invoice Scraper dan Extension Download Faktur Otomatis?", answer: "Extension membantu mengunduh dokumen dari tabel Coretax. Invoice Scraper mengolah file faktur yang sudah tersedia menjadi data terstruktur dan rekap." },
];

export function CoretaxSeoContent() {
  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Karya", item: absoluteUrl("/karya") },
            { "@type": "ListItem", position: 2, name: "Tools Pajak", item: absoluteUrl("/karya/pajak") },
            { "@type": "ListItem", position: 3, name: "Rekap Faktur Pajak Coretax ke Excel", item: absoluteUrl("/karya/pajak/coretax") },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Coretax Invoice Scraper",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: absoluteUrl("/karya/pajak/coretax"),
          description: "Rekap Faktur Pajak Coretax dari PDF, ZIP, atau folder menjadi data barang dan Excel langsung di browser.",
          publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl() },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
        },
      ]} />

      <section className="coretax-seo section-tight" aria-labelledby="coretax-guide-title">
        <div className="container coretax-seo__grid">
          <div>
            <span className="eyebrow text-rempah">CARA MENGGUNAKAN</span>
            <h2 id="coretax-guide-title">Dari Faktur Pajak PDF ke rekap Excel</h2>
            <ol className="coretax-seo__steps">
              <li><strong>Pilih dokumen.</strong> Masukkan PDF, ZIP, atau folder yang berisi Faktur Pajak.</li>
              <li><strong>Baca dan periksa hasil.</strong> Workspace membuat antrean, menampilkan status, serta detail transaksi dan barang yang dapat ditinjau.</li>
              <li><strong>Unduh rekap.</strong> Setelah meninjau data yang perlu perhatian, unduh rekap Excel atau ZIP faktur dengan nama yang dirapikan.</li>
            </ol>
          </div>
          <aside className="coretax-seo__note">
            <h3>Dokumen tetap di perangkat Anda</h3>
            <p>Coretax Invoice Scraper memproses file di browser. PuspitaCore tidak mengunggah atau menyimpan dokumen batch Anda.</p>
            <p>Hasil ekstraksi adalah bahan review. Periksa kembali dokumen sumber, terutama saat workspace menandai error, duplikat, atau data yang perlu perhatian.</p>
          </aside>
        </div>
      </section>

      <section className="section-tight coretax-seo coretax-seo--paper" aria-labelledby="coretax-features-title">
        <div className="container">
          <span className="eyebrow text-rempah">FITUR WORKSPACE</span>
          <h2 id="coretax-features-title">Satu ruang untuk rekap banyak Faktur Pajak sekaligus</h2>
          <div className="coretax-seo__features">
            <article><h3>Impor batch fleksibel</h3><p>Gunakan PDF tunggal, banyak PDF, ZIP, atau folder sesuai cara Anda menyimpan dokumen.</p></article>
            <article><h3>Review transaksi dan barang</h3><p>Periksa nomor faktur, pihak terkait, status parsing, dan detail barang sebelum rekap digunakan.</p></article>
            <article><h3>Ekspor yang dapat ditindaklanjuti</h3><p>Unduh rekap Excel untuk data terstruktur atau ZIP faktur yang telah diberi nama lebih rapi.</p></article>
          </div>
        </div>
      </section>

      <section className="section-tight coretax-seo" aria-labelledby="coretax-use-title">
        <div className="container coretax-seo__grid">
          <div>
            <span className="eyebrow text-rempah">KAPAN BERGUNA</span>
            <h2 id="coretax-use-title">Untuk pekerjaan rekap yang berulang</h2>
            <p>Tool ini berguna saat staf accounting atau pajak perlu menggabungkan data dari banyak Faktur Pajak PDF, mengecek detail barang, atau menyiapkan rekap kerja sebelum tahap berikutnya.</p>
            <p>Pemilik bisnis juga dapat memakai workspace ini untuk menata batch dokumen yang sudah tersedia tanpa mengubah sumber dokumennya.</p>
          </div>
          <div className="coretax-seo__links">
            <h3>Tool terkait</h3>
            <p><Link href="/karya/tools/extension-download-faktur-otomatis">Download Faktur Pajak Coretax Otomatis</Link> membantu mengambil dokumen dari tabel Coretax; gunakan scraper ini setelah file tersedia untuk rekap dan review.</p>
            <p><Link href="/karya/tools/download-faktur-laptop-kentang">Panduan Laptop Kentang</Link> membantu mengatur proses unduhan secara bertahap ketika perangkat terasa lambat.</p>
            <p><Link href="/karya/pajak">Lihat seluruh tools pajak PuspitaCore</Link>.</p>
          </div>
        </div>
      </section>

      <section className="section-tight coretax-seo coretax-seo--paper" aria-labelledby="coretax-faq-title">
        <div className="container coretax-seo__faq">
          <span className="eyebrow text-rempah">FAQ</span>
          <h2 id="coretax-faq-title">Pertanyaan tentang Coretax Invoice Scraper</h2>
          {faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
        </div>
      </section>
    </>
  );
}
