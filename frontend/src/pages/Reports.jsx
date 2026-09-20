import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import ReportTable from '../components/ReportTable';
import demoReports from '../data/demoReports';
import { CROP_OPTIONS, ISSUE_OPTIONS, EVIDENCE_OPTIONS, filterReports } from '../utils/filters';

export default function Reports() {
  const [filters, setFilters] = useState({ crop: 'all', issue: 'all', evidence: 'all', time: 'all' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filtered = useMemo(() => {
    let results = filterReports(demoReports, filters);

    // Search
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.crop.toLowerCase().includes(q) ||
        r.suspectedIssue.toLowerCase().includes(q) ||
        r.village.toLowerCase().includes(q)
      );
    }

    // Sort
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest': return new Date(a.timestamp) - new Date(b.timestamp);
        case 'evidence-high': return b.evidenceScore - a.evidenceScore;
        case 'evidence-low': return a.evidenceScore - b.evidenceScore;
        case 'confidence': return b.imageConfidence - a.imageConfidence;
        default: return 0;
      }
    });

    return results;
  }, [filters, search, sortBy]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reports</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              {filtered.length} reports · {filtered.filter(r => ['independent', 'confirmed'].includes(r.verificationStatus)).length} independent
            </p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-[13px] border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          {[
            { key: 'crop', options: CROP_OPTIONS },
            { key: 'issue', options: ISSUE_OPTIONS },
            { key: 'evidence', options: EVIDENCE_OPTIONS },
          ].map(({ key, options }) => (
            <select
              key={key}
              value={filters[key]}
              onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
              className="text-[12px] border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-600
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            >
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-[12px] border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-600
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="evidence-high">Highest evidence</option>
            <option value="evidence-low">Lowest evidence</option>
            <option value="confidence">Photo confidence</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200">
          <ReportTable reports={filtered} />
        </div>
      </div>
    </div>
  );
}
