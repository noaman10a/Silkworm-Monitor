import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Clock, BellRing } from 'lucide-react';
import { LatestApiResponse } from '../types';

interface HealthBannerProps {
  data: LatestApiResponse;
}

export const HealthBanner: React.FC<HealthBannerProps> = ({ data }) => {
  const { is_healthy, severity, status_text, warnings, timestamp, last_alert_time } = data;

  // Banner styles based on 3-tier severity
  const getBannerConfig = () => {
    if (is_healthy) {
      return {
        bg: 'from-emerald-950/40 to-slate-900/60 border-emerald-500/30 text-emerald-400',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
        title: 'Optimal Rearing Conditions',
        desc: 'All 5 microclimate metrics (Temperature, Humidity, Soil, Gas, Light) are within safe physiological limits.',
      };
    } else if (severity === 1) {
      return {
        bg: 'from-amber-950/40 to-slate-900/60 border-amber-500/30 text-amber-400',
        badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        icon: <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />,
        title: 'Caution — Microclimate Deviation',
        desc: 'One or more parameters are drifting outside ideal ranges. Immediate monitoring advised.',
      };
    } else {
      return {
        bg: 'from-rose-950/50 to-slate-900/70 border-rose-500/40 text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse',
        icon: <AlertOctagon className="w-8 h-8 text-rose-400 animate-pulse" />,
        title: 'Critical Alert — Risk of Silkworm Mortality!',
        desc: 'Severe environmental stress detected. Immediate corrective intervention required to avoid crop loss.',
      };
    }
  };

  const config = getBannerConfig();

  return (
    <div className={`rounded-2xl p-5 md:p-6 bg-gradient-to-r ${config.bg} border backdrop-blur-sm shadow-xl transition-all duration-300`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Status & Description */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${config.badgeBg} flex-shrink-0 shadow-inner`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl md:text-2xl text-slate-100">{config.title}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${config.badgeBg}`}>
                Tier {severity}: {status_text}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{config.desc}</p>

            {/* Active Warnings List */}
            {warnings && warnings.length > 0 && (
              <div className="mt-3.5 flex flex-col gap-1.5">
                {warnings.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs md:text-sm text-rose-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timestamp Cards */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0 gap-4">
          <div className="text-left lg:text-right">
            <div className="flex items-center lg:justify-end gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Last Reading (IST)</span>
            </div>
            <div className="font-mono text-sm font-semibold text-slate-200 mt-0.5">
              {timestamp || '--'}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>Last Alert Recorded</span>
            </div>
            <div className="font-mono text-xs font-semibold text-amber-300 mt-0.5">
              {last_alert_time || 'None recently'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

