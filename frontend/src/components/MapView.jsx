import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { getMarkerColor, getMarkerOpacity, getRiskMeta, clusterRadiusMeters } from '../utils/clustering';
import EvidenceStatusBadge from './EvidenceStatusBadge';
import RiskBadge from './RiskBadge';

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MapController({ center, zoom }) {
  const map = useMap();
  const prevCenter = useRef(center);
  useEffect(() => {
    if (center && (center[0] !== prevCenter.current?.[0] || center[1] !== prevCenter.current?.[1])) {
      map.flyTo(center, zoom || 14, { duration: 0.8 });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  reports,
  clusters,
  selectedCluster,
  selectedReport,
  onSelectCluster,
  onSelectReport,
  mapCenter,
  mapZoom,
}) {
  const defaultCenter = [19.1250, 73.4580]; // Kharpada
  const center = mapCenter || defaultCenter;
  const zoom = mapZoom || 13;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={center} zoom={mapZoom} />

      {/* Cluster overlays */}
      {clusters.map(cluster => {
        const riskMeta = getRiskMeta(cluster.riskLevel);
        const isSelected = selectedCluster?.id === cluster.id;
        return (
          <Circle
            key={cluster.id}
            center={[cluster.centerLatitude, cluster.centerLongitude]}
            radius={clusterRadiusMeters(cluster.radiusKm)}
            pathOptions={{
              color: riskMeta.mapColor,
              fillColor: riskMeta.mapColor,
              fillOpacity: isSelected ? riskMeta.mapOpacity + 0.08 : riskMeta.mapOpacity,
              weight: isSelected ? 3 : 1.5,
              dashArray: isSelected ? '' : '5,5',
            }}
            eventHandlers={{
              click: () => onSelectCluster?.(cluster),
            }}
          />
        );
      })}

      {/* Report markers */}
      {reports.map(report => {
        const isSelected = selectedReport?.id === report.id;
        const color = getMarkerColor(report.verificationStatus);
        const opacity = getMarkerOpacity(report.verificationStatus);
        const radius = isSelected ? 8 : report.verificationStatus === 'duplicate' || report.verificationStatus === 'similar' ? 4 : 6;

        return (
          <CircleMarker
            key={report.id}
            center={[report.latitude, report.longitude]}
            radius={radius}
            pathOptions={{
              color: 'white',
              fillColor: color,
              fillOpacity: opacity,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{
              click: () => onSelectReport?.(report),
            }}
          >
            <Popup maxWidth={260} className="report-popup">
              <div className="p-3 min-w-[220px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500">{report.id}</span>
                  <EvidenceStatusBadge status={report.verificationStatus} />
                </div>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Crop</span>
                    <span className="font-medium text-slate-700">{report.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Suspected issue</span>
                    <span className="font-medium text-slate-700">{report.suspectedIssue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Photo confidence</span>
                    <span className="font-semibold text-slate-700">{Math.round(report.imageConfidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evidence score</span>
                    <span className="font-semibold text-slate-700">{Math.round(report.evidenceScore * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reported</span>
                    <span className="text-slate-600">{timeAgo(report.timestamp)}</span>
                  </div>
                </div>
                <Link
                  to={`/report/${report.id}`}
                  className="mt-3 block text-center text-[11px] font-semibold text-emerald-600
                             bg-emerald-50 rounded-md py-1.5 no-underline hover:bg-emerald-100 transition-colors"
                >
                  View Report →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Map Legend */}
      <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: 'auto' }}>
        <div className="leaflet-control bg-white/95 backdrop-blur rounded-lg border border-slate-200 p-3 m-3 shadow-sm" style={{ pointerEvents: 'auto' }}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Evidence</div>
          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm" />
              <span className="text-slate-600">Independent report</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-sm" />
              <span className="text-slate-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-sm opacity-70" />
              <span className="text-slate-600">Unconfirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 border border-white shadow-sm opacity-50" />
              <span className="text-slate-500">Similar / Duplicate</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-2">Risk</div>
          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center gap-2"><span className="w-3 h-1.5 rounded bg-red-500" /><span className="text-slate-600">High</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-1.5 rounded bg-orange-500" /><span className="text-slate-600">Elevated</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-1.5 rounded bg-amber-500" /><span className="text-slate-600">Watch</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-1.5 rounded bg-emerald-500" /><span className="text-slate-600">Low</span></div>
          </div>
        </div>
      </div>
    </MapContainer>
  );
}
