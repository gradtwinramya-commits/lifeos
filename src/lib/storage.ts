import { DailyLog, Goal, TaskItem, Habit, UserProfile, GamificationState, InsightItem } from '../types';
import { generate30DaysDemoData, DEFAULT_HABITS, DEFAULT_BADGES } from './analytics';

const STORAGE_KEYS = {
  LOGS: 'lifeos_daily_logs_v1',
  GOALS: 'lifeos_goals_v1',
  TASKS: 'lifeos_tasks_v1',
  HABITS: 'lifeos_habits_v1',
  PROFILE: 'lifeos_user_profile_v1',
  GAMIFICATION: 'lifeos_gamification_v1',
  INSIGHTS: 'lifeos_insights_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Mercer',
  chronotype: 'Early Bird',
  targetSleep: 8.0,
  targetFocus: 5.0,
  dailyBudget: 50,
  primaryGoal: 'Scale startup architecture & build endurance',
};

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Run First Half-Marathon (21.1 km)',
    category: 'Health',
    target: 21,
    current: 16.5,
    unit: 'km',
    deadline: '2026-12-15',
    status: 'on_track',
    statusReason: 'Pacing at 108% of target weekly mileage. Projected completion 6 days ahead of schedule.',
    completionOdds: 84,
    milestones: [
      { id: 'm1', title: '5km continuous run', completed: true },
      { id: 'm2', title: '10km sub-55min tempo', completed: true },
      { id: 'm3', title: '15km long weekend run', completed: true },
      { id: 'm4', title: '21.1km race test', completed: false },
    ],
  },
  {
    id: 'g2',
    title: 'Ship LifeOS v2.0 Platform Architecture',
    category: 'Productivity',
    target: 100,
    current: 68,
    unit: '%',
    deadline: '2026-11-28',
    status: 'at_risk',
    statusReason: 'Recent cognitive crunch slowed code review throughput. Requires +1.2h focused coding block daily.',
    completionOdds: 62,
    milestones: [
      { id: 'm5', title: 'Core analytics math engine', completed: true },
      { id: 'm6', title: 'Gemini server-side bridge', completed: true },
      { id: 'm7', title: 'Predictive forecasting visualization', completed: true },
      { id: 'm8', title: 'End-to-end stress testing', completed: false },
    ],
  },
  {
    id: 'g3',
    title: 'Emergency Reserve Fund Growth',
    category: 'Finance',
    target: 10000,
    current: 8400,
    unit: '$',
    deadline: '2026-12-31',
    status: 'on_track',
    statusReason: 'Consistent weekly surplus from staying under daily discretionary budget.',
    completionOdds: 92,
    milestones: [
      { id: 'm9', title: '$2,500 initial milestone', completed: true },
      { id: 'm10', title: '$5,000 baseline milestone', completed: true },
      { id: 'm11', title: '$7,500 security cushion', completed: true },
      { id: 'm12', title: '$10,000 target liquidity', completed: false },
    ],
  },
  {
    id: 'g4',
    title: 'Cognitive Reset & 30-Day Mindfulness',
    category: 'Mind',
    target: 30,
    current: 19,
    unit: 'days',
    deadline: '2026-11-30',
    status: 'at_risk',
    statusReason: 'Missed 3 sessions during midweek sprint crunch.',
    completionOdds: 58,
    milestones: [
      { id: 'm13', title: '7 consecutive mornings', completed: true },
      { id: 'm14', title: '14 consecutive mornings', completed: true },
      { id: 'm15', title: '21 consecutive mornings', completed: false },
      { id: 'm16', title: '30 consecutive mornings', completed: false },
    ],
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Deep Architecture Design: Neural Memory Layer',
    timeSlot: '09:00 - 11:30',
    category: 'Productivity',
    durationMinutes: 150,
    energyRequired: 'Peak',
    completed: true,
    reason: 'Scheduled during morning cognitive peak based on 30-day focus telemetry.',
  },
  {
    id: 't2',
    title: 'Zone 2 Cardio / 45m Endurance Run',
    timeSlot: '12:00 - 12:45',
    category: 'Health',
    durationMinutes: 45,
    energyRequired: 'High',
    completed: false,
    reason: 'Breaks cognitive fatigue before afternoon slump.',
  },
  {
    id: 't3',
    title: 'Sprint Pull Request Review & Team Sync',
    timeSlot: '14:00 - 15:00',
    category: 'Productivity',
    durationMinutes: 60,
    energyRequired: 'Medium',
    completed: false,
    reason: 'Interactive communication task suited for post-lunch energy curve.',
  },
  {
    id: 't4',
    title: 'Finance & Weekly Discretionary Budget Reconciliation',
    timeSlot: '17:00 - 17:30',
    category: 'Finance',
    durationMinutes: 30,
    energyRequired: 'Medium',
    completed: false,
    reason: 'Low cognitive resistance task before evening wind-down.',
  },
  {
    id: 't5',
    title: 'Evening Digital Sunset & Reading (30m)',
    timeSlot: '21:00 - 21:45',
    category: 'Mind',
    durationMinutes: 45,
    energyRequired: 'Low',
    completed: false,
    reason: 'Reduces blue light exposure; proven to protect next-day focus (+31%).',
  },
];

