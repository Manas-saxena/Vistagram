// Lightweight auth store with localStorage persistence
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
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function loginWithPassword(emailOrUsername: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ emailOrUsername, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data.accessToken as string;
}

export async function logout() {
  try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
  setAccessToken(null);
}
