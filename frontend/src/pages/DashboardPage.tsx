import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Eye, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils'
import { mockStats, mockTimeSeries, mockRiskDistribution, mockRequests } from '@/constants/mockData'

const COLORS = ['#059669', '#d97706', '#dc2626']

export function DashboardPage() {
  const stats = mockStats
  const timeSeries = mockTimeSeries
  const riskDist = mockRiskDistribution
  const requests = mockRequests.slice(0, 4)

  const riskData = useMemo(() => [
    { name: 'Low Risk', value: riskDist.low },
    { name: 'Medium Risk', value: riskDist.medium },
    { name: 'High Risk', value: riskDist.high },
  ], [riskDist])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'destructive'
      case 'PENDING':
        return 'warning'
      case 'IN_REVIEW':
        return 'info'
      default:
        return 'secondary'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your banking workflow system</p>
          </div>
          <Button variant="default" size="lg">
            <TrendingUp size={18} />
            Generate Report
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: stats.totalRequests, change: stats.totalRequestsChange, icon: '📋' },
            { label: 'Approved', value: stats.approved, change: stats.approvedChange, icon: '✅', color: 'green' },
            { label: 'Pending', value: stats.pending, change: stats.pendingChange, icon: '⏳', color: 'amber' },
            { label: 'Rejected', value: stats.rejected, change: stats.rejectedChange, icon: '❌', color: 'red' },
          ].map((stat, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{formatNumber(stat.value)}</p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={14} className={stat.change > 0 ? 'text-green-600' : 'text-red-600'} />
                  <span className={stat.change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Series Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Requests Over Time</CardTitle>
              <CardDescription>Monthly loan request trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Portfolio breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Loan Requests</CardTitle>
              <CardDescription>Latest submitted requests</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Applicant</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Risk</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">{req.id}</td>
                      <td className="py-3 px-4">{req.applicant}</td>
                      <td className="py-3 px-4 font-semibold">{formatCurrency(req.amount)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={req.risk === 'LOW' ? 'success' : req.risk === 'MEDIUM' ? 'warning' : 'destructive'}>
                          {req.risk}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye size={14} />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
