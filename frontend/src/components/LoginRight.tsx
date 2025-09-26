import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithUsername, persistSession } from '../services/auth';

export default function LoginRight() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim()) return setError('Enter a username');
    setLoading(true);
    try {
      const res = await loginWithUsername(username);
      if (res?.token) {
        persistSession(res, username);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 sm:p-8 flex flex-col justify-center">
      <div className="mb-6 flex items-center gap-3">
        <img src="/vistagram-logo.svg" alt="Vistagram" className="h-10 w-10" />
        <div className="text-lg font-semibold text-white">Vistagram</div>
      </div>

      <h1 className="mb-1 text-3xl font-semibold text-white">Welcome back</h1>
      <p className="mb-6 text-sm text-white/70">Sign in with a username to continue</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-white/70">Username</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. vistagramfan"
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 p-3 font-medium text-white hover:from-violet-600 hover:to-violet-800 disabled:opacity-70"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}


