"use client";
import { useState } from "react";
import { createAim, enableLocking } from "@/lib/api";

export default function SetupScreen({ refreshStatus }: { refreshStatus: () => void }) {
  const [aim, setAim] = useState("");
  const [extraPriorities, setExtraPriorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aimSaved, setAimSaved] = useState(false);
  const [lockingEnabled, setLockingEnabled] = useState(false);
  const [error, setError] = useState("");

  const handleSaveAim = async () => {
    if (!aim.trim()) {
      setError("Please enter your primary aim.");
      return;
    }
    const filteredExtras = extraPriorities.filter(p => p.trim());
    setLoading(true);
    setError("");
    try {
      await createAim(aim, JSON.stringify(filteredExtras));
      setAimSaved(true);
    } catch (err: any) {
      setError(err.message || "Failed to save aim.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExtra = () => {
    if (extraPriorities.length < 4) {
      setExtraPriorities([...extraPriorities, ""]);
    }
  };

  const handleExtraChange = (index: number, value: string) => {
    const newExtras = [...extraPriorities];
    newExtras[index] = value;
    setExtraPriorities(newExtras);
  };

  const handleRemoveExtra = (index: number) => {
    const newExtras = [...extraPriorities];
    newExtras.splice(index, 1);
    setExtraPriorities(newExtras);
  };

  const handleConfirmLock = async () => {
    if (!lockingEnabled) return;
    setLoading(true);
    setError("");
    try {
      await enableLocking();
      refreshStatus();
    } catch (err: any) {
      setError(err.message || "Failed to enable locking.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full max-w-xl mx-auto px-4 py-6 text-zinc-100">
      <h1 className="text-2xl sm:text-4xl font-bold mb-8 tracking-widest text-zinc-400 text-center">SYSTEM SETUP</h1>
      
      {error && <div className="text-red-500 mb-4 text-center text-sm">{error}</div>}

      <div className="w-full space-y-8">
        {/* Step 1: Set Aim */}
        <div className={`p-6 border rounded-sm ${aimSaved ? 'border-green-900 bg-green-950/20' : 'border-zinc-800 bg-zinc-900/40'}`}>
          <h2 className="text-xl font-bold mb-4 text-zinc-100">1. Define Your Priorities</h2>
          <p className="text-sm text-zinc-400 mb-4">What is your single most important priority right now?</p>
          <textarea
            className="w-full p-3 bg-black/50 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 mb-4 rounded-sm"
            rows={2}
            placeholder="Primary Aim (e.g. Launch my startup gracefully by Q3...)"
            value={aim}
            onChange={(e) => setAim(e.target.value)}
            disabled={loading || aimSaved}
          />

          {!aimSaved && extraPriorities.map((ep, i) => (
            <div key={i} className="flex gap-2 mb-3">
              <input
                type="text"
                className="w-full p-3 bg-black/50 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 rounded-sm"
                placeholder={`Secondary Priority ${i + 1}`}
                value={ep}
                onChange={(e) => handleExtraChange(i, e.target.value)}
                disabled={loading || aimSaved}
              />
              <button
                onClick={() => handleRemoveExtra(i)}
                className="px-4 bg-red-950/40 text-red-500 font-bold hover:bg-red-900/60 border border-red-900/50 transition-colors rounded-sm"
                disabled={loading || aimSaved}
              >
                X
              </button>
            </div>
          ))}

          {aimSaved && extraPriorities.filter(p => p.trim()).length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-zinc-500 uppercase mb-3">Secondary Priorities:</p>
              <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
                {extraPriorities.filter(p => p.trim()).map((ep, i) => (
                  <li key={i}>{ep}</li>
                ))}
              </ul>
            </div>
          )}

          {!aimSaved && extraPriorities.length < 4 && (
             <button
               onClick={handleAddExtra}
               className="text-xs font-bold text-zinc-400 uppercase mb-6 hover:text-zinc-200 transition-colors block tracking-widest"
               disabled={loading}
             >
               + Add Priority ({extraPriorities.length + 1}/5 max)
             </button>
          )}

          {!aimSaved && (
            <button
              onClick={handleSaveAim}
              disabled={loading}
              className="px-6 py-3 bg-zinc-200 text-black hover:bg-white w-full uppercase tracking-wider text-sm font-bold transition-colors rounded-sm"
            >
              {loading ? "Saving..." : "Save Priorities"}
            </button>
          )}
          {aimSaved && <div className="text-green-500 font-bold uppercase text-sm tracking-widest mt-2">✓ Priorities Locked In</div>}
        </div>

        {/* Step 2: Enable Locking */}
        {aimSaved && (
          <div className="p-6 border border-red-900/50 bg-red-950/20 animate-fade-in transition-opacity duration-500 rounded-sm">
            <h2 className="text-xl font-bold mb-5 text-red-500 tracking-wide">2. Enable Strict Mode</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <input
                type="checkbox"
                id="enableLocking"
                className="w-5 h-5 accent-red-600 bg-black border-red-900"
                checked={lockingEnabled}
                onChange={(e) => setLockingEnabled(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="enableLocking" className="font-bold text-red-300 cursor-pointer text-sm flex-1">
                I am ready to enforce my schedule.
              </label>
            </div>

            <div className="text-xs text-red-300/80 mb-8 bg-red-950/40 border border-red-900/40 p-4 rounded-sm">
              <strong className="block mb-2 font-extrabold uppercase tracking-widest text-red-400">WARNING:</strong>
              Once enabled, the system will start locking your application during non-window hours. 
              <strong className="block mt-2 text-red-400">You cannot undo this without burning your streak.</strong>
            </div>

            <button
              onClick={handleConfirmLock}
              disabled={!lockingEnabled || loading}
              className={`px-6 py-4 w-full uppercase tracking-widest text-sm font-bold transition-all rounded-sm
                ${!lockingEnabled || loading 
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/50' 
                  : 'bg-red-900/80 text-red-100 hover:bg-red-800 hover:shadow-lg hover:shadow-red-900/20 border border-red-700'}`}
            >
              {loading ? "Securing System..." : "Confirm & Lock System"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
