"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { RipitaMark } from "@/components/brand/ripita-mark";
import {
  RIPITA_LOADER_SESSION_KEY,
  RipitaSignatureLoader,
} from "@/components/brand/ripita-signature-loader";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";

export function RipitaMotionDemo() {
  const [runToken, setRunToken] = useState(1);
  const [forceCompleteToken, setForceCompleteToken] = useState(0);
  const [simulatedLoadMs, setSimulatedLoadMs] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [referenceOpacity, setReferenceOpacity] = useState(0);
  const [status, setStatus] = useState("Animasi berjalan");

  const run = (delay: number, label: string) => {
    setSimulatedLoadMs(delay);
    setStatus(label);
    setRunToken((value) => value + 1);
  };

  const simulateFirstVisit = () => {
    try {
      window.sessionStorage.removeItem(RIPITA_LOADER_SESSION_KEY);
    } catch {
      // Demo remains usable when session storage is unavailable.
    }
    run(0, "Simulasi kunjungan pertama");
  };

  const handleComplete = useCallback(() => {
    setStatus("Siklus selesai");
  }, []);

  return (
    <>
      <SiteHeader currentKey="karya" />
      <RipitaSignatureLoader
        demoMode
        runToken={runToken}
        forceCompleteToken={forceCompleteToken}
        simulatedLoadMs={simulatedLoadMs}
        forceReducedMotion={reducedMotion}
        onComplete={handleComplete}
      />

      <aside className="ripita-demo-controls" aria-label="Kontrol demo animasi">
        <div>
          <strong>Motion Lab</strong>
          <span aria-live="polite">{status}</span>
        </div>
        <button type="button" onClick={simulateFirstVisit}>
          Kunjungan pertama
        </button>
        <button type="button" onClick={() => run(0, "Replay normal")}>
          Replay
        </button>
        <button type="button" onClick={() => run(6000, "Simulasi loading 6 detik")}>
          Slow 6 detik
        </button>
        <button type="button" onClick={() => run(10000, "Extended state aktif")}>
          Extended state
        </button>
        <button
          type="button"
          onClick={() => setForceCompleteToken((value) => value + 1)}
        >
          Selesai sekarang
        </button>
        <label>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => {
              const checked = event.target.checked;
              setReducedMotion(checked);
              run(0, checked ? "Reduced motion aktif" : "Motion penuh aktif");
            }}
          />
          Reduced motion
        </label>
      </aside>

      <main className="ripita-motion-page" id="main-content">
        <section className="ripita-motion-hero">
          <span className="eyebrow text-rempah">RIPITA · MOTION IDENTITY</span>
          <h1>RIPITA Awakens</h1>
          <p className="lead muted">
            Empat bentuk bertemu menjadi satu signature: struktur, rasa, gerak,
            dan aksen yang mengantar pengunjung masuk ke PUSPITA × RIPITA.
          </p>
        </section>

        <section className="ripita-motion-comparison" aria-labelledby="comparison-title">
          <div>
            <span className="eyebrow text-delima">Silhouette check</span>
            <h2 id="comparison-title">SVG produksi dan referensi PNG</h2>
            <p className="muted">
              Geser kontrol untuk menumpuk referensi raster di atas SVG. Bentuk
              produksi tetap memakai empat lapisan terpisah agar dapat dianimasikan.
            </p>
            <label className="ripita-reference-control">
              Opasitas referensi: {referenceOpacity}%
              <input
                type="range"
                min="0"
                max="100"
                value={referenceOpacity}
                onChange={(event) => setReferenceOpacity(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="ripita-logo-comparison" aria-label="Perbandingan logo SVG dan PNG">
            <RipitaMark title="Logo RIPITA versi SVG" />
            {/* The raster is intentionally retained as a visual fidelity reference. */}
            <Image
              src="/images/brand/puspita-ripita-mark.png"
              alt="Referensi logo RIPITA versi PNG"
              fill
              sizes="(max-width: 760px) 86vw, 420px"
              style={{ opacity: referenceOpacity / 100 }}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
