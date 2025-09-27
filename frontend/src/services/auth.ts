import { apiFetch } from '../api';

export type LoginResponse = { user: { id: string; username: string }; token: string };

export async function loginWithUsername(username: string): Promise<LoginResponse> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
  return res as LoginResponse;
}

export function persistSession(resp: LoginResponse, fallbackUsername?: string) {
  localStorage.setItem('vistagram_token', resp.token);
  localStorage.setItem('vistagram_username', resp.user?.username || fallbackUsername || '');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vistagram-auth-changed'));
  }
}

export function logout() {
  localStorage.removeItem('vistagram_token');
  localStorage.removeItem('vistagram_username');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vistagram-auth-changed'));
  }
}
