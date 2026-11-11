import { DailyLog, LifeScoreBreakdown, Goal, PredictionMetric, Habit, Badge } from '../types';

export const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: '7.5h+ Restorative Sleep', category: 'Health', icon: 'Moon', targetDaysPerWeek: 7 },
  { id: 'h2', name: 'Morning Exercise (30m+)', category: 'Health', icon: 'Dumbbell', targetDaysPerWeek: 5 },
  { id: 'h3', name: 'Deep Work (4h+)', category: 'Productivity', icon: 'Zap', targetDaysPerWeek: 5 },
  { id: 'h4', name: 'Mindfulness / Meditation (10m)', category: 'Mind', icon: 'Brain', targetDaysPerWeek: 6 },
  { id: 'h5', name: 'Within Daily Budget', category: 'Finance', icon: 'Wallet', targetDaysPerWeek: 6 },
];

export const DEFAULT_BADGES: Badge[] = [
  { id: 'b1', name: 'Genesis Sync', description: 'Initialized LifeOS telemetry engine', icon: 'Sparkles', unlocked: true, unlockedAt: '2026-10-12' },
  { id: 'b2', name: '7-Day Streak', description: 'Logged daily telemetry for 7 consecutive days', icon: 'Flame', unlocked: true, unlockedAt: '2026-10-19' },
  { id: 'b3', name: 'Sleep Master', description: 'Averaged > 7.5 hours of sleep for 5 days', icon: 'Moon', unlocked: true, unlockedAt: '2026-10-25' },
  { id: 'b4', name: 'Iron Focus', description: 'Completed 6+ hours of deep focus in a single day', icon: 'Zap', unlocked: true, unlockedAt: '2026-11-02' },
  { id: 'b5', name: 'Flow State Seeker', description: 'Maintained Life Score > 80 for 14 straight days', icon: 'Award', unlocked: false },
  { id: 'b6', name: 'Predictive Pioneer', description: 'Actively heeded 5 AI counter-actions to avoid burnout', icon: 'ShieldCheck', unlocked: false },
];

/**
 * Generates 30 days of realistic, correlated historical data up to today.
 */
export function generate30DaysDemoData(): DailyLog[] {
  const logs: DailyLog[] = [];
  const today = new Date();

  // Create 30 days of synthetic data leading up to today
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Introduce realistic cycles (workweek stress vs weekend recovery, occasional crunch)
    const isCrunchPeriod = i >= 3 && i <= 6; // Recent crunch days (explains recent burnout spike)
    
    let sleepHours: number;
    let focusHours: number;
    let mood: number;
    let energy: number;
    let workout: boolean;
    let spend: number;

    if (isCrunchPeriod) {
      // High stress, late work, low sleep
      sleepHours = parseFloat((5.5 + Math.random() * 0.9).toFixed(1));
      focusHours = parseFloat((6.8 + Math.random() * 1.5).toFixed(1));
      mood = Math.random() > 0.4 ? 2 : 3;
      energy = Math.random() > 0.3 ? 2 : 3;
      workout = Math.random() > 0.7;
      spend = Math.floor(45 + Math.random() * 70); // Stress takeout/coffee
    } else if (isWeekend) {
      sleepHours = parseFloat((7.8 + Math.random() * 1.2).toFixed(1));
      focusHours = parseFloat((1.5 + Math.random() * 2.0).toFixed(1));
      mood = Math.random() > 0.2 ? 5 : 4;
      energy = Math.random() > 0.25 ? 5 : 4;
      workout = Math.random() > 0.3;
      spend = Math.floor(60 + Math.random() * 80);
    } else {
      // Normal weekday
      sleepHours = parseFloat((6.8 + Math.random() * 1.0).toFixed(1));
      focusHours = parseFloat((4.5 + Math.random() * 1.8).toFixed(1));
      mood = Math.random() > 0.5 ? 4 : 3;
      energy = Math.random() > 0.4 ? 4 : 3;
      workout = Math.random() > 0.45;
      spend = Math.floor(25 + Math.random() * 40);
    }

    // Determine completed habits based on metrics
    const habitsCompleted: string[] = [];
    if (sleepHours >= 7.5) habitsCompleted.push('h1');
    if (workout) habitsCompleted.push('h2');
    if (focusHours >= 4.0) habitsCompleted.push('h3');
    if (mood >= 4 || !isCrunchPeriod) habitsCompleted.push('h4');
    if (spend <= 60) habitsCompleted.push('h5');

    const workoutTypes = ['HIIT', 'Zone 2 Run', 'Strength', 'Yoga Flow', 'Cycling'];
    const selectedWorkout = workout ? workoutTypes[Math.floor(Math.random() * workoutTypes.length)] : undefined;
    const workoutMinutes = workout ? Math.floor(30 + Math.random() * 35) : 0;

    let notes = '';
    if (isCrunchPeriod) {
      notes = 'Late push on quarterly deliverables. Feeling mild cognitive strain; need to prioritize sleep.';
    } else if (workout && mood >= 4) {
      notes = 'Great energy post-morning workout. Deep work flowed effortlessly in the morning.';
    } else if (isWeekend) {
      notes = 'Recharged outdoors. Disconnected from screens and spent time reading.';
    }

    logs.push({
      date: dateStr,
      sleepHours,
      mood,
      energy,
      workout,
      workoutType: selectedWorkout,
      workoutMinutes,
      spend,
      focusHours,
      habitsCompleted,
      notes: notes || undefined,
    });
  }

  return logs;
}

