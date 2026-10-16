"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type VisitorResponse = {
  visitorCount: number | null;
};

const visitorFormatter = new Intl.NumberFormat("id-ID");

export function VisitorStamp() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVisitorCount() {
      try {
        const response = await fetch("/api/analytics/visitors", { signal: controller.signal });
        if (!response.ok) return;
        const data = (await response.json()) as VisitorResponse;
        setVisitorCount(data.visitorCount);
      } catch {
        // The stamp intentionally remains quiet when analytics is not configured.
      } finally {
        setIsLoading(false);
      }
    }

    void loadVisitorCount();
    return () => controller.abort();
  }, []);

  const countLabel = visitorCount === null ? "—" : visitorFormatter.format(visitorCount);
  const statusLabel = isLoading ? "Memuat data pengunjung" : visitorCount === null ? "Umami belum dikonfigurasi" : `Total pengunjung sejak awal: ${countLabel}`;

  return (
    <aside className="visitor-stamp" aria-live="polite" aria-label={`Web Analytics: ${statusLabel}`}>
      <Image
        className="visitor-stamp__art"
        src="/images/analytics/web-analytics-stamp-blank.png"
        alt=""
        width={1122}
        height={1402}
        sizes="(max-width: 640px) 92px, 132px"
      />
      <div className="visitor-stamp__count" aria-hidden="true">
        <strong>{countLabel}</strong>
      </div>
    </aside>
  );
}
