export const API_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://integrity-backend-jm08.onrender.com/api" 
  : "http://127.0.0.1:8000/api";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API request failed with status ${response.status}`);
  }

  return response.json();
};

export const syncTime = async () => {
  return fetchAPI("/windows/sync-time");
};

export const getStatus = async () => {
  return fetchAPI("/windows/status");
};

export const enableLocking = async () => {
  return fetchAPI("/windows/enable-locking", {
    method: "POST",
  });
};

export const createAim = async (primary_aim: string, description: string = "") => {
  return fetchAPI("/aims/", {
    method: "POST",
    body: JSON.stringify({ primary_aim, description }),
  });
};

export const submitAMGoals = async (goals: string[]) => {
  return fetchAPI("/windows/architect/submit", {
    method: "POST",
    body: JSON.stringify({ goals }),
  });
};

export const submitPMReflection = async (reflection: string) => {
  return fetchAPI("/windows/auditor/submit", {
    method: "POST",
    body: JSON.stringify({ reflection }),
  });
};
