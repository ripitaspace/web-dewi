"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { RipitaMark } from "@/components/brand/ripita-mark";
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
        <RipitaMark
          className="brand-logo"
          data-ripita-logo-target
        />
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
        <a
          className="btn primary"
          href="https://wa.me/6282333360110?text=Halo%20Kak%20Puspita%2C%20aku%20tertarik%20untuk%20ngobrol%20sesuatu%20nich"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat via WhatsApp"
        >
          <svg aria-hidden="true" viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
            <path d="M16 3a13 13 0 0 0-11.1 19.8L3 29l6.4-1.7A13 13 0 1 0 16 3Zm0 23.7a10.7 10.7 0 0 1-5.4-1.5l-.4-.2-3.8 1 1-3.7-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.3-.6.1a8.7 8.7 0 0 1-2.5-1.6 9.4 9.4 0 0 1-1.7-2.1c-.2-.3 0-.4.1-.6l.5-.5c.2-.2.2-.3.3-.5s0-.4 0-.5l-1-2.3c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.6.1-.9.4s-1.2 1.1-1.2 2.8 1.2 3.4 1.4 3.6a12.9 12.9 0 0 0 4.9 4.3c.7.3 1.3.6 1.8.7.8.3 1.5.2 2.1.1.6-.1 1.8-.7 2.1-1.4s.3-1.3.2-1.4-.2-.2-.5-.4Z" />
          </svg>
          <span>Chat WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
