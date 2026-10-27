"use client";

import Link from "next/link";
import type { ModuleCard } from "@/modules/learning/types";
import styles from "./learning.module.css";

export function ModuleCatalog({ modules }: { modules: ModuleCard[] }) {
  return (
    <section className={styles.catalogSection} aria-labelledby="modules-title">
      <div className="container">
        <div className={styles.catalogHeading}>
          <div>
            <span className="eyebrow text-delima">BELAJAR SAMBIL MENCOBA</span>
            <h2 id="modules-title">Ruang belajar interaktif.</h2>
          </div>
          <p>
            Satu topik, berbagai cara memahami.
            <br />
            Baca, dengarkan, lalu praktikkan sendiri.
          </p>
        </div>
        <div className={styles.catalogGrid}>
          {modules.map((module) => (
            <article className={styles.moduleCard} key={module.id}>
              <div className={styles.moduleArt} aria-hidden="true">
                <span>✳</span>
                <div>
                  KENALI.
                  <br />
                  HITUNG.
                  <br />
                  <em>PAHAMI.</em>
                </div>
                <small>AKUNTANSI DALAM PRAKTIK / 01</small>
              </div>
              <div className={styles.moduleCardContent}>
                <span className={styles.eyebrow}>{module.subject}</span>
                <h3>
                  {module.contentStatus === "pending" ? module.title : <Link href={`/belajar/modul/${module.slug}`}>{module.title}</Link>}
                </h3>
                <p>{module.summary}</p>
                <div className={styles.moduleMeta}>
                  {module.contentStatus === "pending" ? <><span>Content Pending</span><span>Belum ada unit belajar</span></> : <><span>{module.level}</span><span>{module.minutes} menit</span><span>{module.pages} bab · {module.activities} aktivitas</span></>}
                </div>
                <div className={styles.moduleCardFoot}>
                  {module.contentStatus === "pending" ? <small>Content Pending · Materi sedang disiapkan</small> : <><Link className={styles.primaryButton} href={`/belajar/modul/${module.slug}`}>Mulai belajar →</Link><small>Gratis · Tanpa login</small></>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
