"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ROUTE_ORDER } from "@/lib/site-data";

interface SiteHeaderProps {
  currentKey?: "beranda" | "tentang" | "pemikiran" | "karya" | "belajar" | "kerja-bersama" | "ripita";
}

export function SiteHeader({ currentKey }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <header className={`site-nav ${isScrolled ? "compact" : ""}`} id="siteNav">
      <Link className="brand" href="/" aria-label="PUSPITA × RIPITA">
        <span className="brand-mark">P</span>
        <span className="brand-copy">
          <strong>PUSPITA × RIPITA</strong>
          <small>Rupa Indonesia · Akal Masa Depan</small>
        </span>
      </Link>

      <nav className="nav-links" aria-label="Navigasi utama">
        {ROUTE_ORDER.map((item) => {
          const isActive =
            currentKey === item.key ||
            (item.path === "/" && pathname === "/") ||
            (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.key}
              href={item.path}
              className={isActive ? "active" : ""}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="nav-actions">
        <Link className="btn primary" href="/kerja-bersama">
          Kerja Bersama
        </Link>
      </div>
    </header>
  );
}
