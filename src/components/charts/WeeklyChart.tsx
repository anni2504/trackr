'use client';
// src/components/charts/WeeklyChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

interface Props {
  data: Array<{ date: string; hours: number; logs: number }>;
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
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
        <p className="font-semibold mb-1" style={{ color: '#f0f0f0' }}>{label}</p>
        <p style={{ color: '#e8c547' }}>
          <span className="font-mono font-bold">{d.hours}h</span>
          <span style={{ color: '#8888a0' }}> worked</span>
        </p>
        <p style={{ color: '#8888a0' }}>
          {d.logs} {d.logs === 1 ? 'log' : 'logs'} submitted
        </p>
      </div>
    );
  }
  return null;
};

export default function WeeklyChart({ data, title }: Props) {
  const maxVal = Math.max(...data.map((d) => d.hours), 1);
  const today = data[data.length - 1]?.date;

  return (
    <div>
      {title && (
        <p className="text-xs font-medium uppercase mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          {title}
        </p>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#555568', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#555568', fontSize: 11 }}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.date === today
                  ? '#e8c547'
                  : entry.hours > maxVal * 0.6
                  ? 'rgba(232,197,71,0.55)'
                  : 'rgba(232,197,71,0.25)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
