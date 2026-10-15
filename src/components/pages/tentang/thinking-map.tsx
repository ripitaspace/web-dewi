"use client";

import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
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
const relationshipText = "Aku cenderung melihat hubungan.";
const questionParticles = Array.from({ length: 22 }, (_, index) => index);

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

function particleStyle(index: number): CSSProperties {
  const fallX = -45 - ((index * 31) % 138);
  const fallY = 156 + ((index * 47) % 238);
  return {
    "--particle-start-x": `${10 + ((index * 17) % 82)}%`,
    "--particle-start-y": `${72 + ((index * 23) % 76)}px`,
    "--particle-size": `${3 + (index % 4)}px`,
    "--particle-delay": `${index * 58}ms`,
    "--particle-x-1": `${fallX}px`,
    "--particle-y-1": `${fallY}px`,
    "--particle-x-2": `${Math.round(fallX * .9)}px`,
    "--particle-y-2": `${Math.round(fallY * .7)}px`,
    "--particle-x-3": `${Math.round(fallX * .96)}px`,
    "--particle-y-3": `${Math.round(fallY * .92)}px`,
  } as CSSProperties;
}

export function ThinkingMap() {
  const [selected, setSelected] = useState("Manusia");
  const [groupIndex, setGroupIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [questionParticlesActive, setQuestionParticlesActive] = useState(false);
  const relationshipRef = useRef<HTMLSpanElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const relationship = relationshipRef.current;
    if (!relationship) return;

    const media = gsap.matchMedia();
    media.add({
      hover: "(hover: hover) and (pointer: fine)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      const { hover, reduced } = context.conditions!;
      if (!hover || reduced) return;

      const letters = gsap.utils.toArray<HTMLElement>("[data-relationship-char]", relationship);
      const spaces = gsap.utils.toArray<HTMLElement>("[data-space]", relationship);
      const line = relationship.querySelector<HTMLElement>("[data-relationship-line]");
      if (!line) return;

      const midpoint = (letters.length - 1) / 2;
      const interaction = gsap.timeline({ paused: true });
      gsap.set(line, { scaleX: 0, opacity: 0 });
      interaction
        .to(line, { opacity: 1, duration: .01 }, 0)
        .to(line, { scaleX: 1, duration: .72, ease: "power2.inOut" }, 0)
        .to(relationship, { letterSpacing: "-.15em", duration: .54, ease: "power2.out" }, 0)
        .to(spaces, { width: 0, duration: .54, ease: "power2.out" }, 0)
        .to(letters, {
          x: (index: number) => {
            const tension = 1 - Math.abs(index - midpoint) / midpoint;
            return (midpoint - index) * (1.25 + tension * .9);
          },
          scaleX: (index: number) => {
            const tension = 1 - Math.abs(index - midpoint) / midpoint;
            return 1 - tension * .24;
          },
          scaleY: (index: number) => {
            const tension = 1 - Math.abs(index - midpoint) / midpoint;
            return 1 - tension * .09;
          },
          duration: .54,
          stagger: { each: .012, from: "edges" },
          ease: "power2.out",
        }, 0);

      const enter = () => interaction.restart();
      const leave = () => interaction.reverse();
      relationship.addEventListener("pointerenter", enter);
      relationship.addEventListener("pointerleave", leave);
      return () => {
        relationship.removeEventListener("pointerenter", enter);
        relationship.removeEventListener("pointerleave", leave);
      };
    }, relationship);
    return () => media.revert();
  }, []);

  useLayoutEffect(() => {
    const heading = questionHeadingRef.current;
    if (!heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setQuestionParticlesActive(true);
      observer.disconnect();
    }, { threshold: .55 });
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);
  const selectedNode = nodes.find((node) => node.name === selected) ?? nodes[0];
  const selectedIndex = nodes.findIndex((node) => node.name === selected);
  return <>
    <div className={styles.thinkingIntro}>
      <div><p className={styles.eyebrow}>Bab 01 / The Thinking Map</p><h2 className={styles.scatterHeading} aria-label="Ketika sesuatu terlihat berantakan, biasanya ada pola yang belum ditemukan.">{scatterTokens.map((word, wordIndex) => <Fragment key={scatterWords[wordIndex]}><span className={`${styles.word} ${activeWordIndex === wordIndex ? styles.wordScattered : ""}`} onPointerEnter={() => setActiveWordIndex(wordIndex)} onPointerLeave={() => setActiveWordIndex(null)} onClick={() => setActiveWordIndex((active) => active === wordIndex ? null : wordIndex)}>{word.map(({ character, index, delay }) => <span key={`${character}-${index}`} className={styles.letter} style={scatterStyle(index, delay)}>{character}</span>)}</span>{wordIndex < scatterTokens.length - 1 ? " " : null}</Fragment>)}</h2><p className={styles.subhead} aria-label={relationshipText}><span className={styles.relationship} ref={relationshipRef} aria-hidden="true">{Array.from(relationshipText).map((character, index) => <span className={styles.relationshipLetter} data-relationship-char data-space={character === " " || undefined} key={`${character}-${index}`}>{character === " " ? "\u00a0" : character}</span>)}<span className={styles.relationshipLine} data-relationship-line /></span></p><p className={styles.copy}>Aku sering melihat pekerjaan bukan sebagai daftar tugas, melainkan hubungan antara manusia, keputusan, dokumen, informasi, dan konsekuensi.</p><p className={styles.copy}>Aku tidak hanya ingin memahami apa yang terjadi. Aku ingin memahami mengapa itu terjadi dan pola apa yang ada di baliknya.</p></div>
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
      <span className={`${styles.questionParticles} ${questionParticlesActive ? styles.questionParticlesActive : ""}`} aria-hidden="true">{questionParticles.map((particle) => <i key={particle} style={particleStyle(particle)} />)}</span>
      <div><p className={styles.eyebrow}>Pertanyaan yang selalu muncul</p><h3 ref={questionHeadingRef}>Rasa ingin tahu adalah titik awalnya.</h3></div>
      <div className={styles.questionTabs} role="tablist" aria-label="Kategori pertanyaan">{questionGroups.map((group, index) => <button key={group.title} type="button" role="tab" aria-selected={groupIndex === index} className={groupIndex === index ? styles.active : ""} onClick={() => setGroupIndex(index)}>{group.title}</button>)}</div>
      <ol className={styles.questionList} aria-label={questionGroups[groupIndex].title}>{questionGroups[groupIndex].items.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol>
    </div>
    <div className={styles.pipeline} aria-label="Alur pertanyaan menjadi produk">{["Pertanyaan", "Pemikiran", "Eksperimen", "Karya", "Produk"].map((item, index) => <div key={item}><b>0{index + 1}</b><span>{item}</span></div>)}</div>
    <aside className={styles.notes}><p className={styles.eyebrow}>Sedang kupikirkan</p><ul><li>Apa yang membuat sistem terasa rumit?</li><li>Kapan automation membantu atau justru mengganggu?</li><li>Bagaimana informasi menjadi dasar keputusan?</li><li>Bagaimana teknologi mengikuti konteks manusia?</li></ul><Link href="/pemikiran">Baca Pemikiranku <span aria-hidden="true">→</span></Link></aside>
  </>;
}
