import React from 'react';
import { motion } from 'motion/react';
import { 
  Bot, 
  TrendingUp, 
  Calendar, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Activity, 
  ArrowRight,
  Brain,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const pillars = [
    {
      title: "Jarvis AI Core",
      badge: "Context-Aware",
      icon: Bot,
      color: "from-cyan-500 to-blue-600",
      description: "An assistant that knows your full 30-day biometrics. Ask 'Why was I tired this week?' or have it proactively protect your focus."
    },
    {
      title: "Predictive Analytics",
      badge: "Forecasting",
      icon: TrendingUp,
      color: "from-violet-500 to-fuchsia-600",
      description: "Forecasts burnout risk 7 days in advance, predicts goal completion odds, and correlates sleep deprivation with cognitive slump."
    },
    {
      title: "Smart Productivity Planner",
      badge: "Circadian Sync",
      icon: Calendar,
      color: "from-amber-500 to-orange-600",
      description: "Dynamically distributes hard cognitive tasks during your peak energy hours, and light administrative tasks during post-lunch slumps."
    },
    {
      title: "Radical Explainability",
      badge: "Every 'Why?'",
      icon: HelpCircle,
      color: "from-emerald-500 to-teal-600",
      description: "Zero black-box mystery. Every recommendation and prediction features a 'Why?' card with real mathematical drivers and counter-action levers."
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-violet w-[500px] h-[500px] -top-32 -left-32" />
      <div className="ambient-glow-cyan w-[600px] h-[600px] top-1/3 -right-48" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-6 shadow-lg shadow-cyan-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Autonomous Personal Intelligence Platform</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-mono leading-tight"
        >
          Your life, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400">decoded.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal mb-10"
        >
          LifeOS isn't just another habit tracker or chatbot. It is a full-stack personal intelligence engine that turns your sleep, focus, mood, and health telemetry into predictive insights, circadian schedules, and guaranteed outcomes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onLaunch}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Launch LifeOS Core</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pre-loaded with 30 days of telemetry</span>
          </div>
        </motion.div>

        {/* Live Interactive Telemetry Preview Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 p-4 rounded-2xl glass-panel-glow border border-violet-500/20 text-left grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Composite Life Score</span>
            <div className="text-2xl font-bold text-cyan-300 font-mono mt-1">79 / 100</div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              ▲ +3.4 vs last week
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Burnout Probability</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">72% (High)</div>
            <span className="text-[10px] text-slate-400 font-mono">
              Late night crunch factor
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Half-Marathon Odds</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">84% On Track</div>
            <span className="text-[10px] text-slate-400 font-mono">
              +1.2 km/wk ahead
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Explainability</span>
            <div className="text-2xl font-bold text-violet-400 font-mono mt-1">100% "Why?"</div>
            <span className="text-[10px] text-slate-400 font-mono">
              Zero black-box AI
            </span>
          </div>
        </motion.div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono">
            Four Core Architectures In One OS
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engineered to analyze, predict, plan, and explain every daily variable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="p-6 rounded-2xl glass-panel hover:border-cyan-500/40 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
