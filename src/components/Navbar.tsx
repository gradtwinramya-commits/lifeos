import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Target, 
  Calendar, 
  Lightbulb, 
  TrendingUp, 
  Settings, 
  Menu, 
  X, 
  Sparkles, 
  Award, 
  Flame,
  LayoutDashboard
} from 'lucide-react';
import { GamificationState } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lifeScore: number;
  gamification: GamificationState;
  onOpenCheckIn: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  lifeScore,
  gamification,
  onOpenCheckIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin', label: 'Daily Check-in', icon: CheckCircle2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'planner', label: 'Smart Planner', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  // Level progress percentage (e.g. 400 XP per level)
  const xpInCurrentLevel = gamification.xp % 400;
  const xpProgress = Math.min(100, Math.round((xpInCurrentLevel / 400) * 100));

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white font-mono">
                Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">OS</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block -mt-1 font-mono">Personal Intelligence</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-violet-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Badges & Action CTA */}
        <div className="flex items-center gap-3">
          {/* Life Score Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">Score:</span>
            <span className="text-xs font-bold text-white font-mono">{lifeScore}</span>
          </div>

          {/* XP & Level Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-violet-500/20">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-200">
                <span>LVL {gamification.level}</span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400">{gamification.streakDays}d streak</span>
              </div>
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full transition-all duration-500" 
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Check-in Button */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden md:inline">Quick Check-in</span>
            <span className="md:hidden">Check-in</span>
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-slate-950/95 border-b border-white/10 backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-violet-600/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
