import { Link } from 'react-router-dom';
import { ArrowRight, Radio, Layers, ShieldCheck, Camera, MapPin, BarChart3, AlertTriangle } from 'lucide-react';

const steps = [
  { icon: Camera, label: 'Report', desc: 'Farmer submits photo + location' },
  { icon: ShieldCheck, label: 'Photo Analysis', desc: 'AI-assisted image assessment' },
  { icon: Layers, label: 'Duplicate Check', desc: 'Similarity & location comparison' },
  { icon: MapPin, label: 'Geographic Clustering', desc: 'Spatio-temporal grouping' },
  { icon: BarChart3, label: 'Evidence Weighting', desc: 'Independent evidence scoring' },
  { icon: AlertTriangle, label: 'Hyperlocal Alert', desc: 'Risk-based alert generation' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">HyperCrop</span>
        </div>
        <Link
          to="/login"
          className="text-[13px] font-medium text-slate-500 no-underline hover:text-slate-700"
        >
          Officer login →
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto pt-20 pb-16 px-8 text-center">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-[11px] font-medium text-emerald-700 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Hackathon Prototype
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Hyperlocal crop intelligence from{' '}
          <span className="text-emerald-600">independent field evidence</span>.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          Turn farmer-submitted crop reports into geographically meaningful outbreak signals —
          without letting duplicate or panic reports overwhelm the map.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white no-underline rounded-lg
                       px-6 py-3 text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Report a Crop Issue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Core principle */}
      <section className="max-w-3xl mx-auto px-8 pb-16">
        <div className="bg-slate-900 rounded-xl p-8 text-center">
          <p className="text-[13px] text-slate-400 uppercase tracking-widest mb-2 font-medium">Core Principle</p>
          <p className="text-xl md:text-2xl font-bold text-white">
            "We don't count reports. We count independent evidence."
          </p>
        </div>
      </section>

      {/* Problem / Difference */}
      <section className="max-w-4xl mx-auto px-8 pb-16 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">The Problem</h3>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            District-level pest-alert bulletins aggregate data too coarsely. They miss hyperlocal
            outbreaks hiding within a single village. When alerts finally go out, panic reporting
            floods the system with duplicates.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">The Difference</h3>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            HyperCrop weighs independent field evidence instead of simply counting reports.
            Photo-confirmed, geographically distinct reports carry more weight than a pile
            of copycat panic reports from the same location.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How it works</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {steps.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 p-5 text-center hover:shadow-sm
                         transition-shadow animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                Step {i + 1}
              </div>
              <h4 className="text-[14px] font-semibold text-slate-800 mb-1">{label}</h4>
              <p className="text-[12px] text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-[12px] text-slate-400">
        <p>HyperCrop — Hackathon Prototype · Not for production agricultural surveillance</p>
      </footer>
    </div>
  );
}
