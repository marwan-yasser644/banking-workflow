import { useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'
import { mockRequests } from '@/constants/mockData'

export function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [riskFilter, setRiskFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredRequests = mockRequests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.applicant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || req.status === statusFilter
    const matchesRisk = !riskFilter || req.risk === riskFilter
    return matchesSearch && matchesStatus && matchesRisk
  })

  const totalPages = Math.ceil(filteredRequests.length / pageSize)
  const paginatedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize)

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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all loan requests</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus size={18} />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Loan Request</DialogTitle>
                <DialogDescription>Fill in the details to create a new loan request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="applicant">Applicant Name</Label>
                  <Input id="applicant" placeholder="Enter applicant name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount</Label>
                  <Input id="amount" type="number" placeholder="Enter amount" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Term (months)</Label>
                  <Input id="term" type="number" placeholder="Enter term" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input id="purpose" placeholder="Enter purpose" />
                </div>
                <Button className="w-full">Create Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <Input
                  placeholder="Search by ID or applicant name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="INITIATED">Initiated</SelectItem>
                  <SelectItem value="VALIDATED">Validated</SelectItem>
                  <SelectItem value="RULE_CHECKED">Rule Checked</SelectItem>
                  <SelectItem value="RISK_ASSESSED">Risk Assessed</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={(v) => {
                setRiskFilter(v)
                setPage(1)
              }}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risk Levels</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>Total: {filteredRequests.length} requests</CardDescription>
              </div>
              <Filter size={18} className="text-gray-400" />
            </div>
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
                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.length > 0 ? (
                    paginatedRequests.map((req) => (
                      <tr key={req.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="py-3 px-4 font-mono text-xs font-semibold">{req.id}</td>
                        <td className="py-3 px-4 font-medium">{req.applicant}</td>
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
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatDate(req.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" title="View">
                              <Eye size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" title="Delete" className="text-red-600 hover:text-red-700">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
