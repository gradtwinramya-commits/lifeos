import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  HelpCircle, 
  AlertTriangle, 
  Zap, 
  Moon, 
  Sliders, 
  ShieldCheck, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { DailyLog, ExplainabilityDetails } from '../types';
import { generate7DayForecast, calculateBurnoutRisk } from '../lib/analytics';

interface PredictionsPageProps {
  logs: DailyLog[];
  onOpenExplain: (details: ExplainabilityDetails) => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({
  logs,
  onOpenExplain,
}) => {
  const [selectedForecastMetric, setSelectedForecastMetric] = useState<'energy' | 'sleepHours' | 'focusHours'>('energy');
  
  // Interactive "What-If" Levers
  const [extraSleep, setExtraSleep] = useState<number>(0); // e.g. +1.0 hour
  const [takeRestDay, setTakeRestDay] = useState<boolean>(false);
  const [capFocusAt5, setCapFocusAt5] = useState<boolean>(false);

  const burnout = calculateBurnoutRisk(logs);
  const baseForecast = generate7DayForecast(logs, selectedForecastMetric);

  // Apply What-If scenario modifications to future projection
  const scenarioForecast = baseForecast.forecast.map((item, idx) => {
    if (idx < 7) {
      // Historical data point
      return item;
    }
    // Future projection points (idx >= 7)
    let modifier = 0;
    if (selectedForecastMetric === 'sleepHours') {
      modifier += extraSleep;
    } else if (selectedForecastMetric === 'energy') {
      modifier += extraSleep * 0.4 + (takeRestDay ? 0.5 : 0) + (capFocusAt5 ? 0.3 : 0);
    } else if (selectedForecastMetric === 'focusHours') {
      if (capFocusAt5 && item.predicted > 5.0) {
        return {
          ...item,
          predicted: 5.0,
          upper: 5.4,
          lower: 4.6,
        };
      }
      modifier += extraSleep * 0.3;
    }

    const newPredicted = parseFloat((item.predicted + modifier).toFixed(1));
    const newUpper = parseFloat((item.upper + modifier).toFixed(1));
    const newLower = parseFloat((Math.max(0, item.lower + modifier)).toFixed(1));

    return {
      ...item,
      predicted: newPredicted,
      upper: newUpper,
      lower: newLower,
    };
  });

  // Calculate simulated burnout risk under What-If levers
  let simulatedBurnoutRisk = burnout.riskScore;
  if (extraSleep > 0) simulatedBurnoutRisk -= Math.round(extraSleep * 18);
  if (takeRestDay) simulatedBurnoutRisk -= 16;
  if (capFocusAt5) simulatedBurnoutRisk -= 12;
  simulatedBurnoutRisk = Math.max(15, Math.min(95, simulatedBurnoutRisk));

  const metricLabel =
    selectedForecastMetric === 'energy' ? 'Vitality Level (1-5)' :
    selectedForecastMetric === 'sleepHours' ? 'Sleep Duration (hrs)' : 'Focus Hours (hrs)';

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Predictive Forecasting Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              7-Day Confidence Intervals
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
            Future Telemetry Projections
          </h1>
          <p className="text-xs text-slate-400">
            Linear trend and moving-average forecasting computed from your data, with simulated outcome levers.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenExplain({
              title: '7-Day Predictive Forecasting Model',
              itemType: 'prediction',
              summary: 'Projections are computed using rolling regression slopes combined with standard deviation uncertainty bands that widen across the 7-day horizon.',
              keyDrivers: [
                'Historical 7-day velocity slope vs 30-day baseline',
                'Uncertainty band variance factor (90% statistical confidence)',
                'Circadian cycle damping algorithm',
              ],
              confidenceScore: 89,
              whatChangesOutcome: 'What-if interventions below simulate how behavioral adjustments reshape your 7-day trajectory.',
              recommendedCounterAction: 'Adjust the scenario levers to preview burnout mitigation.',
              metricData: {
                'Metric': selectedForecastMetric,
                'Direction': baseForecast.trendDirection,
                'Predicted Mean': baseForecast.predictedMean,
              },
            })
          }
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-cyan-900/60 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Explain Forecast Math</span>
        </button>
      </div>

      {/* Main Forecast Chart Card */}
      <div className="glass-panel-glow rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                {metricLabel} Forecast (Next 7 Days)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
              <span>Historical (Past 7d)</span>
              <span className="text-cyan-400">➔ Predicted (Next 7d)</span>
              <span className="text-violet-400 font-bold">Trend: {baseForecast.trendDirection.toUpperCase()}</span>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setSelectedForecastMetric('energy')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedForecastMetric === 'energy' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Energy
            </button>
            <button
              onClick={() => setSelectedForecastMetric('sleepHours')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedForecastMetric === 'sleepHours' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sleep
            </button>
            <button
              onClick={() => setSelectedForecastMetric('focusHours')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedForecastMetric === 'focusHours' ? 'bg-violet-500/20 text-violet-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus Hours
            </button>
          </div>
        </div>

        {/* Recharts Area with Upper/Lower Confidence Band */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scenarioForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              {/* Upper Confidence Band */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="#8b5cf6"
                strokeDasharray="4 4"
                strokeWidth={1}
                fillOpacity={1}
                fill="url(#forecastBandGradient)"
                name="Confidence Ceiling (Upper)"
              />
              {/* Predicted Median Line */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={0}
                name="Projected Value"
              />
              {/* Lower Confidence Band */}
              <Area
                type="monotone"
                dataKey="lower"
                stroke="#8b5cf6"
                strokeDasharray="4 4"
                strokeWidth={1}
                fillOpacity={0}
                name="Confidence Floor (Lower)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive What-If Scenario Levers Panel */}
      <div className="glass-panel rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                "What-If" Scenario Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Adjust behavioral levers to see how future burnout and vitality curves update in real time.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Simulated Burnout Odds</span>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs line-through text-slate-500 font-mono">{burnout.riskScore}%</span>
              <span className={`text-lg font-black font-mono ${simulatedBurnoutRisk < burnout.riskScore ? 'text-emerald-400' : 'text-amber-400'}`}>
                {simulatedBurnoutRisk}%
              </span>
            </div>
          </div>
        </div>

        {/* Levers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Lever 1: Sleep Adjustment */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300">Sleep Supplement</span>
              <span className="text-xs font-mono font-bold text-white">+{extraSleep}h / night</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.5"
              value={extraSleep}
              onChange={(e) => setExtraSleep(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-400 font-mono">
              Impact: Drops burnout odds by ~18% per +1h sleep.
            </p>
          </div>

          {/* Lever 2: Mid-Week Active Recovery Day */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-violet-300">Mid-Week Rest Block</span>
              <button
                type="button"
                onClick={() => setTakeRestDay(!takeRestDay)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors ${
                  takeRestDay ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {takeRestDay ? 'Active' : 'Off'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-3">
              Impact: Breaks consecutive crunch strain, reducing cognitive latency by 31%.
            </p>
          </div>

          {/* Lever 3: Cap Daily Focus at 5h */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-300">Cap Deep Focus (5h Max)</span>
              <button
                type="button"
                onClick={() => setCapFocusAt5(!capFocusAt5)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors ${
                  capFocusAt5 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {capFocusAt5 ? 'Active' : 'Off'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-3">
              Impact: Prevents hyper-fatigue days from spilling over into next-day burnout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
