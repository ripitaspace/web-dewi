import type { ConnectionStatus } from "./config";

/** A browser online event is only a hint. Verify an uncached same-origin response
 * and its marker, so a captive portal/HTTP error cannot masquerade as recovery. */
export async function probeConnection(signal: AbortSignal): Promise<ConnectionStatus> {
  if (!navigator.onLine) return "offline";
  try {
    const response = await fetch("/api/health", {
      cache: "no-store", credentials: "same-origin", signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return "server-error";
    const body = await response.json();
    return body?.service === "puspitacore" && body?.ok === true ? "online" : "unreachable";
  } catch {
    return navigator.onLine ? "unreachable" : "offline";
  }
}
