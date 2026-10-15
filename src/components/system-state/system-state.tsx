"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { SYSTEM_STATES, CONNECTION_COPY, type ConnectionStatus, type SystemStateType } from "./config";
import { useConnection } from "./use-connection";
import styles from "./system-state.module.css";

type Action = { label: string; disabled?: boolean } & (
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }
);
export interface SystemStateProps {
  type: SystemStateType;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  primaryAction?: Action | null;
  secondaryAction?: Action | null;
  size?: "page" | "section" | "compact";
  className?: string;
  connectionStatus?: ConnectionStatus;
}

function ActionButton({ action, secondary = false }: { action: Action; secondary?: boolean }) {
  const className = `btn ${secondary ? "btn-secondary" : "btn-primary"} ${styles.action}`;
  return action.href !== undefined ? (
    <Link className={className} href={action.href}>{action.label}</Link>
  ) : (
    <button className={className} type="button" disabled={action.disabled} onClick={action.onClick}>{action.label}</button>
  );
}

function Illustration({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  // A decorative wave remains a last-resort local fallback if a custom URL
  // fails. Never leave a broken-image glyph in the layout.
  return failed ? <span className={styles.imageFallback} role="img" aria-label={alt}>⌁</span> : (
    // Keep native PNG rendering: no image optimization request needed offline.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={styles.image} src={src} alt={alt} width={640} height={640} onError={() => setFailed(true)} />
  );
}

export function SystemState({ type, title, description, image, imageAlt, primaryAction, secondaryAction,
  size = "page", className = "", connectionStatus }: SystemStateProps) {
  const copy = SYSTEM_STATES[type];
  const id = useId();
  const connection = useConnection(type === "offline" && connectionStatus === undefined);
  const status = connectionStatus ?? connection.status;
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    // Also works in global-error, where the Next router context is unavailable.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    else window.location.assign("/");
  };
  const defaults: Partial<Record<SystemStateType, { primary?: Action; secondary?: Action }>> = {
    "404": { primary: { label: "Kembali ke Beranda", href: "/" }, secondary: { label: "Halaman Sebelumnya", onClick: goBack } },
    "500": { primary: { label: "Coba Lagi", onClick: () => window.location.reload() }, secondary: { label: "Kembali ke Beranda", href: "/" } },
    offline: { primary: { label: "Coba Lagi", onClick: () => { void connection.check(); }, disabled: status === "checking" } },
  };
  const primary = primaryAction === undefined ? defaults[type]?.primary : primaryAction;
  const secondary = secondaryAction === undefined ? defaults[type]?.secondary : secondaryAction;
  const Heading = size === "page" ? "h1" : "h2";
  let indicator: ReactNode = null;
  if (type === "loading") indicator = <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>;
  if (type === "offline") indicator = <p className={styles.connection} role="status"><span data-online={status === "online"} />{CONNECTION_COPY[status]}</p>;

  return (
    <section className={`${styles.state} ${styles[size]} ${styles[type === "404" ? "lost" : type === "500" ? "repair" : type]} ${className}`}
      aria-labelledby={`${id}-title`} aria-busy={type === "loading" || undefined}>
      <div className={styles.wave} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.art}>
          {type === "404" && <span className={styles.number} aria-hidden="true">404</span>}
          <Illustration key={image ?? copy.image} src={image ?? copy.image} alt={imageAlt ?? copy.alt} />
          {type === "loading" && <div className={styles.bubbles} aria-hidden="true"><i /><i /><i /></div>}
          {type === "500" && <span className={styles.gear} aria-hidden="true">⚙</span>}
          {type === "offline" && <span className={styles.signal} aria-hidden="true">⌁</span>}
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span aria-hidden="true">✳</span> {copy.eyebrow} <span aria-hidden="true">✳</span></p>
          <Heading id={`${id}-title`} className={styles.title}>{title ?? copy.title}</Heading>
          <p className={styles.description}>{description ?? copy.description}</p>
          {indicator}
          {(primary || secondary) && <div className={styles.actions}>
            {primary && <ActionButton action={primary} />}
            {secondary && <ActionButton action={secondary} secondary />}
          </div>}
        </div>
        <span className={styles.signature} aria-hidden="true">PUSPITACORE <span>·</span> TEMAN DI SETIAP ARUS</span>
      </div>
    </section>
  );
}
