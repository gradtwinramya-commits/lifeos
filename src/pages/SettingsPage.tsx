import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  Upload, 
  User, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Moon,
  Zap
} from 'lucide-react';
import { UserProfile, GamificationState, Badge } from '../types';
import { StorageService } from '../lib/storage';

interface SettingsPageProps {
  profile: UserProfile;
  gamification: GamificationState;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetData: () => void;
  onRefreshAll: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  gamification,
  onUpdateProfile,
  onResetData,
  onRefreshAll,
}) => {
  const [name, setName] = useState(profile.name);
  const [chronotype, setChronotype] = useState(profile.chronotype);
  const [targetSleep, setTargetSleep] = useState(profile.targetSleep);
  const [targetFocus, setTargetFocus] = useState(profile.targetFocus);
  const [dailyBudget, setDailyBudget] = useState(profile.dailyBudget);
  const [primaryGoal, setPrimaryGoal] = useState(profile.primaryGoal);

  const [savedNotice, setSavedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      name,
      chronotype,
      targetSleep,
      targetFocus,
      dailyBudget,
      primaryGoal,
    };
    onUpdateProfile(updated);
    StorageService.saveProfile(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = StorageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeos-telemetry-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importAllData(content);
        if (success) {
          onRefreshAll();
          alert('LifeOS telemetry imported successfully!');
        } else {
          alert('Failed to parse LifeOS JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    onResetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            LifeOS System Control
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-500/30">
            Node Configuration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
          Settings & Profile
        </h1>
        <p className="text-xs text-slate-400">
          Manage your biological preferences, gamified badges, and telemetry backup.
        </p>
      </div>

      {/* Gamification Achievements & Badges Card */}
      <div className="glass-panel-glow rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  Level {gamification.level} Cognitive Optimizer
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  ({gamification.xp} Total XP)
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {gamification.streakDays}-day active telemetry streak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{gamification.badges.filter(b => b.unlocked).length} of {gamification.badges.length} Badges Unlocked</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gamification.badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                b.unlocked
                  ? 'bg-slate-900/80 border-cyan-500/30'
                  : 'bg-slate-950/40 border-white/5 opacity-40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Flame className={`w-4 h-4 ${b.unlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                <h4 className="text-xs font-bold text-white font-mono">{b.name}</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{b.description}</p>
              {b.unlockedAt && (
                <span className="text-[10px] font-mono text-cyan-400 block mt-2">
                  Unlocked: {b.unlockedAt}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-panel rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">Telemetry & Bio Profile</h3>
          </div>
          {savedNotice && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">User Identity Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">Circadian Chronotype</label>
            <select
              value={chronotype}
              onChange={(e) => setChronotype(e.target.value as any)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Early Bird">Early Bird (Peak: 08:00 - 12:00)</option>
              <option value="Night Owl">Night Owl (Peak: 17:00 - 22:00)</option>
              <option value="Biphasic">Biphasic (Dual Focus Windows)</option>
              <option value="Flexible">Flexible Circadian Schedule</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">Daily Sleep Target (Hours)</label>
            <input
              type="number"
              step="0.5"
              min="5"
              max="11"
              value={targetSleep}
              onChange={(e) => setTargetSleep(parseFloat(e.target.value) || 8)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">Daily Focus Target (Hours)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="12"
              value={targetFocus}
              onChange={(e) => setTargetFocus(parseFloat(e.target.value) || 5)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">Daily Discretionary Budget ($)</label>
            <input
              type="number"
              min="0"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(parseInt(e.target.value) || 50)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">Primary Life Objective</label>
            <input
              type="text"
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          Save Profile Telemetry
        </button>
      </form>

      {/* Data Management: Export, Import, Reset */}
      <div className="glass-panel rounded-3xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white font-mono">Data Persistence & Backups</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            LifeOS stores all your data directly in your browser's persistent localStorage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
          >
            <Download className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white font-mono">Export Data (JSON)</span>
            <span className="text-[10px] text-slate-400">Download full 30-day telemetry backup</span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-violet-500/40 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer">
            <Upload className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white font-mono">Import Data</span>
            <span className="text-[10px] text-slate-400">Restore from previously exported JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/50 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-rose-400 group-hover:-rotate-45 transition-transform" />
            <span className="text-xs font-bold text-rose-300 font-mono">Reset Demo Data</span>
            <span className="text-[10px] text-slate-400">Re-generate 30 days of pristine demo logs</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-lg font-bold text-white font-mono">Reset Telemetry to Demo State?</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                This will re-populate LifeOS with realistic 30-day baseline telemetry (including sleep cycles, focus crunch periods, goals, and tasks).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
