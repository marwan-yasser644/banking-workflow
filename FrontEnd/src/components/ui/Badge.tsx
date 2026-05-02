import { cn } from '@/utils'
import type { WorkflowState, RiskLevel } from '@/types'
import { STATUS_META, RISK_META } from '@/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variant === 'outline' && 'border border-current bg-transparent',
      className
    )}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: WorkflowState }) {
  const meta = STATUS_META[status]
  return <Badge className={meta.color}>{meta.label}</Badge>
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const meta = RISK_META[risk]
  return <Badge className={meta.color}>{meta.label}</Badge>
}