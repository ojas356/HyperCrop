import { useNavigate } from 'react-router-dom';
import EvidenceStatusBadge from './EvidenceStatusBadge';

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ReportTable({ reports, compact = false }) {
  const navigate = useNavigate();

  if (!reports.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm font-medium">No reports match the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report</th>
            <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crop</th>
            <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue</th>
            <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Village</th>
            <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
            {!compact && (
              <>
                <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Photo</th>
                <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evidence</th>
              </>
            )}
            <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
            {!compact && <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cluster</th>}
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr
              key={report.id}
              className="border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
              onClick={() => navigate(`/report/${report.id}`)}
            >
              <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 text-[12px]">{report.id}</td>
              <td className="py-2.5 px-3 text-slate-700">{report.crop}</td>
              <td className="py-2.5 px-3 text-slate-700">{report.suspectedIssue}</td>
              <td className="py-2.5 px-3 text-slate-500">{report.village}</td>
              <td className="py-2.5 px-3 text-slate-400 text-[12px]">{timeAgo(report.timestamp)}</td>
              {!compact && (
                <>
                  <td className="py-2.5 px-3 font-semibold text-slate-600">{Math.round(report.imageConfidence * 100)}%</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-600">{Math.round(report.evidenceScore * 100)}%</td>
                </>
              )}
              <td className="py-2.5 px-3">
                <EvidenceStatusBadge status={report.verificationStatus} />
              </td>
              {!compact && (
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{report.clusterId || '—'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
