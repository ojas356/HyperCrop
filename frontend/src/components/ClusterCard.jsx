import { MapPin, Clock } from 'lucide-react';
import RiskBadge from './RiskBadge';

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ClusterCard({ cluster, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(cluster)}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-150
        ${isSelected
          ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono font-bold text-slate-400">{cluster.id}</span>
        <RiskBadge level={cluster.riskLevel} size="xs" />
      </div>
      <h4 className="text-[13px] font-semibold text-slate-800 mb-0.5">{cluster.issue}</h4>
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cluster.village}</span>
        <span>{cluster.radiusKm} km</span>
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        <span className="font-semibold text-emerald-600">{cluster.independentReports} independent</span>
        <span className="text-slate-400">{cluster.totalReports} total</span>
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
        <Clock className="w-3 h-3" />
        Updated {timeAgo(cluster.updatedAt)}
      </div>
    </button>
  );
}
