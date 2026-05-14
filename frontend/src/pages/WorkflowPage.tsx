import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { mockRequests } from '@/constants/mockData'

const workflowSteps = [
  { id: 1, name: 'Initiated', icon: Clock },
  { id: 2, name: 'Validated', icon: CheckCircle2 },
  { id: 3, name: 'Rule Checked', icon: CheckCircle2 },
  { id: 4, name: 'Risk Assessed', icon: AlertCircle },
  { id: 5, name: 'Approved/Rejected', icon: CheckCircle2 },
]

export function WorkflowPage() {
  const requests = mockRequests.slice(0, 5)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflow Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track request progress through approval workflow</p>
        </div>

        {/* Workflow Steps Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Process</CardTitle>
            <CardDescription>Standard loan approval workflow steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mb-2">
                      <Icon size={20} />
                    </div>
                    <p className="text-xs font-medium text-center">{step.name}</p>
                    {idx < workflowSteps.length - 1 && (
                      <div className="hidden sm:block absolute w-16 h-0.5 bg-blue-200 dark:bg-blue-900 mt-6 ml-12" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Request Workflows */}
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{req.applicant}</CardTitle>
                    <CardDescription>Request {req.id}</CardDescription>
                  </div>
                  <Badge variant={req.status.includes('APPROVED') ? 'success' : req.status.includes('REJECTED') ? 'destructive' : 'warning'}>
                    {req.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress indicators */}
                  <div className="flex items-center gap-2">
                    {['INITIATED', 'VALIDATED', 'RULE_CHECKED', 'RISK_ASSESSED', 'APPROVED'].map((step, idx) => {
                      const isCompleted = workflowSteps.some(s => s.name.includes(step.replace('_', ' ')))
                      const isActive = req.status === step
                      return (
                        <div key={idx} className="flex items-center flex-1">
                          <div className={`h-2 flex-1 rounded-full ${
                            isCompleted || isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          {idx < 4 && <div className="w-0.5 h-2 bg-gray-300 mx-1" />}
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="font-bold">${req.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Term</p>
                      <p className="font-bold">{req.term} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                      <Badge variant={req.risk === 'LOW' ? 'success' : req.risk === 'MEDIUM' ? 'warning' : 'destructive'}>
                        {req.risk}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
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
