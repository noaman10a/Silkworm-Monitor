import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  name: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  targetRange: string;
  isSafe: boolean;
  accentColor: string;
  rawAdc?: number;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  name,
  value,
  unit,
  icon: Icon,
  targetRange,
  isSafe,
  accentColor,
  rawAdc,
}) => {
  return (
    <div
      className={`rounded-2xl p-5 bg-slate-900/90 border transition-all duration-300 relative overflow-hidden group hover:shadow-xl ${
        isSafe
          ? 'border-slate-800 hover:border-slate-700'
          : 'border-rose-500/50 shadow-rose-950/30 animate-alert-glow'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
          {name}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${accentColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Sensor Reading */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-display font-extrabold text-3xl md:text-4xl text-slate-100 tracking-tight">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-sm font-semibold text-slate-400">{unit}</span>
      </div>

      {/* Target Pill & Status */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
          Target: {targetRange}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full font-semibold border ${
            isSafe
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
          }`}
        >
          {isSafe ? '🟢 Normal' : '🔴 Alert'}
        </span>
      </div>

      {/* Raw ADC indicator tooltip/footnote if available */}
      {rawAdc !== undefined && (
        <div className="mt-2 text-[10px] text-slate-500 font-mono text-right">
          Raw ADC: {rawAdc} / 4095
        </div>
      )}
    </div>
  );
};

