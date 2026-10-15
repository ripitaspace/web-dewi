import Link from "next/link";
import styles from "./about.module.css";

export function AboutClosing() {
  return <section className={styles.closing}><div className="container"><p className={styles.eyebrow}>Where ideas become things</p><h2>Tidak semua pertanyaan harus langsung memiliki jawaban. <em>Beberapa justru layak dibangun.</em></h2><p>Di sinilah aku menyimpan pemikiran, eksperimen, dan karya yang terus berkembang. Sebagian masih berupa pertanyaan. Sebagian sudah menjadi sesuatu yang bisa digunakan.</p><div className="button-row"><Link className="btn btn-light" href="/ripita">Lihat Peta RIPITA <span aria-hidden="true">→</span></Link><Link className="btn btn-light" href="/karya">Lihat yang Sedang Kubangun <span aria-hidden="true">→</span></Link><Link className="btn btn-light" href="/karya">Jelajahi Karya <span aria-hidden="true">→</span></Link></div></div></section>;
}
