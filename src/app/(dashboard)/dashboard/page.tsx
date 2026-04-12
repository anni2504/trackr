'use client';
// src/app/(dashboard)/dashboard/page.tsx
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TimerWidget from '@/components/ui/TimerWidget';
import LogForm from '@/components/ui/LogForm';
import LogsTable from '@/components/ui/LogsTable';
import WeeklyChart from '@/components/charts/WeeklyChart';
import StudentHoursChart from '@/components/charts/StudentHoursChart';
import { Role, WorkLog, Analytics, User } from '@/types';
import { formatHours, getInitials } from '@/lib/utils';
import {
  TrendingUp, Clock, FileText, Users,
  ArrowUp, Activity, Briefcase, Calendar,
  ChevronDown, BarChart2
} from 'lucide-react';

interface CurrentUser {
  name: string;
  email: string;
  role: Role;
  userId: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [prefillHours, setPrefillHours] = useState<number | undefined>(undefined);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  // Get current user from cookie/session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoadingLogs(true);
    try {
      const url = selectedStudent ? `/api/logs?userId=${selectedStudent}` : '/api/logs';
      const res = await fetch(url);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } finally {
      setLoadingLogs(false);
    }
  }, [user, selectedStudent]);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    const res = await fetch('/api/analytics');
    const data = await res.json();
    setAnalytics(data);
  }, [user]);

  const fetchStudents = useCallback(async () => {
    if (!user || user.role === 'STUDENT') return;
    const res = await fetch('/api/users');
    const data = await res.json();
    setStudents(Array.isArray(data) ? data : []);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLogs();
      fetchAnalytics();
      fetchStudents();
    }
  }, [user, fetchLogs, fetchAnalytics, fetchStudents]);

  function handleNewLog(log: WorkLog) {
    setLogs((prev) => [log, ...prev]);
    fetchAnalytics();
    setPrefillHours(undefined);
  }

  function handleTimerEnd(hours: number) {
    setPrefillHours(hours);
    setActiveTab('logs');
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="fade-in space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Good {getGreeting()},{' '}
                  <span style={{ color: 'var(--accent)' }}>{user.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user.role === 'STUDENT'
                    ? "Here's your progress this week"
                    : user.role === 'JUNIOR'
                    ? `Overseeing ${students.length} intern${students.length !== 1 ? 's' : ''}`
                    : `Platform overview · ${students.length} total interns`}
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Hours Today"
                  value={analytics ? formatHours(analytics.totalHoursToday) : '—'}
                  icon={<Clock size={18} />}
                  color="var(--accent)"
                  subtext={analytics ? `${analytics.totalLogsToday} log${analytics.totalLogsToday !== 1 ? 's' : ''} submitted` : ''}
                />
                <StatCard
                  label="This Week"
                  value={analytics ? formatHours(analytics.totalHoursWeek) : '—'}
                  icon={<TrendingUp size={18} />}
                  color="var(--blue)"
                  subtext="Last 7 days"
                />
                <StatCard
                  label={user.role === 'STUDENT' ? 'Total Logs' : 'Active Interns'}
                  value={user.role === 'STUDENT' ? logs.length.toString() : students.length.toString()}
                  icon={user.role === 'STUDENT' ? <FileText size={18} /> : <Users size={18} />}
                  color="var(--purple)"
                  subtext={user.role === 'STUDENT' ? 'All time' : 'Assigned to you'}
                />
                <StatCard
                  label="Avg / Day"
                  value={analytics?.dailyHours
                    ? formatHours(analytics.dailyHours.filter(d => d.hours > 0).reduce((s, d) => s + d.hours, 0) /
                        Math.max(analytics.dailyHours.filter(d => d.hours > 0).length, 1))
                    : '—'}
                  icon={<Activity size={18} />}
                  color="var(--green)"
                  subtext="Active days this week"
                />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Daily Hours — Last 7 Days
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {analytics
                          ? `${formatHours(analytics.totalHoursWeek)} logged this week · avg ${analytics.dailyHours && formatHours(analytics.dailyHours.filter(d => d.hours > 0).reduce((s, d) => s + d.hours, 0) / Math.max(analytics.dailyHours.filter(d => d.hours > 0).length, 1))} on active days`
                          : 'Loading...'}
                      </p>
                    </div>
                    <BarChart2 size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  {analytics?.dailyHours ? (
                    <WeeklyChart data={analytics.dailyHours} />
                  ) : (
                    <div className="h-44 animate-pulse rounded-xl" style={{ background: 'var(--bg-hover)' }} />
                  )}
                </div>

                {user.role !== 'STUDENT' && (
                  <div className="card p-5">
                    <div className="mb-4">
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Hours by Intern
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        Cumulative all-time breakdown
                      </p>
                    </div>
                    {analytics?.perStudentHours ? (
                      <StudentHoursChart data={analytics.perStudentHours} />
                    ) : (
                      <div className="h-44 animate-pulse rounded-xl" style={{ background: 'var(--bg-hover)' }} />
                    )}
                  </div>
                )}

                {user.role === 'STUDENT' && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
                      Your Progress
                    </h3>
                    <div className="space-y-4">
                      <ProgressRow
                        label="Today"
                        hours={analytics?.totalHoursToday || 0}
                        target={8}
                        color="var(--accent)"
                      />
                      <ProgressRow
                        label="This Week"
                        hours={analytics?.totalHoursWeek || 0}
                        target={40}
                        color="var(--blue)"
                      />
                      <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {analytics && analytics.totalHoursToday >= 8
                            ? '🎉 Hit your daily target!'
                            : analytics
                            ? `${formatHours(8 - analytics.totalHoursToday)} to go today`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent logs preview */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Recent Activity
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {logs.length > 0
                        ? `${logs.length} total log${logs.length !== 1 ? 's' : ''} · showing latest 5`
                        : 'No logs yet'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    View all →
                  </button>
                </div>
                <LogsTable logs={logs.slice(0, 5)} role={user.role} loading={loadingLogs} />
              </div>

              {/* Supervisor table for Senior/Junior */}
              {user.role !== 'STUDENT' && analytics?.perStudentHours && analytics.perStudentHours.length > 0 && (
                <div className="card p-5">
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Intern Summary
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      All-time performance · sorted by total hours
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Intern', 'Today', 'Total Hours', 'Logs', 'Activity'].map((h) => (
                            <th key={h} className="text-left pb-3 pr-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...analytics.perStudentHours]
                          .sort((a, b) => b.totalHours - a.totalHours)
                          .map((s, i) => (
                            <tr
                              key={s.userId}
                              style={{ borderBottom: i < analytics.perStudentHours.length - 1 ? '1px solid var(--border)' : 'none' }}
                            >
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                                  >
                                    {getInitials(s.name)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className="text-xs font-mono font-bold"
                                  style={{ color: s.todayHours > 0 ? 'var(--green)' : 'var(--text-muted)' }}
                                >
                                  {s.todayHours > 0 ? `+${s.todayHours}h` : '—'}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>
                                  {s.totalHours}h
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  {s.logsCount}
                                </span>
                              </td>
                              <td className="py-3">
                                <div
                                  className="h-1.5 rounded-full overflow-hidden"
                                  style={{ background: 'var(--bg-hover)', width: '80px' }}
                                >
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${Math.min((s.totalHours / Math.max(...analytics.perStudentHours.map(x => x.totalHours), 1)) * 100, 100)}%`,
                                      background: 'var(--accent)',
                                      opacity: 0.7,
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TIMER TAB ── */}
          {activeTab === 'timer' && user.role === 'STUDENT' && (
            <div className="fade-in">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Timer</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Track your work session live — stop to auto-fill a log
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-8 flex flex-col items-center">
                  <TimerWidget onSessionEnd={handleTimerEnd} />
                </div>

                <div className="space-y-4">
                  <div className="card p-5">
                    <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                      How it works
                    </h3>
                    <div className="space-y-3">
                      {[
                        { n: '1', t: 'Start timer', d: 'Click "Start Timer" when you begin working' },
                        { n: '2', t: 'Work away', d: 'Timer tracks your session in real-time' },
                        { n: '3', t: 'Stop & log', d: 'Hours auto-fill into your work log form' },
                        { n: '4', t: 'Add details', d: 'Describe what you did and submit' },
                      ].map((step) => (
                        <div key={step.n} className="flex items-start gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                          >
                            {step.n}
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{step.t}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="card p-4"
                    style={{ border: '1px solid rgba(232,197,71,0.2)', background: 'var(--accent-dim)' }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent)' }}>💡 Pro tip</p>
                    <p className="text-xs" style={{ color: 'rgba(232,197,71,0.7)' }}>
                      The timer persists across page refreshes, so you won't lose your session if you navigate away.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── LOGS TAB ── */}
          {activeTab === 'logs' && (
            <div className="fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {user.role === 'STUDENT' ? 'Work Logs' : 'All Work Logs'}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user.role === 'STUDENT'
                    ? 'Log your work and track your submissions'
                    : 'View and filter work logs from interns'}
                </p>
              </div>

              {user.role === 'STUDENT' && (
                <div className="card p-5">
                  <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
                    {prefillHours ? `⚡ Log ${prefillHours}h session` : 'New Work Log'}
                  </h3>
                  {prefillHours && (
                    <div
                      className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg mb-4"
                      style={{ background: 'rgba(74,222,128,0.08)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)' }}
                    >
                      ✓ Timer session auto-filled · {prefillHours}h
                    </div>
                  )}
                  <LogForm prefillHours={prefillHours} onSuccess={handleNewLog} />
                </div>
              )}

              {/* Filter by student (for supervisors) */}
              {user.role !== 'STUDENT' && students.length > 0 && (
                <div className="flex items-center gap-3">
                  <select
                    className="input-field max-w-xs"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">All interns</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {selectedStudent && (
                    <button
                      onClick={() => setSelectedStudent('')}
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Clear ×
                    </button>
                  )}
                </div>
              )}

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {logs.length} log{logs.length !== 1 ? 's' : ''}
                    {selectedStudent && ` · filtered`}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    <span>Most recent first</span>
                  </div>
                </div>
                <LogsTable logs={logs} role={user.role} loading={loadingLogs} />
              </div>
            </div>
          )}

          {/* ── STUDENTS TAB ── */}
          {activeTab === 'students' && user.role !== 'STUDENT' && (
            <div className="fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {user.role === 'JUNIOR' ? 'My Interns' : 'All Interns'}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {students.length} intern{students.length !== 1 ? 's' : ''} · click to view their logs
                </p>
              </div>

              {students.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 rounded-2xl"
                  style={{ border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
                >
                  <Users size={36} className="mb-3 opacity-40" />
                  <p className="text-sm">No interns assigned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map((student, i) => {
                    const stats = analytics?.perStudentHours?.find((s) => s.userId === student.id);
                    return (
                      <div
                        key={student.id}
                        className="card p-5 cursor-pointer transition-all duration-150 hover:border-opacity-60 group"
                        style={{ animationDelay: `${i * 50}ms` }}
                        onClick={() => { setSelectedStudent(student.id); setActiveTab('logs'); }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(232,197,71,0.2)' }}
                          >
                            {getInitials(student.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                              {student.name}
                            </p>
                            <p className="text-xs truncate mb-3" style={{ color: 'var(--text-muted)' }}>
                              {student.email}
                            </p>
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                                <p className="text-sm font-bold font-mono" style={{ color: 'var(--accent)' }}>
                                  {stats?.totalHours ?? 0}h
                                </p>
                              </div>
                              <div>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Today</p>
                                <p className="text-sm font-bold font-mono" style={{ color: (stats?.todayHours ?? 0) > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                                  {stats?.todayHours ?? 0}h
                                </p>
                              </div>
                              <div>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Logs</p>
                                <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                                  {stats?.logsCount ?? 0}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--text-muted)' }}>→</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && user.role !== 'STUDENT' && (
            <div className="fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">Analytics</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Performance insights across your team
                </p>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Hours Today" value={analytics ? formatHours(analytics.totalHoursToday) : '—'} icon={<Clock size={18} />} color="var(--accent)" subtext="Team total" />
                <StatCard label="Logs Today" value={analytics?.totalLogsToday?.toString() ?? '—'} icon={<FileText size={18} />} color="var(--blue)" subtext="Submitted" />
                <StatCard label="This Week" value={analytics ? formatHours(analytics.totalHoursWeek) : '—'} icon={<TrendingUp size={18} />} color="var(--purple)" subtext="7-day total" />
                <StatCard label="Active Interns" value={students.length.toString()} icon={<Users size={18} />} color="var(--green)" subtext="In your team" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card p-5">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    Team Daily Hours — Last 7 Days
                  </h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {analytics
                      ? `${formatHours(analytics.totalHoursWeek)} combined across all interns · peak: ${analytics.dailyHours ? formatHours(Math.max(...analytics.dailyHours.map(d => d.hours))) : '—'}`
                      : 'Loading...'}
                  </p>
                  {analytics?.dailyHours ? (
                    <WeeklyChart data={analytics.dailyHours} />
                  ) : (
                    <div className="h-44 animate-pulse rounded-xl" style={{ background: 'var(--bg-hover)' }} />
                  )}
                </div>

                <div className="card p-5">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    Hours by Intern
                  </h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                    All-time contribution breakdown
                  </p>
                  {analytics?.perStudentHours ? (
                    <StudentHoursChart data={analytics.perStudentHours} />
                  ) : (
                    <div className="h-44 animate-pulse rounded-xl" style={{ background: 'var(--bg-hover)' }} />
                  )}
                </div>
              </div>

              {/* Detailed table */}
              {analytics?.perStudentHours && analytics.perStudentHours.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    Intern Performance Breakdown
                  </h3>
                  <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
                    Sorted by total hours · click on an intern to view their logs
                  </p>
                  <div className="space-y-3">
                    {[...analytics.perStudentHours]
                      .sort((a, b) => b.totalHours - a.totalHours)
                      .map((s, i) => {
                        const maxHours = Math.max(...analytics.perStudentHours.map(x => x.totalHours), 1);
                        const pct = Math.min((s.totalHours / maxHours) * 100, 100);
                        return (
                          <div
                            key={s.userId}
                            className="p-3 rounded-xl cursor-pointer transition-colors"
                            style={{ background: 'var(--bg-hover)' }}
                            onClick={() => { setSelectedStudent(s.userId); setActiveTab('logs'); }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="text-xs font-mono font-bold w-5"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  #{i + 1}
                                </span>
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {s.name}
                                </span>
                                {s.todayHours > 0 && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)' }}
                                  >
                                    +{s.todayHours}h today
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                                  <p className="text-sm font-bold font-mono" style={{ color: 'var(--accent)' }}>{s.totalHours}h</p>
                                </div>
                                <div>
                                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Logs</p>
                                  <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{s.logsCount}</p>
                                </div>
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: 'var(--accent)', opacity: 0.7 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Helpers ──

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function StatCard({
  label, value, icon, color, subtext
}: {
  label: string; value: string; icon: React.ReactNode; color: string; subtext?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          {label.toUpperCase()}
        </p>
        <span style={{ color: color, opacity: 0.7 }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold font-mono mb-1" style={{ color }}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtext}</p>
      )}
    </div>
  );
}

function ProgressRow({ label, hours, target, color }: { label: string; hours: number; target: number; color: string }) {
  const pct = Math.min((hours / target) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {hours}h / {target}h
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, opacity: pct >= 100 ? 1 : 0.7 }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}% of target</p>
    </div>
  );
}
