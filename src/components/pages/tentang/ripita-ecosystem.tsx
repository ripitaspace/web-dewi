"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./about.module.css";
import { transformation } from "./content";

const fields = ["Accounting", "Business Process", "Technology", "Product", "Education", "Community"];

export function RipitaEcosystem() {
  const [field, setField] = useState("RIPITA");
  return <>
    <header className={styles.chapterHeading}><p className={styles.eyebrow}>Bab 04 / From Knowledge to Ecosystem</p><h2>Bagaimana kalau pengalaman tidak berhenti sebagai ingatan?</h2><p className={styles.subhead}>Dalam pekerjaan, banyak pengetahuan berharga tersimpan sebagai spreadsheet, SOP, template, percakapan chat, folder, dan pengalaman senior.</p><p className={styles.copy}>Ketika tim berubah atau proyek selesai, sebagian pengetahuan itu mudah hilang. <strong>Bagaimana kalau pengalaman itu bisa dibentuk menjadi sesuatu yang dapat digunakan kembali?</strong></p></header>
    <ol className={styles.transformation}>{transformation.map(([title, detail], index) => <li key={title}><span>0{index + 1}</span><div><strong>{title}</strong><small>{detail}</small></div></li>)}</ol>
    <div className={styles.layers}><article><p>PUSPITA</p><h3>The Thinking Layer</h3><ul><li>Berpikir & menulis</li><li>Mempertanyakan & bereksperimen</li><li>Memperlihatkan karya</li><li>Mengembangkan perspektif</li></ul></article><div className={styles.layerConnection} aria-hidden="true"><span>ide menjadi sistem</span><i>→</i></div><article><p>RIPITA</p><h3>The System Layer</h3><ul><li>Tools & workflow</li><li>Automation & products</li><li>Infrastructure</li><li>Ecosystem</li></ul></article></div>
    <p className={styles.layerStatement}>PUSPITA menjelaskan pemikirannya. RIPITA menjalankan sistemnya.</p>
    <div className={styles.constellation}><p className={styles.eyebrow}>Ecosystem Map</p><div className={styles.constellationStage}><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /><button type="button" className={`${styles.constellationCenter} ${field === "RIPITA" ? styles.selected : ""}`} onClick={() => setField("RIPITA")}>RIPITA</button>{fields.map((item) => <button key={item} type="button" className={`${styles.constellationNode} ${field === item ? styles.selected : ""}`} onClick={() => setField(item)}>{item}</button>)}</div><p className={styles.constellationDetail}><b>{field}</b>{field === "RIPITA" ? " adalah kumpulan knowledge, tools, products, systems, dan infrastructure—bukan satu aplikasi monolitik." : " adalah salah satu bidang yang dapat berdiri sendiri, lalu terhubung saat diperlukan."}</p></div>
    <div className={styles.notOne}><span>NOT ONE</span><strong>SUPER APP.</strong><p>UNDERSTANDING <i>→</i> SYSTEM <i>→</i> PRODUCT <i>→</i> ECOSYSTEM</p><Link href="/ripita">Lihat Peta RIPITA <span aria-hidden="true">→</span></Link></div>
  </>;
}
