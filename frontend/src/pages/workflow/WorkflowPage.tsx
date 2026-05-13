import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLoanRequest, getLoanWorkflowHistory } from '../../services/loan.service';
import { Card } from '../../components/ui/Card';
import { formatDate, capitalize } from '../../utils/format';
import { ArrowLeft, Activity, CheckCircle2, Clock3 } from 'lucide-react';

const stageIcons = {
  INITIATED: Clock3,
  VALIDATED: Activity,
  RULE_CHECKED: CheckCircle2,
  APPROVED: CheckCircle2,
  REJECTED: CheckCircle2,
};

const WorkflowPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { data: request } = useQuery({
    queryKey: ['loanRequest', requestId],
    queryFn: () => getLoanRequest(requestId!),
    enabled: Boolean(requestId),
  });
  const { data: workflow } = useQuery({
    queryKey: ['workflowHistory', requestId],
    queryFn: () => getLoanWorkflowHistory(requestId!),
    enabled: Boolean(requestId),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/requests" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Back to requests
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Workflow tracking</h1>
          <p className="text-sm text-slate-500">Review the approval journey for the selected request.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          Reference: {request?.reference_number ?? '—'}
        </div>
      </div>

      <Card className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Current status</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{request ? capitalize(request.status) : 'Loading...'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Risk level</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{request?.risk_level ?? 'Unknown'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {workflow?.map((step: any, index: number) => {
            const Icon = stageIcons[step.to_state as keyof typeof stageIcons] ?? Clock3;
            return (
              <div key={step.id} className="flex gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid h-14 w-14 place-items-center rounded-3xl bg-slate-900 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-900">{capitalize(step.to_state)}</p>
                    <p className="text-sm text-slate-500">{formatDate(step.created_at)}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{step.transition_reason ?? 'Automated workflow transition.'}</p>
                </div>
              </div>
            );
          })}
          {!workflow?.length ? <p className="text-sm text-slate-500">Workflow history is not available.</p> : null}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowPage;
