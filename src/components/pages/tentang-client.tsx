"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { AboutHero } from "./tentang/about-hero";
import { ThinkingMap } from "./tentang/thinking-map";
import { EvolutionTimeline } from "./tentang/evolution-timeline";
import { NusantaraManifesto } from "./tentang/nusantara-manifesto";
import { RipitaEcosystem } from "./tentang/ripita-ecosystem";
import { AboutClosing } from "./tentang/about-closing";
import styles from "./tentang/about.module.css";

export function TentangClient() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return <>
    <SiteHeader currentKey="tentang" />
    <div className={styles.progress} aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    <main id="main-content" className={styles.page}>
      <AboutHero />
      <div className={`container ${styles.storyShell}`}>
        <div className={styles.story}>
          <section id="cara-melihat" className={`${styles.chapter} ${styles.thinking}`}><ThinkingMap /></section>
          <section id="angka-sistem" className={`${styles.chapter} ${styles.evolution}`}><EvolutionTimeline /></section>
          <section id="indonesia" className={`${styles.chapter} ${styles.nusantara}`}><NusantaraManifesto /></section>
          <section id="ripita" className={`${styles.chapter} ${styles.ripita}`}><RipitaEcosystem /></section>
        </div>
      </div>
      <AboutClosing />
    </main>
    <SiteFooter />
  </>;
}
