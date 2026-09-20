import { CROP_OPTIONS, ISSUE_OPTIONS, RISK_OPTIONS, EVIDENCE_OPTIONS, TIME_OPTIONS } from '../utils/filters';

function SelectFilter({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[13px] bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                   hover:border-slate-300 transition-colors cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel({ filters, onFilterChange }) {
  const handleChange = (key) => (value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <span className="w-1 h-3.5 rounded-full bg-emerald-500" />
        Filters
      </h3>
      <SelectFilter label="Crop" options={CROP_OPTIONS} value={filters.crop} onChange={handleChange('crop')} />
      <SelectFilter label="Issue" options={ISSUE_OPTIONS} value={filters.issue} onChange={handleChange('issue')} />
      <SelectFilter label="Risk Level" options={RISK_OPTIONS} value={filters.risk} onChange={handleChange('risk')} />
      <SelectFilter label="Evidence" options={EVIDENCE_OPTIONS} value={filters.evidence} onChange={handleChange('evidence')} />
      <SelectFilter label="Time Range" options={TIME_OPTIONS} value={filters.time} onChange={handleChange('time')} />
    </div>
  );
}
