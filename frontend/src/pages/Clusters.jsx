import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Layers, ArrowUpDown } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import demoClusters from '../data/demoClusters';
import demoReports from '../data/demoReports';

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const riskOrder = { high: 0, elevated: 1, watch: 2, low: 3 };

export default function Clusters() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('risk');

  const sorted = useMemo(() => {
    return [...demoClusters].sort((a, b) => {
      switch (sortBy) {
        case 'risk': return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        case 'evidence': return b.independentReports - a.independentReports;
        case 'newest': return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'reports': return b.totalReports - a.totalReports;
        default: return 0;
      }
    });
  }, [sortBy]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-400" />
              Clusters
            </h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Evidence-weighted outbreak clusters · {demoClusters.length} active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-[12px] border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-600
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            >
              <option value="risk">Sort by risk</option>
              <option value="evidence">Sort by evidence</option>
              <option value="newest">Sort by newest</option>
              <option value="reports">Sort by report count</option>
            </select>
          </div>
        </div>

        {/* Cluster cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map((cluster, i) => {
            const clusterReports = demoReports.filter(r => r.clusterId === cluster.id);
            return (
              <div
                key={cluster.id}
                onClick={() => navigate('/dashboard')}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md
                           transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono font-bold text-slate-400">{cluster.id}</span>
                    <RiskBadge level={cluster.riskLevel} size="sm" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    Updated {timeAgo(cluster.updatedAt)}
                  </div>
                </div>

                {/* Issue and location */}
                <h3 className="text-[15px] font-bold text-slate-800 mb-1">{cluster.issue}</h3>
                <div className="flex items-center gap-3 text-[12px] text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cluster.village}</span>
                  <span>{cluster.crop}</span>
                  <span>{cluster.radiusKm} km radius</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800">{cluster.totalReports}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{cluster.independentReports}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Independent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{cluster.confirmedReports}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-400">{cluster.duplicateReports}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">Duplicate</div>
                  </div>
                </div>

                {/* Why it matters */}
                {cluster.whyItMatters && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Key evidence</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cluster.whyItMatters.filter(w => w.check).slice(0, 3).map((item, j) => (
                        <span key={j} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ {item.text.split(' ').slice(0, 5).join(' ')}…
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
