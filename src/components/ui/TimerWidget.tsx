'use client';
// src/components/ui/TimerWidget.tsx
import { useState, useEffect, useCallback } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { formatHours } from '@/lib/utils';

interface Props {
  onSessionEnd: (hours: number) => void;
}

export default function TimerWidget({ onSessionEnd }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check for active timer on mount
  useEffect(() => {
    fetch('/api/timer')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.endTime) {
          const start = new Date(data.startTime).getTime();
          setStartTime(start);
          setIsRunning(true);
          setSessionId(data.id);
          setElapsed(Math.floor((Date.now() - start) / 1000));
        }
      })
      .catch(() => {});
  }, []);

  // Tick
  useEffect(() => {
    if (!isRunning || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionId(data.id);
        setStartTime(Date.now());
        setElapsed(0);
        setIsRunning(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStop() {
    setLoading(true);
    try {
      const res = await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsRunning(false);
        setStartTime(null);
        setElapsed(0);
        setSessionId(null);
        if (data.hours > 0) {
          onSessionEnd(parseFloat(data.hours.toFixed(2)));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const progressDeg = Math.min((elapsed % 3600) / 3600 * 360, 360);

  return (
    <div className="flex flex-col items-center">
      {/* Circular timer */}
      <div className="relative mb-6" style={{ width: 180, height: 180 }}>
        <svg width="180" height="180" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r="82" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="90" cy="90" r="82"
            fill="none"
            stroke={isRunning ? 'var(--accent)' : 'var(--text-muted)'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 82}`}
            strokeDashoffset={`${2 * Math.PI * 82 * (1 - progressDeg / 360)}`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono text-3xl font-medium"
            style={{ color: isRunning ? 'var(--accent)' : 'var(--text-secondary)', letterSpacing: '0.05em' }}
          >
            {formatTime(elapsed)}
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {isRunning ? 'recording...' : 'ready'}
          </span>
        </div>
      </div>

      {/* Session info */}
      {isRunning && (
        <div
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-4"
          style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: 'var(--green)' }}
        >
          <span className="glow-dot" />
          Session in progress · {formatHours(elapsed / 3600)} tracked
        </div>
      )}

      {/* Button */}
      <button
        onClick={isRunning ? handleStop : handleStart}
        disabled={loading}
        className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
        style={{
          background: isRunning
            ? 'rgba(248,113,113,0.12)'
            : 'var(--accent)',
          color: isRunning ? 'var(--red)' : '#0d0d10',
          border: isRunning ? '1.5px solid rgba(248,113,113,0.3)' : 'none',
          boxShadow: isRunning ? 'none' : '0 4px 20px var(--accent-glow)',
        }}
      >
        {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        {loading ? 'Please wait...' : isRunning ? 'Stop & Log' : 'Start Timer'}
      </button>

      {isRunning && (
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
          Stop the timer to auto-fill your work log
        </p>
      )}
    </div>
  );
}
