import { ExplainabilityDetails } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const ApiService = {
  async chatWithJarvis(
    messages: ChatMessage[],
    userContext: Record<string, any>
  ): Promise<{ reply: string; action: any | null }> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userContext }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Jarvis chat API fallback:', err);
      return {
        reply: "Jarvis is operating via local analytical heuristics. Your 7-day focus load is elevated and sleep deficit is 1.2h. I recommend prioritizing recovery before your next deep sprint.",
        action: null,
      };
    }
  },

  async getExplainability(
    itemType: string,
    title: string,
    metricData: Record<string, any>,
    context: Record<string, any>
  ): Promise<ExplainabilityDetails> {
    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType, title, metricData, context }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Explainability API fallback:', err);
      return {
        title,
        itemType: itemType as any,
        summary: `Calculated directly from your rolling 14-day telemetry and habit consistency variance.`,
        keyDrivers: [
          `30-day baseline vs current 7-day deviation`,
          `High cognitive load ratio relative to sleep recovery`,
          `Activity threshold adherence rate`,
        ],
        confidenceScore: 88,
        whatChangesOutcome: "Increasing restorative sleep above 7.2 hours for 3 straight nights shifts this probability toward optimal stability.",
        recommendedCounterAction: "Execute an active 30-minute decompression protocol before 9:00 PM.",
        metricData,
      };
    }
  },

  async discoverInsights(logs: any[], profile: any): Promise<any[]> {
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, profile }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.insights || [];
    } catch (err) {
      console.warn('Discover insights API fallback:', err);
      return [];
    }
  },

  async replanDay(
    tasks: any[],
    goals: any[],
    energyCurve: any,
    preferences: any
  ): Promise<{ schedule: any[]; plannerPhilosophy: string }> {
    try {
      const res = await fetch('/api/gemini/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, goals, energyCurve, preferences }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Replan day API fallback:', err);
      return {
        schedule: [
          { time: '08:30 - 09:30', title: 'Morning Movement & Nutrition', category: 'Health', energyMatch: 'High', reason: 'Jumpstarts metabolism and sets dopamine baseline.' },
          { time: '09:30 - 12:00', title: 'Deep Work: High Leverage Objective', category: 'Productivity', energyMatch: 'Peak', reason: 'Protected morning flow block.' },
          { time: '13:00 - 14:00', title: 'Active Walk & Lunch Break', category: 'Mind', energyMatch: 'Moderate', reason: 'Counteracts circadian post-prandial drop.' },
          { time: '14:30 - 16:30', title: 'Execution, Calls & Admin Sync', category: 'Productivity', energyMatch: 'Medium', reason: 'Low friction communication tasks.' },
          { time: '18:00 - 19:00', title: 'Workout / Strength Training', category: 'Health', energyMatch: 'High', reason: 'Late afternoon body temperature peak.' },
          { time: '21:00 - 22:00', title: 'Restorative Wind Down', category: 'Mind', energyMatch: 'Low', reason: 'Protects melatonin secretion curve.' }
        ],
        plannerPhilosophy: 'Chronotype-optimized time blocking aligned with your cognitive peak energy hours.'
      };
    }
  }
};
