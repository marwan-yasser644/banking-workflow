import { formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';

export const StatsCard = ({
  title,
  value,
  trend,
}: {
  title: string;
  value: number | string;
  trend?: string;
}) => (
  <Card className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {trend ? <p className="text-xs text-emerald-600">{trend}</p> : null}
    </div>
    <p className="text-3xl font-semibold text-slate-900">{typeof value === 'number' ? formatCurrency(value) : value}</p>
  </Card>
);
