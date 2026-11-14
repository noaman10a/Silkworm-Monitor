import React from 'react';
import { HistoryTable } from '../components/HistoryTable';

export const HistoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-100 tracking-tight">
          Telemetry Database History
        </h1>
        <p className="text-xs text-slate-400">
          Historical sensor logs formatted in Indian Standard Time (IST — Asia/Kolkata) with SQL pagination
        </p>
      </div>

      <HistoryTable />
    </div>
  );
};

