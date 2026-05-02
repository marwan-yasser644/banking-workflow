import { cn } from '@/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn(
      'inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin',
      className
    )} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-8 h-8 text-[var(--color-brand)]" />
        <p className="text-sm text-[var(--color-muted)]">Loading...</p>
      </div>
    </div>
  )
}