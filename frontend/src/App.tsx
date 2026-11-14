import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/HistoryPage';
import { LatestApiResponse, SensorReading } from './types';
import { api } from './services/api';

const DEFAULT_DATA: LatestApiResponse = {
  id: 0,
  temperature: 26.0,
  humidity: 75.0,
  soil_moisture: 50.0,
  gas_value: 450.0,
  ldr_value: 400.0,
  motion_detected: false,
  is_simulated: false,
  timestamp: '--:--:--',
  is_healthy: true,
  severity: 0,
  status_text: 'Optimal Conditions',
  warnings: [],
  recommendations: [],
  has_data: false,
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [latestData, setLatestData] = useState<LatestApiResponse>(DEFAULT_DATA);
  const [historyItems, setHistoryItems] = useState<SensorReading[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Sync theme class with HTML element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [latestRes, historyRes] = await Promise.all([
        api.getLatest(),
        api.getHistory(1, 20),
      ]);

      if (latestRes.has_data) {
        setLatestData(latestRes);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }

      if (historyRes.items) {
        setHistoryItems(historyRes.items);
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setIsConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-polling interval (4 seconds)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        isConnected={isConnected}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'dashboard' ? (
          <Dashboard
            latestData={latestData}
            historyItems={historyItems}
            onRefresh={fetchData}
            isRefreshing={isRefreshing}
          />
        ) : (
          <HistoryPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-12 py-6 text-center text-xs text-slate-500">
        <p>
          Smart Silkworm Rearing Environment Monitor &copy; 2026 — Built by{' '}
          <span className="text-slate-300 font-semibold">Noaman Nazeer Ahamed</span> (USN: 4DM23CS089)
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          VTU CSE Mini-Project • Automated Sericulture IoT Platform • Indian Standard Time (IST UTC+5:30)
        </p>
      </footer>
    </div>
  );
};

