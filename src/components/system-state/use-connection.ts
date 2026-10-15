"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectionStatus } from "./config";
import { probeConnection } from "./connection";

export function useConnection(enabled = true) {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const statusRef = useRef(status);
  const [lastStatus, setLastStatus] = useState<ConnectionStatus>("checking");
  const check = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setStatus("checking");
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const result = await probeConnection(controller.signal);
    window.clearTimeout(timeout);
    if (mounted.current && request.current === controller) {
      statusRef.current = result;
      setStatus(result);
      setLastStatus(result);
    }
    return result;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    mounted.current = true;
    const verify = () => { void check(); };
    const resume = () => {
      if (document.visibilityState === "visible") verify();
    };
    verify();
    window.addEventListener("online", verify);
    window.addEventListener("offline", verify);
    document.addEventListener("visibilitychange", resume);
    const interval = window.setInterval(() => {
      if (statusRef.current !== "online" && document.visibilityState === "visible") verify();
    }, 15000);
    return () => {
      mounted.current = false;
      request.current?.abort();
      window.clearInterval(interval);
      window.removeEventListener("online", verify);
      window.removeEventListener("offline", verify);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [check, enabled]);
  return { status, lastStatus, check };
}
