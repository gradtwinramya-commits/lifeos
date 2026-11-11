import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Sparkles, 
  Moon, 
  Smile, 
  Zap, 
  Dumbbell, 
  DollarSign, 
  Briefcase, 
  FileText, 
  Flame, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { DailyLog, Habit } from '../types';
import { StorageService } from '../lib/storage';

interface DailyCheckinProps {
  todayLog?: DailyLog;
  habits: Habit[];
  onComplete: () => void;
  onCancel?: () => void;
}

export const DailyCheckin: React.FC<DailyCheckinProps> = ({
  todayLog,
  habits,
  onComplete,
  onCancel,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [sleepHours, setSleepHours] = useState<number>(todayLog?.sleepHours ?? 7.5);
  const [mood, setMood] = useState<number>(todayLog?.mood ?? 4);
  const [energy, setEnergy] = useState<number>(todayLog?.energy ?? 4);
  const [workout, setWorkout] = useState<boolean>(todayLog?.workout ?? true);
  const [workoutType, setWorkoutType] = useState<string>(todayLog?.workoutType ?? 'Zone 2 Run');
  const [workoutMinutes, setWorkoutMinutes] = useState<number>(todayLog?.workoutMinutes ?? 45);
  const [spend, setSpend] = useState<number>(todayLog?.spend ?? 32);
  const [focusHours, setFocusHours] = useState<number>(todayLog?.focusHours ?? 5.0);
  const [notes, setNotes] = useState<string>(todayLog?.notes ?? '');
  const [habitsCompleted, setHabitsCompleted] = useState<string[]>(todayLog?.habitsCompleted ?? ['h1', 'h2', 'h3']);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);

  const moodLabels = [
    { value: 1, label: 'Depleted', emoji: '😞' },
    { value: 2, label: 'Low', emoji: '🙁' },
    { value: 3, label: 'Steady', emoji: '😐' },
    { value: 4, label: 'Energized', emoji: '🙂' },
    { value: 5, label: 'Peak Flow', emoji: '🤩' },
  ];

  const energyLabels = [
    { value: 1, label: 'Exhausted' },
    { value: 2, label: 'Lethargic' },
    { value: 3, label: 'Balanced' },
    { value: 4, label: 'Vibrant' },
    { value: 5, label: 'Hyper-Charged' },
  ];

  const workoutOptions = ['Zone 2 Run', 'HIIT Session', 'Strength Training', 'Yoga Flow', 'Cycling', 'Walk & Mobility'];

  const toggleHabit = (id: string) => {
    if (habitsCompleted.includes(id)) {
      setHabitsCompleted(habitsCompleted.filter((h) => h !== id));
    } else {
      setHabitsCompleted([...habitsCompleted, id]);
    }
  };

  // Real-time estimated daily impact preview
  const estimatedDayScore = Math.min(
    100,
    Math.round(
      (sleepHours / 8) * 25 +
      (mood / 5) * 20 +
      (energy / 5) * 20 +
      (focusHours / 5) * 20 +
      (workout ? 15 : 5)
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const log: DailyLog = {
      date: todayStr,
      sleepHours,
      mood,
      energy,
      workout,
      workoutType: workout ? workoutType : undefined,
      workoutMinutes: workout ? workoutMinutes : 0,
      spend,
      focusHours,
      habitsCompleted,
      notes: notes.trim() || undefined,
    };

    // Save log to storage
    StorageService.addOrUpdateLog(log);

    // Add gamification XP (+50 XP for daily check-in)
    const { newXp } = StorageService.addXp(50);
    setEarnedXp(50);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Daily Telemetry Sync
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-500/30">
                +50 XP
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
              Daily Check-in
            </h1>
            <p className="text-xs text-slate-400">
              Log today's biometrics to immediately recalculate Life Score & predictive forecasts.
            </p>
          </div>
        </div>

        {/* Live Estimated Score Preview */}
        <div className="hidden sm:flex flex-col items-end p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-right">
          <span className="text-[10px] font-mono uppercase text-slate-400">Projected Day Score</span>
          <div className="text-xl font-black text-cyan-300 font-mono">
            {estimatedDayScore} / 100
          </div>
        </div>
      </div>

      {/* Main Check-in Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Sleep Hours & Quality */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-white font-mono block">Sleep Duration</label>
                <span className="text-xs text-slate-400">Total restorative sleep last night</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-cyan-400">{sleepHours} hrs</span>
              <span className={`block text-[10px] font-mono font-bold ${sleepHours >= 7.5 ? 'text-emerald-400' : sleepHours >= 6.5 ? 'text-amber-400' : 'text-rose-400'}`}>
                {sleepHours >= 7.5 ? 'Optimal Rest' : sleepHours >= 6.5 ? 'Acceptable' : 'Deficit (-31% Focus Risk)'}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="4"
            max="11"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>4 hrs</span>
            <span>7.5 hrs (Target)</span>
            <span>11 hrs</span>
          </div>
        </div>

        {/* 2. Mood & Energy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mood (1-5) */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-white font-mono block">Subjective Mood</label>
                <span className="text-xs text-slate-400">Mental baseline today</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {moodLabels.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                    mood === m.value
                      ? 'bg-violet-600/30 border border-violet-400 text-white shadow-lg shadow-violet-500/20 scale-105'
                      : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-mono text-center font-medium leading-tight">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy (1-5) */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-white font-mono block">Energy / Vitality</label>
                <span className="text-xs text-slate-400">Physical battery level</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {energyLabels.map((en) => (
                <button
                  key={en.value}
                  type="button"
                  onClick={() => setEnergy(en.value)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                    energy === en.value
                      ? 'bg-amber-500/20 border border-amber-400 text-white shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-bold font-mono text-amber-300">{en.value}/5</span>
                  <span className="text-[10px] font-mono text-center font-medium leading-tight">{en.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Physical Training / Workout */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-white font-mono block">Physical Workout</label>
                <span className="text-xs text-slate-400">Did you engage in physical training today?</span>
              </div>
            </div>

            {/* Yes/No Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
              <button
                type="button"
                onClick={() => setWorkout(true)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                  workout ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWorkout(false)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                  !workout ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rest Day
              </button>
            </div>
          </div>

          {workout && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-3 border-t border-white/5 space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                {workoutOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWorkoutType(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      workoutType === opt
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 font-bold'
                        : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-mono text-slate-400">Duration:</span>
                <input
                  type="number"
                  min="10"
                  max="180"
                  step="5"
                  value={workoutMinutes}
                  onChange={(e) => setWorkoutMinutes(parseInt(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-white/10 rounded-xl px-3 py-1 text-xs font-mono text-white text-center focus:outline-none focus:border-rose-400"
                />
                <span className="text-xs font-mono text-slate-400">minutes</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 4. Productivity (Focus Hours) & Spending ($) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Focus Hours */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <label className="text-sm font-bold text-white font-mono block">Deep Focus</label>
                  <span className="text-xs text-slate-400">High-leverage work/study</span>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-cyan-400">{focusHours} hrs</span>
            </div>

            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={focusHours}
              onChange={(e) => setFocusHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>0h</span>
              <span>5.0h (Daily Target)</span>
              <span>12h</span>
            </div>
          </div>

          {/* Daily Spend */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <label className="text-sm font-bold text-white font-mono block">Discretionary Spend</label>
                  <span className="text-xs text-slate-400">Food, coffees, impulse buys</span>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-400">${spend}</span>
            </div>

            <input
              type="number"
              min="0"
              max="2000"
              value={spend}
              onChange={(e) => setSpend(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            <div className="text-[11px] font-mono text-slate-500">
              Daily budget target: $50.00
            </div>
          </div>
        </div>

        {/* 5. Habit Completion Checkboxes */}
        <div className="glass-panel rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono">Daily Core Habits Completed</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {habits.map((h) => {
              const completed = habitsCompleted.includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHabit(h.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    completed
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-medium font-mono">{h.name}</span>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                      completed ? 'bg-cyan-400 text-slate-950' : 'border border-white/20'
                    }`}
                  >
                    {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Journal & Cognitive Notes */}
        <div className="glass-panel rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <label className="text-sm font-bold text-white font-mono">Daily Reflection & Context</label>
          </div>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What affected your focus or energy today? Any unexpected stress or breakthroughs?"
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 leading-relaxed"
          />
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Synchronizing Telemetry & Neural Models...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                <span>Save Telemetry & Claim +50 XP</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Floating XP Reward Notification */}
      <AnimatePresence>
        {earnedXp && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-mono font-bold text-sm shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>+50 XP Gained! Streak Extended!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