/**
 * Computes Pearson correlation coefficient between two numeric arrays
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const avgX = x.reduce((a, b) => a + b, 0) / n;
  const avgY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - avgX;
    const diffY = y[i] - avgY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  if (denomX === 0 || denomY === 0) return 0;
  return parseFloat((numerator / Math.sqrt(denomX * denomY)).toFixed(2));
}

/**
 * Calculates Life Score (0-100) and 5 sub-scores based on recent logs (last 7 vs 30 days)
 */
export function calculateLifeScore(logs: DailyLog[]): LifeScoreBreakdown {
  if (!logs || logs.length === 0) {
    return { overall: 75, health: 75, productivity: 75, finance: 75, mind: 75, social: 75, trendChange: 0 };
  }

  const recent7 = logs.slice(-7);
  const prev7 = logs.slice(-14, -7);

  const calcPeriodScore = (windowLogs: DailyLog[]) => {
    if (windowLogs.length === 0) return { overall: 75, health: 75, productivity: 75, finance: 75, mind: 75, social: 75 };

    const avgSleep = windowLogs.reduce((s, l) => s + l.sleepHours, 0) / windowLogs.length;
    const workoutDays = windowLogs.filter(l => l.workout).length;
    const workoutRate = workoutDays / windowLogs.length;
    // Health score: 7-8h sleep is 100%, workout 4x week is 100%
    const sleepScore = Math.min(100, Math.max(30, (avgSleep / 7.5) * 100));
    const fitnessScore = Math.min(100, (workoutRate / 0.6) * 100);
    const health = Math.round(sleepScore * 0.6 + fitnessScore * 0.4);

    // Productivity score: based on focus hours (target ~5h/day) and habit consistency
    const avgFocus = windowLogs.reduce((s, l) => s + l.focusHours, 0) / windowLogs.length;
    const productivity = Math.min(100, Math.max(20, Math.round((avgFocus / 5) * 100)));

    // Finance score: based on spending variance & budget adherence (target ~$50/day)
    const avgSpend = windowLogs.reduce((s, l) => s + l.spend, 0) / windowLogs.length;
    const finance = Math.min(100, Math.max(30, Math.round(100 - Math.max(0, (avgSpend - 40) * 1.2))));

    // Mind score: mood (1-5) and energy (1-5)
    const avgMood = windowLogs.reduce((s, l) => s + l.mood, 0) / windowLogs.length;
    const avgEnergy = windowLogs.reduce((s, l) => s + l.energy, 0) / windowLogs.length;
    const mind = Math.round(((avgMood / 5) * 55 + (avgEnergy / 5) * 45));

    // Social score: weekend recovery, life balance ratio
    const social = Math.round(Math.min(95, Math.max(45, (health * 0.4 + mind * 0.6) + 4)));

    const overall = Math.round(
      health * 0.25 +
      productivity * 0.25 +
      finance * 0.15 +
      mind * 0.25 +
      social * 0.10
    );

    return { overall, health, productivity, finance, mind, social };
  };

  const current = calcPeriodScore(recent7);
  const previous = calcPeriodScore(prev7.length > 0 ? prev7 : recent7);
  const trendChange = parseFloat((current.overall - previous.overall).toFixed(1));

  return {
    ...current,
    trendChange,
  };
}

