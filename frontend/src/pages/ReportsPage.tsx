import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Download, Plus, FileText } from 'lucide-react'

const reportData = [
  { month: 'Jan', approved: 120, rejected: 20, pending: 30 },
  { month: 'Feb', approved: 160, rejected: 25, pending: 35 },
  { month: 'Mar', approved: 140, rejected: 18, pending: 28 },
  { month: 'Apr', approved: 180, rejected: 30, pending: 40 },
  { month: 'May', approved: 210, rejected: 28, pending: 45 },
  { month: 'Jun', approved: 240, rejected: 35, pending: 50 },
]

export function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and view system reports</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus size={18} />
            Generate Report
          </Button>
        </div>

        {/* Report Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Trends</CardTitle>
              <CardDescription>Monthly approval statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" fill="#10b981" />
                  <Bar dataKey="rejected" fill="#ef4444" />
                  <Bar dataKey="pending" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Metrics</CardTitle>
              <CardDescription>Request processing over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="approved" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>Recently generated system reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'Monthly Performance Report', period: 'June 2024', date: '2024-06-30', type: 'PDF' },
                { title: 'Risk Analysis Report', period: 'Q2 2024', date: '2024-06-15', type: 'PDF' },
                { title: 'User Activity Report', period: 'June 2024', date: '2024-06-20', type: 'XLSX' },
                { title: 'Compliance Report', period: 'Q1 2024', date: '2024-03-31', type: 'PDF' },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div className="flex items-center gap-3">
                    <FileText className="text-gray-400" size={24} />
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{report.period} • {report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{report.type}</Badge>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download size={16} />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
