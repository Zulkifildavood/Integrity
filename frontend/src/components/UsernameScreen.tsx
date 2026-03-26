"use client";
import { useState } from "react";
import { updateProfile } from "@/lib/api";

export default function UsernameScreen({ 
  refreshStatus, 
  isEditMode = false,
  onClose
}: { 
  refreshStatus: () => void;
  isEditMode?: boolean;
  onClose?: () => void;
}) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateProfile({ username: username.trim() });
      if (isEditMode && onClose) {
        onClose();
      } else {
        refreshStatus();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save username. It might be taken.");
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full text-zinc-100 ${!isEditMode ? "min-h-screen" : "py-4"}`}>
      <div className="w-full p-6 sm:p-8 border border-zinc-800 bg-zinc-900/40 rounded-sm shadow-xl">
        <h1 className="text-3xl font-bold mb-4 tracking-widest text-zinc-300">
          {isEditMode ? "EDIT PROFILE" : "INITIALIZE CALLSIGN"}
        </h1>
        
        {!isEditMode && (
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            Welcome to the system. Before you proceed to setup your terminal constraints, you must define your permanent identifier.
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {error && <div className="text-red-500 bg-red-950/40 border border-red-900/50 p-4 rounded-sm text-sm">{error}</div>}
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Username</label>
            <input
              type="text"
              className="w-full text-base p-4 bg-black/50 border border-zinc-700 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 rounded-sm"
              placeholder="e.g. Maverick"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || username.trim().length < 3}
              className={`flex-1 px-6 py-4 uppercase tracking-widest text-sm font-bold transition-all rounded-sm
                ${loading || username.trim().length < 3
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-zinc-200 text-black hover:bg-white'}`}
            >
              {loading ? "SAVING..." : "CONFIRM"}
            </button>

            {isEditMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-4 uppercase tracking-widest text-sm font-bold border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all rounded-sm"
              >
                CANCEL
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