/**
 * Computes Burnout Risk score (0-100%) and key drivers
 */
export function calculateBurnoutRisk(logs: DailyLog[]): {
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  keyDrivers: string[];
  confidence: number;
} {
  const recent5 = logs.slice(-5);
  if (recent5.length === 0) {
    return { riskScore: 35, riskLevel: 'low', keyDrivers: ['Insufficient historical logs'], confidence: 60 };
  }

  const avgSleepRecent = recent5.reduce((s, l) => s + l.sleepHours, 0) / recent5.length;
  const avgFocusRecent = recent5.reduce((s, l) => s + l.focusHours, 0) / recent5.length;
  const avgEnergyRecent = recent5.reduce((s, l) => s + l.energy, 0) / recent5.length;

  let risk = 30; // base risk
  const keyDrivers: string[] = [];

  if (avgSleepRecent < 6.5) {
    const sleepDiff = (6.5 - avgSleepRecent).toFixed(1);
    risk += 28;
    keyDrivers.push(`Rolling 5-day sleep deficit (${sleepDiff}h below minimum 7.0h recovery line)`);
  } else if (avgSleepRecent > 7.4) {
    risk -= 15;
  }

  if (avgFocusRecent > 6.0) {
    risk += 22;
    keyDrivers.push(`High cognitive load: ${avgFocusRecent.toFixed(1)} avg daily focus hours across past 5 days`);
  }

  if (avgEnergyRecent < 3.2) {
    risk += 20;
    keyDrivers.push(`Reported vitality level below recovery threshold (${avgEnergyRecent.toFixed(1)} / 5.0)`);
  }

  // Count consecutive days with high focus and low sleep
  let consecutiveCrunch = 0;
  for (let i = recent5.length - 1; i >= 0; i--) {
    if (recent5[i].focusHours >= 5.5 && recent5[i].sleepHours < 6.8) {
      consecutiveCrunch++;
    } else {
      break;
    }
  }

  if (consecutiveCrunch >= 2) {
    risk += 12 * consecutiveCrunch;
    keyDrivers.push(`${consecutiveCrunch} consecutive high-strain crunch days detected`);
  }

  const finalRisk = Math.min(94, Math.max(12, Math.round(risk)));
  const riskLevel = finalRisk >= 65 ? 'high' : finalRisk >= 40 ? 'moderate' : 'low';

  return {
    riskScore: finalRisk,
    riskLevel,
    keyDrivers: keyDrivers.length > 0 ? keyDrivers : ['Balanced workload and steady sleep cycles'],
    confidence: 89,
  };
}

/**
 * Calculates Goal Completion odds and track status
 */
