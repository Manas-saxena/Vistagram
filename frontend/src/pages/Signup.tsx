import { useState } from 'react';
import { signup } from '../services/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !username || !password) return setError('All fields required');
    setLoading(true);
    try {
      await signup(email, username, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">Email</label>
            <input className="w-full rounded-xl border border-white/20 bg-black/30 p-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="me@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Username</label>
            <input className="w-full rounded-xl border border-white/20 bg-black/30 p-3" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="vistagramfan" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Password</label>
            <input type="password" className="w-full rounded-xl border border-white/20 bg-black/30 p-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          </div>
          {error && <div className="text-rose-300 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 p-3 font-medium text-white disabled:opacity-60">{loading ? 'Signing up…' : 'Sign up'}</button>
        </form>
      </div>
    </div>
  );
}


