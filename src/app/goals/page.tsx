'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle, Clock, AlertCircle, Trash2, Calendar, ChevronRight, X } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  category: string;
}

export default function GoalsPage() {
  const [mounted, setMounted] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'Mathematics'
  });

  // Handle Hydration and LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('academic-goals');
    if (saved) setGoals(JSON.parse(saved));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('academic-goals', JSON.stringify(goals));
  }, [goals, mounted]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-amber-500" />;
      default: return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Mathematics: 'bg-blue-100 text-blue-700',
      Physics: 'bg-purple-100 text-purple-700',
      Chemistry: 'bg-pink-100 text-pink-700',
      Computer: 'bg-cyan-100 text-cyan-700',
      General: 'bg-slate-100 text-slate-700',
    };
    return colors[cat] || colors.General;
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.deadline) return;
    const goal: Goal = {
      id: crypto.randomUUID(),
      ...newGoal,
      status: 'pending',
      progress: 0,
    };
    setGoals([goal, ...goals]);
    setNewGoal({ title: '', description: '', deadline: '', category: 'Mathematics' });
    setShowAddForm(false);
  };

  const updateProgress = (id: string, progress: number) => {
    setGoals(goals.map(g => {
      if (g.id !== id) return g;
      const newProgress = Math.min(100, Math.max(0, progress));
      return { 
        ...g, 
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'pending'
      };
    }));
  };

  const deleteGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));

  if (!mounted) return null;

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.length ? Math.round(goals.reduce((acc, curr) => acc + curr.progress, 0) / goals.length) : 0
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        {/* Header & Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">My Targets</h1>
            <p className="text-slate-500">Track your progress and crush your academic milestones.</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-around">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase">Success</p>
              <p className="text-2xl font-black text-blue-600">{stats.avgProgress}%</p>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase">Finished</p>
              <p className="text-2xl font-black text-slate-800">{stats.completed}/{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Current Goals <span className="bg-slate-200 text-slate-600 text-xs py-1 px-2 rounded-full">{goals.length}</span>
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center shadow-xl shadow-slate-200"
          >
            <Plus className="h-5 w-5 mr-1" /> Create Goal
          </button>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => updateProgress(goal.id, goal.progress === 100 ? 0 : 100)}
                    className={`mt-1 transition-colors ${goal.status === 'completed' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                  >
                    {getStatusIcon(goal.status)}
                  </button>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-lg font-bold ${goal.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {goal.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-3">{goal.description}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {goal.status === 'in-progress' && <span className="text-amber-500 font-bold">In Focus</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-32 md:w-48">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div 
                      className="h-2 w-full bg-slate-100 rounded-full overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        updateProgress(goal.id, Math.round((x / rect.width) * 100));
                      }}
                    >
                      <div 
                        className={`h-full transition-all duration-500 ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Target className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Your goal list is empty. Time to dream big.</p>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-3xl font-black mb-6">New Goal</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">What's the mission?</label>
                <input
                  type="text"
                  placeholder="e.g., Master Organic Chemistry"
                  className="w-full mt-1 px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Deadline</label>
                  <input
                    type="date"
                    className="w-full mt-1 px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                  <select
                    className="w-full mt-1 px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  >
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Computer Science</option>
                    <option>General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Details (Optional)</label>
                <textarea
                  placeholder="Break down the steps..."
                  className="w-full mt-1 px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                />
              </div>
            </div>

            <button
              onClick={handleAddGoal}
              className="w-full mt-8 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              Initialize Target
            </button>
          </div>
        </div>
      )}
    </div>
  );
}