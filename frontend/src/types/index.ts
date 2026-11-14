export interface Recommendation {
  parameter: string;
  action: string;
  rationale: string;
}

export interface SensorReading {
  id: number;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  gas_value: number;
  ldr_value: number;
  raw_soil?: number;
  raw_gas?: number;
  raw_ldr?: number;
  motion_detected: boolean;
  is_simulated: boolean;
  timestamp: string;
  timestamp_iso?: string;
  is_healthy: boolean;
  severity: 0 | 1 | 2; // 0 = Optimal, 1 = Caution, 2 = Critical
  status_text: string;
  warnings: string[];
  recommendations: Recommendation[];
}

export interface LatestApiResponse extends SensorReading {
  has_data: boolean;
  last_alert_time?: string;
  message?: string;
}

export interface AnalyticsSummary {
  total_records: number;
  alert_count: number;
  healthy_count: number;
  health_rate_percent: number;
  summary: string;
}

export interface HistoryApiResponse {
  status: string;
  items: SensorReading[];
  total_records: number;
  total_filtered: number;
  page: number;
  per_page: number;
  total_pages: number;
  analytics: {
    avg_temp: number;
    avg_hum: number;
    alert_count: number;
  };
}

