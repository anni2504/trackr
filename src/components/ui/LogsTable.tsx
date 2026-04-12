'use client';
// src/components/ui/LogsTable.tsx
import { WorkLog, Role } from '@/types';
import { formatDate, formatHours, getInitials } from '@/lib/utils';
import { Clock, FileText } from 'lucide-react';

interface Props {
  logs: WorkLog[];
  role: Role;
  loading?: boolean;
}

export default function LogsTable({ logs, role, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl animate-pulse"
            style={{ background: 'var(--bg-hover)' }}
          />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-2xl"
        style={{ border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
      >
        <FileText size={36} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">No work logs yet</p>
        <p className="text-xs mt-1">
          {role === 'STUDENT' ? 'Submit your first log above' : 'Students haven\'t logged any work yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, i) => (
        <div
          key={log.id}
          className="rounded-xl px-4 py-3.5 flex items-start gap-4 transition-all duration-150 group cursor-default"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            animationDelay: `${i * 30}ms`,
          }}
        >
          {/* Hours badge */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-12 rounded-xl"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(232,197,71,0.15)' }}
          >
            <span className="text-base font-bold font-mono leading-none" style={{ color: 'var(--accent)' }}>
              {log.hours}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'rgba(232,197,71,0.6)' }}>hrs</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {role !== 'STUDENT' && log.user && (
                <>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                  >
                    {getInitials(log.user.name)}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {log.user.name}
                  </span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                </>
              )}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDate(log.date)}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {log.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
