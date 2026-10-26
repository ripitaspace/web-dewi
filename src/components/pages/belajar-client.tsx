"use client";


import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModuleCatalog } from "@/components/learning/module-catalog";
import { DomainExplorer, type DomainLink } from "@/components/learning/catalog-explorer";
import { LearningOfflineCache } from "@/components/learning/offline-cache";
import type { ModuleCard } from "@/modules/learning/types";
import styles from "./belajar-client.module.css";

interface BelajarClientProps {
  modules?: ModuleCard[];
  domains?: DomainLink[];
}

export function BelajarClient({ modules = [], domains = [] }: BelajarClientProps) {
  return (
    <>
      <LearningOfflineCache />
      <SiteHeader currentKey="belajar" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        <section className={styles.learningPhilosophy} aria-labelledby="learning-philosophy-title">
          <div className={`container ${styles.learningPhilosophyGrid}`}>
            <div className={styles.learningPhilosophyCopy}>
              <span className={styles.learningPhilosophyEyebrow}>
                PUSPITACORE · LEARNING PHILOSOPHY
              </span>
              <h1 id="learning-philosophy-title" className={styles.learningPhilosophyTitle}>
                Pengetahuan boleh disalin. Kemampuan harus dibangun.
              </h1>
              <div className={styles.learningPhilosophyBody}>
                <p>
                  Siapa pun boleh belajar. Tidak perlu akun, tidak perlu membuktikan diri kepada sistem, dan tidak perlu berlomba mendapatkan nilai tertinggi.
                </p>
                <p>
                  Yang terpenting bukan seberapa cepat seseorang menyelesaikan materi, melainkan seberapa banyak yang benar-benar ia pahami, mampu kerjakan, dan terapkan dalam kehidupannya.
                </p>
              </div>
              <p className={styles.learningPhilosophyClosing}>
                <em>Learn freely. Practice honestly. Grow continuously.</em>
              </p>
            </div>
            <div className={styles.learningPhilosophyArt} aria-hidden="true">
              <img src="/images/artworks/peacock-feather-ornament.png" alt="" />
            </div>
          </div>
        </section>

        <DomainExplorer domains={domains} />

        <ModuleCatalog modules={modules} />
      </main>

      <SiteFooter />
    </>
  );
}
