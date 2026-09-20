/**
 * HyperCrop — API Service Layer
 *
 * Tries Flask backend first, falls back to demo data seamlessly.
 * This allows the app to work in demo mode without a running backend.
 */

import demoReports from '../data/demoReports';
import demoClusters from '../data/demoClusters';
import demoAlerts from '../data/demoAlerts';
import { computeKpis } from '../utils/filters';

const API_BASE = 'http://localhost:5000/api';

async function fetchWithFallback(url, fallbackData) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch {
    // Backend unavailable — using demo data
    return fallbackData;
  }
}

export async function getReports() {
  return fetchWithFallback(`${API_BASE}/reports`, demoReports);
}

export async function getReport(id) {
  const fallback = demoReports.find(r => r.id === id) || null;
  return fetchWithFallback(`${API_BASE}/reports/${id}`, fallback);
}

export async function createReport(reportData) {
  try {
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch {
    // Generate a mock response
    const newId = `HC-${1050 + Math.floor(Math.random() * 100)}`;
    return {
      ...reportData,
      id: newId,
      imageConfidence: reportData.imageUrl ? 0.75 : 0.15,
      duplicateSimilarity: 0.10,
      geographicIndependence: 0.70,
      temporalConsistency: 0.80,
      evidenceScore: 0.42,
      verificationStatus: 'unconfirmed',
      status: 'active',
      clusterId: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getClusters() {
  return fetchWithFallback(`${API_BASE}/clusters`, demoClusters);
}

export async function getCluster(id) {
  const fallback = demoClusters.find(c => c.id === id) || null;
  return fetchWithFallback(`${API_BASE}/clusters/${id}`, fallback);
}

export async function getAlerts() {
  return fetchWithFallback(`${API_BASE}/alerts`, demoAlerts);
}

export async function getDashboardStats() {
  const fallback = computeKpis(demoReports, demoClusters, demoAlerts);
  return fetchWithFallback(`${API_BASE}/dashboard/stats`, fallback);
}
