/**
 * HyperCrop — Evidence Scoring Utilities
 *
 * Prototype implementation.
 * Replace with ML model inference service for production.
 * Each function is structured to accept inputs and return scores,
 * making them drop-in replaceable with real model calls.
 */

/**
 * Prototype image analysis.
 * Replace with a vision model (e.g., fine-tuned crop disease classifier)
 * when deploying a production version.
 */
export function analyzeImage(imageUrl, crop, issue) {
  if (!imageUrl) return { confidence: 0.15, label: 'No photo provided' };
  // Deterministic score for demo
  const hash = simpleHash(imageUrl + crop);
  const confidence = 0.70 + (hash % 25) / 100;
  return {
    confidence: Math.round(confidence * 100) / 100,
    label: `Suspected ${issue}`,
    status: confidence > 0.70 ? 'Photo-supported' : 'Weak photo evidence',
  };
}

/**
 * Prototype image similarity check.
 * Replace with perceptual hashing or CLIP embedding cosine similarity.
 */
export function calculateImageSimilarity(imageA, imageB) {
  if (!imageA || !imageB) return 0;
  if (imageA === imageB) return 0.98;
  const h = Math.abs(simpleHash(imageA) - simpleHash(imageB)) % 100;
  return Math.max(0.05, Math.min(0.95, 1 - h / 100));
}

/**
 * Prototype geographic independence score.
 * Replace with proper spatial analysis (PostGIS, Turf.js) for production.
 */
export function calculateGeographicIndependence(lat, lng, clusterReports) {
  if (!clusterReports || clusterReports.length === 0) return 1.0;

  let minDist = Infinity;
  for (const report of clusterReports) {
    const dist = haversineDistance(lat, lng, report.latitude, report.longitude);
    if (dist < minDist) minDist = dist;
  }

  if (minDist < 0.01) return 0.10;
  if (minDist < 0.05) return 0.25;
  if (minDist < 0.1) return 0.50;
  if (minDist < 0.3) return 0.75;
  if (minDist < 0.5) return 0.85;
  return 0.95;
}

/**
 * Prototype temporal consistency score.
 * Replace with temporal analysis model for production.
 */
export function calculateTemporalConsistency(timestamp, clusterReports) {
  const hash = simpleHash(timestamp);
  return 0.70 + (hash % 25) / 100;
}

/**
 * Proposed prototype scoring model.
 * Evidence Score = Photo Confidence × Geographic Independence
 *                × Temporal Consistency × Verification Weight
 *
 * This is NOT a scientifically validated formula.
 */
export function calculateEvidenceScore(
  imageConfidence,
  geographicIndependence,
  temporalConsistency,
  verificationWeight = 1.0
) {
  const score = imageConfidence * geographicIndependence * temporalConsistency * verificationWeight;
  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}

/**
 * Classify verification status based on evidence metrics.
 */
export function classifyVerificationStatus(evidenceScore, duplicateSimilarity, imageConfidence) {
  if (duplicateSimilarity > 0.85) return 'duplicate';
  if (duplicateSimilarity > 0.60) return 'similar';
  if (imageConfidence < 0.30) return 'unconfirmed';
  if (evidenceScore > 0.60 && imageConfidence > 0.70) return 'independent';
  if (imageConfidence > 0.50) return 'confirmed';
  return 'unconfirmed';
}

// ── Helpers ───────────────────────────────────────────────────

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
