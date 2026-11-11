import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  Zap, 
  Activity, 
  CalendarPlus, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { ApiService, ChatMessage } from '../lib/api';
import { StorageService } from '../lib/storage';
import { calculateLifeScore, calculateBurnoutRisk } from '../lib/analytics';

interface JarvisWidgetProps {
  onRefreshData?: () => void;
}

export const JarvisWidget: React.FC<JarvisWidgetProps> = ({ onRefreshData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Greetings Alex. I am Jarvis, your LifeOS personal intelligence core. I have loaded your 30-day biometrics, productivity load, and active goals. How may I optimize your state today?"
    }
  ]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const quickPrompts = [
    "Why was I tired this week?",
    "Should I take on this new project?",
    "How do I lower my burnout risk?",
    "Add a 45m deep focus block"
  ];

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!userText) setInput('');
    setIsLoading(true);
    setActionNotice(null);

    // Build real user context to feed to Jarvis
    const logs = StorageService.getLogs();
    const goals = StorageService.getGoals();
    const tasks = StorageService.getTasks();
    const profile = StorageService.getProfile();
    const lifeScore = calculateLifeScore(logs);
    const burnout = calculateBurnoutRisk(logs);

    const recentLogs = logs.slice(-7);
    const avgSleep = (recentLogs.reduce((s, l) => s + l.sleepHours, 0) / (recentLogs.length || 1)).toFixed(1);
    const avgFocus = (recentLogs.reduce((s, l) => s + l.focusHours, 0) / (recentLogs.length || 1)).toFixed(1);

    const userContext = {
      profileName: profile.name,
      chronotype: profile.chronotype,
      lifeScore: lifeScore.overall,
      healthScore: lifeScore.health,
      productivityScore: lifeScore.productivity,
      mindScore: lifeScore.mind,
      burnoutRisk: `${burnout.riskScore}% (${burnout.riskLevel})`,
      avgSleepLast7Days: `${avgSleep} hours`,
      avgFocusLast7Days: `${avgFocus} hours`,
      activeGoalsCount: goals.filter(g => !g.completed).length,
      topGoal: goals[0]?.title || 'None',
      incompleteTasksToday: tasks.filter(t => !t.completed).map(t => t.title),
    };

    try {
      const response = await ApiService.chatWithJarvis(newMessages, userContext);
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);

      // Check for actions proposed by Jarvis
      if (response.action) {
        if (response.action.type === 'ADD_TASK' && response.action.payload) {
          const newTask = {
            id: 't-' + Date.now(),
            title: response.action.payload.title || 'Jarvis Recommended Block',
            category: response.action.payload.category || 'Productivity',
            durationMinutes: response.action.payload.duration || 45,
            energyRequired: response.action.payload.energy || 'Medium',
            completed: false,
            reason: 'Generated dynamically by Jarvis assistant',
          };
          const currentTasks = StorageService.getTasks();
          StorageService.saveTasks([newTask, ...currentTasks]);
          setActionNotice(`Added task: "${newTask.title}"`);
          onRefreshData?.();
        } else if (response.action.type === 'ADD_GOAL' && response.action.payload) {
          const newGoal = {
            id: 'g-' + Date.now(),
            title: response.action.payload.title || 'New Habit Goal',
            category: response.action.payload.category || 'Health',
            target: response.action.payload.target || 7,
            current: 0,
            unit: response.action.payload.unit || 'days',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            milestones: [{ id: 'm-1', title: 'Start baseline streak', completed: false }],
            status: 'on_track' as const,
            statusReason: 'Initiated by Jarvis recommendation',
            completionOdds: 75,
          };
          const currentGoals = StorageService.getGoals();
          StorageService.saveGoals([newGoal, ...currentGoals]);
          setActionNotice(`Created new goal: "${newGoal.title}"`);
          onRefreshData?.();
        }
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I ran into a telemetry transmission error. However, your data indicates elevated stress over the past 48 hours. Recommend pausing work past 9:00 PM."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Orb trigger button when collapsed */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-full glass-panel-cyan border border-cyan-400/40 text-white shadow-2xl hover:border-cyan-300 transition-all cursor-pointer"
            aria-label="Open Jarvis AI Assistant"
          >
            {/* Glowing pulsing orb */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-violet-500 to-fuchsia-500 jarvis-core-pulse flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
              <div className="absolute -inset-1 rounded-full border border-cyan-400/60 animate-ping opacity-60 pointer-events-none" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                Jarvis AI
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-400">Ask or optimize schedule</div>
            </div>
          </button>
        </motion.div>
      )}

      {/* Expanded Jarvis Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '70px' : '580px',
              width: '420px',
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-6 right-6 z-40 max-w-[calc(100vw-2rem)] glass-panel-glow rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center jarvis-core-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">JARVIS</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      LIVE CORE
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Context-Aware AI Assistant</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* If not minimized, show chat body */}
            {!isMinimized && (
              <>
                {/* Action notice banner if an action was executed */}
                {actionNotice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 py-2 bg-emerald-950/70 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{actionNotice}</span>
                  </motion.div>
                )}

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {m.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-400/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                            : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-line'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {/* Thinking animation */}
                  {isLoading && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 w-fit">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs font-mono text-cyan-300">Jarvis is thinking...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompt suggestions */}
                <div className="px-3 py-2 bg-slate-950/40 border-t border-white/5 overflow-x-auto flex gap-1.5 no-scrollbar">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Jarvis anything about your life data..."
                    className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
