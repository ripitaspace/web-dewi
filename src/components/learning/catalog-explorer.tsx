"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ModuleCard } from "@/modules/learning/types";
import styles from "./catalog-explorer.module.css";

export interface CatalogLink {
  href: string;
  title: string;
  description?: string;
  moduleCount: number;
}

export interface DomainLink extends CatalogLink { icon?: string }

export function DomainExplorer({ domains }: { domains: DomainLink[] }) {
  return (
    <section className={styles.domainSection} aria-labelledby="explore-domains-title">
      <div className="container">
        <div className={styles.heading}>
          <div><span className="eyebrow text-delima">EKSPLORASI BIDANG</span><h2 id="explore-domains-title">Mulai dari bidang yang ingin kamu pahami.</h2></div>
          <p>Struktur belajar tumbuh perlahan. Bidang yang belum memiliki modul tetap ditampilkan dengan jujur.</p>
        </div>
        <div className={styles.domainGrid}>
          {domains.map((domain, index) => <Link key={domain.href} href={domain.href} className={`${styles.domainCard} ${!domain.moduleCount ? styles.comingSoon : ""}`} aria-label={!domain.moduleCount ? `${domain.title}, akan hadir` : undefined}>
            <div className={styles.cardArt} aria-hidden="true"><span>{domain.icon || "✳"}</span><strong>{domain.title.toUpperCase()}</strong><small>BIDANG BELAJAR / {String(index + 1).padStart(2, "0")}</small></div>
            <div className={styles.cardContent}><span className={styles.cardEyebrow}>PUSPITACORE BELAJAR</span><h3>{domain.title}</h3><p>{domain.description}</p><div className={styles.cardFoot}><span className={styles.metaPill}>{domain.moduleCount ? `${domain.moduleCount} modul tersedia` : "Akan hadir"}</span><span className={styles.cardLink}>{domain.moduleCount ? "Jelajahi bidang →" : "Lihat roadmap →"}</span></div></div>
          </Link>)}
        </div>
      </div>
    </section>
  );
}

export function CatalogExplorer({
  title,
  description,
  crumbs,
  topics,
  modules,
}: {
  title: string;
  description?: string;
  crumbs: { href: string; label: string }[];
  topics: CatalogLink[];
  modules: ModuleCard[];
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Semua");
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("id-ID");
    return modules.filter((module) => (!term || `${module.title} ${module.summary} ${module.subject}`.toLocaleLowerCase("id-ID").includes(term)) && (level === "Semua" || module.level === level));
  }, [level, modules, query]);
  const levels = ["Semua", ...Array.from(new Set(modules.map((module) => module.level)))];
  return (
    <main className={styles.page} id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
      <div className="container">
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>{crumbs.map((crumb, index) => <span key={crumb.href}>{index ? <span aria-hidden="true">/</span> : null}<Link href={crumb.href}>{crumb.label}</Link></span>)}</nav>
        <header className={styles.pageHeader}><span className="eyebrow text-delima">PUSPITACORE · BELAJAR</span><h1>{title}</h1>{description && <p>{description}</p>}</header>
        {topics.length > 0 && <section className={styles.topicSection} aria-labelledby="subtopics-title"><div className={styles.sectionIntro}><span className="eyebrow text-delima">LANJUTKAN KE TOPIK</span><h2 id="subtopics-title">Pilih arah belajarmu.</h2></div><div className={styles.topicGrid}>{topics.map((topic, index) => <Link key={topic.href} href={topic.href} className={`${styles.topicCard} ${!topic.moduleCount ? styles.comingSoon : ""}`} aria-label={!topic.moduleCount ? `${topic.title}, akan hadir` : undefined}><div className={styles.topicArt} aria-hidden="true"><span>✳</span><strong>{topic.moduleCount ? "DALAMI." : "SEGERA."}</strong><small>TOPIK / {String(index + 1).padStart(2, "0")}</small></div><div className={styles.topicContent}><span className={styles.cardEyebrow}>{topic.moduleCount ? "JALUR BELAJAR" : "ROADMAP BELUM AKTIF"}</span><h3>{topic.title}</h3>{topic.description && <p>{topic.description}</p>}<div className={styles.cardFoot}><span className={styles.metaPill}>{topic.moduleCount ? `${topic.moduleCount} modul tersedia` : "Akan hadir"}</span><span className={styles.cardLink}>{topic.moduleCount ? "Buka topik →" : "Lihat roadmap →"}</span></div></div></Link>)}</div></section>}
        <section className={styles.moduleSection} aria-labelledby="catalog-title"><div className={styles.sectionIntro}><span className="eyebrow text-delima">KATALOG MODUL</span><h2 id="catalog-title">Materi yang bisa langsung dipelajari.</h2></div>{modules.length > 0 && <div className={styles.filters}><label>Cari modul<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Judul atau kata kunci" /></label><label>Level<select value={level} onChange={(event) => setLevel(event.target.value)}>{levels.map((entry) => <option key={entry}>{entry}</option>)}</select></label></div>}{filtered.length ? <div className={styles.moduleGrid}>{filtered.map((module, index) => <article key={module.id} className={styles.moduleCard}><div className={styles.moduleArt} aria-hidden="true"><span>✳</span><strong>BELAJAR.<br />COBA.<br /><em>PAHAMI.</em></strong><small>{module.subject.toUpperCase()} / {String(index + 1).padStart(2, "0")}</small></div><div className={styles.moduleContent}><span className={styles.cardEyebrow}>{module.subject}</span><h3><Link href={`/belajar/modul/${module.slug}`}>{module.title}</Link></h3><p>{module.summary}</p><div className={styles.moduleMeta}><span>{module.level}</span><span>{module.minutes} menit</span><span>{module.pages} unit · {module.activities} aktivitas</span></div><div className={styles.cardFoot}><Link className={styles.primaryButton} href={`/belajar/modul/${module.slug}`}>Mulai belajar →</Link><small>Gratis · Tanpa login</small></div></div></article>)}</div> : <div className={styles.empty}><div className={styles.emptyArt} aria-hidden="true"><span>✳</span><strong>RUANG INI<br /><em>SEDANG TUMBUH.</em></strong></div><div><span className={styles.cardEyebrow}>PUSPITACORE BELAJAR</span><h3>{modules.length ? "Modul tidak ditemukan." : "Belum ada modul tersedia."}</h3><p>{modules.length ? "Coba kata kunci atau level lain." : "Struktur topik ini sudah disiapkan dan materi akan ditambahkan bertahap."}</p></div></div>}</section>
      </div>
    </main>
  );
}
