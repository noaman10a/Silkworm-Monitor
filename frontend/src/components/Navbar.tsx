import React, { useState, useEffect } from 'react';
import { Activity, Clock, Sun, Moon, Database, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'history';
  setActiveTab: (tab: 'dashboard' | 'history') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  isConnected,
}) => {
  const [istTime, setIstTime] = useState<string>('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      setIstTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 lg:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">
            🐛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-slate-100 tracking-tight">SilkWormCare</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                IoT Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Sericulture Microclimate Monitoring</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Live Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>History & Analytics</span>
          </button>
        </nav>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-medium">{isConnected ? 'ESP32 Online' : 'Hardware Idle'}</span>
          </div>

          {/* Live IST Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 font-mono text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>IST: {istTime}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};

