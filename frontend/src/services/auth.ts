// Lightweight auth store with localStorage persistence
import { apiFetch } from '../api';
let accessToken: string | null = (typeof window !== 'undefined') ? localStorage.getItem('vistagram_token') : null;
const listeners = new Set<() => void>();

function notify() { listeners.forEach((l) => l()); }

export function getAccessToken() { return accessToken; }
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('vistagram_token', token); else localStorage.removeItem('vistagram_token');
  }
  notify();
}
export function subscribeAuth(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

// API calls for auth
export async function signup(email: string, username: string, password: string) {
  const data = await apiFetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function loginWithPassword(emailOrUsername: string, password: string) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password }),
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function refreshAccessToken(): Promise<string | null> {
  // Use apiFetch with retry disabled to avoid recursion
  const data = await apiFetch('/api/auth/refresh', { method: 'POST' }, false).catch(() => null as any);
  if (!data) return null;
  setAccessToken(data.accessToken);
  return data.accessToken as string;
}

export async function logout() {
  try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
  setAccessToken(null);
}
