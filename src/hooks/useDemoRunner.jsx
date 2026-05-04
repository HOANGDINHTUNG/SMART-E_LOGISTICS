import { useEffect, useRef, useState } from "react";
import { startDemoGenerator } from "@/utils/demoGenerator";
import * as demoStorage from "@/lib/demoStorage";

export function useDemoRunner({ duration = 300000, onEvent } = {}) {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const stopRef = useRef(null);
  const endTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
      if (endTimerRef.current) clearInterval(endTimerRef.current);
    };
  }, []);

  function emit(evt) {
    // persist and call callback
    try {
      console.debug("[demo] emit", evt);
    } catch {}
    demoStorage.saveEvent(evt);
    if (typeof onEvent === "function") onEvent(evt);
    // broadcast for in-app listeners (Orders, Dashboard)
    try {
      window.dispatchEvent(new CustomEvent("demo:event", { detail: evt }));
    } catch {
      // ignore in non-browser env
    }
  }

  function start(opts = {}) {
    if (running) return;
    try {
      console.info("[demo] start", opts);
    } catch {}
    setRunning(true);
    setTimeLeft(duration);
    // start generator
    stopRef.current = startDemoGenerator(emit, opts.generatorOptions || {});

    const startedAt = Date.now();
    endTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        stop();
      }
    }, 500);
  }

  function stop() {
    if (!running) return;
    try {
      console.info("[demo] stop");
    } catch {}
    setRunning(false);
    setTimeLeft(0);
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    if (endTimerRef.current) {
      clearInterval(endTimerRef.current);
      endTimerRef.current = null;
    }
  }

  // expose for debug in dev
  if (typeof window !== "undefined") {
    try {
      window.__demoRunner = window.__demoRunner || {};
      window.__demoRunner.start = start;
      window.__demoRunner.stop = stop;
    } catch {}
  }

  return { running, timeLeft, start, stop };
}
