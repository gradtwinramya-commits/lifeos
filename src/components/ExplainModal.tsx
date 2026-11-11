import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, Activity, Zap } from 'lucide-react';
import { ExplainabilityDetails } from '../types';

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExplainabilityDetails | null;
  isLoading?: boolean;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          className="relative w-full max-w-2xl glass-panel-glow rounded-2xl border border-violet-500/30 overflow-hidden shadow-2xl z-10 my-8 text-slate-100"
        >
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-950/40 via-slate-900/40 to-cyan-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                    LifeOS Explainability Engine
                  </span>
                  {data?.confidenceScore && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      {data.confidenceScore}% Confidence
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1 line-clamp-1">
                  Why: {data?.title || 'Telemetry Analysis'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                    <Zap className="w-6 h-6 text-violet-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-300">Jarvis is correlating 30 days of telemetry...</p>
                <p className="text-xs text-slate-500 font-mono">Running regression models & cross-domain analysis</p>
              </div>
            ) : data ? (
              <>
                {/* 1. The Core Summary in One Sentence */}
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/25">
                  <div className="text-xs font-mono uppercase text-violet-400 font-semibold tracking-wider mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    The Recommendation / Prediction In One Sentence
                  </div>
                  <p className="text-base text-slate-100 font-medium leading-relaxed">
                    {data.summary}
                  </p>
                </div>

                {/* 2. Key Telemetry Drivers & Data Points */}
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Data Points & Patterns Leading To This (Mathematical Evidence)
                  </h4>
                  <div className="space-y-2.5">
                    {data.keyDrivers.map((driver, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all text-sm"
                      >
                        <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-slate-200 leading-normal">{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. What Would Change The Outcome */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase font-semibold">
                    <Zap className="w-4 h-4 text-amber-400" />
                    What Would Change The Outcome? (Scenario Levers)
                  </div>
                  <p className="text-sm text-cyan-100/90 leading-relaxed font-normal">
                    {data.whatChangesOutcome}
                  </p>
                </div>

                {/* 4. Recommended Immediate Counter-Action */}
                {data.recommendedCounterAction && (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-mono uppercase text-emerald-400 font-semibold mb-1">
                        Recommended Next Move
                      </div>
                      <p className="text-sm text-emerald-100/90 font-medium">
                        {data.recommendedCounterAction}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mini metric badges */}
                {data.metricData && (
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-xs font-mono text-slate-400">
                    {Object.entries(data.metricData).map(([k, v]) => (
                      <span key={k} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                        {k}: <strong className="text-white font-mono">{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-center py-6">No telemetry explanation available.</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Powered by LifeOS Analytics & Gemini 3.8 Flash
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
            >
              Close Breakdown
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
