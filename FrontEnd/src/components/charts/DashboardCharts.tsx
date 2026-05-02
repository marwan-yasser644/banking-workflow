import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import type { DashboardStats } from '@/types'

const PALETTE = {
  INITIATED:     '#3b82f6',
  VALIDATED:     '#0ea5e9',
  RULE_CHECKED:  '#8b5cf6',
  RISK_ASSESSED: '#f59e0b',
  APPROVED:      '#22c55e',
  REJECTED:      '#ef4444',
}

const RISK_COLORS = {
  LOW:    '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH:   '#ef4444',
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  fontSize: 12,
}

export function StatusDistributionChart({ stats }: { stats: DashboardStats }) {
  const data = Object.entries(stats.requests_by_status)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.replace('_', ' '), value: v, key: k }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--color-bg)' }} />
        <Bar dataKey="value" name="Requests" radius={[4, 4, 0, 0]}>
          {data.map(d => (
            <Cell key={d.key} fill={PALETTE[d.key as keyof typeof PALETTE] ?? '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RiskDistributionChart({ stats }: { stats: DashboardStats }) {
  const data = Object.entries(stats.requests_by_risk)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v }))

  if (data.length === 0) return (
    <div className="flex items-center justify-center h-52 text-[var(--color-muted)] text-sm">
      No risk data yet
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {data.map(d => (
            <Cell key={d.name} fill={RISK_COLORS[d.name as keyof typeof RISK_COLORS] ?? '#64748b'} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend
          formatter={(v) => <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function ApprovalRateGauge({ rate }: { rate: number }) {
  const data = [
    { name: 'Approved', value: rate },
    { name: 'Other',    value: 100 - rate },
  ]
  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            <Cell fill="#22c55e" />
            <Cell fill="var(--color-border)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-[var(--color-text)]">{rate.toFixed(1)}%</p>
        <p className="text-xs text-[var(--color-muted)]">Approval Rate</p>
      </div>
    </div>
  )
}