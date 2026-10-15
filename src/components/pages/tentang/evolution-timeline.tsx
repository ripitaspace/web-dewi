"use client";

import { useState } from "react";
import styles from "./about.module.css";
import { timeline } from "./content";

export function EvolutionTimeline() {
  const [shifted, setShifted] = useState(false);
  return <>
    <header className={styles.chapterHeading}><p className={styles.eyebrow}>Bab 02 / The Evolution Timeline</p><h2>Di belakang sebuah angka selalu ada cerita.</h2><p className={styles.subhead}>Perjalananku bukan meninggalkan accounting untuk technology. Justru menemukan hubungan di antara keduanya.</p><p className={styles.copy}>Accounting mengajariku membaca jejak berupa transaksi, bukti, laporan, kontrol, risiko, dan keputusan. Namun angka tidak berdiri sendiri. Selalu ada manusia, proses, dokumen, sistem, dan keputusan yang menghasilkan angka tersebut.</p></header>
    <button type="button" className={`${styles.shift} ${shifted ? styles.shifted : ""}`} onClick={() => setShifted(!shifted)} aria-pressed={shifted}><span>Interactive thinking shift</span><div><small>DULU</small><strong>“Kenapa angkanya salah?”</strong><em>Memeriksa output</em></div><i aria-hidden="true">→</i><div><small>KEMUDIAN</small><strong>“Proses apa yang membuat angka itu menjadi salah?”</strong><em>Mencari akar persoalan</em></div></button>
    <ol className={styles.timeline}>{timeline.map(([type, title, detail], index) => <li key={type}><b>0{index + 1}</b><div><p>{type}</p><h3>{title}</h3><span>{detail}</span></div></li>)}</ol>
    <div className={styles.beforeAfter}><div><p>Previously</p><strong>Excel · Laporan · SOP · Catatan</strong></div><i>→</i><div><p>Evolving into</p><strong>Workflow · Database · Automation · Interface · Product</strong></div></div>
    <blockquote className={styles.bigQuote}><strong>NUMBERS <i>→</i> CONTEXT <i>→</i> PROCESS <i>→</i> SYSTEM</strong><p>“Perjalananku bukan hanya memahami angka, tetapi memahami sistem yang menghasilkan angka tersebut.”</p></blockquote>
  </>;
}
