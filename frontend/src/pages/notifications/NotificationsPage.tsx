import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notification.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(false),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Notifications</p>
          <h1 className="text-3xl font-semibold text-slate-900">Inbox and alerts</h1>
        </div>
        <Button variant="secondary" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.status === 'pending'}>
          Mark all read
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading recent alerts…</p>
          ) : notifications?.length ? (
            notifications.map((notification) => (
              <div key={notification.id} className={`rounded-3xl border p-5 ${notification.is_read ? 'border-slate-200 bg-white' : 'border-slate-900/10 bg-slate-50'}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                    <p className="text-sm text-slate-500">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={notification.is_read ? 'default' : 'info'}>{notification.is_read ? 'Read' : 'Unread'}</Badge>
                    <p className="text-xs text-slate-500">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  {!notification.is_read ? (
                    <Button variant="secondary" onClick={() => markReadMutation.mutate(notification.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No notifications at this time.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsPage;
