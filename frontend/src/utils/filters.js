/**
 * HyperCrop — Filter Utilities
 * Functional filters that modify map markers, cluster lists, and KPI numbers.
 */

export function filterReports(reports, filters) {
  return reports.filter(report => {
    // Crop filter
    if (filters.crop && filters.crop !== 'all') {
      if (report.crop.toLowerCase() !== filters.crop.toLowerCase()) return false;
    }

    // Issue filter
    if (filters.issue && filters.issue !== 'all') {
      if (report.suspectedIssue.toLowerCase() !== filters.issue.toLowerCase()) return false;
    }

    // Risk filter (needs cluster context)
    // Handled at cluster level

    // Evidence status filter
    if (filters.evidence && filters.evidence !== 'all') {
      if (filters.evidence === 'confirmed') {
        if (!['independent', 'confirmed'].includes(report.verificationStatus)) return false;
      } else if (report.verificationStatus !== filters.evidence) {
        return false;
      }
    }

    // Time filter
    if (filters.time && filters.time !== 'all') {
      const reportTime = new Date(report.timestamp);
      const now = new Date();
      const diffMs = now - reportTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      switch (filters.time) {
        case '1h': if (diffHours > 1) return false; break;
        case '6h': if (diffHours > 6) return false; break;
        case 'today': if (diffHours > 24) return false; break;
        case '7d': if (diffHours > 168) return false; break;
        default: break;
      }
    }

    return true;
  });
}

export function filterClusters(clusters, filters) {
  return clusters.filter(cluster => {
    if (filters.crop && filters.crop !== 'all') {
      if (cluster.crop.toLowerCase() !== filters.crop.toLowerCase()) return false;
    }
    if (filters.issue && filters.issue !== 'all') {
      if (cluster.issue.toLowerCase() !== filters.issue.toLowerCase()) return false;
    }
    if (filters.risk && filters.risk !== 'all') {
      if (cluster.riskLevel !== filters.risk) return false;
    }
    return true;
  });
}

export function computeKpis(reports, clusters, alerts) {
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const totalReports = reports.length;
  const independentEvidence = reports.filter(
    r => ['independent', 'confirmed'].includes(r.verificationStatus)
  ).length;
  const highRiskClusters = clusters.filter(c => c.riskLevel === 'high').length;
  const reportsSuppressed = reports.filter(
    r => ['duplicate', 'similar'].includes(r.verificationStatus)
  ).length;

  return {
    activeAlerts,
    totalReports,
    independentEvidence,
    highRiskClusters,
    reportsSuppressed,
  };
}

export const CROP_OPTIONS = [
  { value: 'all', label: 'All Crops' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'potato', label: 'Potato' },
  { value: 'pepper', label: 'Pepper' },
];

export const ISSUE_OPTIONS = [
  { value: 'all', label: 'All Issues' },
  { value: 'early blight', label: 'Early Blight' },
  { value: 'late blight', label: 'Late Blight' },
  { value: 'bacterial spot', label: 'Bacterial Spot' },
  { value: 'leaf mold', label: 'Leaf Mold' },
  { value: 'septoria leaf spot', label: 'Septoria Leaf Spot' },
  { value: 'spider mites', label: 'Spider Mites' },
  { value: 'target spot', label: 'Target Spot' },
  { value: 'leaf curl virus', label: 'Leaf Curl Virus' },
  { value: 'mosaic virus', label: 'Mosaic Virus' },
];

export const RISK_OPTIONS = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'high', label: 'High' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'watch', label: 'Watch' },
  { value: 'low', label: 'Low' },
];

export const EVIDENCE_OPTIONS = [
  { value: 'all', label: 'All Evidence' },
  { value: 'independent', label: 'Independent' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'unconfirmed', label: 'Unconfirmed' },
  { value: 'duplicate', label: 'Duplicate' },
];

export const TIME_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
];
