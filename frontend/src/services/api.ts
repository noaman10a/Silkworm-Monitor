import { LatestApiResponse, HistoryApiResponse, AnalyticsSummary } from '../types';

const API_BASE = '/api';

export const api = {
  async getLatest(): Promise<LatestApiResponse> {
    const res = await fetch(`${API_BASE}/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch latest sensor data`);
    return res.json();
  },

  async getHistory(page = 1, perPage = 20, status = 'all', search = ''): Promise<HistoryApiResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      status,
      search,
    });
    const res = await fetch(`${API_BASE}/history?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch history records`);
    return res.json();
  },

  async getSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch analytics summary`);
    return res.json();
  },

  async triggerSimulation(customData?: Partial<{
    temperature: number;
    humidity: number;
    soil_moisture: number;
    gas_value: number;
    ldr_value: number;
  }>): Promise<LatestApiResponse> {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customData || {}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Simulation request failed`);
    const data = await res.json();
    return data.entry;
  },

  getExportCsvUrl(): string {
    return `${API_BASE}/export-csv`;
  }
};

