"use client";
import { useState } from "react";
import { API_BASE_URL } from "../lib/api";

export default function LoginScreen({ setAuthenticated }: { setAuthenticated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Register Logic
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, am_window_start: "08:00", pm_window_start: "20:00" })
        });
        if (!res.ok) throw new Error("Registration failed");
        
        // Setup initial primary aim for MVP flow simplicity
        // Not implemented here, assuming generic or user will set later.
      }
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
        })
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      setAuthenticated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest">RITUAL WINDOW</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col space-y-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input 
          type="email" 
          placeholder="EMAIL" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="PASSWORD" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isRegister ? "REGISTER" : "ENTER"}</button>
      </form>
      <button 
        className="mt-8 text-sm text-gray-500 border-none hover:text-white bg-transparent"
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister ? "SWITCH TO LOGIN" : "INITIALIZE NEW USER"}
      </button>
    </div>
  );
}
