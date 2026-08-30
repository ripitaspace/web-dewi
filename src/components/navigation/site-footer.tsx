import Link from "next/link";
import { ROUTE_ORDER } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: "16px" }}>
              <strong>PUSPITA</strong>
              <span>RUPA INDONESIA · AKAL MASA DEPAN</span>
            </div>
            <p className="muted" style={{ maxWidth: "340px" }}>
              Personal ecosystem yang mengeksplorasi perjumpaan antara akuntansi, teknologi, seni rupa, dan desain sistem.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
              Peta Navigasi
            </h4>
            <div className="footer-nav">
              {ROUTE_ORDER.map((item) => (
                <Link key={item.key} href={item.path} style={{ color: "rgba(30, 27, 24, 0.75)" }}>
                  {item.num} · {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
              Ekosistem Terkait
            </h4>
            <div className="footer-nav">
              <Link href="/ripita" style={{ color: "rgba(30, 27, 24, 0.75)" }}>
                RIPITA Core & Hub
              </Link>
              <Link href="/karya" style={{ color: "rgba(30, 27, 24, 0.75)" }}>
                RIPITAX & Logistics
              </Link>
              <Link href="/belajar" style={{ color: "rgba(30, 27, 24, 0.75)" }}>
                Storefront & Toolkits
              </Link>
              <Link href="/kerja-bersama" style={{ color: "rgba(30, 27, 24, 0.75)" }}>
                Jadwal Konsultasi & Kerja Bersama
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="muted">© {new Date().getFullYear()} PUSPITA × RIPITA. Hak cipta dilindungi.</span>
          <span className="hand-note text-delima">Rasa menjadi rupa. Ide menjadi sistem.</span>
        </div>
      </div>
    </footer>
  );
}
