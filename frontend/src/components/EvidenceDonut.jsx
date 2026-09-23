import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  independent: '#16A34A',
  confirmed: '#2563EB',
  unconfirmed: '#D97706',
  duplicate: '#6B7280',
};

export default function EvidenceDonut({ reports }) {
  const counts = {
    independent: reports.filter(r => r.verificationStatus === 'independent').length,
    confirmed: reports.filter(r => r.verificationStatus === 'confirmed').length,
    unconfirmed: reports.filter(r => r.verificationStatus === 'unconfirmed').length,
    duplicate: reports.filter(r => ['duplicate', 'similar'].includes(r.verificationStatus)).length,
  };

  const data = [
    { name: 'Independent', value: counts.independent, color: COLORS.independent },
    { name: 'Confirmed', value: counts.confirmed, color: COLORS.confirmed },
    { name: 'Unconfirmed', value: counts.unconfirmed, color: COLORS.unconfirmed },
    { name: 'Duplicate', value: counts.duplicate, color: COLORS.duplicate },
  ].filter(d => d.value > 0);

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={36}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5 text-[16px]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-slate-500">{d.name}</span>
            <span className="font-semibold text-slate-700 ml-auto pl-2">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
