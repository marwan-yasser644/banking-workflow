import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  User, Mail, Phone, Building2, CreditCard,
  Calendar, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge, RiskBadge } from '@/components/ui/Badge'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { Spinner } from '@/components/ui/Spinner'
import { loanService } from '@/services'
import { formatCurrency, formatDateTime, getErrorMessage } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import type { LoanRequest } from '@/types'

interface LoanDetailModalProps {
  loanId: number | null
  onClose: () => void
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-[var(--color-muted)] flex-shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text)] truncate">{value}</p>
      </div>
    </div>
  )
}

export function LoanDetailModal({ loanId, onClose }: LoanDetailModalProps) {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const qc = useQueryClient()
  const [actionReason, setActionReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => loanService.get(loanId!),
    enabled: !!loanId,
  })

  const { data: wfLogs } = useQuery({
    queryKey: ['loan-workflow', loanId],
    queryFn: () => loanService.workflow(loanId!),
    enabled: !!loanId,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['loan', loanId] })
    qc.invalidateQueries({ queryKey: ['loans'] })
    qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
  }

  const approveMut = useMutation({
    mutationFn: () => loanService.approve(loanId!, actionReason || undefined),
    onSuccess: () => { success('Loan approved successfully'); invalidate() },
    onError: (e) => toastError(getErrorMessage(e)),
  })

  const rejectMut = useMutation({
    mutationFn: () => loanService.reject(loanId!, actionReason),
    onSuccess: () => { success('Loan rejected'); invalidate() },
    onError: (e) => toastError(getErrorMessage(e)),
  })

  const canAct = (user?.role === 'APPROVER' || user?.role === 'ADMIN')
    && loan?.status === 'RISK_ASSESSED'

  return (
    <Modal open={!!loanId} onClose={onClose} title={loan ? `Loan ${loan.reference_number}` : 'Loan Details'} size="xl">
      {isLoading || !loan ? (
        <div className="flex items-center justify-center h-48"><Spinner className="w-7 h-7 text-[var(--color-brand)]" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: details */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Status row */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={loan.status} />
              {loan.risk_level && <RiskBadge risk={loan.risk_level} />}
              {loan.risk_score !== null && (
                <span className="text-xs text-[var(--color-muted)] bg-[var(--color-bg)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                  Risk Score: {loan.risk_score.toFixed(1)}/100
                </span>
              )}
            </div>

            {/* Applicant info */}
            <div className="card p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">Applicant Information</p>
              </div>
              <InfoRow label="Full Name"    value={loan.applicant_name} icon={<User size={14} />} />
              <InfoRow label="National ID"  value={loan.national_id}    icon={<CreditCard size={14} />} />
              <InfoRow label="Email"        value={loan.email}          icon={<Mail size={14} />} />
              <InfoRow label="Phone"        value={loan.phone}          icon={<Phone size={14} />} />
              <InfoRow label="Employment"   value={loan.employment_type} icon={<Building2 size={14} />} />
              <InfoRow label="Monthly Salary" value={formatCurrency(loan.monthly_salary)} />
            </div>

            {/* Loan details */}
            <div className="card p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">Loan Details</p>
              </div>
              <InfoRow label="Loan Amount"   value={formatCurrency(loan.loan_amount)} />
              <InfoRow label="Tenure"        value={`${loan.loan_tenure_months} months`} icon={<Calendar size={14} />} />
              <InfoRow label="Purpose"       value={loan.loan_purpose} />
              {loan.debt_to_income_ratio !== null && (
                <InfoRow label="DTI Ratio" value={`${loan.debt_to_income_ratio.toFixed(1)}%`} />
              )}
              {loan.eligibility_score !== null && (
                <InfoRow label="Eligibility Score" value={`${loan.eligibility_score.toFixed(1)}/100`} />
              )}
              <InfoRow label="Submitted" value={formatDateTime(loan.created_at)} />
            </div>

            {/* Rules breakdown */}
            {loan.rules_details && (
              <div className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">
                  Business Rules — Score: {loan.rules_details.total_score.toFixed(0)}/{loan.rules_details.max_score}
                </p>
                <div className="flex flex-col gap-2">
                  {loan.rules_details.rules.map(r => (
                    <div key={r.name} className="flex items-start gap-2.5">
                      {r.passed
                        ? <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        : <XCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-[var(--color-text)]">
                            {r.name.replace(/_/g, ' ')}
                          </p>
                          <span className="text-xs text-[var(--color-muted)]">+{r.score.toFixed(0)}pts</span>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] truncate">{r.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection reason */}
            {loan.rejection_reason && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertTriangle size={15} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300">Rejection Reason</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{loan.rejection_reason}</p>
                </div>
              </div>
            )}

            {/* Approval actions */}
            {canAct && (
              <div className="card p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">Action Required</p>
                <textarea
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="Add a reason (required for rejection)..."
                  rows={2}
                  className="input mb-3 resize-none text-sm"
                />
                <div className="flex gap-2">
                  <button
                    className="btn-primary flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-sm py-2"
                    onClick={() => approveMut.mutate()}
                    disabled={approveMut.isPending}
                  >
                    {approveMut.isPending ? <Spinner className="w-4 h-4" /> : <CheckCircle2 size={15} />}
                    Approve
                  </button>
                  <button
                    className="btn-ghost flex-1 justify-center text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm py-2"
                    onClick={() => rejectMut.mutate()}
                    disabled={rejectMut.isPending || !actionReason}
                  >
                    {rejectMut.isPending ? <Spinner className="w-4 h-4" /> : <XCircle size={15} />}
                    Reject
                  </button>
                </div>
                {!actionReason && showRejectInput && (
                  <p className="text-xs text-red-500 mt-1">Reason is required for rejection</p>
                )}
              </div>
            )}
          </div>

          {/* Right: workflow */}
          <div className="card p-4 h-fit">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-4">Workflow Progress</p>
            <WorkflowStepper currentStatus={loan.status} logs={wfLogs} />
          </div>
        </div>
      )}
    </Modal>
  )
}