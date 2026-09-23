import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Radio,
  Layers,
  ShieldCheck,
  Camera,
  MapPin,
  BarChart3,
  AlertTriangle,
  Fingerprint,
  Navigation,
  Clock,
  BadgeCheck,
  Eye,
  AlertCircle,
  Flame,
} from 'lucide-react';

const stats = [
  { value: '4', label: 'independent evidence signals weighed per report' },
  { value: '4', label: 'alert tiers, from Monitor to Outbreak Alert' },
  { value: '0', label: 'paid APIs — built on OpenStreetMap and Leaflet' },
];

const signals = [
  { icon: Fingerprint, label: 'Photo Confidence', desc: 'Image similarity scored against known cases' },
  { icon: Navigation, label: 'Geographic Independence', desc: 'Distinct locations, not one field repeated' },
  { icon: Clock, label: 'Temporal Consistency', desc: 'Reports build over days, not a single spike' },
  { icon: BadgeCheck, label: 'Verification', desc: 'Officer or field confirmation, where available' },
];

const steps = [
  { icon: Camera, label: 'Report', desc: 'Farmer submits a photo and location' },
  { icon: ShieldCheck, label: 'Photo Analysis', desc: 'AI compares the image against known cases' },
  { icon: Layers, label: 'Duplicate Check', desc: 'Similarity and distance rule out copies' },
  { icon: MapPin, label: 'Geographic Clustering', desc: 'Nearby reports are grouped spatio-temporally' },
  { icon: BarChart3, label: 'Evidence Weighting', desc: 'Each cluster earns an independent evidence score' },
  { icon: AlertTriangle, label: 'Hyperlocal Alert', desc: 'A risk tier is raised only once evidence earns it' },
];

