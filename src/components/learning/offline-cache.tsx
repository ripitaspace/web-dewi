"use client";

import { useEffect } from "react";

/** Registers only after someone visits Belajar; no learner data is ever sent to it. */
export function LearningOfflineCache() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/learning-sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Offline cache is progressive enhancement; learning remains usable online.
    });
  }, []);
  return null;
}
