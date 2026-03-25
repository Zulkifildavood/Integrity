export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`http://127.0.0.1:8000/api${endpoint}`, {
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
