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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 max-w-xl mx-auto relative">
      <button 
        onClick={() => {
          localStorage.removeItem("token");
          refreshStatus();
        }}
        className="fixed top-8 right-8 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest bg-white p-2 rounded shadow-sm z-50"
      >
        Logout
      </button>

      <h1 className="text-4xl font-bold mb-8 tracking-widest text-[#444444] text-center">SYSTEM SETUP</h1>
      
      {error && <div className="text-red-500 mb-4 text-center text-sm">{error}</div>}

      <div className="w-full space-y-8">
        {/* Step 1: Set Aim */}
        <div className={`p-6 border ${aimSaved ? 'border-green-500 bg-green-50' : 'border-[#444444]'}`}>
          <h2 className="text-xl font-bold mb-4">1. Define Your Priorities</h2>
          <p className="text-sm text-gray-600 mb-4">What is your single most important priority right now?</p>
          <textarea
            className="w-full p-2 border border-blue-400 mb-4"
            rows={2}
            placeholder="Primary Aim (e.g. Launch my startup gracefully by Q3...)"
            value={aim}
            onChange={(e) => setAim(e.target.value)}
            disabled={loading || aimSaved}
          />

          {!aimSaved && extraPriorities.map((ep, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                className="w-full p-2 border border-gray-300"
                placeholder={`Secondary Priority ${i + 1}`}
                value={ep}
                onChange={(e) => handleExtraChange(i, e.target.value)}
                disabled={loading || aimSaved}
              />
              <button
                onClick={() => handleRemoveExtra(i)}
                className="px-3 bg-red-100 text-red-600 font-bold hover:bg-red-200"
                disabled={loading || aimSaved}
              >
                X
              </button>
            </div>
          ))}

          {aimSaved && extraPriorities.filter(p => p.trim()).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Secondary Priorities:</p>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {extraPriorities.filter(p => p.trim()).map((ep, i) => (
                  <li key={i}>{ep}</li>
                ))}
              </ul>
            </div>
          )}

          {!aimSaved && extraPriorities.length < 4 && (
             <button
               onClick={handleAddExtra}
               className="text-xs font-bold text-blue-600 uppercase mb-4 hover:underline block"
               disabled={loading}
             >
               + Add Priority ({extraPriorities.length + 1}/5 max)
             </button>
          )}

          {!aimSaved && (
            <button
              onClick={handleSaveAim}
              disabled={loading}
              className="px-6 py-2 bg-black text-white w-full uppercase tracking-wider text-sm font-bold"
            >
              {loading ? "Saving..." : "Save Priorities"}
            </button>
          )}
          {aimSaved && <div className="text-green-600 font-bold uppercase text-sm">✓ Priorities Locked In</div>}
        </div>

        {/* Step 2: Enable Locking */}
        {aimSaved && (
          <div className="p-6 border border-red-500 bg-red-50 animate-fade-in transition-opacity duration-500">
            <h2 className="text-xl font-bold mb-4 text-red-700">2. Enable Strict Mode</h2>
            
            <div className="flex items-center space-x-3 mb-6">
              <input
                type="checkbox"
                id="enableLocking"
                className="w-5 h-5 accent-red-600"
                checked={lockingEnabled}
                onChange={(e) => setLockingEnabled(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="enableLocking" className="font-bold text-red-900 cursor-pointer">
                I am ready to enforce my schedule.
              </label>
            </div>

            <div className="text-xs text-red-800 mb-6 bg-red-100 p-3 rounded">
              <strong className="block mb-1 font-extrabold uppercase tracking-widest">WARNING:</strong>
              Once enabled, the system will start locking your application during non-window hours. 
              <strong> You cannot undo this without burning your streak.</strong>
            </div>

            <button
              onClick={handleConfirmLock}
              disabled={!lockingEnabled || loading}
              className={`px-6 py-3 w-full uppercase tracking-widest text-sm font-bold transition-all
                ${!lockingEnabled || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'}`}
            >
              {loading ? "Securing System..." : "Confirm & Lock System"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
