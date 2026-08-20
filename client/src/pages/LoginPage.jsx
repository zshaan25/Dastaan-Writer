import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather, AlertCircle, ArrowRight } from 'lucide-react';

import { DastaanLogo } from '../components/DastaanLogo';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-12 px-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <DastaanLogo size={44} className="mx-auto rounded-xl shadow-md" />
          <h2 className="text-lg font-bold text-white tracking-tight">Sign in to Dastaan</h2>
          <p className="text-xs text-zinc-500">Access your studio workspace and profile context</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase text-zinc-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase text-zinc-400">Password</label>
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-[11px] text-emerald-400 hover:underline font-mono"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-black py-2.5 rounded-lg font-semibold text-xs transition disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800/80 text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-zinc-300 hover:text-emerald-400 font-medium transition">
            Create account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
