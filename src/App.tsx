/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [time, setTime] = useState(new Date());
  const [insight, setInsight] = useState<string>('Loading daily insight...');
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Gemini Insight
  useEffect(() => {
    async function fetchInsight() {
      try {
        const model = "gemini-3-flash-preview";
        const response = await genAI.models.generateContent({
          model,
          contents: "Give me a short, inspiring one-sentence quote or productivity tip for a minimalist dashboard. Keep it under 15 words.",
        });
        setInsight(response.text || "Focus on what matters most today.");
      } catch (error) {
        console.error("Error fetching insight:", error);
        setInsight("Simplicity is the ultimate sophistication.");
      } finally {
        setIsLoadingInsight(false);
      }
    }
    fetchInsight();
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTask,
      completed: false
    };
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-100">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 bg-white border-r border-zinc-200 flex flex-col items-center py-8 gap-8 z-10 hidden md:flex">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <LayoutDashboard size={20} />
        </div>
        <div className="flex flex-col gap-6 text-zinc-400">
          <Calendar size={20} className="hover:text-emerald-600 cursor-pointer transition-colors" />
          <CheckCircle2 size={20} className="hover:text-emerald-600 cursor-pointer transition-colors" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:pl-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-2">
                Good day.
              </h1>
              <p className="text-zinc-500 font-medium">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm"
            >
              <Clock className="text-emerald-600" size={20} />
              <span className="text-2xl font-mono font-medium tabular-nums">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </span>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Gemini Insight Card */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-emerald-300">
                  <Sparkles size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Gemini Insight</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-medium leading-tight mb-8">
                  {isLoadingInsight ? (
                    <span className="animate-pulse opacity-50">Generating your daily focus...</span>
                  ) : insight}
                </h2>
                <button className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors">
                  Explore more <ChevronRight size={16} />
                </button>
              </div>
              {/* Decorative background element */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
            </motion.section>

            {/* Task Section */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                Today's Focus
                <span className="text-xs font-normal text-zinc-400 ml-auto">
                  {tasks.filter(t => t.completed).length}/{tasks.length}
                </span>
              </h3>

              <form onSubmit={addTask} className="relative mb-6">
                <input 
                  type="text" 
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new goal..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </form>

              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {tasks.length === 0 ? (
                    <p className="text-center text-zinc-400 text-sm py-8 italic">No goals set for today.</p>
                  ) : (
                    tasks.map((task) => (
                      <motion.div 
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          task.completed 
                            ? 'bg-zinc-50 border-zinc-100 opacity-60' 
                            : 'bg-white border-zinc-200 hover:border-emerald-200 shadow-sm'
                        }`}
                      >
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            task.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-zinc-300 hover:border-emerald-500'
                          }`}
                        >
                          {task.completed && <CheckCircle2 size={12} />}
                        </button>
                        <span className={`flex-1 text-sm font-medium ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                          {task.text}
                        </span>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

          </div>
        </div>
      </main>
    </div>
  );
}

