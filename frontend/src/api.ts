export const API_BASE_URL = import.meta.env.VITE_API_URL || 'localhost:4000';
import { getAccessToken, refreshAccessToken } from './services/auth';

export async function apiFetch(path: string, options: RequestInit = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, credentials: 'include' });
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch(path, options, false);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}
