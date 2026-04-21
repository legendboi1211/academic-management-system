'use client';

import { useState, useEffect } from 'react';
import { Timer, Target, TrendingUp, BookOpen, BarChart3 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [studyTime, setStudyTime] = useState("0h 0m");
  const [averageDaily, setAverageDaily] = useState("0h 0m");
  const [graphData, setGraphData] = useState<{ day: string; hours: number }[]>([]);
  const [maxHours, setMaxHours] = useState(1);

  useEffect(() => {
    const qTimer = query(collection(db, "timerSessions"));
    
    const unsub = onSnapshot(qTimer, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: (doc.data() as any).createdAt?.toDate() || new Date()
      }));
      
      // Generate 30-Day Graph Data
      const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
      });

      const chartData = last30Days.map(dateStr => {
        const dayTotal = docs
          .filter(d => {
            const docDate = d.createdAt instanceof Date 
              ? d.createdAt.toISOString().split('T')[0]
              : new Date(d.createdAt).toISOString().split('T')[0];
            return docDate === dateStr;
          })
          .reduce((acc, d: any) => acc + (d.durationSeconds || 0), 0);
        
        return {
          day: dateStr.split('-')[2],
          hours: parseFloat((dayTotal / 3600).toFixed(2))
        };
      });

      // Calculate stats
      const totalSeconds = chartData.reduce((acc, d) => acc + d.hours * 3600, 0);
      const todaySeconds = docs
        .filter(d => {
          const docDate = d.createdAt instanceof Date 
            ? d.createdAt.toISOString().split('T')[0]
            : new Date(d.createdAt).toISOString().split('T')[0];
          return docDate === new Date().toISOString().split('T')[0];
        })
        .reduce((acc, d: any) => acc + (d.durationSeconds || 0), 0);

      const h = Math.floor(todaySeconds / 3600);
      const m = Math.floor((todaySeconds % 3600) / 60);
      setStudyTime(`${h}h ${m}m`);

      // Calculate average
      const daysWith = chartData.filter(d => d.hours > 0).length;
      const avgSeconds = daysWith > 0 ? totalSeconds / daysWith : 0;
      const avgH = Math.floor(avgSeconds / 3600);
      const avgM = Math.floor((avgSeconds % 3600) / 60);
      setAverageDaily(`${avgH}h ${avgM}m`);

      const maxVal = Math.max(...chartData.map(d => d.hours), 1);
      setMaxHours(maxVal);
      setGraphData(chartData);
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <nav className="bg-white border-b border-slate-100 px-8 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><BarChart3 className="text-white h-5 w-5" /></div>
            <h1 className="text-xl font-black">Performance Analytics</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mt-10 px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl"><Timer className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Time Studied Today</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{studyTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-4 rounded-2xl"><TrendingUp className="h-6 w-6 text-emerald-600" /></div>
              <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Daily Average (30 Days)</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{averageDaily}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Graph */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-8">30-Day Study Activity</h2>
          
          <div className="space-y-6">
            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-1.5 h-64 bg-gradient-to-b from-blue-50 to-slate-50 p-6 rounded-2xl border border-slate-100">
              {graphData.map((data, i) => {
                const barHeight = maxHours > 0 ? (data.hours / maxHours) * 100 : 0;
                return (
                  <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg transition-all hover:shadow-xl hover:from-blue-700 hover:to-blue-600 cursor-pointer"
                      style={{ height: `${Math.max(barHeight, 2)}%` }}
                    >
                      {data.hours > 0 && (
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold shadow-lg">
                          {data.hours}h
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-2">{data.day}</p>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-blue-600 to-blue-500"></div>
                <span className="text-sm font-semibold text-slate-600">Hours Studied Per Day</span>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-black text-slate-900">{graphData.reduce((a, d) => a + d.hours, 0).toFixed(1)}h</span> total
              </div>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Daily Breakdown (Last 30 Days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {graphData.map((data, i) => {
              const dateObj = new Date();
              dateObj.setDate(dateObj.getDate() - (29 - i));
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700 w-24">{dayName}</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex-1">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all"
                        style={{ width: `${maxHours > 0 ? (data.hours / maxHours) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-black text-slate-900 w-10 text-right">{data.hours}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}