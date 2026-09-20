/**
 * HyperCrop — Duplicate Detection Utilities
 *
 * Prototype implementation using deterministic/rule-based logic.
 * Replace with ML-based similarity detection for production.
 */

import { calculateImageSimilarity, haversineDistance } from './evidenceScore';

/**
 * Detect if a report is a duplicate of existing reports in the cluster.
 *
 * Criteria for likely duplicate:
 * - Visual similarity > 0.85
 * - Same/similar geographic area (< 50m)
 * - Close reporting time (< 30 minutes)
 */
export function detectDuplicate(report, existingReports) {
  if (!existingReports || existingReports.length === 0) {
    return { isDuplicate: false, similarity: 0, matchedReport: null };
  }

  let highestSimilarity = 0;
  let matchedReport = null;

  for (const existing of existingReports) {
    if (existing.id === report.id) continue;

    // Check geographic proximity
    const distance = haversineDistance(
      report.latitude, report.longitude,
      existing.latitude, existing.longitude
    );

    // Check image similarity
    const imgSimilarity = calculateImageSimilarity(
      report.imageUrl, existing.imageUrl
    );

    // Check temporal proximity (in minutes)
    const timeDiff = Math.abs(
      new Date(report.timestamp) - new Date(existing.timestamp)
    ) / 60000;

    // Combined similarity score
    const geoScore = distance < 0.05 ? 0.9 : distance < 0.1 ? 0.6 : distance < 0.5 ? 0.3 : 0.1;
    const timeScore = timeDiff < 10 ? 0.9 : timeDiff < 30 ? 0.7 : timeDiff < 60 ? 0.4 : 0.1;
    const combinedSimilarity = (imgSimilarity * 0.5 + geoScore * 0.3 + timeScore * 0.2);

    if (combinedSimilarity > highestSimilarity) {
      highestSimilarity = combinedSimilarity;
      matchedReport = existing;
    }
  }

  return {
    isDuplicate: highestSimilarity > 0.75,
    similarity: Math.round(highestSimilarity * 100) / 100,
    matchedReport,
    label: highestSimilarity > 0.85 ? 'Likely duplicate' :
           highestSimilarity > 0.60 ? 'Similar report' :
           'Distinct report',
  };
}

/**
 * Get a human-readable explanation for why a report is flagged.
 */
export function getDuplicateExplanation(report) {
  if (report.verificationStatus === 'duplicate') {
    return {
      status: 'Likely Duplicate',
      reason: `${Math.round(report.duplicateSimilarity * 100)}% similarity to ${report.duplicateOf || 'an earlier report'}`,
      detail: 'This report has been downweighted and does not count as independent evidence.',
      icon: 'alert-triangle',
    };
  }
  if (report.verificationStatus === 'similar') {
    return {
      status: 'Similar Report',
      reason: `${Math.round(report.duplicateSimilarity * 100)}% similarity detected`,
      detail: 'This report shows similarity to existing reports and has reduced evidence weight.',
      icon: 'info',
    };
  }
  if (report.verificationStatus === 'unconfirmed') {
    return {
      status: 'Unconfirmed',
      reason: 'Insufficient photo evidence',
      detail: 'This report lacks strong photo evidence and requires field verification.',
      icon: 'help-circle',
    };
  }
  return {
    status: 'Independent Evidence',
    reason: 'Geographically distinct with strong photo support',
    detail: 'This report contributes to the cluster evidence assessment.',
    icon: 'check-circle',
  };
}
