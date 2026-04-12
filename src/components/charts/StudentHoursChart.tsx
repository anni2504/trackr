'use client';
// src/components/charts/StudentHoursChart.tsx
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getInitials } from '@/lib/utils';

interface StudentData {
  userId: string;
  name: string;
  email: string;
  totalHours: number;
  logsCount: number;
  todayHours: number;
}

interface Props {
  data: StudentData[];
}

const COLORS = ['#e8c547', '#60a5fa', '#a78bfa', '#4ade80', '#f97316', '#f472b6', '#22d3ee'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: '#1e1e28',
          border: '1px solid #2a2a38',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <p className="font-semibold mb-1" style={{ color: '#f0f0f0' }}>{d.name}</p>
        <p style={{ color: '#e8c547' }}>
          <span className="font-mono font-bold">{d.value}h</span>
          <span style={{ color: '#8888a0' }}> total</span>
        </p>
        <p style={{ color: '#8888a0' }}>{d.logsCount} logs</p>
      </div>
    );
  }
  return null;
};

export default function StudentHoursChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">No student data yet</p>
      </div>
    );
  }

  const chartData = data.map((s) => ({
    name: s.name,
    value: s.totalHours,
    logsCount: s.logsCount,
    userId: s.userId,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {data.map((student, index) => (
          <div key={student.userId} className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {student.name}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                  {student.totalHours}h
                </span>
              </div>
              <div
                className="h-1 rounded-full mt-1 overflow-hidden"
                style={{ background: 'var(--bg-hover)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((student.totalHours / Math.max(...data.map(d => d.totalHours), 1)) * 100, 100)}%`,
                    background: COLORS[index % COLORS.length],
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
