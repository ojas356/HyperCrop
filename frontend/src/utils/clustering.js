/**
 * HyperCrop — Clustering Utilities (Frontend)
 *
 * Prototype cluster detection and risk classification.
 * Replace with DBSCAN/HDBSCAN for production.
 */

import { haversineDistance } from './evidenceScore';

/**
 * Classify cluster risk using evidence-weighted logic.
 * NOT simply: 10 reports = high risk.
 */
export function classifyRisk(independentReports, confirmedReports, totalReports, avgEvidenceScore) {
  if (independentReports >= 6 && confirmedReports >= 4 && avgEvidenceScore > 0.55) return 'high';
  if (independentReports >= 4 && avgEvidenceScore > 0.45) return 'elevated';
  if (independentReports >= 2 || totalReports >= 5) return 'watch';
  return 'low';
}

/**
 * Get risk level metadata for display.
 */
export function getRiskMeta(riskLevel) {
  const meta = {
    high: {
      label: 'HIGH',
      color: '#DC2626',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      borderColor: 'rgba(220, 38, 38, 0.3)',
      mapColor: '#DC2626',
      mapOpacity: 0.20,
    },
    elevated: {
      label: 'ELEVATED',
      color: '#EA580C',
      bgColor: 'rgba(234, 88, 12, 0.1)',
      borderColor: 'rgba(234, 88, 12, 0.3)',
      mapColor: '#EA580C',
      mapOpacity: 0.15,
    },
    watch: {
      label: 'WATCH',
      color: '#D97706',
      bgColor: 'rgba(217, 119, 6, 0.1)',
      borderColor: 'rgba(217, 119, 6, 0.3)',
      mapColor: '#D97706',
      mapOpacity: 0.12,
    },
    low: {
      label: 'LOW',
      color: '#16A34A',
      bgColor: 'rgba(22, 163, 74, 0.1)',
      borderColor: 'rgba(22, 163, 74, 0.3)',
      mapColor: '#16A34A',
      mapOpacity: 0.10,
    },
  };
  return meta[riskLevel] || meta.low;
}

/**
 * Get marker color based on verification status.
 */
export function getMarkerColor(verificationStatus) {
  const colors = {
    independent: '#16A34A',   // Green
    confirmed: '#2563EB',     // Blue
    unconfirmed: '#D97706',   // Amber
    similar: '#9CA3AF',       // Gray
    duplicate: '#6B7280',     // Muted gray
  };
  return colors[verificationStatus] || '#9CA3AF';
}

/**
 * Get marker opacity based on verification status.
 * Duplicates and unconfirmed are visually de-emphasized.
 */
export function getMarkerOpacity(verificationStatus) {
  const opacities = {
    independent: 1.0,
    confirmed: 0.9,
    unconfirmed: 0.6,
    similar: 0.4,
    duplicate: 0.35,
  };
  return opacities[verificationStatus] || 0.5;
}

/**
 * Calculate cluster radius in meters for map display.
 */
export function clusterRadiusMeters(radiusKm) {
  return radiusKm * 1000;
}
