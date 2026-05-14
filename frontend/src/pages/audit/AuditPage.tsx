import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../../services/audit.service';
import { Card } from '../../components/ui/Card';
import { formatDate } from '../../utils/format';

const AuditPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => getAuditLogs({ limit: 100 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Audit</p>
        <h1 className="text-3xl font-semibold text-slate-900">Activity logs</h1>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading audit logs…</td>
                </tr>
              ) : data?.length ? (
                data.map((log) => (
                  <tr key={log.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{log.action}</td>
                    <td className="px-6 py-4">{log.entity_type}</td>
                    <td className="px-6 py-4">{log.user_id ?? 'System'}</td>
                    <td className="px-6 py-4 text-slate-500">{JSON.stringify(log.new_values || log.old_values || {})}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No audit entries available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditPage;
