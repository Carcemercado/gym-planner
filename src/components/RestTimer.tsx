"use client";

import { useEffect, useRef, useState } from "react";

export default function RestTimer({ initialSeconds = 90 }: { initialSeconds?: number }) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [running, setRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const onVisibility = async () => {
      if (document.visibilityState === "visible" && running) {
        try {
          if ("wakeLock" in navigator && (navigator as any).wakeLock) {
            wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
          }
        } catch {}
      } else {
        try {
          await wakeLockRef.current?.release();
          wakeLockRef.current = null;
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
      try {
        // optional beep
        // new Audio('/beep.mp3').play();
      } catch {}
    }
  }, [secondsLeft, running]);

  const start = () => {
    setSecondsLeft(initialSeconds);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const resume = () => setRunning(true);
  const reset = () => {
    setRunning(false);
    setSecondsLeft(initialSeconds);
  };

  return (
    <div className="border border-gray-700 rounded p-3 bg-gray-800">
      <div className="text-center text-2xl font-mono">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</div>
      <div className="flex gap-2 justify-center mt-2">
        {!running && <button className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 transition" onClick={start}>Start</button>}
        {running && <button className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition" onClick={pause}>Pause</button>}
        {!running && secondsLeft !== initialSeconds && <button className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition" onClick={resume}>Resume</button>}
        <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
