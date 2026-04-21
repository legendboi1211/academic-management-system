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
  const [mounted, setMounted] = useState(false);

  const subjects = ["Physics", "PChemistry", "OChemistry", "IOChemistry", "Botany", "Zoology"];

  useEffect(() => {
    setMounted(true);
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

      const todayGoals = fetchedGoals.filter(g => g.date >= startOfToday);
      setGoals(todayGoals);
      calculateRealStreak(fetchedGoals);
    });

    // 2. Sync Study Time from Timer Sessions
    const qTimer = query(collection(db, "timerSessions"));
    const unsubTimer = onSnapshot(qTimer, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ ...d.data(), date: (d.data() as any).createdAt?.toDate() || new Date() }));

      const todaySecs = docs
        .filter(d => d.date >= startOfToday)
        .reduce((acc, d: any) => acc + (d.durationSeconds || 0), 0);

      const h = Math.floor(todaySecs / 3600);
      const m = Math.floor((todaySecs % 3600) / 60);
      setStudyTime(`${h}h ${m}m`);

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
          day: dateStr.split('-')[2],
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
      if (!dayTasks) { if (i === 0) continue; break; }
      if (dayTasks.every(t => t.completed === true)) { count++; } 
      else { if (i === 0) continue; break; }
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

  if (!mounted) return null;

  // Dynamic Date Calculation
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 font-sans">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={Timer} label="Time Today" value={studyTime} color="blue" />
          <StatCard icon={Target} label="Goals Progress" value={`${goals.filter(g => g.completed).length}/${goals.length}`} color="emerald" />
          <StatCard icon={TrendingUp} label="Current Streak" value={`${streak} Days`} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dynamic Calendar Widget - Fixed highlight issue */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                 <Calendar size={18} className="text-blue-500" /> 
                 {today.toLocaleDateString('en-US', { month: 'long' })}
               </h3>
               <div className="grid grid-cols-7 gap-1.5 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[10px] font-black text-slate-300 mb-2">{d}</div>
                ))}
                {[...Array(daysInMonth)].map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === currentDay; // Matches current system date
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all 
                      ${isToday ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px]">
              <h3 className="text-xl font-black mb-8 text-slate-800">Daily Objectives</h3>
              <div className="flex gap-3 mb-10">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-blue-300 transition-all font-medium"
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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

              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 italic font-medium">No goals added for today.</div>
                ) : (
                  goals.map(goal => (
                    <div key={goal.id} className="group flex items-center justify-between bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm">
                      <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => toggleGoal(goal.id, goal.completed)}>
                          {goal.completed ? <CheckCircle2 className="text-emerald-500 w-6 h-6" /> : <Circle className="text-slate-300 w-6 h-6 hover:text-blue-500" />}
                        </button>
                        <div className="flex-1">
                          <p className="text-[11px] font-black text-blue-600 uppercase tracking-wide mb-1">{goal.subject}</p>
                          <span className={`font-bold text-lg transition-all ${goal.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {goal.text}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2">
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
  const colors: any = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", orange: "bg-orange-50 text-orange-600" };
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