import React, { useState } from 'react';
import { RefreshCw, Play, Sparkles } from 'lucide-react';
import { HealthBanner } from '../components/HealthBanner';
import { SensorGrid } from '../components/SensorGrid';
import { EnvironmentalChart } from '../components/EnvironmentalChart';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import { LatestApiResponse, SensorReading } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  latestData: LatestApiResponse;
  historyItems: SensorReading[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  latestData,
  historyItems,
  onRefresh,
  isRefreshing,
}) => {
  const [simulating, setSimulating] = useState<boolean>(false);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      await api.triggerSimulation();
      onRefresh();
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-100 tracking-tight">
            Live Rearing Telemetry
          </h1>
          <p className="text-xs text-slate-400">
            Real-time environmental tracking & intelligent intervention engine
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 hover:border-sky-500/40 text-xs font-semibold shadow-sm transition-all"
            title="Generate a random sensor packet to test UI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simulating ? 'Generating...' : 'Simulate Packet'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Health Status Banner */}
      <HealthBanner data={latestData} />

      {/* 5-Sensor Real-Time Metrics Cards */}
      <SensorGrid data={latestData} />

      {/* Recommendations Section */}
      <RecommendationsPanel recommendations={latestData.recommendations} />

      {/* Environmental Trend Chart */}
      <EnvironmentalChart historyItems={historyItems} />
    </div>
  );
};

