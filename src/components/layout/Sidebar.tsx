'use client';
// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Zap, LayoutDashboard, Clock, FileText,
  Users, BarChart3, LogOut, ChevronRight,
  Menu, X
} from 'lucide-react';
import { Role } from '@/types';
import { getInitials } from '@/lib/utils';

interface SidebarProps {
  user: { name: string; email: string; role: Role };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS: Record<Role, Array<{ id: string; label: string; icon: React.ReactNode; description: string }>> = {
  STUDENT: [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} />, description: 'Your stats at a glance' },
    { id: 'timer', label: 'Timer', icon: <Clock size={17} />, description: 'Track time live' },
    { id: 'logs', label: 'Work Logs', icon: <FileText size={17} />, description: 'Log & view your work' },
  ],
  JUNIOR: [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} />, description: "Team at a glance" },
    { id: 'students', label: 'My Students', icon: <Users size={17} />, description: 'Assigned students' },
    { id: 'logs', label: 'All Logs', icon: <FileText size={17} />, description: 'View student work' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={17} />, description: 'Performance insights' },
  ],
  SENIOR: [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} />, description: 'Platform overview' },
    { id: 'students', label: 'All Students', icon: <Users size={17} />, description: 'All interns' },
    { id: 'logs', label: 'All Logs', icon: <FileText size={17} />, description: 'All work logs' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={17} />, description: 'Deep insights' },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Intern',
  JUNIOR: 'Junior Supervisor',
  SENIOR: 'Senior Supervisor',
};

export default function Sidebar({ user, activeTab, onTabChange }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS.STUDENT;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Zap size={15} color="#0d0d10" fill="#0d0d10" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Trackr
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block rounded-lg p-1 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronRight
            size={16}
            className="transition-transform duration-200"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden rounded-lg p-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
            className={`nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="flex-1 text-left">{item.label}</span>
            )}
            {!collapsed && activeTab === item.id && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* User Profile + Logout */}
      <div className="px-3 pb-4 border-t pt-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'var(--bg-hover)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(232,197,71,0.2)' }}
          >
            {getInitials(user.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="nav-item w-full"
          style={{ color: loggingOut ? 'var(--text-muted)' : 'var(--red)' }}
        >
          <LogOut size={16} />
          {!collapsed && <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '260px',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? '68px' : '220px',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <SidebarContent />
      </div>
    </>
  );
}
