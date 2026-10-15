"use client";

import { Fragment, useState, type CSSProperties } from "react";
import Link from "next/link";
import styles from "./about.module.css";
import { questionGroups } from "./content";

const nodes = ["Manusia", "Keputusan", "Dokumen", "Informasi", "Konsekuensi"];
const scatterWords = "Ketika sesuatu terlihat berantakan, biasanya ada pola yang belum ditemukan.".split(" ");
let scatterIndex = 0;
const scatterTokens = scatterWords.map((word) => {
  const letters = Array.from(word).map((character, delay) => ({ character, index: scatterIndex++, delay }));
  scatterIndex += 1;
  return letters;
});

function scatterStyle(index: number, delay: number): CSSProperties {
  const angle = ((index * 137.5) - 90) * (Math.PI / 180);
  const distance = 18 + (index % 6) * 9;
  return {
    "--scatter-x": `${Math.round(Math.cos(angle) * distance)}px`,
    "--scatter-y": `${Math.round(Math.sin(angle) * distance)}px`,
    "--scatter-rotate": `${(index % 2 === 0 ? 1 : -1) * (5 + (index % 5) * 3)}deg`,
    "--scatter-delay": `${delay * 8}ms`,
  } as CSSProperties;
}

export function ThinkingMap() {
  const [selected, setSelected] = useState("Manusia");
  const [groupIndex, setGroupIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  return <>
    <div className={styles.thinkingIntro}>
      <div><p className={styles.eyebrow}>Bab 01 / The Thinking Map</p><h2 className={styles.scatterHeading} aria-label="Ketika sesuatu terlihat berantakan, biasanya ada pola yang belum ditemukan.">{scatterTokens.map((word, wordIndex) => <Fragment key={scatterWords[wordIndex]}><span className={`${styles.word} ${activeWordIndex === wordIndex ? styles.wordScattered : ""}`} onPointerEnter={() => setActiveWordIndex(wordIndex)} onPointerLeave={() => setActiveWordIndex(null)} onClick={() => setActiveWordIndex((active) => active === wordIndex ? null : wordIndex)}>{word.map(({ character, index, delay }) => <span key={`${character}-${index}`} className={styles.letter} style={scatterStyle(index, delay)}>{character}</span>)}</span>{wordIndex < scatterTokens.length - 1 ? " " : null}</Fragment>)}</h2><p className={styles.subhead}>Aku cenderung melihat hubungan.</p><p className={styles.copy}>Aku sering melihat pekerjaan bukan sebagai daftar tugas, melainkan hubungan antara manusia, keputusan, dokumen, informasi, dan konsekuensi.</p><p className={styles.copy}>Aku tidak hanya ingin memahami apa yang terjadi. Aku ingin memahami mengapa itu terjadi dan pola apa yang ada di baliknya.</p></div>
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
