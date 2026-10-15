"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { RipitaMark } from "@/components/brand/ripita-mark";

export const RIPITA_LOADER_SESSION_KEY = "ripita:signature-seen:v1";
export const RIPITA_LOADER_COMPLETE_EVENT = "ripita:loader-complete";

export interface RipitaLoaderConfig {
  enabled: boolean;
  sequenceDurationMs: number;
  backgroundColor: string;
  logoSize: string;
  initialLoadOnly: boolean;
  playOnRouteChange: boolean;
  extendedLoading: boolean;
  navbarTargetSelector: string;
  minDisplayMs: number;
  maxFallbackMs: number;
  replayRoutes: string[];
  showLoadingLabel: boolean;
}

export interface RipitaSignatureLoaderProps extends Partial<RipitaLoaderConfig> {
  demoMode?: boolean;
  runToken?: number;
  forceCompleteToken?: number;
  simulatedLoadMs?: number;
  forceReducedMotion?: boolean;
  onComplete?: () => void;
}

type LoaderPhase = "idle" | "assembling" | "holding" | "exiting" | "hidden";

const EMPTY_ROUTES: string[] = [];
const DEMO_ROUTE = "/karya/ripita-motion";
const EXIT_DURATION_MS = 400;

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) =>
    route.endsWith("/*") ? pathname.startsWith(route.slice(0, -1)) : pathname === route,
  );
}

function waitForCriticalAssets(simulatedLoadMs: number | undefined) {
  if (typeof simulatedLoadMs === "number") {
    return new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, simulatedLoadMs)));
  }

  const fontReady = document.fonts?.ready?.then(() => undefined).catch(() => undefined) ??
    Promise.resolve();
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>("img[data-loader-critical]"),
  );
  const imageReady = images.map((image) => {
    if (image.complete) return Promise.resolve();
    if (typeof image.decode === "function") return image.decode().catch(() => undefined);
    return new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  });

  return Promise.all([fontReady, ...imageReady]).then(() => undefined);
}

