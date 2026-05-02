import { useQuery } from '@tanstack/react-query'
import { ClipboardList, User, FileText } from 'lucide-react'
import { auditService } from '@/services'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDateTime, cn } from '@/utils'

const ACTION_COLORS: Record<string, string> = {
  LOGIN:                 'bg-blue-100 text-blue-700',
  CREATE_LOAN_REQUEST:   'bg-emerald-100 text-emerald-700',
  UPDATE_LOAN_REQUEST:   'bg-amber-100 text-amber-700',
  WORKFLOW_TRANSITION:   'bg-violet-100 text-violet-700',
  MANUAL_APPROVE:        'bg-emerald-100 text-emerald-700',
  MANUAL_REJECT:         'bg-red-100 text-red-700',
  CREATE_USER:           'bg-sky-100 text-sky-700',
  UPDATE_USER:           'bg-amber-100 text-amber-700',
  DEACTIVATE_USER:       'bg-red-100 text-red-700',
}

export default function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => auditService.list({ limit: 200 }),
    refetchInterval: 30_000,
  })

  return (
    <div className="flex flex-col gap-5 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Audit Log</h1>
        <p className="text-sm text-[var(--color-muted)]">All system actions — {data?.length ?? 0} records</p>
      </div>

      {isLoading ? <PageLoader /> : !data?.length ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <ClipboardList size={40} className="text-[var(--color-border)] mb-4" />
          <p className="text-[var(--color-muted)]">No audit records yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                {['Timestamp','Action','Entity','User','IP Address','Details'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map(log => (
                <tr key={log.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--color-muted)]">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                      ACTION_COLORS[log.action] ?? 'bg-slate-100 text-slate-700'
                    )}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {log.entity_type === 'User' ? <User size={12} className="text-[var(--color-muted)]" /> : <FileText size={12} className="text-[var(--color-muted)]" />}
                      <span className="text-xs text-[var(--color-muted)]">{log.entity_type}</span>
                      {log.entity_id && <span className="text-xs font-mono text-[var(--color-text)]">#{log.entity_id}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                    {log.user_id ? `#${log.user_id}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">
                    {log.ip_address ?? '—'}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {log.new_values && (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-[var(--color-brand)] font-medium list-none hover:underline">
                          View changes
                        </summary>
                        <pre className="text-xs mt-1 bg-[var(--color-bg)] p-2 rounded overflow-x-auto text-[var(--color-muted)]">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}