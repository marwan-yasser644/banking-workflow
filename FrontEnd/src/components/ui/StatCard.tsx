import { ReactNode } from 'react'
import { cn } from '@/utils'

interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  icon: ReactNode
  trend?: { value: number; label: string }
  accent?: string
  className?: string
}

export function StatCard({ title, value, sub, icon, trend, accent = 'var(--color-brand)', className }: StatCardProps) {
  return (
    <div className={cn('card p-5 fade-up', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-1">{title}</p>
          <p className="text-3xl font-bold text-[var(--color-text)] leading-none">{value}</p>
          {sub && <p className="text-xs text-[var(--color-muted)] mt-1">{sub}</p>}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent }}
        >
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center gap-1.5">
          <span className={cn(
            'text-xs font-semibold',
            trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-[var(--color-muted)]">{trend.label}</span>
        </div>
      )}
    </div>
  )
}