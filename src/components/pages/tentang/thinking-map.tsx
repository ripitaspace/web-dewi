"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./about.module.css";
import { questionGroups } from "./content";

const nodes = ["Manusia", "Keputusan", "Dokumen", "Informasi", "Konsekuensi"];

export function ThinkingMap() {
  const [selected, setSelected] = useState("Manusia");
  const [groupIndex, setGroupIndex] = useState(0);
  return <>
    <div className={styles.thinkingIntro}>
      <div><p className={styles.eyebrow}>Bab 01 / The Thinking Map</p><h2>Ketika sesuatu terlihat berantakan, biasanya ada pola yang belum ditemukan.</h2><p className={styles.subhead}>Aku cenderung melihat hubungan.</p><p className={styles.copy}>Aku sering melihat pekerjaan bukan sebagai daftar tugas, melainkan hubungan antara manusia, keputusan, dokumen, informasi, dan konsekuensi.</p><p className={styles.copy}>Aku tidak hanya ingin memahami apa yang terjadi. Aku ingin memahami mengapa itu terjadi dan pola apa yang ada di baliknya.</p></div>
      <div className={styles.map} aria-label="Peta hubungan cara berpikir">
        <svg viewBox="0 0 400 400" aria-hidden="true"><path d="M95 97 282 82 327 224 202 326 75 261ZM95 97 327 224M282 82 75 261M95 97 202 326" /></svg>
        {nodes.map((node) => <button key={node} type="button" className={`${styles.mapNode} ${styles[`node${node}`]} ${selected === node ? styles.selected : ""}`} onClick={() => setSelected(node)} onFocus={() => setSelected(node)}>{node}</button>)}
        <p><b>{selected}</b> tidak berdiri sendiri. Pilih simpul untuk melihat hubungan.</p>
      </div>
    </div>
    <div className={styles.questionBlock}>
      <div><p className={styles.eyebrow}>Pertanyaan yang selalu muncul</p><h3>Rasa ingin tahu adalah titik awalnya.</h3></div>
      <div className={styles.questionTabs} role="tablist" aria-label="Kategori pertanyaan">{questionGroups.map((group, index) => <button key={group.title} type="button" role="tab" aria-selected={groupIndex === index} className={groupIndex === index ? styles.active : ""} onClick={() => setGroupIndex(index)}>{group.title}</button>)}</div>
      <ol className={styles.questionList} aria-label={questionGroups[groupIndex].title}>{questionGroups[groupIndex].items.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol>
    </div>
    <div className={styles.pipeline} aria-label="Alur pertanyaan menjadi produk">{["Pertanyaan", "Pemikiran", "Eksperimen", "Karya", "Produk"].map((item, index) => <div key={item}><b>0{index + 1}</b><span>{item}</span></div>)}</div>
    <aside className={styles.notes}><p className={styles.eyebrow}>Sedang kupikirkan</p><ul><li>Apa yang membuat sistem terasa rumit?</li><li>Kapan automation membantu atau justru mengganggu?</li><li>Bagaimana informasi menjadi dasar keputusan?</li><li>Bagaimana teknologi mengikuti konteks manusia?</li></ul><Link href="/pemikiran">Baca Pemikiranku <span aria-hidden="true">→</span></Link></aside>
  </>;
}
