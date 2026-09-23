import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ label, value, trend, trendLabel, icon: Icon, color }) {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex flex-col gap-1 min-w-[140px] animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-300" />}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold tabular-nums ${color || 'text-slate-800'}`}>{value}</span>
        {trendLabel && (
          <span className={`flex items-center gap-0.5 text-[11px] font-medium pb-0.5 ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}