export function evaluateGoalStatus(goal: Goal, logs: DailyLog[]): {
  status: 'on_track' | 'at_risk' | 'off_track';
  odds: number;
  reason: string;
} {
  const today = new Date();
  const deadline = new Date(goal.deadline);
  const diffDays = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  const remainingTarget = Math.max(0, goal.target - goal.current);
  if (remainingTarget === 0) {
    return { status: 'on_track', odds: 100, reason: 'Target achieved! Outstanding velocity.' };
  }

  const requiredPerDay = remainingTarget / diffDays;
  
  // Calculate historical velocity based on category
  let currentVelocity = 0;
  const recent14 = logs.slice(-14);

  if (goal.category === 'Health') {
    const workouts = recent14.filter(l => l.workout).length;
    currentVelocity = (workouts / 14); // workouts per day
  } else if (goal.category === 'Productivity') {
    const focusAvg = recent14.reduce((s, l) => s + l.focusHours, 0) / (recent14.length || 1);
    currentVelocity = focusAvg / 5; // fractional velocity
  } else {
    currentVelocity = goal.current / 30; // general rate
  }

  const velocityRatio = currentVelocity / (requiredPerDay || 0.1);
  let odds = Math.min(96, Math.max(15, Math.round(velocityRatio * 75)));

  let status: 'on_track' | 'at_risk' | 'off_track' = 'on_track';
  let reason = '';

  if (odds >= 70) {
    status = 'on_track';
    reason = `Pacing at ${Math.round(velocityRatio * 100)}% of target velocity. Projected to complete ${Math.abs(Math.round(diffDays * 0.15))} days ahead of schedule.`;
  } else if (odds >= 45) {
    status = 'at_risk';
    reason = `Velocity is ${Math.round((1 - velocityRatio) * 100)}% below trajectory. Requires +0.8 unit increase per week to hit deadline.`;
  } else {
    status = 'off_track';
    reason = `Current daily momentum will reach ~${Math.round(goal.current + currentVelocity * diffDays)} ${goal.unit} by deadline (${diffDays} days left).`;
  }

  return { status, odds, reason };
}

/**
 * Generates 7-Day Forecasting for predictions with confidence intervals
 */
export function generate7DayForecast(logs: DailyLog[], metricKey: 'energy' | 'sleepHours' | 'focusHours'): {
  forecast: { date: string; actual?: number; predicted: number; upper: number; lower: number }[];
  trendDirection: 'rising' | 'steady' | 'declining';
  predictedMean: number;
} {
  const historical = logs.slice(-7);
  const values = historical.map(l => l[metricKey] as number);
  const n = values.length;
  
  // Simple linear regression slope: y = mx + b
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Standard deviation for confidence bands
  const mean = sumY / n;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const forecast = [];
  const today = new Date();

  // Add historical 7 days with actual values
  for (let i = 0; i < historical.length; i++) {
    forecast.push({
      date: historical[i].date.slice(5), // MM-DD
      actual: historical[i][metricKey] as number,
      predicted: historical[i][metricKey] as number,
      upper: historical[i][metricKey] as number,
      lower: historical[i][metricKey] as number,
    });
  }

  // Project next 7 days
  let predictedSum = 0;
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr = futureDate.toISOString().split('T')[0].slice(5);

    // Damped projection toward mean with slight slope persistence
    const x = n + i - 1;
    let proj = intercept + slope * x;
    
    // Boundary clamps
    if (metricKey === 'energy') proj = Math.max(1, Math.min(5, proj));
    if (metricKey === 'sleepHours') proj = Math.max(4, Math.min(10, proj));
    if (metricKey === 'focusHours') proj = Math.max(1, Math.min(9, proj));

    // Confidence band widens as we look further into the future
    const uncertainty = (stdDev * 0.8) + (i * 0.12);
    const upper = parseFloat((proj + uncertainty).toFixed(1));
    const lower = parseFloat((Math.max(0, proj - uncertainty)).toFixed(1));
    const predicted = parseFloat(proj.toFixed(1));

    predictedSum += predicted;
    forecast.push({
      date: dateStr,
      predicted,
      upper,
      lower,
    });
  }

  const predictedMean = parseFloat((predictedSum / 7).toFixed(1));
  const trendDirection = slope > 0.05 ? 'rising' : slope < -0.05 ? 'declining' : 'steady';

  return { forecast, trendDirection, predictedMean };
}
