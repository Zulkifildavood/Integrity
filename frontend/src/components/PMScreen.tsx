"use client";
import { useState, useEffect } from "react";
import { submitPMReflection } from "@/lib/api";

export default function PMScreen({ remaining, refreshStatus }: { remaining: number; refreshStatus: () => void }) {
  const [reflection, setReflection] = useState("");
  const [timeLeft, setTimeLeft] = useState(remaining);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [penaltyWarning, setPenaltyWarning] = useState(false);
  const [pasteWarning, setPasteWarning] = useState(false);

  useEffect(() => {
    setTimeLeft(remaining);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  // Anti-Cheat: Tab Switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setPenaltyWarning(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (reflection.trim().length < 10) throw new Error("Reflection too short.");
      await submitPMReflection(reflection);
      refreshStatus();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (!submitting) handleSubmit();
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-6">
      <div className="w-full flex flex-wrap justify-between items-center mb-6 border-b border-[#444444] pb-4 gap-2">
        <h1 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Auditor Window</h1>
        <div className={`text-xl sm:text-2xl font-mono ${timeLeft < 60 ? "text-red-500 animate-pulse" : ""}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {penaltyWarning && (
        <div className="mb-4 text-red-500 text-sm border border-red-500 p-2 w-full text-center uppercase tracking-widest">
          Focus loss detected. Discipline is mandatory.
        </div>
      )}

      {pasteWarning && (
        <div className="mb-4 text-yellow-400 text-sm border border-yellow-500 p-2 w-full text-center uppercase tracking-widest animate-pulse">
          ⚠ Paste is disabled. Write your reflection manually.
        </div>
      )}

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="w-full space-y-4">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">Account for your actions.</p>
        
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="State what was done and what was failed."
          rows={10}
          className="w-full resize-none"
          onPaste={(e) => {
            e.preventDefault();
            setPasteWarning(true);
            setTimeout(() => setPasteWarning(false), 3000);
          }}
          onCopy={(e) => e.preventDefault()}
          autoComplete="off"
          spellCheck="false"
        />

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "SUBMITTING..." : "COMMIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
