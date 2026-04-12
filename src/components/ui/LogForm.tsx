'use client';
// src/components/ui/LogForm.tsx
import { useState } from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { WorkLog } from '@/types';

interface Props {
  prefillHours?: number;
  onSuccess: (log: WorkLog) => void;
}

export default function LogForm({ prefillHours, onSuccess }: Props) {
  const [hours, setHours] = useState(prefillHours?.toString() || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Update hours if prefill changes
  if (prefillHours !== undefined && hours !== prefillHours.toString() && !loading) {
    setHours(prefillHours.toString());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: parseFloat(hours), description, date }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit log');
        return;
      }

      setSuccess(true);
      setDescription('');
      setHours('');
      onSuccess(data);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Hours worked</label>
          <input
            type="number"
            className="input-field"
            placeholder="2.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            min="0.1"
            max="24"
            step="0.25"
            required
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">What did you work on?</label>
        <textarea
          className="input-field resize-none"
          placeholder="Describe your work in detail... e.g. Implemented user authentication with JWT tokens and OTP verification"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          minLength={10}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {description.length}/500 · Min 10 characters
        </p>
      </div>

      {error && (
        <div
          className="text-sm px-3 py-2.5 rounded-lg"
          style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          ⚠ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="flex items-center gap-2 btn-primary disabled:opacity-60"
      >
        {success ? (
          <><Check size={16} /> Log submitted!</>
        ) : loading ? (
          'Submitting...'
        ) : (
          <><PlusCircle size={16} /> Submit Work Log</>
        )}
      </button>
    </form>
  );
}
