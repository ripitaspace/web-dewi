"use client";

import { Fragment, useState, type CSSProperties } from "react";
import Link from "next/link";
import styles from "./about.module.css";
import { questionGroups } from "./content";

const nodes = [
  { name: "Manusia", role: "Memulai dari kebutuhan, konteks, dan orang yang akan menggunakan hasilnya.", next: "Informasi" },
  { name: "Informasi", role: "Mengubah pengamatan menjadi fakta yang cukup jelas untuk dipertimbangkan.", next: "Keputusan" },
  { name: "Keputusan", role: "Memilih arah dengan mempertimbangkan konteks, batasan, dan dampaknya.", next: "Dokumen" },
  { name: "Dokumen", role: "Merekam keputusan supaya pekerjaan dapat dipahami dan diteruskan.", next: "Konsekuensi" },
  { name: "Konsekuensi", role: "Melihat dampak keputusan pada manusia—lalu menjadi masukan untuk putaran berikutnya.", next: "Manusia" },
];
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
  const selectedNode = nodes.find((node) => node.name === selected) ?? nodes[0];
  const selectedIndex = nodes.findIndex((node) => node.name === selected);
  return <>
    <div className={styles.thinkingIntro}>
      <div><p className={styles.eyebrow}>Bab 01 / The Thinking Map</p><h2 className={styles.scatterHeading} aria-label="Ketika sesuatu terlihat berantakan, biasanya ada pola yang belum ditemukan.">{scatterTokens.map((word, wordIndex) => <Fragment key={scatterWords[wordIndex]}><span className={`${styles.word} ${activeWordIndex === wordIndex ? styles.wordScattered : ""}`} onPointerEnter={() => setActiveWordIndex(wordIndex)} onPointerLeave={() => setActiveWordIndex(null)} onClick={() => setActiveWordIndex((active) => active === wordIndex ? null : wordIndex)}>{word.map(({ character, index, delay }) => <span key={`${character}-${index}`} className={styles.letter} style={scatterStyle(index, delay)}>{character}</span>)}</span>{wordIndex < scatterTokens.length - 1 ? " " : null}</Fragment>)}</h2><p className={styles.subhead}>Aku cenderung melihat hubungan.</p><p className={styles.copy}>Aku sering melihat pekerjaan bukan sebagai daftar tugas, melainkan hubungan antara manusia, keputusan, dokumen, informasi, dan konsekuensi.</p><p className={styles.copy}>Aku tidak hanya ingin memahami apa yang terjadi. Aku ingin memahami mengapa itu terjadi dan pola apa yang ada di baliknya.</p></div>
      <div className={styles.map} aria-label="Alur hubungan cara berpikir">
        <p className={styles.mapLabel}>Cara aku membaca sebuah pekerjaan</p>
        <div className={styles.mapFlow} aria-label="Alur sebab dan akibat">
          {nodes.map((node, index) => <Fragment key={node.name}>
            <button type="button" aria-pressed={selected === node.name} className={`${styles.mapNode} ${selected === node.name ? styles.selected : ""}`} onClick={() => setSelected(node.name)} onFocus={() => setSelected(node.name)}>
              <span>0{index + 1}</span>{node.name}
            </button>
            {index < nodes.length - 1 && <i className={`${styles.mapConnector} ${index === selectedIndex || index === selectedIndex - 1 ? styles.connectorActive : ""}`} aria-hidden="true">→</i>}
          </Fragment>)}
        </div>
        <div className={styles.mapDetail} aria-live="polite">
          <p><span>Langkah 0{selectedIndex + 1}</span><b>{selectedNode.name}</b></p>
          <p>{selectedNode.role}</p>
          <small>Berlanjut ke <strong>{selectedNode.next}</strong> <i aria-hidden="true">→</i></small>
        </div>
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
