import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExplainModal } from './components/ExplainModal';
import { JarvisWidget } from './components/JarvisWidget';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { DailyCheckin } from './pages/DailyCheckin';
import { GoalsPage } from './pages/GoalsPage';
import { PlannerPage } from './pages/PlannerPage';
import { InsightsPage } from './pages/InsightsPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StorageService } from './lib/storage';
import { calculateLifeScore } from './lib/analytics';
import { ApiService } from './lib/api';
import { 
  DailyLog, 
  LifeScoreBreakdown, 
  Goal, 
  TaskItem, 
  Habit, 
  UserProfile, 
  GamificationState, 
  InsightItem, 
  ExplainabilityDetails 
} from './types';

export default function App() {
  const [inApp, setInApp] = useState<boolean>(() => {
    // Check if user has previously launched the app
    return localStorage.getItem('lifeos_has_launched') === 'true';
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [gamification, setGamification] = useState<GamificationState>(StorageService.getGamification());
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [lifeScore, setLifeScore] = useState<LifeScoreBreakdown>({
    overall: 79,
    health: 76,
    productivity: 82,
    finance: 80,
    mind: 74,
    social: 75,
    trendChange: 3.4,
  });

  // Explainability Modal State
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [explainData, setExplainData] = useState<ExplainabilityDetails | null>(null);
  const [isExplainLoading, setIsExplainLoading] = useState(false);

  // Load state from StorageService
  const loadAllState = () => {
    const storedLogs = StorageService.getLogs();
    const storedGoals = StorageService.getGoals();
    const storedTasks = StorageService.getTasks();
    const storedHabits = StorageService.getHabits();
    const storedProfile = StorageService.getProfile();
    const storedGamification = StorageService.getGamification();
    const storedInsights = StorageService.getInsights();

    setLogs(storedLogs);
    setGoals(storedGoals);
    setTasks(storedTasks);
    setHabits(storedHabits);
    setProfile(storedProfile);
    setGamification(storedGamification);
    setInsights(storedInsights);

    const calculatedScore = calculateLifeScore(storedLogs);
    setLifeScore(calculatedScore);
  };

  useEffect(() => {
    loadAllState();
  }, []);

  const handleLaunchApp = () => {
    localStorage.setItem('lifeos_has_launched', 'true');
    setInApp(true);
    setCurrentTab('dashboard');
  };

  const handleResetData = () => {
    StorageService.resetDemoData();
    loadAllState();
    setCurrentTab('dashboard');
  };

  // Trigger Explainability breakdown with AI reasoning from backend
  const handleOpenExplain = async (details: ExplainabilityDetails) => {
    setExplainData(details);
    setExplainModalOpen(true);
    setIsExplainLoading(true);

    try {
      const serverExplanation = await ApiService.getExplainability(
        details.itemType,
        details.title,
        details.metricData || {},
        { lifeScore: lifeScore.overall, chronotype: profile.chronotype }
      );

      if (serverExplanation && serverExplanation.summary) {
        setExplainData({
          ...details,
          summary: serverExplanation.summary,
          keyDrivers: serverExplanation.keyDrivers || details.keyDrivers,
          confidenceScore: serverExplanation.confidenceScore || details.confidenceScore,
          whatChangesOutcome: serverExplanation.whatChangesOutcome || details.whatChangesOutcome,
          recommendedCounterAction: serverExplanation.recommendedCounterAction || details.recommendedCounterAction,
        });
      }
    } catch (err) {
      console.warn('Explain modal fetch fallback', err);
    } finally {
      setIsExplainLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find((l) => l.date === todayStr);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* If Landing Page mode is active */}
      {!inApp ? (
        <>
          <header className="w-full glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-mono tracking-tight text-white">
                Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">OS</span>
              </span>
            </div>
            <button
              onClick={handleLaunchApp}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all"
            >
              Enter Dashboard ➔
            </button>
          </header>
          <main className="flex-1">
            <LandingPage onLaunch={handleLaunchApp} />
          </main>
        </>
      ) : (
        <>
          {/* Main App Bar */}
          <Navbar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            lifeScore={lifeScore.overall}
            gamification={gamification}
            onOpenCheckIn={() => setCurrentTab('checkin')}
          />

          {/* Sub Navigation Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {currentTab === 'dashboard' && (
              <Dashboard
                logs={logs}
                lifeScore={lifeScore}
                goals={goals}
                tasks={tasks}
                onOpenExplain={handleOpenExplain}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'checkin' && (
              <DailyCheckin
                todayLog={todayLog}
                habits={habits}
                onComplete={() => {
                  loadAllState();
                  setCurrentTab('dashboard');
                }}
                onCancel={() => setCurrentTab('dashboard')}
              />
            )}

            {currentTab === 'goals' && (
              <GoalsPage
                goals={goals}
                onUpdateGoals={(updated) => setGoals(updated)}
                onOpenExplain={handleOpenExplain}
              />
            )}

            {currentTab === 'planner' && (
              <PlannerPage
                tasks={tasks}
                goals={goals}
                onUpdateTasks={(updated) => setTasks(updated)}
                onOpenExplain={handleOpenExplain}
              />
            )}

            {currentTab === 'insights' && (
              <InsightsPage
                insights={insights}
                logs={logs}
                onUpdateInsights={(updated) => setInsights(updated)}
                onOpenExplain={handleOpenExplain}
              />
            )}

            {currentTab === 'predictions' && (
              <PredictionsPage
                logs={logs}
                onOpenExplain={handleOpenExplain}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                profile={profile}
                gamification={gamification}
                onUpdateProfile={(updated) => setProfile(updated)}
                onResetData={handleResetData}
                onRefreshAll={loadAllState}
              />
            )}
          </main>

          {/* Persistent Jarvis AI Assistant available across every view */}
          <JarvisWidget onRefreshData={loadAllState} />

          {/* Global Explainability ("Why?") Modal */}
          <ExplainModal
            isOpen={explainModalOpen}
            onClose={() => setExplainModalOpen(false)}
            data={explainData}
            isLoading={isExplainLoading}
          />
        </>
      )}
    </div>
  );
}
