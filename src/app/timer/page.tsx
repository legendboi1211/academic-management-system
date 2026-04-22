'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useTimer } from '@/components/TimerContext';
import { useAuth } from '@/components/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Play, Pause, Check, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';

function TimerPageContent() {
  const { seconds, isActive, setIsActive, resetTimer } = useTimer();
  const { user } = useAuth();

  const handleFinish = async () => {
    if (seconds > 0 && user) {
      try {
        await addDoc(collection(db, "users", user.uid, "timerSessions"), {
          durationSeconds: seconds,
          createdAt: serverTimestamp(),
          label: 'Organic Chemistry Session'
        });
        resetTimer();
        alert("Session Recorded!");
      } catch (e) { 
        console.error("Error saving session:", e); 
      }
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center font-mono overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Exit Button */}
      <Link href="/" className="absolute top-10 left-10 p-3 hover:bg-white/10 rounded-full transition-colors group">
        <X size={28} className="text-slate-500 group-hover:text-white" />
      </Link>

      <div className="relative z-10 flex flex-col items-center w-full">
        <span className="text-blue-500 font-bold tracking-[0.5em] uppercase text-xs mb-10 opacity-70">
          Deep Focus Mode
        </span>
        
        {/* Massive Timer */}
        <div className="text-[120px] md:text-[220px] font-black leading-none tracking-tighter mb-20 drop-shadow-[0_0_40px_rgba(59,130,246,0.2)]">
          {formatTime(seconds)}
        </div>

        {/* Futuristic Controls */}
        <div className="flex items-center gap-12">
          {/* Reset Button */}
          <button onClick={resetTimer} className="p-5 bg-slate-900/50 border border-slate-800 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90">
            <RotateCcw size={32} />
          </button>

          {/* Start/Pause Button */}
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`h-28 w-28 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-slate-800 border border-slate-700' : 'bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.25)] scale-110'}`}
          >
            {isActive ? <Pause size={48} fill="currentColor" /> : <Play size={48} className="ml-2" fill="currentColor" />}
          </button>

          {/* Finish Button */}
          <button onClick={handleFinish} className="p-5 bg-emerald-950/20 text-emerald-500 border border-emerald-500/30 rounded-full hover:bg-emerald-500 hover:text-white transition-all active:scale-90">
            <Check size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimerPage() {
  return (
    <ProtectedRoute>
      <TimerPageContent />
    </ProtectedRoute>
  );
}