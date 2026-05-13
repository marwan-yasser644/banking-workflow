import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Low Risk', value: 60, color: '#34d399' },
  { name: 'Medium Risk', value: 30, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#f43f5e' },
];

export const RiskDistributionChart = () => (
  <ResponsiveContainer width="100%" height={280}>
    <PieChart>
      <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4}>
        {data.map((entry) => (
          <Cell key={entry.name} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number) => `${value}%`} />
    </PieChart>
  </ResponsiveContainer>
);
