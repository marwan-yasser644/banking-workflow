import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLoanRequest, getLoanWorkflowHistory } from '../../services/loan.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, capitalize } from '../../utils/format';
import { ArrowLeft, ClipboardList } from 'lucide-react';

const RequestDetailPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { data: request, isLoading } = useQuery({
    queryKey: ['loanRequest', requestId],
    queryFn: () => getLoanRequest(requestId!),
    enabled: Boolean(requestId),
  });
  const { data: workflow } = useQuery({
    queryKey: ['workflowHistory', requestId],
    queryFn: () => getLoanWorkflowHistory(requestId!),
    enabled: Boolean(requestId),
  });

  if (isLoading || !request) {
    return <div className="min-h-[60vh] grid place-items-center text-slate-500">Loading request details…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link to="/requests" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Back to requests
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900">Request details</h1>
          <p className="text-sm text-slate-500">Reference #{request.reference_number} • {capitalize(request.status)}</p>
        </div>
        <Link to={`/requests/${request.id}/edit`} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Edit request
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Applicant</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{request.applicant_name}</p>
              <p className="mt-1 text-sm text-slate-500">{request.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Loan amount</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(request.loan_amount)}</p>
              <p className="mt-1 text-sm text-slate-500">Tenure: {request.loan_tenure_months} months</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Risk score</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{request.risk_score ?? '--'}</p>
              <Badge variant={request.risk_level === 'HIGH' ? 'danger' : request.risk_level === 'MEDIUM' ? 'warning' : 'success'}>
                {request.risk_level ?? 'Unknown'}
              </Badge>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{capitalize(request.status)}</p>
              <p className="mt-2 text-sm text-slate-500">Created {formatDate(request.created_at)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">National ID</p>
              <p className="mt-2 text-slate-700">{request.national_id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-2 text-slate-700">{request.phone}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Loan purpose</p>
            <p className="mt-2 text-slate-700">{request.loan_purpose}</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Workflow timeline</p>
              <p className="mt-1 text-sm text-slate-500">Audit-ready state history</p>
            </div>
            <Link to={`/workflow/${request.id}`} className="text-sm font-semibold text-slate-900 hover:text-slate-700">
              View tracker
            </Link>
          </div>

          <div className="space-y-4">
            {workflow?.map((item: any) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{capitalize(item.to_state)}</p>
                    <p className="text-sm text-slate-500">{item.transition_reason ?? 'System update'}</p>
                  </div>
                  <p className="text-sm text-slate-500">{formatDate(item.created_at)}</p>
                </div>
              </div>
            ))}
            {!workflow?.length ? <p className="text-sm text-slate-500">No workflow history available.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RequestDetailPage;
