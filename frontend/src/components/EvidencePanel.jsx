import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, MapPin, Clock, Camera, FileSearch } from 'lucide-react';
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

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-semibold text-slate-600 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function EvidencePanel({ cluster, reports }) {
  if (!cluster) {
    return (
      <div className="p-4 text-center text-[13px] text-slate-400">
        <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="font-medium">Select a cluster on the map</p>
        <p className="text-[11px] mt-1">Click a cluster circle to see its evidence breakdown</p>
      </div>
    );
  }

  const clusterReports = reports.filter(r => r.clusterId === cluster.id);

  return (
    <div className="animate-slide-in">
      {/* Cluster header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <RiskBadge level={cluster.riskLevel} size="md" />
          <span className="text-[11px] font-mono text-slate-400">{cluster.id}</span>
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 mb-0.5">{cluster.issue}</h3>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <MapPin className="w-3 h-3" />
          <span>{cluster.village}</span>
          <span className="text-slate-300">·</span>
          <span>{cluster.radiusKm} km radius</span>
        </div>
      </div>

      {/* Evidence breakdown */}
      <div className="p-4 border-b border-slate-100">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Evidence Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="text-lg font-bold text-slate-800">{cluster.totalReports}</div>
            <div className="text-[10px] text-slate-400">Total reports</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{cluster.independentReports}</div>
            <div className="text-[10px] text-slate-400">Independent evidence</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{cluster.confirmedReports}</div>
            <div className="text-[10px] text-slate-400">Photo-confirmed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600">{cluster.unconfirmedReports}</div>
            <div className="text-[10px] text-slate-400">Unconfirmed</div>
          </div>
          {cluster.duplicateReports > 0 && (
            <div>
              <div className="text-lg font-bold text-slate-400">{cluster.duplicateReports}</div>
              <div className="text-[10px] text-slate-400">Likely duplicates</div>
            </div>
          )}
          <div>
            <div className="text-lg font-bold text-slate-700">{cluster.distinctFields || cluster.independentReports}</div>
            <div className="text-[10px] text-slate-400">Distinct fields</div>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          First detected {timeAgo(cluster.firstDetected)}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Updated {timeAgo(cluster.updatedAt)}
        </div>
      </div>

      {/* Why this alert fired */}
      {cluster.whyItMatters && (
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
            Why this cluster matters
          </h4>
          <div className="space-y-1.5">
            {cluster.whyItMatters.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                {item.check ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                )}
                <span className={item.check ? 'text-slate-700' : 'text-slate-500'}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score bars */}
      <div className="p-4 border-b border-slate-100">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Cluster Evidence Scores
        </h4>
        <div className="space-y-2">
          <ScoreBar
            label="Photo"
            value={Math.round((cluster.confirmedReports / Math.max(cluster.totalReports, 1)) * 100)}
            color="#2563EB"
          />
          <ScoreBar
            label="Geographic"
            value={Math.round((cluster.independentReports / Math.max(cluster.totalReports, 1)) * 100)}
            color="#16A34A"
          />
          <ScoreBar
            label="Avg. evidence"
            value={Math.round((cluster.avgEvidenceScore || 0.5) * 100)}
            color="#7C3AED"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex flex-col gap-2">
        <Link
          to={`/clusters`}
          className="block text-center text-[12px] font-semibold text-emerald-600 bg-emerald-50
                     rounded-md py-2 no-underline hover:bg-emerald-100 transition-colors border border-emerald-200"
        >
          <FileSearch className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
          Review Reports
        </Link>
      </div>
    </div>
  );
}
