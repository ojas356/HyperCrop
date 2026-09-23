import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Camera, ShieldCheck, Copy, Layers,
  AlertTriangle, CheckCircle2, HelpCircle, Info, BadgeCheck, XCircle, Eye,
  ChevronRight
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import EvidenceStatusBadge from '../components/EvidenceStatusBadge';
import { useReports } from '../hooks/useReports';
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
        <div className="text-[13px] font-medium text-slate-600">{label}</div>
        {desc && <div className="text-[11px] text-slate-400">{desc}</div>}
      </div>
      <div className="flex items-center gap-2 w-40">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[13px] font-bold text-slate-700 w-10 text-right">{Math.round(value * 100)}%</span>
      </div>
    </div>
  );
}

export default function ReportDetails() {
  const { id } = useParams();
  const [allReports, setAllReports] = useReports();
  const report = allReports.find(r => r.id === id);
  const [statusNote, setStatusNote] = useState('');

  if (!report) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-700 mb-2">Report not found</h2>
          <Link to="/reports" className="text-sm text-emerald-600 no-underline font-medium">← Back to reports</Link>
        </div>
      </div>
    );
  }

  const cluster = report.clusterId ? demoClusters.find(c => c.id === report.clusterId) : null;
  const dupExplanation = getDuplicateExplanation(report);

  const WORKFLOW_STEPS = ['pending', 'under_review', 'action_taken', 'resolved'];
  const WORKFLOW_LABELS = {
    pending:      'Pending',
    under_review: 'Under Review',
    action_taken: 'Action Taken',
    resolved:     'Resolved',
  };

  const currentWorkflow = report.workflowStatus || 'pending';
  const currentStepIdx  = WORKFLOW_STEPS.indexOf(currentWorkflow);
  const nextStep        = WORKFLOW_STEPS[currentStepIdx + 1] ?? null;

  const persistChange = (patch) => {
    const updated = allReports.map(r => r.id === id ? { ...r, ...patch } : r);
    setAllReports(updated);
    try {
      const saved = JSON.parse(localStorage.getItem('hc_my_reports') || '[]');
      const updatedSaved = saved.map(r => r.id === id ? { ...r, ...patch } : r);
      localStorage.setItem('hc_my_reports', JSON.stringify(updatedSaved));
    } catch { /* ignore */ }
  };

  const updateStatus = (newStatus) => {
    persistChange({ verificationStatus: newStatus });
    setStatusNote(`Verification updated to "${newStatus}"`);
    setTimeout(() => setStatusNote(''), 3000);
  };

  const advanceWorkflow = () => {
    if (!nextStep) return;
    persistChange({ workflowStatus: nextStep });
    setStatusNote(`Moved to "${WORKFLOW_LABELS[nextStep]}"`);
    setTimeout(() => setStatusNote(''), 3000);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-5">
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
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Crop</span>
              <span className="font-semibold text-slate-800">{report.crop}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Suspected Issue</span>
              <span className="font-semibold text-slate-800">{report.suspectedIssue}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Location</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3 h-3" />{report.village}
              </span>
              <span className="text-[11px] text-slate-400">{report.latitude}, {report.longitude}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Cluster</span>
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
            <p className="text-[11px] text-slate-400 mt-3 italic">
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
            <p className="text-[11px] text-slate-400 mt-2 italic">
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
                <div className="text-[11px] text-slate-400">Total reports</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">{cluster.independentReports}</div>
                <div className="text-[11px] text-slate-400">Independent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{cluster.confirmedReports}</div>
                <div className="text-[11px] text-slate-400">Photo-supported</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-400">{cluster.duplicateReports}</div>
                <div className="text-[11px] text-slate-400">Likely duplicates</div>
              </div>
            </div>
          </div>
        )}

        {/* Workflow status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Report Workflow
            </h3>
            {statusNote && (
              <span className="text-[11px] text-emerald-600 font-medium">{statusNote}</span>
            )}
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-0 mb-5">
            {WORKFLOW_STEPS.map((step, i) => {
              const done    = i < currentStepIdx;
              const current = i === currentStepIdx;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[11px] font-bold transition-colors
                      ${done    ? 'bg-emerald-500 border-emerald-500 text-white'
                      : current ? 'bg-white border-emerald-500 text-emerald-600'
                      :           'bg-white border-slate-200 text-slate-300'}`}
                    >
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold whitespace-nowrap
                      ${done ? 'text-emerald-600' : current ? 'text-slate-700' : 'text-slate-300'}`}>
                      {WORKFLOW_LABELS[step]}
                    </span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 rounded
                      ${i < currentStepIdx ? 'bg-emerald-400' : 'bg-slate-200'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Advance button */}
          {nextStep ? (
            <button
              onClick={advanceWorkflow}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
                         bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Advance to "{WORKFLOW_LABELS[nextStep]}"
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
                            bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Report Resolved
            </div>
          )}
        </div>

        {/* Classification decision */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Current Classification
            </h3>
          </div>
          <div className={`flex items-start gap-3 p-4 rounded-lg mb-4
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
                <Link to={`/report/${report.duplicateOf}`} className="inline-flex items-center gap-1 mt-2 text-[12px] text-emerald-600 font-medium no-underline">
                  <Info className="w-3 h-3" />
                  View original report ({report.duplicateOf})
                </Link>
              )}
            </div>
          </div>

          {/* Officer actions */}
          <div className="border-t border-slate-100 pt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Officer Actions
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={report.verificationStatus === 'confirmed'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                           bg-emerald-50 border border-emerald-200 text-emerald-700
                           hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <BadgeCheck className="w-3.5 h-3.5" /> Confirm Report
              </button>
              <button
                onClick={() => updateStatus('independent')}
                disabled={report.verificationStatus === 'independent'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                           bg-blue-50 border border-blue-200 text-blue-700
                           hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Mark Independent
              </button>
              <button
                onClick={() => updateStatus('unconfirmed')}
                disabled={report.verificationStatus === 'unconfirmed'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                           bg-amber-50 border border-amber-200 text-amber-700
                           hover:bg-amber-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Eye className="w-3.5 h-3.5" /> Mark Unconfirmed
              </button>
              <button
                onClick={() => updateStatus('duplicate')}
                disabled={report.verificationStatus === 'duplicate'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                           bg-slate-50 border border-slate-200 text-slate-600
                           hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XCircle className="w-3.5 h-3.5" /> Mark Duplicate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
