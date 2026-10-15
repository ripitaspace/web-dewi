"use client";

import { useState } from "react";
import { SystemState } from "./system-state";
import { SYSTEM_STATES, type ConnectionStatus, type SystemStateType } from "./config";
import styles from "./system-state.module.css";

export function SystemStateShowcase() {
  const [type, setType] = useState<SystemStateType>("loading");
  const [status, setStatus] = useState<ConnectionStatus>("offline");
  const [retries, setRetries] = useState(0);
  return <main>
    <nav className={styles.previewNav} aria-label="Preview state (development only)">
      {(Object.keys(SYSTEM_STATES) as SystemStateType[]).map((state) =>
        <button key={state} className="btn btn-secondary btn-small" aria-pressed={state === type} onClick={() => setType(state)}>{state}</button>)}
    </nav>
    {type === "500" && <p role="status" style={{ textAlign: "center" }}>Simulasi retry: {retries}</p>}
    <SystemState key={type} type={type} connectionStatus={status}
      primaryAction={type === "offline" ? { label: "Coba Lagi", onClick: () => setStatus(status === "online" ? "offline" : "online") }
        : type === "500" ? { label: "Coba Lagi", onClick: () => setRetries(retries + 1) } : undefined} />
  </main>;
}
