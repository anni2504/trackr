'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Zap, CheckCircle } from 'lucide-react';

type Step = 'details' | 'otp' | 'done';

export default function SignupPage() {
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); return; }
      setStep('otp');
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); return; }
      setStep('done');
      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  }

  if (step === 'done') return (
    <div className="fade-in text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)' }}>
        <CheckCircle size={32} style={{ color: 'var(--green)' }} />
      </div>
      <h2 className="text-xl font-semibold mb-2">Account created!</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={18} color="#0d0d10" fill="#0d0d10" />
          </div>
          <span className="text-xl font-bold tracking-tight">Trackr</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{step === 'details' ? 'Create account' : 'Verify email'}</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step === 'details' ? 'Get started with internship tracking' : `Code sent to ${email}`}</p>
      </div>

      <div className="card p-6">
        {step === 'details' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div><label className="label">Full name</label><input type="text" className="input-field" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></div>
            <div><label className="label">Email</label><input type="email" className="input-field" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-10" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="text-xs px-3 py-2.5 rounded-lg" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(232,197,71,0.2)' }}>
              🔒 Role is set to Student by default. Supervisors are assigned by admins.
            </div>
            {error && <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' }}>⚠ {error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Sending code...' : 'Send verification code'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="label">Verification code</label>
              <input type="text" className="input-field text-center text-2xl font-mono tracking-[0.5em] py-4" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} autoFocus />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Expires in 5 minutes</p>
            </div>
            {error && <div className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' }}>⚠ {error}</div>}
            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full disabled:opacity-50">{loading ? 'Verifying...' : 'Verify & create account'}</button>
            <button type="button" className="w-full text-sm text-center" style={{ color: 'var(--text-secondary)' }} onClick={() => { setStep('details'); setOtp(''); setError(''); }}>← Back</button>
          </form>
        )}
      </div>
      <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)' }} className="font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
