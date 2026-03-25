"use client";

import { useEffect, useState } from "react";
import { getStatus } from "@/lib/api";
import LockedScreen from "@/components/LockedScreen";
import AMScreen from "@/components/AMScreen";
import PMScreen from "@/components/PMScreen";
import BurnScreen from "@/components/BurnScreen";
import LoginScreen from "@/components/LoginScreen";

export default function Home() {
  const [status, setStatus] = useState<string>("LOADING");
  const [remaining, setRemaining] = useState<number>(0);
  const [isBurn, setIsBurn] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("UNAUTHORIZED");
      return;
    }
    
    setIsAuthenticated(true);
    fetchStatus();
    
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
      if (err instanceof Error && err.message.includes("Could not validate credentials")) {
         localStorage.removeItem("token");
         setStatus("UNAUTHORIZED");
         setIsAuthenticated(false);
      }
    }
  };

  if (status === "UNAUTHORIZED") {
    return <LoginScreen setAuthenticated={() => {
      setIsAuthenticated(true);
      fetchStatus();
    }} />;
  }

  if (status === "LOADING") return <div className="p-8">LOADING_SYSTEM_STATE...</div>;

  if (isBurn) return <BurnScreen />;
  
  if (status === "OPEN_AM") return <AMScreen remaining={remaining} refreshStatus={fetchStatus} />;
  
  if (status === "OPEN_PM") return <PMScreen remaining={remaining} refreshStatus={fetchStatus} />;

  return <LockedScreen remaining={remaining} />;
}
