'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      window.location.href = '/dashboard';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={18} color="#0d0d10" fill="#0d0d10" />
          </div>
          <span className="text-xl font-bold tracking-tight">Trackr</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your workspace</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input type="email" className="input-field" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' }}>⚠ {error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <hr className="my-5 divider" />
        <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>Test accounts</p>
        <div className="space-y-2">
          {[
            { email: 'student@test.com', role: 'Student', color: 'badge-student' },
            { email: 'junior@test.com', role: 'Junior', color: 'badge-junior' },
            { email: 'senior@test.com', role: 'Senior', color: 'badge-senior' },
          ].map((acc) => (
            <button key={acc.email} type="button" onClick={() => { setEmail(acc.email); setPassword('password123'); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <span className="font-mono">{acc.email}</span>
              <span className={`badge ${acc.color}`}>{acc.role}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: 'var(--accent)' }} className="font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
