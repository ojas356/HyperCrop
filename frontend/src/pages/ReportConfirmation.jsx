import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Radio, MapPin, Clock, Camera, ShieldCheck,
  ChevronRight, Copy, Check,
} from 'lucide-react';
import { useState } from 'react';

const STATUS_STEPS = [
  {
    key: 'received',
    label: 'Report Received',
    desc: 'Your submission has been recorded in the evidence network.',
    done: true,
  },
  {
    key: 'analysis',
    label: 'Evidence Analysis',
    desc: 'AI-assisted photo confidence check and duplicate screening running.',
    done: true,
  },
  {
    key: 'clustering',
    label: 'Geographic Clustering',
    desc: 'Checking if other reports in your area match this issue.',
    done: false,
    active: true,
  },
  {
    key: 'verified',
    label: 'Verification Complete',
    desc: 'An agriculture officer will review the cluster and escalate if needed.',
    done: false,
  },
];

function ScoreBar({ label, value, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[12px] mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ReportConfirmation() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  // Load from localStorage (set by ReportIssue on submit)
  let report = null;
  try {
    const all = JSON.parse(localStorage.getItem('hc_my_reports') || '[]');
    report = all.find(r => r.id === id) || null;
  } catch { /* ignore */ }

  const copyId = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-5 gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Radio className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">HyperCrop</span>
        <span className="text-slate-300 text-sm ml-1">/</span>
        <span className="text-[13px] text-slate-500">Report Status</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">

        {/* Success banner */}
        <div className="bg-white rounded-xl border border-emerald-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-900 mb-1">Report submitted</h1>
              <p className="text-[13px] text-slate-500 mb-4">
                Your report has been added to the evidence network. Save your tracking number to check back on its status.
              </p>

              {/* Tracking number */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Tracking Number
                  </div>
                  <div className="text-2xl font-mono font-bold text-slate-900 tracking-wide">{id}</div>
                </div>
                <button
                  onClick={copyId}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500
                             hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5
                             hover:bg-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report details */}
        {report && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Your Report
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
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
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{report.village}</span>
                </div>
                {report.latitude && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                  </div>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Submitted</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{new Date(report.timestamp).toLocaleString()}</span>
                </div>
              </div>
              {report.notes && (
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Notes</span>
                  <span className="text-slate-600">{report.notes}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Photo</span>
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3 h-3 text-slate-400" />
                  <span className={report.hasPhoto ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    {report.hasPhoto ? 'Provided — boosts evidence score' : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {report.imagePreview && (
              <div className="mt-4 rounded-lg overflow-hidden border border-slate-200">
                <img src={report.imagePreview} alt="Submitted" className="w-full max-h-48 object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Evidence analysis */}
        {report && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Initial Evidence Analysis
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">
              Prototype scoring — full analysis completes once the report is processed against the cluster network.
            </p>

            <ScoreBar label="Photo confidence" value={report.imageConfidence} color="#10b981" />
            <ScoreBar label="Initial evidence score" value={report.evidenceScore} color="#3b82f6" />

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Verification Status
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[13px] font-semibold text-slate-700 capitalize">
                    {report.verificationStatus}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Processing Status
                </div>
                <span className="text-[13px] font-semibold text-amber-600">Pending cluster check</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress tracker */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            What Happens Next
          </h2>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex gap-3">
                {/* Connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10
                    ${step.done
                      ? 'bg-emerald-500'
                      : step.active
                      ? 'bg-amber-400'
                      : 'bg-slate-200'
                    }`}
                  >
                    {step.done ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : step.active ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                    )}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`w-px flex-1 my-1 ${step.done ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-5 ${i === STATUS_STEPS.length - 1 ? 'pb-0' : ''}`}>
                  <div className={`text-[13px] font-semibold mb-0.5
                    ${step.done ? 'text-emerald-700' : step.active ? 'text-amber-700' : 'text-slate-400'}`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[12px] text-slate-500">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to="/report"
            className="flex-1 text-center bg-emerald-600 text-white no-underline rounded-lg py-2.5
                       text-[13px] font-semibold hover:bg-emerald-700 transition-colors"
          >
            Submit Another Report
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1 text-[13px] font-medium text-slate-500 no-underline
                       border border-slate-200 rounded-lg px-4 py-2.5 hover:bg-slate-50 transition-colors"
          >
            Home
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
