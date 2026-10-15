import Link from "next/link";
import { getBlogPostBySlug } from "@/modules/cms";
import { INVOICE_EXTENSION_STORES } from "@/lib/invoice-extension";
import styles from "./invoice-extension-info.module.css";
import { InvoiceBookmarklet } from "./invoice-bookmarklet";

const features = [
  { title: "Faktur pada halaman aktif", description: "Unduh faktur yang siap dari tabel yang sedang kamu buka, tanpa berpindah halaman otomatis." },
  { title: "Antrean dan progres", description: "Download berjalan secara berurutan, dengan progres yang mudah diikuti." },
  { title: "Jeda dan hentikan", description: "Kendalikan antrean download sesuai kebutuhanmu." },
  { title: "Ringkasan hasil", description: "Lihat faktur yang berhasil diunduh, gagal, atau masih perlu diperiksa." },
];

const steps = [
  { title: "Pasang melalui store resmi", description: "Pilih store untuk browsermu, lalu konfirmasi pemasangan extension." },
  { title: "Buka tabel faktur di Coretax", description: "Login ke Coretax dan buka menu Pajak Keluaran atau Pajak Masukan." },
  { title: "Pindai faktur", description: "Jalankan extension untuk memindai faktur pada halaman tabel yang sedang terbuka." },
  { title: "Mulai Download", description: "Tekan Mulai Download, lalu ikuti progres dan periksa ringkasan hasilnya." },
];

export async function InvoiceExtensionInfo() {
  const articleSlug = "download-faktur-pajak-otomatis";
  const article = await getBlogPostBySlug(articleSlug).catch(() => null);
  const articleImage = article?.image && !article.image.includes("data:image/svg")
    ? article.image
    : "/images/artworks/coretax-ripita-icon.png";
  const articleTopics = article?.topics?.length ? article.topics.slice(0, 3) : ["VAT IN", "VAT OUT", "CORETAX"];
  const articleTitle = article?.title || "⚡ Cara Download Faktur Pajak di Coretax Sekaligus Banyak dengan JavaScript";
  const articleExcerpt = article?.excerpt || "Panduan untuk menyiapkan bookmarklet dan mengunduh banyak Faktur Pajak dari Coretax.";
  const articleAuthor = article?.author || "pus";
  const articleDate = article?.date || "07 Sep 2026";
  const stores = [
    { name: "Chrome Web Store", browser: "Chrome", href: INVOICE_EXTENSION_STORES.chrome },
    { name: "Microsoft Edge Add-ons", browser: "Edge", href: INVOICE_EXTENSION_STORES.edge },
  ];
  const hasListing = stores.some((store) => store.href);

  return (
    <div className={styles.content}>
      <div className={styles.overview}>
        <section aria-labelledby="extension-overview">
          <span className={styles.status}>{hasListing ? "Chrome & Edge desktop · Ketersediaan sesuai store" : "Dalam pengembangan · Chrome & Edge desktop"}</span>
          <h2 id="extension-overview" className={styles.title}>Download Faktur Coretax Lebih Praktis</h2>
          <p className={styles.intro}>
            Unduh faktur Pajak Keluaran dan Pajak Masukan dari halaman Coretax yang sedang kamu buka.
            Extension dirancang untuk menjalankan download secara berurutan dan menampilkan progresnya.
          </p>
          <div className={styles.scope}>
            <span aria-hidden="true">↓</span>
            <p><strong>Satu halaman, satu antrean.</strong><br />Dirancang untuk faktur pada halaman aktif. Untuk halaman berikutnya, kamu berpindah sendiri di Coretax.</p>
          </div>
        </section>

        <aside className={styles.install} aria-labelledby="extension-install">
          <span className="eyebrow">PEMASANGAN EXTENSION</span>
          <h2 id="extension-install">Mulai dari browsermu.</h2>
          <p id="extension-store-status">
            {hasListing
              ? "Pilih store yang sudah tersedia untuk membuka listing resmi extension."
              : "Extension sedang dikembangkan dan belum diterbitkan di store. Tombol pemasangan akan aktif setelah listing resmi tersedia."}
          </p>
          <div className={styles.stores}>
            {stores.map((store) => (
              <div key={store.browser} className={styles.store}>
                <span className={styles.storeName}>{store.name}</span>
                {store.href ? (
                  <a className={`btn primary ${styles.storeButton}`} href={store.href} target="_blank" rel="noopener noreferrer">
                    Pasang untuk {store.browser} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (membuka store di tab baru)</span>
                  </a>
                ) : (
                  <button className={`btn ${styles.storeButton}`} type="button" disabled aria-describedby="extension-store-status" aria-label={`Segera tersedia di store — ${store.name}`}>
                    Segera tersedia di store
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className={styles.installNote}>Pemasangan memerlukan konfirmasi browser. Tombol di halaman ini membuka store resmi, bukan memasang extension secara langsung.</p>
        </aside>
      </div>

      <div className={styles.bookmarkletLayout}>
        <InvoiceBookmarklet />
        <aside aria-label="Artikel terkait">
          <article className={`blog-card ${styles.articleCard}`}>
            <div className="blog-card-cover">
              <img src={articleImage} alt={articleTitle} />
            </div>
            <div className="blog-topic-row">
              {articleTopics.map((topic) => (
                <span className="topic-pill" key={topic}>{topic}</span>
              ))}
            </div>
            <h3 className="blog-title">
              <Link href={`/blog/${articleSlug}`}>{articleTitle}</Link>
            </h3>
            <p className="blog-excerpt">{articleExcerpt}</p>
            <div className="blog-card-foot">
              <div className="blog-card-byline">
                <img className="blog-author-avatar" src="/author-avatar.jpg" alt="" />
                <span className="blog-author">{articleAuthor}</span>
                <time className="blog-date">{articleDate}</time>
              </div>
              <Link className="blog-link" href={`/blog/${articleSlug}`}>Baca artikel <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        </aside>
      </div>

      <section className={styles.section} aria-labelledby="extension-features">
        <span className="eyebrow text-delima">{hasListing ? "TENTANG EXTENSION" : "YANG SEDANG DISIAPKAN"}</span>
        <h2 id="extension-features">{hasListing ? "Fitur extension" : "Fitur yang direncanakan"}</h2>
        <ul className={styles.features}>
          {features.map((feature, index) => (
            <li key={feature.title} className={styles.feature}>
              <span className={styles.number} aria-hidden="true">0{index + 1}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="extension-guide">
        <span className="eyebrow text-delima">PANDUAN PENGGUNAAN</span>
        <h2 id="extension-guide">{hasListing ? "Empat langkah untuk mulai" : "Empat langkah setelah extension tersedia"}</h2>
        <p className={styles.guideNote}>{hasListing ? "Gunakan tombol store yang sudah tersedia, lalu ikuti langkah berikut di browser desktopmu." : "Panduan ini menjelaskan alur yang direncanakan. Extension belum dapat dipasang atau digunakan saat ini."}</p>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.footer}>
        <p>{hasListing ? "Lihat detail versi dan ketersediaan extension pada listing store resmi masing-masing browser." : "Implementasi dan pengujian pada menu Pajak Keluaran serta Pajak Masukan masih akan dilakukan sebelum rilis publik."}</p>
        <Link href="/karya" className="btn">← Kembali ke Karya</Link>
      </div>
    </div>
  );
}
