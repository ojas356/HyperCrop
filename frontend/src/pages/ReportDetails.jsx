import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Camera, ShieldCheck, Copy, Layers,
  AlertTriangle, CheckCircle2, HelpCircle, Info
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import EvidenceStatusBadge from '../components/EvidenceStatusBadge';
import demoReports from '../data/demoReports';
import demoClusters from '../data/demoClusters';
import { getDuplicateExplanation } from '../utils/duplicateDetection';

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ScoreRow({ label, value, color, desc }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <div className="flex-1">
        <div className="text-[12px] font-medium text-slate-600">{label}</div>
        {desc && <div className="text-[10px] text-slate-400">{desc}</div>}
      </div>
      <div className="flex items-center gap-2 w-40">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[12px] font-bold text-slate-700 w-10 text-right">{Math.round(value * 100)}%</span>
      </div>
    </div>
  );
}

export default function ReportDetails() {
  const { id } = useParams();
  const report = demoReports.find(r => r.id === id);

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-700 mb-2">Report not found</h2>
          <Link to="/reports" className="text-sm text-emerald-600 no-underline font-medium">← Back to reports</Link>
        </div>
      </div>
    );
  }

  const cluster = report.clusterId ? demoClusters.find(c => c.id === report.clusterId) : null;
  const dupExplanation = getDuplicateExplanation(report);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-5">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link to="/reports" className="inline-flex items-center gap-1 text-[13px] text-slate-500 no-underline hover:text-slate-700 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          All Reports
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono font-bold text-slate-700">{report.id}</span>
              <EvidenceStatusBadge status={report.verificationStatus} />
            </div>
            <span className="flex items-center gap-1 text-[12px] text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(report.timestamp)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Crop</span>
              <span className="font-semibold text-slate-800">{report.crop}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Suspected Issue</span>
              <span className="font-semibold text-slate-800">{report.suspectedIssue}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Location</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3 h-3" />{report.village}
              </span>
              <span className="text-[10px] text-slate-400">{report.latitude}, {report.longitude}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Cluster</span>
              {cluster ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-600">{cluster.id}</span>
                  <RiskBadge level={cluster.riskLevel} size="xs" />
                </div>
              ) : (
                <span className="text-slate-400">Not clustered</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* AI-assisted analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5" />
              AI-assisted analysis
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-slate-600">Suspected issue</span>
                <span className="text-[13px] font-semibold text-slate-800">{report.suspectedIssue}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-50">
                <span className="text-[13px] text-slate-600">Photo confidence</span>
                <span className="text-[14px] font-bold text-slate-800">{Math.round(report.imageConfidence * 100)}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-50">
                <span className="text-[13px] text-slate-600">Status</span>
                <span className="text-[13px] font-medium text-slate-700">
                  {report.imageUrl ? 'Photo-supported' : 'No photo provided'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 italic">
              Prototype implementation — requires field verification
            </p>
          </div>

          {/* Evidence analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Evidence analysis
            </h3>
            <ScoreRow label="Photo confidence" value={report.imageConfidence} color="#2563EB" />
            <ScoreRow label="Geographic independence" value={report.geographicIndependence} color="#16A34A" desc="Distance from other reports" />
            <ScoreRow label="Temporal consistency" value={report.temporalConsistency} color="#7C3AED" desc="Natural reporting pattern" />
            <ScoreRow label="Duplicate similarity" value={report.duplicateSimilarity} color="#EF4444" desc="Similarity to existing reports" />
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-700">Evidence Score</span>
              <span className="text-xl font-bold text-slate-900">{Math.round(report.evidenceScore * 100)}%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              Proposed prototype scoring model — not scientifically validated
            </p>
          </div>
        </div>

        {/* Cluster relationship */}
        {cluster && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              Cluster relationship
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono font-bold text-slate-600">{cluster.id}</span>
              <RiskBadge level={cluster.riskLevel} size="sm" />
              <span className="text-[12px] text-slate-500">{cluster.issue} · {cluster.village}</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-lg font-bold text-slate-800">{cluster.totalReports}</div>
                <div className="text-[10px] text-slate-400">Total reports</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">{cluster.independentReports}</div>
                <div className="text-[10px] text-slate-400">Independent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{cluster.confirmedReports}</div>
                <div className="text-[10px] text-slate-400">Photo-supported</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-400">{cluster.duplicateReports}</div>
                <div className="text-[10px] text-slate-400">Likely duplicates</div>
              </div>
            </div>
          </div>
        )}

        {/* Classification decision */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Current Classification
          </h3>
          <div className={`flex items-start gap-3 p-4 rounded-lg
            ${report.verificationStatus === 'duplicate' ? 'bg-slate-50 border border-slate-200'
              : report.verificationStatus === 'unconfirmed' ? 'bg-amber-50 border border-amber-200'
              : 'bg-emerald-50 border border-emerald-200'
            }`}
          >
            {report.verificationStatus === 'duplicate' ? (
              <Copy className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            ) : report.verificationStatus === 'unconfirmed' ? (
              <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-[14px] font-bold text-slate-800 mb-1">{dupExplanation.status}</div>
              <div className="text-[12px] text-slate-600 mb-1">{dupExplanation.reason}</div>
              <div className="text-[11px] text-slate-500">{dupExplanation.detail}</div>
              {report.duplicateOf && (
                <Link to={`/report/${report.duplicateOf}`} className="inline-flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-medium no-underline">
                  <Info className="w-3 h-3" />
                  View original report ({report.duplicateOf})
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
