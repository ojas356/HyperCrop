import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsTimeChart({ reports }) {
  const data = useMemo(() => {
    const now = new Date();
    const buckets = [];

    // Create hourly buckets for last 12 hours
    for (let i = 11; i >= 0; i--) {
      const bucketTime = new Date(now.getTime() - i * 3600000);
      const hour = bucketTime.getHours();
      const label = `${hour.toString().padStart(2, '0')}:00`;
      buckets.push({
        time: label,
        reports: 0,
        independent: 0,
      });
    }

    // Assign reports to buckets
    reports.forEach(report => {
      const reportTime = new Date(report.timestamp);
      const hoursAgo = (now - reportTime) / 3600000;
      const bucketIndex = 11 - Math.floor(hoursAgo);
      if (bucketIndex >= 0 && bucketIndex < 12) {
        buckets[bucketIndex].reports++;
        if (['independent', 'confirmed'].includes(report.verificationStatus)) {
          buckets[bucketIndex].independent++;
        }
      }
    });

    return buckets;
  }, [reports]);

  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="independentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              fontSize: '11px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '6px 10px',
            }}
          />
          <Area
            type="monotone"
            dataKey="reports"
            stroke="#94A3B8"
            fill="url(#reportsGrad)"
            strokeWidth={1.5}
            name="Total reports"
          />
          <Area
            type="monotone"
            dataKey="independent"
            stroke="#10B981"
            fill="url(#independentGrad)"
            strokeWidth={1.5}
            name="Independent"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
