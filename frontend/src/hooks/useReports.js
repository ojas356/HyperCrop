import { useState, useEffect } from 'react';
import demoReports from '../data/demoReports';

/**
 * Returns all reports: demo seed + anything submitted via ReportIssue
 * and stored in localStorage under 'hc_my_reports'.
 *
 * Re-reads localStorage on every mount so the dashboard always picks
 * up newly submitted reports after navigation.
 */
export function useReports() {
  const [reports, setReports] = useState(() => getMerged());

  useEffect(() => {
    setReports(getMerged());

    // Also sync if another tab submits a report
    const onStorage = (e) => {
      if (e.key === 'hc_my_reports') setReports(getMerged());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [reports, setReports];
}

function getMerged() {
  try {
    const saved = JSON.parse(localStorage.getItem('hc_my_reports') || '[]');
    if (!saved.length) return demoReports;

    // Avoid duplicates if someone refreshes after submitting
    const demoIds = new Set(demoReports.map(r => r.id));
    const newOnes = saved.filter(r => !demoIds.has(r.id));
    return [...newOnes, ...demoReports];
  } catch {
    return demoReports;
  }
}
