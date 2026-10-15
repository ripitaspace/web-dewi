import { SystemState } from "./system-state";
import styles from "./system-state.module.css";

export function RouteLoading() {
  return <main className={styles.pending} aria-label="Memuat halaman" aria-busy="true">
    <div className={styles.delayed}><SystemState type="loading" /></div>
  </main>;
}
