import { Bell } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import demoAlerts from '../data/demoAlerts';

export default function Alerts() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-400" />
            Alerts
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Hyperlocal alert timeline · {demoAlerts.filter(a => a.status === 'active').length} active
          </p>
        </div>

        {/* Alert timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200" />

          <div className="space-y-4 pl-10">
            {demoAlerts.map((alert, i) => (
              <div key={alert.id} className="relative" style={{ animationDelay: `${i * 80}ms` }}>
                {/* Timeline dot */}
                <div className={`absolute -left-[26px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm
                  ${alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'elevated' ? 'bg-orange-500' :
                    alert.severity === 'watch' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
                <AlertCard alert={alert} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-[11px] text-slate-400">
          <p>Alerts are generated when clusters cross evidence-weighted thresholds.</p>
          <p>This is a prototype alert system — field verification is always recommended.</p>
        </div>
      </div>
    </div>
  );
}
