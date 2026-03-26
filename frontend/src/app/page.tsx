"use client";

import { useEffect, useState } from "react";
import { getStatus, getProfile } from "@/lib/api";
import LockedScreen from "@/components/LockedScreen";
import AMScreen from "@/components/AMScreen";
import PMScreen from "@/components/PMScreen";
import BurnScreen from "@/components/BurnScreen";
import LoginScreen from "@/components/LoginScreen";
import SetupScreen from "@/components/SetupScreen";
import UsernameScreen from "@/components/UsernameScreen";
import Header from "@/components/Header";

export default function Home() {
  const [status, setStatus] = useState<string>("LOADING");
  const [remaining, setRemaining] = useState<number>(0);
  const [isBurn, setIsBurn] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [activeMenuOverride, setActiveMenuOverride] = useState<string | null>(null);

  // -------- TEST MODE OVERRIDE --------
  const [testMode, setTestMode] = useState<{ active: boolean; mockStatus: string; mockIsBurn: boolean } | null>(null);

  // -------- INACTIVITY AUTO-LOGOUT --------
  useEffect(() => {
    if (!isAuthenticated) return;
    let timeoutId: NodeJS.Timeout;
    
    const logout = () => {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setStatus("UNAUTHORIZED");
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 10 minutes = 600,000 ms
      timeoutId = setTimeout(logout, 600000);
    };

    // Attach listeners
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("UNAUTHORIZED");
      return;
    }
    
    setIsAuthenticated(true);
    fetchStatus();
    fetchProfile();
    
    // Refresh status every exactly 1 minute, but depend on server time locally via sync.
    // For simplicity, poll every 30s.
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await getStatus();
      setStatus(data.status);
      setRemaining(data.time_remaining_seconds);
      setIsBurn(data.is_burn);
    } catch (err) {
      console.error("Failed to fetch status", err);
      // Determine if 401 Unauthorized
      if (err instanceof Error && (err.message.includes("Could not validate credentials") || err.message.includes("Not authenticated") || err.message.includes("401"))) {
         localStorage.removeItem("token");
         setStatus("UNAUTHORIZED");
         setIsAuthenticated(false);
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUsername(data.username);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  if (status === "UNAUTHORIZED") {
    return <LoginScreen setAuthenticated={() => {
      setIsAuthenticated(true);
      fetchStatus();
      fetchProfile();
    }} />;
  }

  if (status === "LOADING") return <div className="p-8">LOADING_SYSTEM_STATE...</div>;

  const currentStatus = testMode?.active ? testMode.mockStatus : status;
  const currentIsBurn = testMode?.active ? testMode.mockIsBurn : isBurn;

  return (
    <>
      <Header setActiveMenuOverride={setActiveMenuOverride} />

      {/* DEVELOPMENT ONLY: TEST PANEL */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-16 left-0 right-0 bg-yellow-400 text-black text-xs font-mono p-2 flex flex-wrap items-center justify-center gap-4 z-40">
          <strong>TEST MODE:</strong>
          <button className="bg-black text-white px-2 py-1 rounded" onClick={() => setTestMode(null)}>Real State</button>
          <button className="bg-black text-white px-2 py-1 rounded" onClick={() => setTestMode({ active: true, mockStatus: "OPEN_AM", mockIsBurn: false })}>Force AM</button>
          <button className="bg-black text-white px-2 py-1 rounded" onClick={() => setTestMode({ active: true, mockStatus: "OPEN_PM", mockIsBurn: false })}>Force PM</button>
          <button className="bg-black text-white px-2 py-1 rounded" onClick={() => setTestMode({ active: true, mockStatus: "LOCKED", mockIsBurn: false })}>Force Locked</button>
          <button className="bg-black text-white px-2 py-1 rounded" onClick={() => setTestMode({ active: true, mockStatus: "LOCKED", mockIsBurn: true })}>Force Burn</button>
        </div>
      )}

      <div className={`pt-20 pb-8 px-4 ${process.env.NODE_ENV === "development" ? "mt-16" : ""}`}>
        {username && (
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-bold tracking-widest text-zinc-100 opacity-80 animate-fade-in">
              HI {username.toUpperCase()},
            </h2>
          </div>
        )}
        {activeMenuOverride === "PROFILE" ? <UsernameScreen isEditMode={true} onClose={() => setActiveMenuOverride(null)} refreshStatus={() => { 
            testMode ? undefined : fetchStatus();
            fetchProfile(); 
          }} /> :
         activeMenuOverride === "SETUP" ? <SetupScreen refreshStatus={() => testMode ? undefined : fetchStatus()} /> :
         currentStatus === "ONBOARDING" ? <UsernameScreen isEditMode={false} refreshStatus={() => { 
            testMode ? undefined : fetchStatus();
            fetchProfile(); 
          }} /> :
         currentIsBurn ? <BurnScreen /> : 
         currentStatus === "SETUP" ? <SetupScreen refreshStatus={() => testMode ? undefined : fetchStatus()} /> :
         currentStatus === "OPEN_AM" ? <AMScreen remaining={remaining} refreshStatus={() => testMode ? undefined : fetchStatus()} /> :
         currentStatus === "OPEN_PM" ? <PMScreen remaining={remaining} refreshStatus={() => testMode ? undefined : fetchStatus()} /> :
         <LockedScreen remaining={remaining > 0 ? remaining : 3600} />}
      </div>
    </>
  );
}
