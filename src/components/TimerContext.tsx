'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext<any>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  const resetTimer = () => {
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <TimerContext.Provider value={{ seconds, setSeconds, isActive, setIsActive, resetTimer }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);