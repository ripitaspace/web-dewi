"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { storageKey } from "@/modules/learning/engine";
import type { ModuleCard } from "@/modules/learning/types";
import styles from "./learning.module.css";

export function ModuleCatalog({ modules }: { modules: ModuleCard[] }) {
  const [started, setStarted] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => {
      setStarted(
        modules
          .filter((module) => {
            try {
              const saved = JSON.parse(
                localStorage.getItem(storageKey(module)) || "null",
              );
              return (
                saved?.moduleId === module.id &&
                saved.revision === module.revision &&
                saved.startedAt
              );
            } catch {
              return false;
            }
          })
          .map((module) => module.id),
      );
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [modules]);
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
                  <Link href={`/belajar/modul/${module.slug}`}>
                    {module.title}
                  </Link>
                </h3>
                <p>{module.summary}</p>
                <div className={styles.moduleMeta}>
                  <span>{module.level}</span>
                  <span>{module.minutes} menit</span>
                  <span>
                    {module.pages} bab · {module.activities} aktivitas
                  </span>
                </div>
                <div className={styles.moduleCardFoot}>
                  <Link
                    className={styles.primaryButton}
                    href={`/belajar/modul/${module.slug}`}
                  >
                    {started.includes(module.id)
                      ? "Lanjutkan belajar"
                      : "Mulai belajar"}{" "}
                    →
                  </Link>
                  <small>Gratis · Tanpa login</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