const DEFAULT_INSIGHTS: InsightItem[] = [
  {
    id: 'ins-1',
    title: 'Sleep Under 6.5h Drops Next-Day Focus by 31%',
    category: 'Productivity',
    description: 'On days you sleep less than 6.5 hours, your deep focus sessions drop by an average of 1.7 hours the following afternoon, with double the context switching.',
    confidence: 93,
    dataPointsCount: 22,
    correlation: -0.68,
    statSnippet: 'Sleep < 6.5h -> Focus -31%',
    actionableTip: 'Shift your evening wind-down 45 minutes earlier to guarantee a 7.5h sleep window.'
  },
  {
    id: 'ins-2',
    title: 'Morning Workouts Elevate Daily Energy by +24%',
    category: 'Health',
    description: 'Logging exercise before 10:00 AM correlates with an average 4.4 / 5.0 daily vitality score, vs 3.2 on sedentary days.',
    confidence: 89,
    dataPointsCount: 16,
    correlation: 0.74,
    statSnippet: 'Morning Workout -> +24% Energy',
    actionableTip: 'Keep your running gear laid out the night before for friction-free morning starts.'
  },
  {
    id: 'ins-3',
    title: 'Work Past 9:00 PM Escalates Next-Day Burnout Odds',
    category: 'Mind',
    description: 'Deep work sessions extending past 9:00 PM increase cortisol latency, adding an average 42 minutes to sleep onset.',
    confidence: 86,
    dataPointsCount: 19,
    correlation: 0.62,
    statSnippet: 'Work > 9 PM -> Latency +42m',
    actionableTip: 'Establish a strict digital cut-off alarm at 8:45 PM.'
  },
  {
    id: 'ins-4',
    title: 'High Discretionary Spending Correlates with Fatigue Days',
    category: 'Finance',
    description: 'Days where energy is logged <= 2 show a 2.4x spike in convenience spending ($65 vs $27 baseline).',
    confidence: 82,
    dataPointsCount: 14,
    correlation: -0.58,
    statSnippet: 'Fatigue Days -> 2.4x Spend Spike',
    actionableTip: 'Pre-plan high-protein meals so fatigue does not drive reactive delivery orders.'
  }
];

const DEFAULT_GAMIFICATION: GamificationState = {
  xp: 1420,
  level: 4,
  streakDays: 12,
  badges: DEFAULT_BADGES,
};

export const StorageService = {
  getLogs(): DailyLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      const initialLogs = generate30DaysDemoData();
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return generate30DaysDemoData();
    }
  },

  saveLogs(logs: DailyLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  addOrUpdateLog(log: DailyLog): void {
    const logs = this.getLogs();
    const existingIndex = logs.findIndex(l => l.date === log.date);
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
      logs.sort((a, b) => a.date.localeCompare(b.date));
    }
    this.saveLogs(logs);
  },

  getGoals(): Goal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
      return DEFAULT_GOALS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_GOALS;
    }
  },

  saveGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getTasks(): TaskItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TASKS;
    }
  },

  saveTasks(tasks: TaskItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getHabits(): Habit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(DEFAULT_HABITS));
      return DEFAULT_HABITS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_HABITS;
    }
  },

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getGamification(): GamificationState {
    const raw = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(DEFAULT_GAMIFICATION));
      return DEFAULT_GAMIFICATION;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_GAMIFICATION;
    }
  },

  saveGamification(state: GamificationState): void {
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(state));
  },

  addXp(amount: number): { newXp: number; newLevel: number; leveledUp: boolean } {
    const current = this.getGamification();
    const newXp = current.xp + amount;
    // Level calculation: Each level takes 400 XP
    const newLevel = Math.floor(newXp / 400) + 1;
    const leveledUp = newLevel > current.level;

    const updated: GamificationState = {
      ...current,
      xp: newXp,
      level: newLevel,
      recentXpGained: amount,
    };
    this.saveGamification(updated);
    return { newXp, newLevel, leveledUp };
  },

  getInsights(): InsightItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(DEFAULT_INSIGHTS));
      return DEFAULT_INSIGHTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_INSIGHTS;
    }
  },

  saveInsights(insights: InsightItem[]): void {
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(insights));
  },

  resetDemoData(): void {
    const freshLogs = generate30DaysDemoData();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(freshLogs));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(DEFAULT_HABITS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(DEFAULT_GAMIFICATION));
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(DEFAULT_INSIGHTS));
  },

  exportAllData(): string {
    const data = {
      version: 'LifeOS-1.0',
      exportedAt: new Date().toISOString(),
      logs: this.getLogs(),
      goals: this.getGoals(),
      tasks: this.getTasks(),
      habits: this.getHabits(),
      profile: this.getProfile(),
      gamification: this.getGamification(),
      insights: this.getInsights(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs));
      if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
      if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
      if (data.habits) localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(data.habits));
      if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
      if (data.gamification) localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(data.gamification));
      if (data.insights) localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(data.insights));
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }
};
