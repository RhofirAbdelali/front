import { getToken, clearToken } from "./auth";

const API = import.meta.env.VITE_API_URL as string;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (res.status === 401) {
    clearToken();
    if (location.pathname !== "/login") location.replace("/login");
    throw new Error("401");
  }
  return res;
}
