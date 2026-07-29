import axios from "axios";

// VITE_API_URL should be set in production (your deployed backend URL).
// Falls back to the local FastAPI dev server if not set.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const isInstructorEndpoint = config.url && config.url.startsWith("/api/instructor") && !config.url.includes("/feedback/self/");

  if (isInstructorEndpoint) {
    const storedInstructor = localStorage.getItem("vichara_instructor");
    if (storedInstructor) {
      try {
        const { token } = JSON.parse(storedInstructor);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // ignore malformed storage
      }
    }
  } else {
    const stored = localStorage.getItem("vichara_student");
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // ignore malformed storage - request just goes out unauthenticated
      }
    }
  }

  const apiKey = localStorage.getItem("vichara_api_key");
  const provider = localStorage.getItem("vichara_api_provider") || "anthropic";
  if (apiKey) {
    config.headers["X-Llm-Api-Key"] = apiKey;
    config.headers["X-Llm-Provider"] = provider;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isInstructorEndpoint = url.startsWith("/api/instructor") && !url.includes("/feedback/self/");
      if (isInstructorEndpoint) {
        localStorage.removeItem("vichara_instructor");
      } else {
        localStorage.removeItem("vichara_student");
      }
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;