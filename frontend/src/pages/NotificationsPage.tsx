import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle } from 'lucide-react'
import { formatRelativeTime } from '@/utils'
import { mockNotifications } from '@/constants/mockData'

export function NotificationsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      default:
        return 'ℹ'
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'warning'
      default:
        return 'info'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage system notifications</p>
          </div>
          <Button variant="outline">Mark all as read</Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {['All', 'Unread', 'Success', 'Warning', 'Error'].map((tab) => (
            <Button key={tab} variant="outline" size="sm">
              {tab}
            </Button>
          ))}
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          {mockNotifications.map((notif) => (
            <Card key={notif.id} className={notif.read ? 'opacity-75' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    notif.type === 'success' ? 'bg-green-500' :
                    notif.type === 'error' ? 'bg-red-500' :
                    notif.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{notif.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                      <Badge variant={getColor(notif.type)}>
                        {notif.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.read && (
                      <Button variant="ghost" size="sm" title="Mark as read">
                        <CheckCircle size={18} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Delete">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
