import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ClipboardList, ShieldCheck, TrendingUp } from 'lucide-react';
import { getDashboardStats } from '../../services/dashboard.service';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { RequestsOverTimeChart } from '../../components/charts/RequestsOverTimeChart';
import { RiskDistributionChart } from '../../components/charts/RiskDistributionChart';
import { useNavigate } from 'react-router-dom';

const dashboardItems = [
  { label: 'Initiated', value: '45', variant: 'info' },
  { label: 'Validated', value: '22', variant: 'success' },
  { label: 'Risk Checked', value: '18', variant: 'warning' },
  { label: 'Approved', value: '10', variant: 'success' },
];

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 1000 * 60 * 5,
  });
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Requests" value={data?.total_requests ?? 0} trend="+12.5%" />
        <StatsCard title="Approved" value={data?.approved_requests ?? 0} trend="+10.2%" />
        <StatsCard title="Pending" value={data?.pending_requests ?? 0} trend="+5.4%" />
        <StatsCard title="Rejected" value={data?.rejected_requests ?? 0} trend="-2.1%" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Requests Over Time</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Live approval demand</h2>
            </div>
            <Badge variant="info">Updated daily</Badge>
          </div>
          <RequestsOverTimeChart />
        </Card>

        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Risk Distribution</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Portfolio risk mix</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <ShieldCheck className="h-4 w-4" />
              Real-time risk
            </div>
          </div>
          <RiskDistributionChart />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Workflow Summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Approval pipeline</h2>
            </div>
            <button onClick={() => navigate('/requests')} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              View requests
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {dashboardItems.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{item.label}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-3xl font-semibold text-slate-900">{item.value}</span>
                  <Badge variant={item.variant as any}>active</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Quick actions</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Streamline approvals</h2>
            </div>
            <TrendingUp className="h-6 w-6 text-slate-900" />
          </div>
          <div className="space-y-4">
            <button onClick={() => navigate('/requests/new')} className="w-full rounded-3xl bg-slate-900 px-4 py-4 text-left text-white shadow-sm transition hover:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Create new loan request</p>
                  <p className="mt-1 text-sm text-slate-300">Quick onboarding form for new applicants.</p>
                </div>
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </button>
            <button onClick={() => navigate('/audit')} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left text-slate-900 transition hover:border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Review audit logs</p>
                  <p className="mt-1 text-sm text-slate-500">Inspect change history across requests.</p>
                </div>
                <ClipboardList className="h-5 w-5 text-slate-500" />
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