export function RipitaSignatureLoader({
  enabled = true,
  sequenceDurationMs = 900,
  backgroundColor = "#F3E7D3",
  logoSize = "clamp(180px, 24vw, 320px)",
  initialLoadOnly = true,
  playOnRouteChange = false,
  extendedLoading = true,
  navbarTargetSelector = "[data-ripita-logo-target]",
  minDisplayMs = 900,
  maxFallbackMs = 6000,
  replayRoutes = EMPTY_ROUTES,
  showLoadingLabel = true,
  demoMode = false,
  runToken = 0,
  forceCompleteToken = 0,
  simulatedLoadMs,
  forceReducedMotion,
  onComplete,
}: RipitaSignatureLoaderProps) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<LoaderPhase>("idle");
  const overlayRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const animationsRef = useRef<Animation[]>([]);
  const exitCycleRef = useRef<(() => void) | null>(null);
  const handledInitialRef = useRef(false);
  const previousPathRef = useRef(pathname);
  const lastDemoRunRef = useRef(-1);
  const overflowRef = useRef<{ html: string; body: string } | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
    const clearAnimations = () => {
      animationsRef.current.forEach((animation) => animation.cancel());
      animationsRef.current = [];
    };
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, Math.max(0, delay));
      timersRef.current.push(timer);
      return timer;
    };
    const dispatchComplete = () => {
      document.documentElement.dataset.ripitaLoader = "complete";
      window.dispatchEvent(new CustomEvent(RIPITA_LOADER_COMPLETE_EVENT));
      onComplete?.();
    };
    const unlockScroll = () => {
      if (!overflowRef.current) return;
      document.documentElement.style.overflow = overflowRef.current.html;
      document.body.style.overflow = overflowRef.current.body;
      overflowRef.current = null;
    };
    const completeWithoutAnimation = () => {
      clearTimers();
      clearAnimations();
      unlockScroll();
      setPhase("hidden");
      if (!demoMode) dispatchComplete();
    };

    const routeChanged = previousPathRef.current !== pathname;
    previousPathRef.current = pathname;
    const firstPass = !handledInitialRef.current;
    if (firstPass) handledInitialRef.current = true;
    const requestedDemoRun = demoMode && runToken !== lastDemoRunRef.current;
    if (demoMode) lastDemoRunRef.current = runToken;
    const requestedRouteReplay =
      !demoMode &&
      routeChanged &&
      (playOnRouteChange || matchesRoute(pathname, replayRoutes));

    if (!enabled || (!demoMode && pathname === DEMO_ROUTE)) {
      completeWithoutAnimation();
      return () => {
        clearTimers();
        unlockScroll();
      };
    }

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(RIPITA_LOADER_SESSION_KEY) === "1";
    } catch {
      seen = false;
    }

    const shouldPlay = demoMode
      ? requestedDemoRun
      : requestedRouteReplay || (firstPass && (!initialLoadOnly || !seen));

    if (!shouldPlay) {
      completeWithoutAnimation();
      return () => {
        clearTimers();
        unlockScroll();
      };
    }

    clearTimers();
    clearAnimations();
    const cycle = cycleRef.current + 1;
    cycleRef.current = cycle;
    const reducedMotion =
      forceReducedMotion ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timelineScale = Math.max(0.55, sequenceDurationMs / 2100);
    let hasExited = false;
    let assetsReady = false;
    let earliestExitReached = false;
    const exitDuration = reducedMotion ? 150 : EXIT_DURATION_MS;
    const earliestExitAt = reducedMotion ? 250 : Math.max(0, minDisplayMs - exitDuration);
    const settleAt = reducedMotion ? 0 : Math.min(1700 * timelineScale, earliestExitAt);
    const fallbackExitAt = Math.max(earliestExitAt, maxFallbackMs - exitDuration);

    overflowRef.current = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (!demoMode) document.documentElement.dataset.ripitaLoader = "active";
    setPhase("holding");

    const finish = () => {
      if (cycleRef.current !== cycle) return;
      clearTimers();
      unlockScroll();
      setPhase("hidden");
      exitCycleRef.current = null;
      if (!demoMode) {
        try {
          window.sessionStorage.setItem(RIPITA_LOADER_SESSION_KEY, "1");
        } catch {
          // The visual lifecycle still completes when storage is unavailable.
        }
        dispatchComplete();
      } else {
        onComplete?.();
      }
    };

    const beginExit = () => {
      if (hasExited || cycleRef.current !== cycle) return;
      hasExited = true;
      setPhase("exiting");
      if (!demoMode) document.documentElement.dataset.ripitaLoader = "exiting";

      const flight = flightRef.current;
      const overlay = overlayRef.current;
      const target = document.querySelector<HTMLElement>(navbarTargetSelector);
      const animations: Animation[] = [];

      if (flight) {
        const sourceRect = flight.getBoundingClientRect();
        const targetRect = target?.getBoundingClientRect();
        const targetIsUsable = Boolean(
          targetRect && targetRect.width > 0 && targetRect.height > 0 && targetRect.bottom > 0,
        );
        const destination = targetIsUsable && targetRect ? targetRect : undefined;
        const deltaX = destination
          ? destination.left + destination.width / 2 - (sourceRect.left + sourceRect.width / 2)
          : 0;
        const deltaY = destination
          ? destination.top + destination.height / 2 - (sourceRect.top + sourceRect.height / 2)
          : 0;
        const scale = destination
          ? Math.min(destination.width / sourceRect.width, destination.height / sourceRect.height)
          : 0.88;

        animations.push(
          flight.animate(
            [
              { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
              {
                transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
                opacity: destination ? 0.96 : 0,
              },
            ],
            {
              duration: exitDuration,
              easing: "cubic-bezier(.22,.78,.22,1)",
              fill: "forwards",
            },
          ),
        );
      }
      if (overlay) {
        animations.push(
          overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: exitDuration,
            easing: "cubic-bezier(.4,0,.2,1)",
            fill: "forwards",
          }),
        );
      }

      if (animations.length) {
        animationsRef.current = animations;
        Promise.allSettled(animations.map((animation) => animation.finished)).then(finish);
      } else {
        schedule(finish, exitDuration);
      }
      schedule(finish, exitDuration + 80);
    };
    exitCycleRef.current = beginExit;

    if (reducedMotion) {
      assetsReady = true;
      schedule(() => {
        earliestExitReached = true;
        beginExit();
      }, earliestExitAt);
    } else {
      schedule(() => {
        if (!hasExited) setPhase("holding");
      }, settleAt);
      schedule(() => {
        earliestExitReached = true;
        if (assetsReady || !extendedLoading) beginExit();
      }, earliestExitAt);
      waitForCriticalAssets(demoMode ? simulatedLoadMs ?? 0 : undefined).then(() => {
        if (cycleRef.current !== cycle) return;
        assetsReady = true;
        if (earliestExitReached) beginExit();
      });
      schedule(beginExit, fallbackExitAt);
    }

    return () => {
      if (cycleRef.current === cycle) cycleRef.current += 1;
      clearTimers();
      clearAnimations();
      exitCycleRef.current = null;
      unlockScroll();
    };
  }, [
    backgroundColor,
    demoMode,
    enabled,
    extendedLoading,
    forceReducedMotion,
    initialLoadOnly,
    maxFallbackMs,
    minDisplayMs,
    navbarTargetSelector,
    onComplete,
    pathname,
    playOnRouteChange,
    replayRoutes,
    runToken,
    sequenceDurationMs,
    simulatedLoadMs,
  ]);

  useEffect(() => {
    if (forceCompleteToken > 0) exitCycleRef.current?.();
  }, [forceCompleteToken]);

  const timelineScale = Math.max(0.55, sequenceDurationMs / 2100);
  const style = {
    "--ripita-loader-bg": backgroundColor,
    "--ripita-loader-size": logoSize,
    "--ripita-spark-delay": `${150 * timelineScale}ms`,
    "--ripita-spark-duration": `${250 * timelineScale}ms`,
    "--ripita-figure-delay": `${350 * timelineScale}ms`,
    "--ripita-figure-duration": `${500 * timelineScale}ms`,
    "--ripita-wing-delay": `${650 * timelineScale}ms`,
    "--ripita-wing-duration": `${500 * timelineScale}ms`,
    "--ripita-structure-delay": `${900 * timelineScale}ms`,
    "--ripita-structure-duration": `${500 * timelineScale}ms`,
    "--ripita-breath-delay": `${1400 * timelineScale}ms`,
  } as CSSProperties;

  const active = phase === "assembling" || phase === "holding";

  return (
    <div
      ref={overlayRef}
      className={`ripita-loader ripita-loader--${phase}${
        forceReducedMotion === true
          ? " is-forced-reduced"
          : forceReducedMotion === false
            ? " is-forced-motion"
            : ""
      }`}
      data-active={active ? "true" : "false"}
      data-static="true"
      data-demo={demoMode ? "true" : "false"}
      style={style}
      role={phase === "hidden" ? undefined : "status"}
      aria-live="polite"
      aria-label="Menyiapkan PUSPITA × RIPITA"
      aria-hidden={phase === "hidden" ? true : undefined}
    >
      <div ref={flightRef} className="ripita-loader__flight">
        <RipitaMark className="ripita-loader__mark" />
        {showLoadingLabel ? (
          <span className="ripita-loader__label">Menyiapkan pengalaman…</span>
        ) : null}
      </div>
    </div>
  );
}
