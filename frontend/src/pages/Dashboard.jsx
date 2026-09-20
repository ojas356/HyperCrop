import { useState, useEffect, useMemo } from 'react';
import { Bell, ShieldAlert, FileText, ShieldCheck, Layers, EyeOff } from 'lucide-react';
import MapView from '../components/MapView';
import KpiCard from '../components/KpiCard';
import FilterPanel from '../components/FilterPanel';
import EvidencePanel from '../components/EvidencePanel';
import ClusterCard from '../components/ClusterCard';
import EvidenceDonut from '../components/EvidenceDonut';
import ReportsTimeChart from '../components/ReportsTimeChart';
import { filterReports, filterClusters, computeKpis } from '../utils/filters';
import demoReports from '../data/demoReports';
import demoClusters from '../data/demoClusters';
import demoAlerts from '../data/demoAlerts';

export default function Dashboard() {
  const [reports, setReports] = useState(demoReports);
  const [clusters, setClusters] = useState(demoClusters);
  const [alerts] = useState(demoAlerts);
  const [selectedCluster, setSelectedCluster] = useState(demoClusters[0]); // Auto-select Kharpada
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    crop: 'all', issue: 'all', risk: 'all', evidence: 'all', time: 'all',
  });
  const [mapCenter, setMapCenter] = useState([19.1250, 73.4580]);
  const [mapZoom, setMapZoom] = useState(13);

  // Apply filters
  const filteredReports = useMemo(() => filterReports(reports, filters), [reports, filters]);
  const filteredClusters = useMemo(() => filterClusters(clusters, filters), [clusters, filters]);
  const kpis = useMemo(() => computeKpis(filteredReports, filteredClusters, alerts), [filteredReports, filteredClusters, alerts]);

  const handleSelectCluster = (cluster) => {
    setSelectedCluster(cluster);
    setSelectedReport(null);
    setMapCenter([cluster.centerLatitude, cluster.centerLongitude]);
    setMapZoom(14);
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    // If report has a cluster, also select that cluster
    if (report.clusterId) {
      const cluster = clusters.find(c => c.id === report.clusterId);
      if (cluster) setSelectedCluster(cluster);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* KPI Strip */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 overflow-x-auto">
        <KpiCard label="Active Alerts" value={kpis.activeAlerts} icon={Bell} color="text-red-600" trend="up" trendLabel="2 new" />
        <KpiCard label="Reports Today" value={kpis.totalReports} icon={FileText} trend="up" trendLabel="↑ 18% vs yesterday" />
        <KpiCard label="Independent Evidence" value={kpis.independentEvidence} icon={ShieldCheck} color="text-emerald-600" />
        <KpiCard label="High-Risk Clusters" value={kpis.highRiskClusters} icon={Layers} color="text-red-600" />
        <KpiCard label="Reports Suppressed" value={kpis.reportsSuppressed} icon={EyeOff} color="text-slate-500" />
        <div className="ml-auto shrink-0 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5 text-[11px] text-amber-700 font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          Demo dataset — prototype scoring model
        </div>
      </div>

      {/* Main content: Sidebar + Map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Cluster List */}
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-full bg-red-500" />
              Clusters ({filteredClusters.length})
            </h3>
            <div className="flex flex-col gap-2">
              {filteredClusters.map(cluster => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  isSelected={selectedCluster?.id === cluster.id}
                  onClick={handleSelectCluster}
                />
              ))}
            </div>
          </div>

          {/* Evidence panel (selected cluster) */}
          <div className="flex-1">
            <EvidencePanel cluster={selectedCluster} reports={filteredReports} />
          </div>
        </aside>

        {/* Map area */}
        <div className="flex-1 flex flex-col">
          {/* Map */}
          <div className="flex-1 relative">
            <MapView
              reports={filteredReports}
              clusters={filteredClusters}
              selectedCluster={selectedCluster}
              selectedReport={selectedReport}
              onSelectCluster={handleSelectCluster}
              onSelectReport={handleSelectReport}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
            />
          </div>

          {/* Bottom evidence bar */}
          <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center gap-6">
            {/* Mini charts */}
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reports over time</div>
              <ReportsTimeChart reports={filteredReports} />
            </div>
            <div className="w-px h-24 bg-slate-200" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Evidence composition</div>
              <EvidenceDonut reports={filteredReports} />
            </div>
            {/* Quick tagline */}
            <div className="w-px h-24 bg-slate-200" />
            <div className="max-w-[200px]">
              <div className="text-[11px] font-semibold text-slate-600 mb-1">Independent evidence matters</div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                We don't count reports. We count independent evidence from geographically distinct fields.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
