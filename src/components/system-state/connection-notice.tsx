"use client";

import { useConnection } from "./use-connection";
import { SystemState } from "./system-state";
import { CONNECTION_COPY } from "./config";
import styles from "./system-state.module.css";

/** Non-blocking: downloaded learning modules and local tools stay usable. */
export function ConnectionNotice() {
  const { status, lastStatus, check } = useConnection();
  const unavailable = lastStatus !== "online" && lastStatus !== "checking";
  return <>
    <span className="sr-only" role="status">{lastStatus === "online" ? CONNECTION_COPY.online : ""}</span>
    {/* Keep the image mounted so it downloads while the connection is healthy. */}
    <details className={styles.notice} hidden={!unavailable}>
      <summary><span role="status">{CONNECTION_COPY[status]}</span> Lihat status</summary>
      <SystemState type={lastStatus === "server-error" ? "500" : "offline"} size="compact" connectionStatus={status}
        primaryAction={{ label: "Coba Lagi", disabled: status === "checking", onClick: () => { void check(); } }} secondaryAction={null} />
    </details>
  </>;
}
