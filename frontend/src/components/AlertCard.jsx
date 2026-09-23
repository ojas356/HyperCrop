import { Clock } from 'lucide-react';
import RiskBadge from './RiskBadge';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AlertCard({ alert, onClick }) {
  const severityLines = {
    high: 'border-l-red-500',
    elevated: 'border-l-orange-500',
    watch: 'border-l-amber-500',
    low: 'border-l-emerald-500',
  };

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 border-l-4 ${severityLines[alert.severity]}
                  p-4 hover:shadow-sm transition-shadow cursor-pointer animate-fade-in`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <RiskBadge level={alert.severity} size="xs" />
        <span className="flex items-center gap-1 text-[12px] text-slate-400 ml-auto">
          <Clock className="w-3 h-3" />
          {formatTime(alert.createdAt)}
        </span>
      </div>
      <h4 className="text-[14px] font-semibold text-slate-800 mb-1">{alert.title}</h4>
      <p className="text-[13px] text-slate-500 leading-relaxed">{alert.message}</p>
      <div className="mt-2 text-[12px] font-mono text-slate-400">
        Cluster {alert.clusterId}
      </div>
    </div>
  );
}
