import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SensorReading } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnvironmentalChartProps {
  historyItems: SensorReading[];
}

export const EnvironmentalChart: React.FC<EnvironmentalChartProps> = ({ historyItems }) => {
  // Reverse to show chronological left-to-right progression
  const reversed = [...historyItems].reverse().slice(-20);

  const labels = reversed.map((item) => {
    // Extract HH:MM:SS from timestamp "YYYY-MM-DD HH:MM:SS IST"
    const parts = item.timestamp.split(' ');
    return parts[1] || item.timestamp;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: reversed.map((item) => item.temperature),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#f97316',
      },
      {
        label: 'Humidity (%)',
        data: reversed.map((item) => item.humidity),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#38bdf8',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      y: {
        ticks: { color: '#64748b', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
      },
    },
  };

  return (
    <div className="rounded-2xl p-5 bg-slate-900/90 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-100">
            📈 Real-Time Environmental Trends
          </h3>
          <p className="text-xs text-slate-400">Temperature & Humidity progression across latest 20 telemetry packets</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Temp</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Hum</span>
        </div>
      </div>

      <div className="h-72 w-full">
        {reversed.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            Waiting for telemetry data...
          </div>
        )}
      </div>
    </div>
  );
};

