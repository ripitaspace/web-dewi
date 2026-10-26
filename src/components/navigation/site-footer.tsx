import Link from "next/link";
import { FOOTER_CONTENT } from "@/lib/footer-content";
import { SurpriseLink } from "./footer-interactions";
import styles from "./site-footer.module.css";

type SocialPlatform = "linkedin" | "instagram" | "threads" | "facebook" | "tiktok" | "youtube" | "x";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case "linkedin":
      return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M5.1 3.5A2.1 2.1 0 1 1 5 7.7a2.1 2.1 0 0 1 .1-4.2ZM3.3 9h3.5v11.3H3.3V9Zm5.7 0h3.3v1.5h.1c.5-.9 1.7-1.9 3.6-1.9 3.8 0 4.5 2.5 4.5 5.8v5.9H17v-5.2c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.4H9.4V9H9Z" /></svg>;
    case "instagram":
      return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r=".8" fill="currentColor" stroke="none" /></svg>;
    case "threads":
      return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 9.8c-.4-3.1-2.5-4.8-5.7-4.8-3.7 0-6.3 2.5-6.3 7s2.5 7 6.6 7c3.5 0 5.7-1.8 5.7-4.4 0-2.4-2.1-3.8-5.4-3.8-2.5 0-4.3 1-4.3 2.9 0 1.5 1.3 2.6 3.4 2.6 2.6 0 4.9-1.2 5.3-4.3" /><path d="M12 12h.1" /></svg>;
    case "facebook":
      return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M13.7 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.2-1.5 1.5-1.5H17V3.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4v2.4H8.3V13h2.6v8h2.8Z" /></svg>;
    case "tiktok":
      return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M15.4 3c.2 1.7 1.1 3.2 2.7 4.1.8.4 1.6.7 2.5.7v3.1c-1.7 0-3.4-.5-4.8-1.4v6.2a5.3 5.3 0 1 1-4.6-5.3v3.2a2.2 2.2 0 1 0 1.5 2.1V3h2.7Z" /></svg>;
    case "youtube":
      return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M21.2 7.2a2.9 2.9 0 0 0-2-2C17.5 4.7 12 4.7 12 4.7s-5.5 0-7.2.5a2.9 2.9 0 0 0-2 2A30 30 0 0 0 2.3 12a30 30 0 0 0 .5 4.8 2.9 2.9 0 0 0 2 2c1.7.5 7.2.5 7.2.5s5.5 0 7.2-.5a2.9 2.9 0 0 0 2-2 30 30 0 0 0 .5-4.8 30 30 0 0 0-.5-4.8ZM10 15.2V8.8l5.3 3.2-5.3 3.2Z" /></svg>;
    case "x":
      return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3.5h2.8l-6.1 7 7.2 10h-5.6l-4.4-6-5.2 6H4.8l6.5-7.4-6.9-9.6H10l4 5.6 4.9-5.6Zm-1 15.2h1.5L9.2 5.2H7.6l10.3 13.5Z" /></svg>;
  }
}

export function SiteFooter() {
  return (
    <footer className={styles.footer} aria-label="PuspitaCore — lanjutkan rasa penasaran">
      <div className={`container ${styles.inner}`}>
        <div className={styles.masthead}>
          <Link href="/" className={styles.wordmark} aria-label="PuspitaCore — Beranda">PUSPITA<span>CORE</span><span className={styles.star} aria-hidden="true">✳</span></Link>
          <div className={styles.mastheadActions}>
            <div className={styles.socials} aria-label="Media sosial PuspitaCore">
              {FOOTER_CONTENT.socials.map((social) => (
                <a
                  key={social.platform}
                  className={styles.socialLink}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label} PuspitaCore (buka tab baru)`}
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>
            <SurpriseLink />
          </div>
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
