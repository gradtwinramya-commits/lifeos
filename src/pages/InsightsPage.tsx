import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Layers, 
  Zap, 
  Brain,
  Filter
} from 'lucide-react';
import { InsightItem, DailyLog, ExplainabilityDetails } from '../types';
import { ApiService } from '../lib/api';
import { StorageService } from '../lib/storage';

interface InsightsPageProps {
  insights: InsightItem[];
  logs: DailyLog[];
  onUpdateInsights: (insights: InsightItem[]) => void;
  onOpenExplain: (details: ExplainabilityDetails) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  insights,
  logs,
  onUpdateInsights,
  onOpenExplain,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDiscovering, setIsDiscovering] = useState(false);

  const categories = ['All', 'Productivity', 'Health', 'Mind', 'Finance'];

  const filteredInsights =
    selectedCategory === 'All'
      ? insights
      : insights.filter((ins) => ins.category === selectedCategory);

  const handleDiscoverNew = async () => {
    setIsDiscovering(true);
    const profile = StorageService.getProfile();
    try {
      const newDiscovered = await ApiService.discoverInsights(logs, profile);
      if (newDiscovered && newDiscovered.length > 0) {
        // Merge with existing
        const combined = [...newDiscovered, ...insights.slice(0, 4)];
        onUpdateInsights(combined);
        StorageService.saveInsights(combined);
      }
    } catch (err) {
      console.warn('Discover insights error', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Neural Pattern Recognition
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-500/30">
              30-Day Cross-Domain Analysis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
            Behavioral Insights & Correlations
          </h1>
          <p className="text-xs text-slate-400">
            Hidden causal relationships uncovered across your sleep, focus, physical workouts, and daily mood.
          </p>
        </div>

        <button
          onClick={handleDiscoverNew}
          disabled={isDiscovering}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold font-mono shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Sparkles className={`w-4 h-4 ${isDiscovering ? 'animate-spin text-cyan-200' : ''}`} />
          <span>{isDiscovering ? 'Analyzing Telemetry...' : 'Discover New Patterns'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedCategory === c
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInsights.map((ins) => (
          <motion.div
            key={ins.id}
            layout
            className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/10 hover:border-cyan-500/40 transition-all group"
          >
            <div>
              {/* Top metadata */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/30">
                    {ins.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    {ins.confidence}% Confidence
                  </span>
                </div>

                {/* Why button */}
                <button
                  onClick={() =>
                    onOpenExplain({
                      title: ins.title,
                      itemType: 'insight',
                      summary: ins.description,
                      keyDrivers: [
                        `Statistical Formula: ${ins.statSnippet}`,
                        `Pearson Correlation Coefficient: ${ins.correlation > 0 ? '+' : ''}${ins.correlation}`,
                        `Sample size: ${ins.dataPointsCount} paired telemetry observations`,
                      ],
                      confidenceScore: ins.confidence,
                      whatChangesOutcome: ins.actionableTip,
                      recommendedCounterAction: `Adopt the actionable rule below for 5 days.`,
                      metricData: {
                        'Correlation (r)': ins.correlation,
                        'Data Points': ins.dataPointsCount,
                        'Confidence': `${ins.confidence}%`,
                        'Category': ins.category,
                      },
                    })
                  }
                  className="shrink-0 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why?</span>
                </button>
              </div>

              {/* Title & Stat Formula Snippet */}
              <h3 className="text-base sm:text-lg font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                {ins.title}
              </h3>

              <div className="mt-2.5 inline-block px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 font-mono text-xs">
                {ins.statSnippet}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {ins.description}
              </p>

              {/* Actionable Tip */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Prescriptive Counter-Measure
                </span>
                <p className="text-xs text-slate-200">
                  {ins.actionableTip}
                </p>
              </div>
            </div>

            {/* Bottom telemetry indicators */}
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                {ins.dataPointsCount} paired data points
              </span>
              <span className="text-cyan-400">
                r = {ins.correlation > 0 ? '+' : ''}{ins.correlation}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
