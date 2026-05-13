import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/dashboard.service';
import { Card } from '../../components/ui/Card';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { RequestsOverTimeChart } from '../../components/charts/RequestsOverTimeChart';
import { RiskDistributionChart } from '../../components/charts/RiskDistributionChart';
import { formatCurrency } from '../../utils/format';

const ReportsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchOnMount: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Reports</p>
        <h1 className="text-3xl font-semibold text-slate-900">Portfolio analytics</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total volume" value={data?.total_loan_volume ?? 0} />
        <StatsCard title="Approved volume" value={data?.approved_loan_volume ?? 0} />
        <StatsCard title="Approval rate" value={`${data?.approval_rate?.toFixed(1) ?? 0}%`} />
        <StatsCard title="Average risk" value={data?.avg_risk_score?.toFixed(1) ?? 'N/A'} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Requests performance</p>
              <h2 className="text-xl font-semibold text-slate-900">Monthly volume</h2>
            </div>
          </div>
          <RequestsOverTimeChart />
        </Card>
        <Card>
          <div className="mb-4">
            <p className="text-sm text-slate-500">Risk breakdown</p>
            <h2 className="text-xl font-semibold text-slate-900">Current exposure</h2>
          </div>
          <RiskDistributionChart />
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
