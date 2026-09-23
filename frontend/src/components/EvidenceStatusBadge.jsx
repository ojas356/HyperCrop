export default function EvidenceStatusBadge({ status }) {
  const styles = {
    independent: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Independent' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Confirmed' },
    unconfirmed: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Unconfirmed' },
    similar: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Similar' },
    duplicate: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-300', label: 'Duplicate' },
  };

  const s = styles[status] || styles.unconfirmed;

  return (
    <span className={`inline-flex items-center text-[16px] font-semibold px-2 py-0.5 rounded border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}
