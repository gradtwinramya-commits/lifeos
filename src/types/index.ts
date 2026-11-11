export interface DailyLog {
  date: string; // YYYY-MM-DD
  sleepHours: number;
  mood: number; // 1-5
  energy: number; // 1-5
  workout: boolean;
  workoutType?: string;
  workoutMinutes?: number;
  spend: number;
  focusHours: number;
  habitsCompleted: string[]; // habit IDs
  notes?: string;
}

export interface LifeScoreBreakdown {
  overall: number; // 0-100
  health: number; // 0-100
  productivity: number; // 0-100
  finance: number; // 0-100
  mind: number; // 0-100
  social: number; // 0-100
  trendChange: number; // vs previous 7-day period (e.g. +3.4)
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Health' | 'Productivity' | 'Finance' | 'Mind' | 'Habit';
  target: number;
  current: number;
  unit: string;
  deadline: string; // YYYY-MM-DD
  milestones: GoalMilestone[];
  status: 'on_track' | 'at_risk' | 'off_track';
  statusReason: string;
  completionOdds: number; // 0-100%
  completed?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  timeSlot?: string;
  category: 'Productivity' | 'Health' | 'Mind' | 'Finance' | 'Social';
  durationMinutes: number;
  energyRequired: 'Peak' | 'High' | 'Medium' | 'Low';
  completed: boolean;
  reason?: string;
}

export interface Habit {
  id: string;
  name: string;
  category: 'Health' | 'Productivity' | 'Mind' | 'Finance' | 'Social';
  icon: string;
  targetDaysPerWeek: number;
}

export interface InsightItem {
  id: string;
  title: string;
  category: 'Health' | 'Productivity' | 'Finance' | 'Mind' | 'Social';
  description: string;
  confidence: number; // 0-100%
  dataPointsCount: number;
  correlation: number; // -1 to 1
  statSnippet: string;
  actionableTip: string;
}

export interface PredictionMetric {
  id: string;
  title: string;
  currentValue: number;
  predictedValue: number;
  riskLevel: 'low' | 'moderate' | 'high';
  timeframe: string;
  confidence: number;
  summary: string;
  whatChangesOutcome: string;
  historicalTrend: { date: string; actual: number; predicted?: number; upper?: number; lower?: number }[];
}

export interface ExplainabilityDetails {
  title: string;
  itemType: 'prediction' | 'recommendation' | 'insight' | 'goal_status';
  summary: string;
  keyDrivers: string[];
  confidenceScore: number;
  whatChangesOutcome: string;
  recommendedCounterAction?: string;
  metricData?: Record<string, any>;
}

export interface UserProfile {
  name: string;
  chronotype: 'Early Bird' | 'Night Owl' | 'Biphasic' | 'Flexible';
  targetSleep: number;
  targetFocus: number;
  dailyBudget: number;
  primaryGoal: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  unlocked: boolean;
}

export interface GamificationState {
  xp: number;
  level: number;
  streakDays: number;
  badges: Badge[];
  recentXpGained?: number;
}
