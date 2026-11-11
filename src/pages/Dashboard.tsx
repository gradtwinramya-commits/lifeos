import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Heart, 
  Briefcase, 
  Wallet, 
  Brain, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Flame, 
  HelpCircle, 
  Zap, 
  Moon, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Target
} from 'lucide-react';
import { DailyLog, LifeScoreBreakdown, Goal, TaskItem, ExplainabilityDetails } from '../types';
import { calculateBurnoutRisk } from '../lib/analytics';

interface DashboardProps {
  logs: DailyLog[];
  lifeScore: LifeScoreBreakdown;
  goals: Goal[];
  tasks: TaskItem[];
  onOpenExplain: (details: ExplainabilityDetails) => void;
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  logs,
  lifeScore,
  goals,
  tasks,
  onOpenExplain,
  onNavigateToTab,
}) => {
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [selectedMetric, setSelectedMetric] = useState<'sleep' | 'focus' | 'energy' | 'mood'>('sleep');

  const burnout = calculateBurnoutRisk(logs);
  const activeGoals = goals.filter((g) => !g.completed);
  const primaryGoal = activeGoals[0] || goals[0];

  // Slice logs for charts
  const chartLogs = logs.slice(-trendDays).map((l) => ({
    date: l.date.slice(5), // MM-DD
    fullDate: l.date,
    sleep: l.sleepHours,
    focus: l.focusHours,
    energy: l.energy,
    mood: l.mood,
    workout: l.workout ? 1 : 0,
    spend: l.spend,
  }));

  // Animated Life Score SVG Ring calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (lifeScore.overall / 100) * circumference;

  // Sub-scores list
  const subScores = [
    { label: 'Health', value: lifeScore.health, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { label: 'Productivity', value: lifeScore.productivity, icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { label: 'Finance', value: lifeScore.finance, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Mind', value: lifeScore.mind, icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Social', value: lifeScore.social, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ];

  // Top 3 Recommended Actions for Today
  const topRecommendations = [
    {
      id: 'rec-1',
      title: 'Mandate a strict 8:45 PM Digital Sunset',
      category: 'Health',
      reason: 'Your past 4 nights showed late screen exposure, delaying sleep onset by 42m and spiking burnout probability to 72%.',
      counterImpact: 'Reduces burnout risk to 44% in 48 hours.',
      metricData: { 'Burnout Risk': `${burnout.riskScore}%`, 'Late Screen Work': 'Past 4 days', 'Target Wind Down': '8:45 PM' },
    },
    {
      id: 'rec-2',
      title: 'Execute 90m Deep Work block before 11:30 AM',
      category: 'Productivity',
      reason: 'Your biometric alertness peaks between 09:00 - 11:30 AM with 2.8x higher cognitive flow efficiency.',
      counterImpact: 'Accelerates goal completion velocity by +18%.',
      metricData: { 'Peak Circadian Window': '09:00 - 11:30 AM', 'Focus Efficiency': '2.8x higher', 'Category': 'Productivity' },
    },
    {
      id: 'rec-3',
      title: 'Cardio / 30m Movement break at 1:00 PM',
      category: 'Mind',
      reason: 'Physical activity directly offsets the post-prandial slump, elevating second-half afternoon focus by 24%.',
      counterImpact: 'Prevents mood drop and evening energy drain.',
      metricData: { 'Afternoon Slump Offset': '+24% Energy', 'Target Duration': '30 mins' },
    },
  ];

  const handleExplainBurnout = () => {
    onOpenExplain({
      title: 'Burnout Risk: ' + burnout.riskScore + '% (' + burnout.riskLevel.toUpperCase() + ')',
      itemType: 'prediction',
      summary: `Your burnout probability is ${burnout.riskScore}% due to a 5-day rolling sleep deficit coupled with ${logs.slice(-5).filter(l => l.focusHours >= 5.5).length} intense crunch focus days.`,
      keyDrivers: burnout.keyDrivers,
      confidenceScore: burnout.confidence,
      whatChangesOutcome: "If you log >= 7.5 hours of sleep for the next 3 nights and limit deep work to 4.5 hours, burnout risk drops to ~38%.",
      recommendedCounterAction: "Block off tonight's schedule starting at 8:30 PM. No work emails or coding sprints.",
      metricData: {
        'Current Burnout Odds': `${burnout.riskScore}%`,
        'Risk Severity': burnout.riskLevel,
        '5-Day Avg Sleep': `${(logs.slice(-5).reduce((s, l) => s + l.sleepHours, 0) / 5).toFixed(1)} hrs`,
        '5-Day Avg Focus': `${(logs.slice(-5).reduce((s, l) => s + l.focusHours, 0) / 5).toFixed(1)} hrs`,
      },
    });
  };

  const handleExplainGoalOdds = () => {
    if (!primaryGoal) return;
    onOpenExplain({
      title: `Goal Completion Odds: ${primaryGoal.title} (${primaryGoal.completionOdds}%)`,
      itemType: 'goal_status',
      summary: primaryGoal.statusReason,
      keyDrivers: [
        `Historical velocity over past 14 days vs target trajectory`,
        `Current completion: ${primaryGoal.current} / ${primaryGoal.target} ${primaryGoal.unit} (${Math.round((primaryGoal.current / primaryGoal.target) * 100)}%)`,
        `Days remaining until deadline: ${Math.max(1, Math.ceil((new Date(primaryGoal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days`,
      ],
      confidenceScore: 89,
      whatChangesOutcome: `Increasing milestone completion pace by 0.5 units/week increases odds to 94%.`,
      recommendedCounterAction: `Schedule a 45-minute focused milestone sprint during your morning peak.`,
      metricData: {
        'Goal Target': `${primaryGoal.target} ${primaryGoal.unit}`,
        'Current Level': `${primaryGoal.current} ${primaryGoal.unit}`,
        'Deadline': primaryGoal.deadline,
        'Estimated Status': primaryGoal.status.replace('_', ' '),
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner / Welcome & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Autonomous Intelligence Core
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
            System Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time biometric synthesis, predictive risk modeling, and circadian time allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('checkin')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Log Today's Telemetry</span>
          </button>
        </div>
      </div>

      {/* Grid: Life Score Ring + Sub-Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Animated Life Score Ring Card (5 cols) */}
        <div className="lg:col-span-5 glass-panel-glow rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Composite Vitality
              </span>
              <h3 className="text-lg font-bold text-white font-mono">Overall Life Score</h3>
            </div>
            <button
              onClick={() => onOpenExplain({
                title: 'Life Score: ' + lifeScore.overall + '/100',
                itemType: 'recommendation',
                summary: `Calculated from multi-domain telemetry weighting Health (25%), Productivity (25%), Mind (25%), Finance (15%), and Social (10%).`,
                keyDrivers: [
                  `Health Score (${lifeScore.health}/100): Weighted average sleep and workout frequency`,
                  `Productivity (${lifeScore.productivity}/100): Target deep work hours adherence`,
                  `Mind Vitality (${lifeScore.mind}/100): Reported mood and energy ratings`,
                  `Trend velocity: ${lifeScore.trendChange >= 0 ? '+' : ''}${lifeScore.trendChange} vs previous 7-day period`,
                ],
                confidenceScore: 94,
                whatChangesOutcome: "Securing 2 consecutive 7.5h sleep nights will bump composite Life Score by +4 points.",
                recommendedCounterAction: "Follow today's recommended evening wind-down at 8:45 PM.",
                metricData: {
                  'Overall Score': `${lifeScore.overall}/100`,
                  'Health': `${lifeScore.health}/100`,
                  'Productivity': `${lifeScore.productivity}/100`,
                  'Mind': `${lifeScore.mind}/100`,
                  'Trend Change': `${lifeScore.trendChange}`,
                }
              })}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why?</span>
            </button>
          </div>

          {/* SVG Animated Circular Ring */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Foreground Animated Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#lifeScoreGradient)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="lifeScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                  {lifeScore.overall}
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase">out of 100</span>
                <span className={`text-[10px] font-mono mt-0.5 font-bold ${lifeScore.trendChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lifeScore.trendChange >= 0 ? '▲ +' : '▼ '}{lifeScore.trendChange} pts
                </span>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400">Current State</div>
                <div className="text-sm font-bold text-cyan-300">
                  {lifeScore.overall >= 80 ? 'Optimal Synergy' : lifeScore.overall >= 65 ? 'Elevated Strain' : 'Recovery Critical'}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Productivity remains robust, but sleep variance is triggering late-week cognitive fatigue.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Score Pills */}
          <div className="grid grid-cols-5 gap-2 pt-4 border-t border-white/10">
            {subScores.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/40 border border-white/5">
                  <Icon className={`w-3.5 h-3.5 ${s.color} mb-1`} />
                  <span className="text-[10px] text-slate-400">{s.label}</span>
                  <span className="text-xs font-bold text-white font-mono mt-0.5">{s.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prediction Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Card 1: Burnout Risk */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border-amber-500/25 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Predictive Alert
                </span>
                <button
                  onClick={handleExplainBurnout}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why?</span>
                </button>
              </div>

              <h4 className="text-xl font-bold text-white font-mono">
                Burnout Risk: <span className="text-amber-400">{burnout.riskScore}%</span>
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Elevated cognitive strain detected across past 5 days with an average sleep of{' '}
                <strong className="text-white font-mono">
                  {(logs.slice(-5).reduce((s, l) => s + l.sleepHours, 0) / 5).toFixed(1)}h
                </strong>.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Risk Threshold:</span>
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  {burnout.riskLevel}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${burnout.riskScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Action lever: +1h sleep tonight drops risk by ~35%.
              </p>
            </div>
          </div>

          {/* Card 2: Goal Completion Odds */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border-emerald-500/25 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Primary Goal Forecast
                </span>
                <button
                  onClick={handleExplainGoalOdds}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why?</span>
                </button>
              </div>

              <h4 className="text-lg font-bold text-white font-mono line-clamp-1">
                {primaryGoal?.title || 'Goal Tracking'}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {primaryGoal?.completionOdds || 84}%
                </span>
                <span className="text-xs font-mono text-emerald-300 uppercase px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
                  On Track
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {primaryGoal?.statusReason || 'Pacing ahead of projected milestone deadline.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Target: {primaryGoal?.target} {primaryGoal?.unit}</span>
              <button
                onClick={() => onNavigateToTab('goals')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View All Goals</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Trend Charts with 7 / 30 day toggle */}
      <div className="glass-panel rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                Biometric & Productivity Telemetry
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous longitudinal tracking across restorative rest and cognitive output.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setSelectedMetric('sleep')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedMetric === 'sleep' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sleep (hrs)
              </button>
              <button
                onClick={() => setSelectedMetric('focus')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedMetric === 'focus' ? 'bg-violet-500/20 text-violet-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Focus (hrs)
              </button>
              <button
                onClick={() => setSelectedMetric('energy')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedMetric === 'energy' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Energy (1-5)
              </button>
              <button
                onClick={() => setSelectedMetric('mood')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedMetric === 'mood' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mood (1-5)
              </button>
            </div>

            {/* 7 vs 30 day toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setTrendDays(7)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  trendDays === 7 ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTrendDays(30)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  trendDays === 30 ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={
                      selectedMetric === 'sleep' ? '#06b6d4' :
                      selectedMetric === 'focus' ? '#8b5cf6' :
                      selectedMetric === 'energy' ? '#f59e0b' : '#f43f5e'
                    } 
                    stopOpacity={0.4} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={
                      selectedMetric === 'sleep' ? '#06b6d4' :
                      selectedMetric === 'focus' ? '#8b5cf6' :
                      selectedMetric === 'energy' ? '#f59e0b' : '#f43f5e'
                    } 
                    stopOpacity={0.0} 
                  />
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
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={
                  selectedMetric === 'sleep' ? '#06b6d4' :
                  selectedMetric === 'focus' ? '#8b5cf6' :
                  selectedMetric === 'energy' ? '#f59e0b' : '#f43f5e'
                }
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: Habit Heatmap Calendar + Today's Focus Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Habit Streak Tracker Heatmap (6 cols) */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Habit Consistency Heatmap
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">30-Day Execution Matrix</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                12 Day Active Streak
              </span>
            </div>

            {/* Heatmap Grid */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {logs.slice(-30).map((log, idx) => {
                  const completedCount = log.habitsCompleted.length;
                  const intensityClass =
                    completedCount >= 4
                      ? 'bg-cyan-400 shadow-md shadow-cyan-500/30'
                      : completedCount >= 3
                      ? 'bg-cyan-600/80'
                      : completedCount >= 2
                      ? 'bg-cyan-900/80'
                      : 'bg-slate-800/60';

                  return (
                    <div
                      key={idx}
                      title={`${log.date}: ${completedCount} habits completed (Sleep: ${log.sleepHours}h, Focus: ${log.focusHours}h)`}
                      className={`h-7 rounded-md transition-all hover:scale-110 cursor-pointer flex items-center justify-center text-[10px] font-mono text-slate-950 font-bold ${intensityClass}`}
                    >
                      {completedCount > 0 ? completedCount : ''}
                    </div>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-4 pt-3 border-t border-white/5">
                <span>Less Active</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-800" />
                  <div className="w-3 h-3 rounded bg-cyan-900" />
                  <div className="w-3 h-3 rounded bg-cyan-600" />
                  <div className="w-3 h-3 rounded bg-cyan-400" />
                </div>
                <span>Peak Synergy (5/5)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Primary Habit: 7.5h Restorative Sleep</span>
            <span className="text-cyan-400">82% adherence</span>
          </div>
        </div>

        {/* Today's Focus Card: Top 3 Recommended Actions (6 cols) */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Prescriptive Intelligence
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">Today's Focus: Top 3 Actions</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Real-time dynamic synthesis</span>
            </div>

            <div className="space-y-3">
              {topRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/30 uppercase">
                        {rec.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {rec.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  {/* Why button */}
                  <button
                    onClick={() => onOpenExplain({
                      title: rec.title,
                      itemType: 'recommendation',
                      summary: rec.reason,
                      keyDrivers: [
                        `Triggered by rolling 5-day biometric correlation`,
                        `Target optimization: ${rec.counterImpact}`,
                        `Alignment with user's defined chronotype profile`,
                      ],
                      confidenceScore: 92,
                      whatChangesOutcome: rec.counterImpact,
                      recommendedCounterAction: `Complete this action before the end of your day.`,
                      metricData: rec.metricData,
                    })}
                    className="shrink-0 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 transition-colors cursor-pointer mt-0.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why?</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Optimized for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <button
              onClick={() => onNavigateToTab('planner')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Daily Schedule</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
