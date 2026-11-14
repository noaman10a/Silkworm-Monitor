# Frontend — Smart Silkworm Monitoring System

## Overview
A modern, responsive Single Page Application (SPA) built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Chart.js** for real-time sericulture microclimate visualization and intervention.

---

## Key Features
* 📊 **Real-Time Telemetry Dashboard:** Automatic non-blocking polling from the Flask backend (`/api/latest`).
* 🩺 **3-Tier Physiological Status:** Visual indicator for Optimal (Tier 0), Caution (Tier 1), and Critical (Tier 2).
* 💡 **Actionable Farmer Advice Panel:** Context-aware recommendations generated dynamically based on active microclimate deviations.
* 📈 **Environmental Curves:** Interactive line charts plotting Temperature and Humidity with safe-band reference lines.
* 📂 **SQL-Paginated Data History:** Multi-column search, status filtering, and one-click timestamped CSV data export.
* 🌙 **Dark & Light Mode:** Seamless theme switching with persistent CSS state.
* 🧪 **Packet Simulator:** Integrated simulation button allowing live demo testing without physical hardware.

---

## Development Setup

### Prerequisites
* Node.js v18+ or v20+ / v24+
* npm or pnpm or yarn

### Installation
From the `frontend` folder:
```bash
npm install
```

### Running Locally
Start the development server with Vite:
```bash
npm run dev
```
The application will be accessible at:
👉 `http://localhost:3000`

> **Note:** The Vite development server automatically proxies all `/api/*` network requests to the Flask backend running on `http://127.0.0.1:5000`.

### Production Build
```bash
npm run build
```
Generates optimized static assets in `frontend/dist/`.

