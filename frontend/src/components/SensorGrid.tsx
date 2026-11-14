import React from 'react';
import { Thermometer, Droplets, Sprout, Wind, Sun } from 'lucide-react';
import { SensorCard } from './SensorCard';
import { LatestApiResponse } from '../types';

interface SensorGridProps {
  data: LatestApiResponse;
}

export const SensorGrid: React.FC<SensorGridProps> = ({ data }) => {
  // Threshold safety evaluations
  const isTempSafe = data.temperature >= 24.0 && data.temperature <= 28.0;
  const isHumSafe = data.humidity >= 70.0 && data.humidity <= 85.0;
  const isSoilSafe = data.soil_moisture >= 30.0 && data.soil_moisture <= 70.0;
  const isGasSafe = data.gas_value <= 1500.0;
  const isLdrSafe = data.ldr_value >= 200.0 && data.ldr_value <= 800.0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <SensorCard
        name="Temperature"
        value={data.temperature}
        unit="°C"
        icon={Thermometer}
        targetRange="24.0 - 28.0 °C"
        isSafe={isTempSafe}
        accentColor="bg-orange-500/15 text-orange-400"
      />

      <SensorCard
        name="Humidity"
        value={data.humidity}
        unit="%"
        icon={Droplets}
        targetRange="70.0 - 85.0 %"
        isSafe={isHumSafe}
        accentColor="bg-sky-500/15 text-sky-400"
      />

      <SensorCard
        name="Bed Moisture"
        value={data.soil_moisture}
        unit="%"
        icon={Sprout}
        targetRange="30.0 - 70.0 %"
        isSafe={isSoilSafe}
        accentColor="bg-emerald-500/15 text-emerald-400"
        rawAdc={data.raw_soil}
      />

      <SensorCard
        name="Air / Gas Quality"
        value={data.gas_value}
        unit="ADC"
        icon={Wind}
        targetRange="< 1500 ADC"
        isSafe={isGasSafe}
        accentColor="bg-purple-500/15 text-purple-400"
        rawAdc={data.raw_gas}
      />

      <SensorCard
        name="Light Level (LDR)"
        value={data.ldr_value}
        unit="ADC"
        icon={Sun}
        targetRange="200 - 800 ADC"
        isSafe={isLdrSafe}
        accentColor="bg-amber-500/15 text-amber-400"
        rawAdc={data.raw_ldr}
      />
    </div>
  );
};

