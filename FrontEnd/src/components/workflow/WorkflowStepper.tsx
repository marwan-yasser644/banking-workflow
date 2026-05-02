import { CheckCircle, Clock, XCircle, Loader } from 'lucide-react'
import type { WorkflowState, WorkflowLog } from '@/types'
import { cn, formatDateTime } from '@/utils'

const STEPS: { state: WorkflowState; label: string; desc: string }[] = [
  { state: 'INITIATED',     label: 'Initiated',     desc: 'Request submitted' },
  { state: 'VALIDATED',     label: 'Validated',     desc: 'Input validation passed' },
  { state: 'RULE_CHECKED',  label: 'Rules Check',   desc: 'Business rules evaluated' },
  { state: 'RISK_ASSESSED', label: 'Risk Assessed', desc: 'Risk score computed' },
  { state: 'APPROVED',      label: 'Decision',      desc: 'Final approval/rejection' },
]

const ORDER: WorkflowState[] = [
  'INITIATED', 'VALIDATED', 'RULE_CHECKED', 'RISK_ASSESSED', 'APPROVED',
]

function getStepStatus(stepState: WorkflowState, currentState: WorkflowState) {
  if (currentState === 'REJECTED') {
    const stepIdx = ORDER.indexOf(stepState)
    const curIdx = ORDER.indexOf('APPROVED')  // Rejected replaces approved slot
    if (stepState === 'APPROVED') return 'rejected'
    if (stepIdx < 4) {
      // Find where it stopped
      const rejectedAtIdx = ORDER.indexOf(currentState === 'REJECTED' ? 'APPROVED' : currentState)
      if (stepIdx < curIdx) return 'done'
    }
    return 'done'
  }

  const stepIdx = ORDER.indexOf(stepState)
  const curIdx  = ORDER.indexOf(currentState)

  if (stepIdx < curIdx) return 'done'
  if (stepIdx === curIdx) return 'active'
  return 'pending'
}

interface WorkflowStepperProps {
  currentStatus: WorkflowState
  logs?: WorkflowLog[]
}

export function WorkflowStepper({ currentStatus, logs = [] }: WorkflowStepperProps) {
  const isRejected = currentStatus === 'REJECTED'

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[var(--color-border)]" />

      <div className="flex flex-col gap-0">
        {STEPS.map((step, i) => {
          const displayState = step.state === 'APPROVED' && isRejected ? 'REJECTED' : step.state
          const status = isRejected && step.state === 'APPROVED'
            ? 'rejected'
            : getStepStatus(step.state, currentStatus)

          const log = logs.find(l => l.to_state === displayState || l.to_state === step.state)

          return (
            <div key={step.state} className={cn('relative flex gap-4 pb-6', i === STEPS.length - 1 && 'pb-0')}>
              {/* Icon */}
              <div className={cn(
                'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all',
                status === 'done'     && 'bg-emerald-500 border-emerald-500 text-white',
                status === 'active'   && 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white',
                status === 'pending'  && 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)]',
                status === 'rejected' && 'bg-red-500 border-red-500 text-white',
              )}>
                {status === 'done'     && <CheckCircle size={18} />}
                {status === 'active'   && <Loader size={18} className="animate-spin" />}
                {status === 'pending'  && <Clock size={16} />}
                {status === 'rejected' && <XCircle size={18} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1.5">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-sm font-semibold',
                    status === 'pending' ? 'text-[var(--color-muted)]' : 'text-[var(--color-text)]'
                  )}>
                    {step.state === 'APPROVED' && isRejected ? 'Decision' : step.label}
                  </p>
                  {status === 'active' && (
                    <span className="text-xs bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full">Current</span>
                  )}
                  {status === 'rejected' && (
                    <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded-full">Rejected</span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-muted)]">{step.desc}</p>
                {log && (
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">{formatDateTime(log.created_at)}</p>
                )}
                {log?.transition_reason && (
                  <p className="text-xs text-[var(--color-muted)] mt-0.5 italic">"{log.transition_reason}"</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}