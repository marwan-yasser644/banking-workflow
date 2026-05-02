import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff, CheckCheck, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { notificationService } from '@/services'
import { PageLoader } from '@/components/ui/Spinner'
import { timeAgo, cn } from '@/utils'
import type { NotificationType } from '@/types'

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; cls: string }> = {
  INFO:    { icon: <Info size={15} />,          cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' },
  SUCCESS: { icon: <CheckCircle size={15} />,   cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' },
  WARNING: { icon: <AlertTriangle size={15} />, cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300' },
  ERROR:   { icon: <XCircle size={15} />,       cls: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' },
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
  })

  const markRead = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifs-unread'] })
    },
  })

  const markAll = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifs-unread'] })
    },
  })

  const unread = data?.filter(n => !n.is_read).length ?? 0

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 fade-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Notifications</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="btn-ghost text-sm"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? <PageLoader /> : !data?.length ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <BellOff size={40} className="text-[var(--color-border)] mb-4" />
          <p className="text-[var(--color-muted)] font-medium">No notifications yet</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">You'll see updates about loan requests here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map(n => {
            const meta = TYPE_META[n.notification_type]
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead.mutate(n.id)}
                className={cn(
                  'card p-4 flex items-start gap-3 transition-all',
                  !n.is_read && 'border-[var(--color-brand)] bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer hover:shadow-sm',
                  n.is_read && 'opacity-60'
                )}
              >
                {/* Icon */}
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', meta.cls)}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold text-[var(--color-text)]', n.is_read && 'font-medium')}>
                      {n.title}
                    </p>
                    <span className="text-xs text-[var(--color-muted)] whitespace-nowrap flex-shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">{n.message}</p>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] flex-shrink-0 mt-2" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}