const tiers = [
  { icon: Eye, label: 'Monitor', desc: 'A single, isolated report. Logged, not alarming.', color: '#2F8B57' },
  { icon: AlertCircle, label: 'Watch', desc: 'A few independent reports start to align.', color: '#CA9A2E' },
  { icon: AlertTriangle, label: 'High Risk', desc: 'Clear geographic and time-based clustering.', color: '#D9660B' },
  { icon: Flame, label: 'Outbreak Alert', desc: 'Strong, verified, independent evidence converges.', color: '#C1272D' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#10231A]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 bg-[#F7F8F3]/95 backdrop-blur border-b border-[#10231A]/8 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#1F5C3D] flex items-center justify-center">
            <Radio className="w-4 h-4 text-[#F7F8F3]" />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">HyperCrop</span>
        </div>
        <Link to="/login" className="text-[13px] font-medium text-[#10231A]/60 no-underline hover:text-[#10231A] transition-colors">
          Officer login
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* background photo + green layer */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/tractor-working-green-field.jpg"
            alt="Aerial view of a farm field showing rows of crops"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E2B1E]/80 via-[#0E2B1E]/50 to-[#0E2B1E]/78" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E2B1E]/65 via-[#0E2B1E]/10 to-transparent" />
        </div>

        <svg className="absolute inset-0 w-full h-full opacity-[0.16]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 600">
          {Array.from({ length: 60 }).map((_, i) => (
            <circle key={i} cx={(i * 53) % 800} cy={(i * 97) % 600} r={1.6} fill="#6FCF97" />
          ))}
        </svg>

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#6FCF97]/30 rounded-full px-3 py-1 text-[12px] text-[#B7E4C7] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6FCF97]" />
              Built for CodeX 2026 by Team DevStorm
            </div>
            <h1 className="font-display text-[2.5rem] md:text-[3.25rem] leading-[1.08] font-semibold text-[#F7F8F3] mb-5">
              Every crop report becomes evidence, not noise.
            </h1>
            <p className="text-[16px] text-[#CBD9CF] max-w-md mb-8 leading-relaxed">
              HyperCrop weighs photo confidence, geography, and timing before it ever raises an alert — so a hyperlocal outbreak surfaces early, and a wave of panic reports never drowns it out.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/report" className="inline-flex items-center gap-2 bg-[#6FCF97] text-[#0E2B1E] no-underline rounded-lg px-6 py-3 text-[14px] font-semibold hover:bg-[#8FE0AE] transition-colors">
                Report a Crop Issue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 border border-[#F7F8F3]/25 text-[#F7F8F3] no-underline rounded-lg px-6 py-3 text-[14px] font-medium hover:bg-[#F7F8F3]/10 transition-colors">
                Officer Dashboard
              </Link>
            </div>
          </div>

          {/* Evidence cluster visual */}
          <div className="relative bg-[#0E2B1E]/60 border border-[#F7F8F3]/10 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-[12px] text-[#B7E4C7] mb-4">Live cluster preview</p>
            <svg viewBox="0 0 320 200" className="w-full h-auto">
              <line x1="120" y1="70" x2="150" y2="95" stroke="#6FCF97" strokeWidth="1" opacity="0.5" />
              <line x1="150" y1="95" x2="140" y2="130" stroke="#6FCF97" strokeWidth="1" opacity="0.5" />
              <line x1="140" y1="130" x2="170" y2="110" stroke="#6FCF97" strokeWidth="1" opacity="0.5" />
              <circle cx="120" cy="70" r="6" fill="#6FCF97" />
              <circle cx="150" cy="95" r="8" fill="#6FCF97" />
              <circle cx="140" cy="130" r="6" fill="#6FCF97" />
              <circle cx="170" cy="110" r="7" fill="#6FCF97" />
              <circle cx="250" cy="40" r="4" fill="#F7F8F3" opacity="0.35" />
              <circle cx="60" cy="160" r="4" fill="#F7F8F3" opacity="0.35" />
              <circle cx="270" cy="150" r="4" fill="#F7F8F3" opacity="0.35" />
            </svg>
            <div className="flex items-center justify-between text-[12px] text-[#CBD9CF] mt-2 border-t border-[#F7F8F3]/10 pt-3">
              <span>4 reports, 3 locations</span>
              <span className="text-[#6FCF97] font-medium">High Risk</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-[#F7F8F3]/10">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-[1.75rem] md:text-[2rem] font-semibold text-[#F7F8F3]">{s.value}</div>
                <p className="text-[12px] md:text-[13px] text-[#B7E4C7] leading-snug mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Difference */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-6">
        <div className="border-l-2 border-[#D9660B] pl-6 py-1">
          <h3 className="font-display text-[18px] font-semibold mb-2">The problem</h3>
          <p className="text-[14px] text-[#10231A]/65 leading-relaxed">
            District-level pest bulletins aggregate too coarsely to catch an outbreak hiding inside a single village. By the time an alert goes out, panic reporting has already flooded the system with duplicates.
          </p>
        </div>
        <div className="border-l-2 border-[#2F8B57] pl-6 py-1">
          <h3 className="font-display text-[18px] font-semibold mb-2">The difference</h3>
          <p className="text-[14px] text-[#10231A]/65 leading-relaxed">
            HyperCrop weighs independent field evidence instead of counting reports. A handful of photo-confirmed, geographically distinct reports outweighs a pile of copycat panic from one spot.
          </p>
        </div>
      </section>

      {/* Evidence signals */}
      <section className="bg-[#EEF3EA] py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <h2 className="font-display text-[26px] md:text-[30px] font-semibold mb-10">Four signals, weighed together</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {signals.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-[#F7F8F3] rounded-lg p-5">
                <div className="w-9 h-9 rounded-md bg-[#1F5C3D]/10 flex items-center justify-center mb-4">
                  <Icon className="w-[18px] h-[18px] text-[#1F5C3D]" />
                </div>
                <h4 className="text-[14px] font-semibold mb-1">{label}</h4>
                <p className="text-[12.5px] text-[#10231A]/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-20">
        <h2 className="font-display text-[26px] md:text-[30px] font-semibold mb-10">How a report becomes an alert</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map(({ icon: Icon, label, desc }, i) => (
            <div key={label} className="bg-white border border-[#10231A]/8 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display text-[12px] font-semibold text-[#2F8B57]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-8 h-8 rounded-md bg-[#F7F8F3] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#1F5C3D]" />
                </div>
              </div>
              <h4 className="text-[14px] font-semibold mb-1">{label}</h4>
              <p className="text-[12.5px] text-[#10231A]/55 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alert tiers */}
      <section className="bg-[#0E2B1E] py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <h2 className="font-display text-[26px] md:text-[30px] font-semibold text-[#F7F8F3] mb-2">Alerts rise only as evidence earns it</h2>
          <p className="text-[14px] text-[#CBD9CF] mb-10 max-w-lg">No report jumps straight to Outbreak Alert. Every tier has to be earned by independent evidence.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#F7F8F3]/10 rounded-xl overflow-hidden">
            {tiers.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-[#0E2B1E] p-6">
                <div className="w-2 h-2 rounded-full mb-4" style={{ backgroundColor: color }} />
                <Icon className="w-5 h-5 mb-3" style={{ color }} />
                <h4 className="text-[14px] font-semibold text-[#F7F8F3] mb-1">{label}</h4>
                <p className="text-[12.5px] text-[#CBD9CF] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-20 text-center">
        <h2 className="font-display text-[24px] md:text-[28px] font-semibold mb-4">See what's happening in your fields right now</h2>
        <Link to="/report" className="inline-flex items-center gap-2 bg-[#1F5C3D] text-[#F7F8F3] no-underline rounded-lg px-7 py-3.5 text-[14px] font-semibold hover:bg-[#2F8B57] transition-colors">
          Report a Crop Issue
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#10231A]/8 py-8 text-center text-[12px] text-[#10231A]/45">
        <p>Built by Team DevStorm for CodeX 2026, MUSA. A hackathon prototype — not a production agricultural surveillance system.</p>
      </footer>
    </div>
  );
}