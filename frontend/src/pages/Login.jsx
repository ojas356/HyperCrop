import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radio, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay to feel real
    setTimeout(() => {
      const result = login(form.username, form.password);
      if (result.ok) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-3 shadow-sm">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">HyperCrop</h1>
          <p className="text-[13px] text-slate-400 mt-1">Officer access only</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <h2 className="text-[15px] font-semibold text-slate-800">Sign in to Dashboard</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="officer"
                className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                           text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 pr-10
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                             text-slate-700 placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!form.username || !form.password || loading}
              className="w-full bg-emerald-600 text-white rounded-lg py-2.5 text-[13px] font-semibold
                         hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          Not an officer?{' '}
          <a href="/report" className="text-emerald-600 font-medium no-underline hover:underline">
            Report a crop issue →
          </a>
        </p>
      </div>
    </div>
  );
}
