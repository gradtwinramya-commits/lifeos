import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  Flame, 
  Brain,
  RotateCcw,
  Check
} from 'lucide-react';
import { TaskItem, Goal, ExplainabilityDetails } from '../types';
import { StorageService } from '../lib/storage';
import { ApiService } from '../lib/api';

interface PlannerPageProps {
  tasks: TaskItem[];
  goals: Goal[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onOpenExplain: (details: ExplainabilityDetails) => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({
  tasks,
  goals,
  onUpdateTasks,
  onOpenExplain,
}) => {
  const [isReplanning, setIsReplanning] = useState(false);
  const [plannerPhilosophy, setPlannerPhilosophy] = useState(
    'Chronotype-synchronized block scheduling: Heavy cognitive loads reserved for morning peak energy, active recovery in late afternoon.'
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Productivity' | 'Health' | 'Mind' | 'Finance' | 'Social'>('Productivity');
  const [newTaskDuration, setNewTaskDuration] = useState(45);
  const [newTaskEnergy, setNewTaskEnergy] = useState<'Peak' | 'High' | 'Medium' | 'Low'>('High');
  const [showAddForm, setShowAddForm] = useState(false);
  const [rewardNotice, setRewardNotice] = useState<string | null>(null);

  const profile = StorageService.getProfile();

  const handleToggleTask = (task: TaskItem) => {
    const updated = tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t));
    onUpdateTasks(updated);
    StorageService.saveTasks(updated);

    if (!task.completed) {
      // Reward +25 XP
      StorageService.addXp(25);
      setRewardNotice(`+25 XP: "${task.title}" completed!`);
      setTimeout(() => setRewardNotice(null), 2500);
    }
  };

  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTasks.length) return;

    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;

    onUpdateTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      durationMinutes: newTaskDuration,
      energyRequired: newTaskEnergy,
      completed: false,
      reason: `Manually added to your ${newTaskEnergy.toLowerCase()} energy block`,
    };

    const updated = [...tasks, task];
    onUpdateTasks(updated);
    StorageService.saveTasks(updated);

    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const handleReplanDay = async () => {
    setIsReplanning(true);
    try {
      const result = await ApiService.replanDay(
        tasks,
        goals,
        { chronotype: profile.chronotype, peak: '09:00 - 12:00', slump: '13:30 - 15:30' },
        { targetFocus: profile.targetFocus }
      );

      if (result.schedule && result.schedule.length > 0) {
        setPlannerPhilosophy(result.plannerPhilosophy || 'Schedule re-synchronized with your circadian curve.');

        // Re-map existing tasks with new time slots & reasons
        const remapped: TaskItem[] = result.schedule.map((slot: any, idx: number) => ({
          id: `t-plan-${Date.now()}-${idx}`,
          title: slot.title,
          timeSlot: slot.time,
          category: slot.category || 'Productivity',
          durationMinutes: 45,
          energyRequired: slot.energyMatch || 'High',
          completed: false,
          reason: slot.reason,
        }));

        onUpdateTasks(remapped);
        StorageService.saveTasks(remapped);
      }
    } catch (err) {
      console.warn('Replan failed', err);
    } finally {
      setIsReplanning(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Circadian Sync Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-500/30">
              {profile.chronotype} Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
            Smart Productivity Planner
          </h1>
          <p className="text-xs text-slate-400">
            AI-sequenced daily schedule aligning cognitive strain with biological alertness curves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-white text-xs font-mono transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>

          <button
            onClick={handleReplanDay}
            disabled={isReplanning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold font-mono shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isReplanning ? 'animate-spin text-cyan-200' : ''}`} />
            <span>{isReplanning ? 'Re-planning Day...' : 'Re-plan My Day'}</span>
          </button>
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
        <Brain className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
            Daily Strategy Philosophy
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {plannerPhilosophy}
          </p>
        </div>
      </div>

      {/* Floating XP Notification */}
      <AnimatePresence>
        {rewardNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{rewardNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Form Drawer */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddTask}
            className="glass-panel-glow rounded-3xl p-6 border border-cyan-500/30 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-mono">Add Time Block / Task</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title or focus block description..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Health">Health</option>
                  <option value="Mind">Mind</option>
                  <option value="Finance">Finance</option>
                  <option value="Social">Social</option>
                </select>
              </div>

              <div>
                <select
                  value={newTaskEnergy}
                  onChange={(e) => setNewTaskEnergy(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Peak">Peak Energy Block</option>
                  <option value="High">High Energy</option>
                  <option value="Medium">Medium Energy</option>
                  <option value="Low">Low / Wind Down</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
            >
              Insert Schedule Block
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Chronotype Energy Curve Visualization */}
      <div className="glass-panel rounded-3xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Your Daily Circadian Energy Curve ({profile.chronotype})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">Biological Synchronization</span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-mono">
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
            <span className="text-[10px] text-cyan-400 block font-bold">08:00 - 12:00</span>
            <div className="text-white font-bold mt-1">Cognitive Peak</div>
            <span className="text-[10px] text-slate-400">Deep Work & Strategic Decisions</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/20">
            <span className="text-[10px] text-amber-400 block font-bold">12:30 - 15:30</span>
            <div className="text-white font-bold mt-1">Post-Lunch Slump</div>
            <span className="text-[10px] text-slate-400">Admin, Calls, Walking Break</span>
          </div>

          <div className="p-3 rounded-2xl bg-violet-950/40 border border-violet-500/30">
            <span className="text-[10px] text-violet-400 block font-bold">16:00 - 18:30</span>
            <div className="text-white font-bold mt-1">Physical / Second Peak</div>
            <span className="text-[10px] text-slate-400">Workouts & Execution Sprints</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-bold">20:00 - 22:30</span>
            <div className="text-white font-bold mt-1">Decompression</div>
            <span className="text-[10px] text-slate-400">Reading & Melatonin Protection</span>
          </div>
        </div>
      </div>

      {/* Tasks / Timeline Block List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>Daily Schedule Blocks ({tasks.length})</span>
          <span>Drag or use arrows to reorder</span>
        </div>

        {tasks.map((task, idx) => {
          const energyBadgeColor =
            task.energyRequired === 'Peak'
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
              : task.energyRequired === 'High'
              ? 'bg-violet-950/80 text-violet-300 border-violet-500/40'
              : task.energyRequired === 'Medium'
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              : 'bg-slate-900 text-slate-400 border-white/10';

          return (
            <motion.div
              key={task.id}
              layout
              className={`glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                task.completed ? 'border-emerald-500/30 opacity-70' : 'border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Complete checkbox */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`w-6 h-6 rounded-lg mt-0.5 shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                    task.completed ? 'bg-cyan-400 text-slate-950' : 'border border-white/20 hover:border-cyan-400'
                  }`}
                  aria-label="Toggle task"
                >
                  {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {task.timeSlot && (
                      <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.timeSlot}
                      </span>
                    )}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${energyBadgeColor}`}>
                      {task.energyRequired} Energy
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                      {task.category}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold text-white font-mono ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h4>

                  {task.reason && (
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {task.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons: Reorder & Why */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* Why Button */}
                <button
                  onClick={() =>
                    onOpenExplain({
                      title: `Schedule Block: ${task.title}`,
                      itemType: 'recommendation',
                      summary: task.reason || `Scheduled at this specific hour to match your ${task.energyRequired.toLowerCase()} biological energy profile.`,
                      keyDrivers: [
                        `Energy alignment: Requires ${task.energyRequired} cognitive output`,
                        `Circadian window match: Scheduled during optimal hormone and alertness state`,
                        `Prevents context switching with adjacent tasks`,
                      ],
                      confidenceScore: 91,
                      whatChangesOutcome: `Executing this during off-peak hours would take an estimated 35% longer to complete due to fatigue latency.`,
                      recommendedCounterAction: `Keep notifications muted during this block.`,
                      metricData: {
                        'Energy Match': task.energyRequired,
                        'Duration': `${task.durationMinutes} min`,
                        'Category': task.category,
                      },
                    })
                  }
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why?</span>
                </button>

                {/* Move Up */}
                <button
                  onClick={() => handleMoveTask(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 hover:bg-white/5"
                  aria-label="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => handleMoveTask(idx, 'down')}
                  disabled={idx === tasks.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 hover:bg-white/5"
                  aria-label="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
