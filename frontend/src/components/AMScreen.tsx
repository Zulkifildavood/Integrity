"use client";
import { useState, useEffect } from "react";
import { submitAMGoals } from "@/lib/api";

export default function AMScreen({ remaining, refreshStatus }: { remaining: number; refreshStatus: () => void }) {
  const [goals, setGoals] = useState<string[]>(["", "", ""]);
  const [timeLeft, setTimeLeft] = useState(remaining);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [penaltyWarning, setPenaltyWarning] = useState(false);

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
        // Basic version: Just warn. Advanced: Reduce time or instantly burn session.
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Anti-Cheat: Disable Copy/Paste happens natively via onCopy/onPaste in JSX

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const addGoal = () => setGoals([...goals, ""]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const validGoals = goals.filter((g) => g.trim().length > 0);
      if (validGoals.length < 3) throw new Error("At least 3 goals required.");

      await submitAMGoals(validGoals);
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
        <h1 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Architect Window</h1>
        <div className={`text-xl sm:text-2xl font-mono ${timeLeft < 60 ? "text-red-500 animate-pulse" : ""}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {penaltyWarning && (
        <div className="mb-4 text-red-500 text-sm border border-red-500 p-2 w-full text-center uppercase tracking-widest">
          Focus loss detected. Discipline is mandatory.
        </div>
      )}

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <div className="w-full space-y-4">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">Define todays mandate.</p>
        
        {goals.map((goal, index) => (
          <textarea
            key={index}
            value={goal}
            onChange={(e) => handleGoalChange(index, e.target.value)}
            placeholder={`GOAL 0${index + 1}`}
            rows={2}
            className="w-full resize-none"
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            autoComplete="off"
            spellCheck="false"
          />
        ))}

        <div className="flex justify-between mt-6 gap-4">
          <button onClick={addGoal} type="button" className="text-sm">
            + ADD GOAL
          </button>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "SUBMITTING..." : "COMMIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
