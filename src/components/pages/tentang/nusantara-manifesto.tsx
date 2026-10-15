import styles from "./about.module.css";
import { values } from "./content";

export function NusantaraManifesto() {
  return <>
    <div className={styles.manifestoArt} aria-hidden="true"><img className={styles.turtle} src="/images/artworks/sea-turtle-gouache.png" alt="" /><img className={styles.coral} src="/images/artworks/coral-fish-gouache.png" alt="" /></div>
    <header className={styles.manifestoHeading}><p className={styles.eyebrow}>Bab 03 / Nusantara Future Manifesto</p><h2>Rupa Indonesia.<br /><em>Akal Masa Depan.</em></h2><p>Indonesia bukan dekorasi. Indonesia adalah perspektif.</p></header>
    <div className={styles.manifestoCopy}><p>Identitas Indonesia di dalam website ini tidak hanya muncul dalam visual, melainkan juga melalui nilai yang ingin kubawa ke dalam pekerjaan dan produk.</p><p>Aku tidak ingin membawa Indonesia ke dunia hanya melalui rupa. Aku ingin membawa cara berpikirnya.</p></div>
    <div className={styles.values}>{values.map(([title, detail], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{detail}</p></article>)}</div>
    <p className={styles.formula}>Indonesia <i>×</i> Professional Knowledge <i>×</i> Technology <i>×</i> Design <i>×</i> Global Perspective</p>
    <p className={styles.manifestoClosing}>Bukan nostalgia terhadap Indonesia. Bukan pula terlihat global dengan menghilangkan identitas sendiri. Tetapi membangun sesuatu yang modern, relevan, dan dapat digunakan lebih luas—tanpa melupakan dari mana aku berasal.</p>
  </>;
}
