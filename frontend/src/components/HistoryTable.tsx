import React, { useState, useEffect } from 'react';
import { Download, Search, RefreshCw, BarChart3, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { SensorReading, HistoryApiResponse } from '../types';

export const HistoryTable: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const loadData = async (currentPage = page, status = statusFilter, query = search) => {
    try {
      setLoading(true);
      const data = await api.getHistory(currentPage, 15, status, query);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, statusFilter, search);
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, statusFilter, search);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Telemetry Logs</div>
            <div className="text-xl font-bold font-display text-slate-100">
              {historyData?.total_records ?? '--'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Avg Temperature</div>
            <div className="text-xl font-bold font-display text-orange-400">
              {historyData?.analytics.avg_temp ? `${historyData.analytics.avg_temp} °C` : '--'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Avg Humidity</div>
            <div className="text-xl font-bold font-display text-sky-400">
              {historyData?.analytics.avg_hum ? `${historyData.analytics.avg_hum} %` : '--'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Alert Incidents</div>
            <div className="text-xl font-bold font-display text-rose-400">
              {historyData?.analytics.alert_count ?? '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, CSV Export */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dates, numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'healthy', 'caution', 'alert'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
              }`}
            >
              {st === 'all' ? 'All Logs' : st === 'healthy' ? '🟢 Optimal' : st === 'caution' ? '🟡 Caution' : '🔴 Critical'}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => loadData(page, statusFilter, search)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Refresh table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href={api.getExportCsvUrl()}
            download
            className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">IST Timestamp</th>
                <th className="py-3.5 px-4">Temp (°C)</th>
                <th className="py-3.5 px-4">Humidity (%)</th>
                <th className="py-3.5 px-4">Soil Moisture</th>
                <th className="py-3.5 px-4">Air (Gas)</th>
                <th className="py-3.5 px-4">Light (LDR)</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-sky-400" />
                    Loading database records...
                  </td>
                </tr>
              ) : !historyData?.items || historyData.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    📭 No records match your current filter or search query.
                  </td>
                </tr>
              ) : (
                historyData.items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors font-medium">
                    <td className="py-3 px-4 font-mono text-slate-500">#{row.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{row.timestamp}</td>
                    <td className="py-3 px-4 font-semibold text-orange-400">{row.temperature}</td>
                    <td className="py-3 px-4 font-semibold text-sky-400">{row.humidity}</td>
                    <td className="py-3 px-4 text-slate-300">{row.soil_moisture}%</td>
                    <td className="py-3 px-4 text-slate-300">{row.gas_value}</td>
                    <td className="py-3 px-4 text-slate-300">{row.ldr_value}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          row.is_healthy
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : row.severity === 1
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {row.is_healthy ? '🟢 Optimal' : row.severity === 1 ? '🟡 Caution' : '🔴 Critical'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {historyData && (
          <div className="py-3.5 px-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {historyData.total_filtered > 0 ? (historyData.page - 1) * historyData.per_page + 1 : 0} to{' '}
              {Math.min(historyData.page * historyData.per_page, historyData.total_filtered)} of{' '}
              {historyData.total_filtered} filtered ({historyData.total_records} total in DB)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-200"
              >
                Previous
              </button>
              <span className="font-mono text-slate-300">
                Page {page} of {historyData.total_pages}
              </span>
              <button
                disabled={page >= historyData.total_pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

