import Link from "next/link";
import { FOOTER_CONTENT } from "@/lib/footer-content";
import { SurpriseLink } from "./footer-interactions";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer} aria-label="PuspitaCore — lanjutkan rasa penasaran">
      <div className={`container ${styles.inner}`}>
        <div className={styles.masthead}>
          <Link href="/" className={styles.wordmark} aria-label="PuspitaCore — Beranda">PUSPITA<span>CORE</span><span className={styles.star} aria-hidden="true">✳</span></Link>
          <SurpriseLink />
        </div>

        <div className={styles.grid}>
          <div className={styles.story}>
            <h2 className={styles.headline} lang="en">From curiosity<br />to <em>systems.</em></h2>
            <p className={styles.description}>{FOOTER_CONTENT.description}</p>
          </div>
          <div className={styles.linksAndContact}>
            <nav className={styles.navigation} aria-label="Navigasi footer">
              {FOOTER_CONTENT.navigation.map((group) => (
                <div key={group.title} className={styles.linkGroup}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
                  </ul>
                </div>
              ))}
            </nav>
            <div className={styles.contact}>
              <h3>{FOOTER_CONTENT.contact.title}</h3>
              <p>{FOOTER_CONTENT.contact.description}</p>
              <a
                href={FOOTER_CONTENT.contact.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mari ngobrol melalui WhatsApp (buka tab baru)"
              >
                {FOOTER_CONTENT.contact.label} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.signature}>{FOOTER_CONTENT.signature}</p>
          <p className={styles.copyright}>© {new Date().getFullYear()} PUSPITA × RIPITA<br /><span>Rupa Indonesia · Akal Masa Depan</span></p>
        </div>
      </div>
    </footer>
  );
}
