import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ExternalLink, RefreshCw } from 'lucide-react'
import { loanService } from '@/services'
import { StatusBadge, RiskBadge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { LoanDetailModal } from '@/components/forms/LoanDetailModal'
import { formatCurrency, formatDate, cn } from '@/utils'
import type { WorkflowState, RiskLevel } from '@/types'

const STATUS_OPTIONS: WorkflowState[] = [
  'INITIATED','VALIDATED','RULE_CHECKED','RISK_ASSESSED','APPROVED','REJECTED'
]
const RISK_OPTIONS: RiskLevel[] = ['LOW','MEDIUM','HIGH']

export default function LoansPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<WorkflowState | ''>('')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['loans', page, statusFilter, riskFilter],
    queryFn: () => loanService.list({
      page,
      size: 15,
      ...(statusFilter && { status: statusFilter }),
      ...(riskFilter  && { risk_level: riskFilter }),
    }),
    placeholderData: prev => prev,
  })

  const filtered = data?.items?.filter(l =>
    !search ||
    l.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
    l.reference_number.toLowerCase().includes(search.toLowerCase()) ||
    l.national_id.includes(search)
  ) ?? []

  return (
    <div className="flex flex-col gap-5 fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Loan Requests</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            {data?.total ?? 0} total records
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-ghost text-sm"
          disabled={isFetching}
        >
          <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters bar */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, reference, national ID..."
            className="input pl-8 text-sm"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as WorkflowState | ''); setPage(1) }}
            className="input pl-7 pr-8 text-sm appearance-none cursor-pointer w-44"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Risk filter */}
        <select
          value={riskFilter}
          onChange={e => { setRiskFilter(e.target.value as RiskLevel | ''); setPage(1) }}
          className="input text-sm appearance-none cursor-pointer w-36"
        >
          <option value="">All Risk</option>
          {RISK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {(statusFilter || riskFilter || search) && (
          <button
            onClick={() => { setStatusFilter(''); setRiskFilter(''); setSearch(''); setPage(1) }}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-muted)]">
            <Search size={32} className="mb-3 opacity-30" />
            <p className="font-medium">No loan requests found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                  {['Reference','Applicant','Amount','Salary','Status','Risk','Submitted',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map(loan => (
                  <tr
                    key={loan.id}
                    onClick={() => setSelectedId(loan.id)}
                    className="hover:bg-[var(--color-bg)] cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-[var(--color-brand)] dark:text-blue-400">
                        {loan.reference_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--color-text)] whitespace-nowrap">{loan.applicant_name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{loan.employment_type}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-[var(--color-text)]">
                      {formatCurrency(loan.loan_amount)}
                      <p className="text-xs text-[var(--color-muted)] font-normal">{loan.loan_tenure_months}mo</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--color-muted)]">
                      {formatCurrency(loan.monthly_salary)}/mo
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
                    <td className="px-4 py-3">
                      {loan.risk_level ? <RiskBadge risk={loan.risk_level} /> : <span className="text-[var(--color-muted)] text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)] text-xs whitespace-nowrap">
                      {formatDate(loan.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <ExternalLink
                        size={14}
                        className="text-[var(--color-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-muted)]">
            Page {data.page} of {data.pages} · {data.total} records
          </p>
          <div className="flex gap-2">
            <button
              className="btn-ghost text-sm py-1.5 px-3"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="btn-ghost text-sm py-1.5 px-3"
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <LoanDetailModal loanId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}