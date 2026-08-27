import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Lock, Mail, User, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthPage({ isRegister: propIsRegister = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(propIsRegister || location.pathname === '/register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Business Analyst');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsRegister(location.pathname === '/register');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('demo@insightflow.internal', 'demo1234');
      navigate('/dashboard');
    } catch (err) {
      // Fallback guest login
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800 bg-slate-900/60 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">InsightFlow</h1>
          <p className="text-xs text-slate-400">AI-Powered Business Analytics & Intelligence Platform</p>
        </div>

        {/* Quick Demo Button */}
        <button
          onClick={handleDemoLogin}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-900/40 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Quick Demo: Sign In as Business Analyst</span>
        </button>

        <div className="flex items-center space-x-3 text-slate-600 text-xs">
          <div className="flex-1 h-px bg-slate-800" />
          <span>or credentials</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="text-slate-400 mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Role / Persona</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Business Manager">Business Manager</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-slate-400 mb-1 block">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@company.com"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center">
          <Link
            to={isRegister ? '/login' : '/register'}
            className="text-xs text-slate-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register now"}
          </Link>
        </div>
      </div>
    </div>
  );
}
