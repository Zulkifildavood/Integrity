"use client";
import { useState, useRef, useEffect } from "react";

export default function Header({
  setActiveMenuOverride
}: {
  setActiveMenuOverride: (view: string | null) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
      <div
        className="text-white font-bold tracking-widest uppercase cursor-pointer text-sm"
        onClick={() => handleAction(() => setActiveMenuOverride(null))}
      >
        Integrity
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
          aria-label="Menu"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl py-1 animate-fade-in origin-top-right">
            <button
              onClick={() => handleAction(() => setActiveMenuOverride("PROFILE"))}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => handleAction(() => setActiveMenuOverride("SETUP"))}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              System Setup
            </button>
            <button
              onClick={() => handleAction(() => {
                localStorage.removeItem("token");
                window.location.reload();
              })}
              className="w-full text-left px-4 py-2 text-sm text-red-500 font-bold hover:bg-red-600 hover:text-white transition-all border-t border-zinc-800 mt-0.5"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
