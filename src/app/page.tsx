'use client';

import { useState, useEffect } from 'react';
import { Timer, Target, TrendingUp, Calendar, Plus, CheckCircle2, Circle, Trash2, Beaker, BookOpen, BarChart } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useTimer } from '@/components/TimerContext';
import Link from 'next/link';

export default function Dashboard() {
  const { seconds } = useTimer();
  const [studyTime, setStudyTime] = useState("0h 0m");
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [streak, setStreak] = useState(0);
  const [graphData, setGraphData] = useState<{ day: string; hours: number }[]>([]);

  const subjects = ["Physics", "PChemistry", "OChemistry", "IOChemistry", "Botany", "Zoology"];

  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Sync Goals & Calculate Streak
    const qGoals = query(collection(db, "goals"), orderBy("createdAt", "desc"));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      const fetchedGoals = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        date: (d.data() as any).createdAt?.toDate() || new Date()
      }));

      // Filter goals for today's progress card
      const todayGoals = fetchedGoals.filter(g => g.date >= startOfToday);
      setGoals(todayGoals);

      // Calculate streak based on full history
      calculateRealStreak(fetchedGoals);
    });

    // 2. Sync Study Time from Timer Sessions
    const qTimer = query(collection(db, "timerSessions"));
    const unsubTimer = onSnapshot(qTimer, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ ...d.data(), date: (d.data() as any).createdAt?.toDate() || new Date() }));

      // Calculate total time today
      const todaySecs = docs
        .filter(d => d.date >= startOfToday)
        .reduce((acc, d: any) => acc + (d.durationSeconds || 0), 0);

      const h = Math.floor(todaySecs / 3600);
      const m = Math.floor((todaySecs % 3600) / 60);
      setStudyTime(`${h}h ${m}m`);

      // Generate 30-Day Graph Data
      const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
      });

      const chartData = last30Days.map(dateStr => {
        const dayTotal = docs
          .filter(d => {
            if (!d.date || !(d.date instanceof Date)) return false;
            const docDate = d.date.toISOString().split('T')[0];
            return docDate === dateStr;
          })
          .reduce((acc, d: any) => acc + (d.durationSeconds || 0), 0);

        return {
          day: dateStr.split('-')[2], // Just the day number
          hours: dayTotal / 3600
        };
      });
      setGraphData(chartData);
    });

    return () => { unsubGoals(); unsubTimer(); };
  }, []);

  const calculateRealStreak = (allGoals: any[]) => {
    if (allGoals.length === 0) { setStreak(0); return; }

    const goalsByDay: Record<string, any[]> = {};
    allGoals.forEach(g => {
      const dayKey = g.date.toISOString().split('T')[0];
      if (!goalsByDay[dayKey]) goalsByDay[dayKey] = [];
      goalsByDay[dayKey].push(g);
    });

    let count = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      const dayTasks = goalsByDay[dayKey];

      if (!dayTasks) {
        if (i === 0) continue;
        break;
      }

      if (dayTasks.every(t => t.completed === true)) {
        count++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    setStreak(count);
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    await addDoc(collection(db, "goals"), { 
      text: newGoal, 
      subject: selectedSubject,
      completed: false, 
      createdAt: serverTimestamp() 
    });
    setNewGoal("");
  };

  const toggleGoal = async (id: string, currentState: boolean) => {
    await updateDoc(doc(db, "goals", id), { completed: !currentState });
  };

  const deleteGoal = async (id: string) => {
    await deleteDoc(doc(db, "goals", id));
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-slate-100 px-8 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><Beaker className="text-white h-5 w-5" /></div>
            <h1 className="text-xl font-black">STUDY<span className="text-blue-600">.ORG</span></h1>
          </div>
          <Link href="/timer" className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-800 transition-all">
            Start Focus Mode
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mt-10 px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={Timer} label="Time Today" value={studyTime} color="blue" />
          <StatCard icon={Target} label="Goals Progress" value={`${completedCount}/${totalCount}`} color="emerald" />
          <StatCard icon={TrendingUp} label="Current Streak" value={`${streak} Days`} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Widget */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><Calendar size={18} className="text-blue-500" /> Study Calendar</h3>
               <div className="grid grid-cols-7 gap-1.5">
                {[...Array(31)].map((_, i) => (
                  <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold ${i === 20 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goal Management Section */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px]">
              <h3 className="text-xl font-black mb-8 text-slate-800">Daily Objectives</h3>
              
              {/* Input Area */}
              <div className="flex gap-3 mb-10">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-blue-300 transition-all font-medium"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <input 
                  value={newGoal} 
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                  placeholder="e.g., Practice Resonance Structures" 
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-300 transition-all font-medium"
                />
                <button onClick={addGoal} className="bg-blue-600 text-white px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-md active:scale-95">
                  <Plus size={24} />
                </button>
              </div>

              {/* Goals List */}
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 italic font-medium">No goals added for today.</div>
                ) : (
                  goals.map(goal => (
                    <div key={goal.id} className="group flex items-center justify-between bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm">
                      <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => toggleGoal(goal.id, goal.completed)}>
                          {goal.completed ? <CheckCircle2 className="text-emerald-500 w-6 h-6 flex-shrink-0" /> : <Circle className="text-slate-300 w-6 h-6 hover:text-blue-500 transition-colors flex-shrink-0" />}
                        </button>
                        <div className="flex-1">
                          <p className="text-[11px] font-black text-blue-600 uppercase tracking-wide mb-1">{goal.subject}</p>
                          <span className={`font-bold text-lg transition-all block ${goal.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {goal.text}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2 flex-shrink-0">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600"
  };
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-50 shadow-sm">
      <div className="flex items-center gap-5">
        <div className={`${colors[color]} p-4 rounded-2xl`}><Icon size={24} /></div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-slate-900 leading-none mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}
