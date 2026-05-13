import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { month: 'Jan', requests: 95 },
  { month: 'Feb', requests: 135 },
  { month: 'Mar', requests: 172 },
  { month: 'Apr', requests: 210 },
  { month: 'May', requests: 245 },
  { month: 'Jun', requests: 280 },
  { month: 'Jul', requests: 320 },
];

export const RequestsOverTimeChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
      <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
      <Area type="monotone" dataKey="requests" stroke="#0f172a" fill="url(#requestsGradient)" strokeWidth={3} />
    </AreaChart>
  </ResponsiveContainer>
);
