import { useQuery } from '@tanstack/react-query'
import {
  FileText, CheckCircle, XCircle, Clock,
  TrendingUp, AlertTriangle, DollarSign,
} from 'lucide-react'
import { dashboardService } from '@/services'
import { PageLoader } from '@/components/ui/Spinner'
import { StatCard } from '@/components/ui/StatCard'
import {
  StatusDistributionChart,
  RiskDistributionChart,
  ApprovalRateGauge,
} from '@/components/charts/DashboardCharts'
import { formatCurrency } from '@/utils'

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.stats,
    refetchInterval: 60_000,
  })

  if (isLoading) return <PageLoader />
  if (error || !stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertTriangle size={32} className="text-amber-500 mx-auto mb-2" />
        <p className="text-[var(--color-muted)] text-sm">Failed to load dashboard data</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Real-time overview of loan processing activity</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={stats.total_requests.toLocaleString()}
          icon={<FileText size={20} />}
          accent="var(--color-brand)"
        />
        <StatCard
          title="Approved"
          value={stats.approved_requests.toLocaleString()}
          sub={`${stats.approved_loan_volume > 0 ? formatCurrency(stats.approved_loan_volume) : '—'} volume`}
          icon={<CheckCircle size={20} />}
          accent="#16a34a"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected_requests.toLocaleString()}
          icon={<XCircle size={20} />}
          accent="#dc2626"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending_requests.toLocaleString()}
          icon={<Clock size={20} />}
          accent="#d97706"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          title="Total Loan Volume"
          value={formatCurrency(stats.total_loan_volume)}
          icon={<DollarSign size={20} />}
          accent="var(--color-brand)"
        />
        <StatCard
          title="Avg Risk Score"
          value={stats.avg_risk_score !== null ? `${stats.avg_risk_score.toFixed(1)} / 100` : '—'}
          sub="Lower is better"
          icon={<TrendingUp size={20} />}
          accent={
            stats.avg_risk_score === null ? 'var(--color-muted)'
            : stats.avg_risk_score >= 60 ? '#dc2626'
            : stats.avg_risk_score >= 30 ? '#d97706'
            : '#16a34a'
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Requests by Status</h3>
          <p className="text-xs text-[var(--color-muted)] mb-4">Distribution across workflow states</p>
          <StatusDistributionChart stats={stats} />
        </div>

        {/* Approval gauge */}
        <div className="card p-5 flex flex-col">
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Approval Rate</h3>
          <p className="text-xs text-[var(--color-muted)] mb-2">Of decided requests</p>
          <div className="flex-1 flex items-center justify-center">
            <ApprovalRateGauge rate={stats.approval_rate} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
              <p className="text-emerald-700 dark:text-emerald-300 font-bold">{stats.approved_requests}</p>
              <p className="text-xs text-[var(--color-muted)]">Approved</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
              <p className="text-red-700 dark:text-red-300 font-bold">{stats.rejected_requests}</p>
              <p className="text-xs text-[var(--color-muted)]">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Risk Distribution</h3>
        <p className="text-xs text-[var(--color-muted)] mb-4">Breakdown of assessed loan risk levels</p>
        <div className="max-w-sm mx-auto">
          <RiskDistributionChart stats={stats} />
        </div>
        {/* Risk counts */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { k: 'LOW',    label: 'Low Risk',    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { k: 'MEDIUM', label: 'Medium Risk',  color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            { k: 'HIGH',   label: 'High Risk',    color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
          ].map(r => (
            <div key={r.k} className={`${r.color} rounded-xl p-3 text-center`}>
              <p className="text-xl font-bold">{stats.requests_by_risk[r.k] ?? 0}</p>
              <p className="text-xs opacity-80">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}