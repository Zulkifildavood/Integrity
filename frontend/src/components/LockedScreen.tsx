"use client";
import { useState, useEffect } from "react";

export default function LockedScreen({ remaining }: { remaining: number }) {
  const [timeLeft, setTimeLeft] = useState(remaining);

  // Fallback local mock countdown if waiting for next sync
  useEffect(() => {
    setTimeLeft(remaining);
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-4xl font-bold mb-4 tracking-widest text-[#444444]">SYSTEM LOCKED</h1>
      <div className="text-6xl font-mono mb-8 border-b-2 border-[#444444] pb-4">
        {timeLeft > 0 ? formatTime(timeLeft) : "WAITING FOR SYNC"}
      </div>
      <p className="text-sm text-gray-500 uppercase tracking-widest">Discipline enforces freedom.</p>
    </div>
  );
}
