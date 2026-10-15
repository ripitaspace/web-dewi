import Link from "next/link";
import styles from "./about.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>PUSPITA / A PERSONAL JOURNAL OF THINKING</p>
          <h1 id="about-title">Bukan biografi. Ini cerita tentang bagaimana cara berpikirku terbentuk.</h1>
          <p className={styles.heroStatement}><mark>Aku melihat pola, lalu membangun sesuatu darinya.</mark></p>
          <p className={styles.intro}>Aku tertarik pada hubungan di balik angka, manusia, keputusan, dan proses. Dari rasa penasaran itu, aku belajar memahami bagaimana sesuatu bekerja—dan bagaimana membuatnya bekerja lebih baik.</p>
          <p className={styles.keywords}>Observe <span>·</span> Understand <span>·</span> Build</p>
          <div className="button-row">
            <a className="btn btn-primary" href="#cara-melihat">Mulai Membaca <span aria-hidden="true">↓</span></a>
            <Link className="btn btn-secondary" href="/karya">Jelajahi Karya <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className={styles.heroArt}>
          <img className={styles.portrait} src="/images/artworks/puspita-kebaya-portrait.png" alt="Potret Puspita mengenakan kebaya" />
          <img className={styles.flora} src="/images/artworks/about-portrait-floral-overlay.png" alt="" aria-hidden="true" />
          <img className={styles.stamp} src="/images/artworks/from-curiosity-to-systems-stamps.png" alt="Stempel From Curiosity to Systems" />
        </div>
      </div>
      <div className={`container ${styles.heroRule}`} aria-hidden="true"><span>01</span><i /><span>make thinking visible</span></div>
    </section>
  );
}
