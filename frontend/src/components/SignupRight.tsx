import { useState } from 'react';
import { signup } from '../services/auth';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function SignupRight() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !username || !password) return toast.error('All fields required');
    setLoading(true);
    try {
      await signup(email, username, password);
      toast.success('Account created');
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed');
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

      <h1 className="mb-1 text-3xl font-semibold text-white">Create account</h1>
      <p className="mb-6 text-sm text-white/70">Join Vistagram to share your moments</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-white/70">Email</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="me@example.com"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Username</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="vistagramfan"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-white/20 bg-black/30 p-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 p-3 font-medium text-white hover:from-violet-600 hover:to-violet-800 disabled:opacity-70"
        >
          {loading ? 'Signing up…' : 'Sign up'}
        </button>
      </form>

      <div className="mt-3 text-sm text-white/70">
        Already have an account? <Link to="/login" className="text-violet-300 hover:text-violet-200">Sign in</Link>
      </div>
    </div>
  );
}


