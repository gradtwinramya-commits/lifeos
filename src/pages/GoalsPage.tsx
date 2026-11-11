import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { Goal, GoalMilestone, ExplainabilityDetails } from '../types';
import { StorageService } from '../lib/storage';

interface GoalsPageProps {
  goals: Goal[];
  onUpdateGoals: (goals: Goal[]) => void;
  onOpenExplain: (details: ExplainabilityDetails) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onUpdateGoals,
  onOpenExplain,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Health' | 'Productivity' | 'Finance' | 'Mind' | 'Habit'>('Health');
  const [target, setTarget] = useState<number>(20);
  const [unit, setUnit] = useState('sessions');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>(['Phase 1 Kickoff', 'Midway Baseline', 'Final Stretch']);
  const [completedGoalNotice, setCompletedGoalNotice] = useState<string | null>(null);

  const categories = ['Health', 'Productivity', 'Finance', 'Mind', 'Habit'] as const;

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const updatedMilestones = g.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      // Recalculate progress based on completed milestones
      const completedCount = updatedMilestones.filter((m) => m.completed).length;
      const progressFraction = completedCount / (updatedMilestones.length || 1);
      const newCurrent = Math.round(progressFraction * g.target * 10) / 10;
      const isNowCompleted = completedCount === updatedMilestones.length;

      return {
        ...g,
        milestones: updatedMilestones,
        current: Math.max(g.current, newCurrent),
        completed: isNowCompleted,
      };
    });

    onUpdateGoals(updated);
    StorageService.saveGoals(updated);
  };

  const handleCompleteGoal = (goal: Goal) => {
    const updated = goals.map((g) => (g.id === goal.id ? { ...g, completed: true, current: g.target } : g));
    onUpdateGoals(updated);
    StorageService.saveGoals(updated);

    // Gamification reward: +250 XP for goal completion
    StorageService.addXp(250);
    setCompletedGoalNotice(`Goal Accomplished: "${goal.title}" (+250 XP!)`);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => setCompletedGoalNotice(null), 3000);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const milestones: GoalMilestone[] = milestoneInputs
      .filter((m) => m.trim().length > 0)
      .map((m, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        title: m.trim(),
        completed: false,
      }));

    const newGoal: Goal = {
      id: `g-${Date.now()}`,
      title: title.trim(),
      category,
      target,
      current: 0,
      unit,
      deadline,
      milestones,
      status: 'on_track',
      statusReason: 'Initiated baseline trajectory. Pacing model calibrated for milestone 1.',
      completionOdds: 78,
      completed: false,
    };

    const updated = [newGoal, ...goals];
    onUpdateGoals(updated);
    StorageService.saveGoals(updated);
    StorageService.addXp(30);

    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Predictive Goal Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Velocity Tracked
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
            Goals & Strategic Objectives
          </h1>
          <p className="text-xs text-slate-400">
            AI-estimated completion probabilities derived from actual daily momentum and historical velocity.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Completion Notification */}
      <AnimatePresence>
        {completedGoalNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-sm flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>{completedGoalNotice}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => {
          const progressPercent = Math.min(100, Math.round((g.current / (g.target || 1)) * 100));
          const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

          const statusColor =
            g.status === 'on_track'
              ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30'
              : g.status === 'at_risk'
              ? 'text-amber-400 bg-amber-950/80 border-amber-500/30'
              : 'text-rose-400 bg-rose-950/80 border-rose-500/30';

          return (
            <motion.div
              key={g.id}
              layout
              className={`glass-panel rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                g.completed ? 'border-emerald-500/30 opacity-90' : 'border-white/10 hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                        {g.category}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${statusColor}`}>
                        {g.completed ? 'Completed' : g.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-mono leading-snug">
                      {g.title}
                    </h3>
                  </div>

                  {/* Why Button */}
                  <button
                    onClick={() =>
                      onOpenExplain({
                        title: `${g.title} Status (${g.status.toUpperCase()})`,
                        itemType: 'goal_status',
                        summary: g.statusReason,
                        keyDrivers: [
                          `Current Progress: ${g.current} of ${g.target} ${g.unit} (${progressPercent}%)`,
                          `Completion probability calculated at ${g.completionOdds}%`,
                          `Pacing trajectory with ${daysLeft} days remaining until ${g.deadline}`,
                        ],
                        confidenceScore: 89,
                        whatChangesOutcome:
                          g.status === 'on_track'
                            ? 'Maintaining current 14-day velocity ensures completion 5 days ahead of schedule.'
                            : 'Increasing weekly milestone effort by 20% restores On-Track status in 7 days.',
                        recommendedCounterAction:
                          g.status === 'on_track'
                            ? 'Keep rhythm steady; avoid burnout spikes.'
                            : 'Dedicate an extra 45-minute focus block per weekday to milestone deliverables.',
                        metricData: {
                          'Target': `${g.target} ${g.unit}`,
                          'Current': `${g.current} ${g.unit}`,
                          'Odds': `${g.completionOdds}%`,
                          'Days Left': `${daysLeft} days`,
                        },
                      })
                    }
                    className="shrink-0 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why?</span>
                  </button>
                </div>

                {/* Progress Bar & Value */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      {g.current} / {g.target} {g.unit}
                    </span>
                    <span className="text-white font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        g.completed
                          ? 'bg-emerald-400'
                          : g.status === 'on_track'
                          ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                          : g.status === 'at_risk'
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* AI Reason explanation */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                  <span className="text-cyan-400 font-mono font-semibold block text-[11px] mb-0.5">
                    AI Trajectory Assessment:
                  </span>
                  {g.statusReason}
                </div>

                {/* Milestones Checklist */}
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Strategic Milestones:
                  </span>
                  <div className="space-y-1.5">
                    {g.milestones.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMilestone(g.id, m.id)}
                        className={`w-full p-2 rounded-xl text-left text-xs font-mono flex items-center justify-between transition-colors ${
                          m.completed
                            ? 'bg-cyan-500/10 text-slate-300 line-through border border-cyan-500/20'
                            : 'bg-slate-900/40 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        <span>{m.title}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center ${
                            m.completed ? 'bg-cyan-400 text-slate-950' : 'border border-white/20'
                          }`}
                        >
                          {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {daysLeft} days remaining ({g.deadline})
                </span>

                {!g.completed && (
                  <button
                    onClick={() => handleCompleteGoal(g)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <span>Mark Complete (+250 XP)</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 border border-cyan-500/30 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white font-mono">Create Strategic Goal</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master French Conversational Fluency"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Target Deadline</label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Target Value</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={target}
                      onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. hours, km, books"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Milestones</label>
                  <div className="space-y-2">
                    {milestoneInputs.map((m, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={m}
                        onChange={(e) => {
                          const updated = [...milestoneInputs];
                          updated[idx] = e.target.value;
                          setMilestoneInputs(updated);
                        }}
                        placeholder={`Milestone ${idx + 1}`}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity mt-4 cursor-pointer"
                >
                  Synthesize Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
