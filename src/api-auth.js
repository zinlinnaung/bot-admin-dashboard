import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.prototypeconnect.xyz";

export function getAuthHeaders() {
  const token = sessionStorage.getItem("adminToken");
  if (token) return { Authorization: `Bearer ${token}` };

  const initData = window.Telegram?.WebApp?.initData;
  return initData ? { "X-Telegram-Init-Data": initData } : {};
}

axios.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  Object.assign(config.headers, getAuthHeaders());
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && sessionStorage.getItem("adminToken")) {
      sessionStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("admin-auth-expired"));
    }
    return Promise.reject(error);
  },
);

export function authenticatedFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
}
