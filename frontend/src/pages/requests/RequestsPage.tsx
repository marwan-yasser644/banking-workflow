import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { LoanRequest, PaginatedResponse } from '../../types';
import { getLoanRequests } from '../../services/loan.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, capitalize } from '../../utils/format';
import { Search, Plus } from 'lucide-react';

const statusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'info';
  }
};

const RequestsPage = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<PaginatedResponse<LoanRequest>>({
    queryKey: ['loanRequests', page, statusFilter],
    queryFn: () => getLoanRequests({ page, size: 10, status: statusFilter || undefined }),
  });

  const filteredRequests = useMemo(
    () => data?.items.filter((item) => item.applicant_name.toLowerCase().includes(query.toLowerCase()) || item.reference_number.toLowerCase().includes(query.toLowerCase())) ?? [],
    [data, query]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Loan request tracking</p>
          <h1 className="text-3xl font-semibold text-slate-900">Request pipeline</h1>
        </div>
        <Button onClick={() => navigate('/requests/new')} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New request
        </Button>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by applicant or reference"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Page {page} of {data?.pages ?? 1}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Loading requests…
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{request.reference_number}</td>
                    <td className="px-6 py-4 text-slate-700">{request.applicant_name}</td>
                    <td className="px-6 py-4 text-slate-700">{formatCurrency(request.loan_amount)}</td>
                    <td className="px-6 py-4 text-slate-700">{request.risk_level ?? 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(request.status)}>{capitalize(request.status)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(request.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link to={`/requests/${request.id}`} className="text-slate-900 font-medium hover:text-slate-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="text-sm text-slate-500">Showing {filteredRequests.length} of {data?.total ?? 0} total requests</div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setPage((value) => Math.max(1, value - 1))} variant="secondary" disabled={page === 1}>
              Previous
            </Button>
            <Button onClick={() => setPage((value) => Math.min((data?.pages ?? 1), value + 1))} variant="secondary" disabled={page === (data?.pages ?? 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RequestsPage;
