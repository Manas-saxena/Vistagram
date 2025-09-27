import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithPassword } from '../services/auth';

export default function LoginRight() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) return setError('Enter email or username');
    if (password.length < 1) return setError('Enter password');
    setLoading(true);
    try {
      await loginWithPassword(identifier, password);
      navigate('/', { replace: true });
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
          <label className="mb-1 block text-sm text-white/70">Email or Username</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. vistagramfan or me@example.com"
            autoFocus
          />
          <label className="mb-1 mt-3 block text-sm text-white/70">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
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
      <div className="mt-3 text-sm text-white/70">
        No account? <Link to="/signup" className="text-violet-300 hover:text-violet-200">Sign up</Link>
      </div>
    </div>
  );
}


