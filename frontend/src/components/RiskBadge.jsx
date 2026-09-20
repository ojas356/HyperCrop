import { getRiskMeta } from '../utils/clustering';

export default function RiskBadge({ level, size = 'sm' }) {
  const meta = getRiskMeta(level);
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded tracking-wide ${sizes[size]}`}
      style={{
        color: meta.color,
        backgroundColor: meta.bgColor,
        border: `1px solid ${meta.borderColor}`,
      }}
    >
      {meta.label}
    </span>
  );
}
