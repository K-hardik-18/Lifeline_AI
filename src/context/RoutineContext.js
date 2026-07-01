'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RoutineContext = createContext();
const STORAGE_KEY = 'lifeline-ai-routines';

const getLocalDateStr = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

const defaultRoutines = [
  {
    id: 'dsa-daily',
    title: 'Data Structures & Algorithms',
    category: 'study',
    priority: 'high',
    createdAt: new Date().toISOString(),
    startDate: getLocalDateStr(),
    days: [0, 1, 2, 3, 4, 5, 6],
    logs: {}
  },
  {
    id: 'gym',
    title: 'Gym Workout',
    category: 'health',
    priority: 'critical',
    createdAt: new Date().toISOString(),
    startDate: getLocalDateStr(),
    days: [1, 2, 3, 4, 5],
    logs: {}
  }
];

export function RoutineProvider({ children }) {
  const [routines, setRoutines] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRoutines(JSON.parse(stored));
      } else {
        setRoutines(defaultRoutines);
      }
    } catch (e) {
      console.error('Failed to load routines', e);
      setRoutines(defaultRoutines);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever routines change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
    }
  }, [routines, isLoaded]);

  const addRoutine = useCallback((routine) => {
    setRoutines((prev) => [
      ...prev,
      {
        ...routine,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        startDate: routine.startDate || getLocalDateStr(),
        days: routine.days || [0, 1, 2, 3, 4, 5, 6],
        logs: {}
      }
    ]);
  }, []);

  const updateRoutine = useCallback((id, updates) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteRoutine = useCallback((id) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleRoutineForDate = useCallback((id, dateStr) => {
    const targetDate = dateStr || getLocalDateStr();
    
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newLogs = { ...r.logs };
          if (newLogs[targetDate]) {
            delete newLogs[targetDate];
          } else {
            newLogs[targetDate] = true;
          }
          return { ...r, logs: newLogs };
        }
        return r;
      })
    );
  }, []);

  const getProgressForDate = useCallback((dateObj) => {
    const target = dateObj || new Date();
    const dateStr = getLocalDateStr(target);
    const dayIndex = target.getDay();
    
    const todaysRoutines = routines.filter(r => !r.days || r.days.includes(dayIndex));
    if (todaysRoutines.length === 0) return 0;
    
    const completed = todaysRoutines.filter((r) => r.logs[dateStr]).length;
    return Math.round((completed / todaysRoutines.length) * 100);
  }, [routines]);

  const getTopicAnalytics = useCallback(() => {
    const analytics = {};
    routines.forEach(r => {
      if (!analytics[r.category]) {
        analytics[r.category] = { total: 0, completed: 0 };
      }
      analytics[r.category].total += 1;
      
      const today = getLocalDateStr();
      if (r.logs[today]) {
        analytics[r.category].completed += 1;
      }
    });
    
    return Object.entries(analytics).map(([category, stats]) => ({
      category,
      percentage: Math.round((stats.completed / stats.total) * 100) || 0
    }));
  }, [routines]);

  const getRoutineHistoryStats = useCallback((timeframe) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return routines.map(r => {
      const rawStart = r.startDate || r.createdAt;
      let startDate;
      if (rawStart.includes('-') && rawStart.length === 10) {
        const [y, m, d] = rawStart.split('-');
        startDate = new Date(y, m - 1, d);
      } else {
        startDate = new Date(rawStart);
      }
      startDate.setHours(0, 0, 0, 0);

      const timeframeDate = new Date(today);
      if (timeframe === 'weekly') {
        const day = timeframeDate.getDay();
        const diff = timeframeDate.getDate() - day + (day === 0 ? -6 : 1);
        timeframeDate.setDate(diff);
      }
      else if (timeframe === 'monthly') timeframeDate.setDate(1);
      else if (timeframe === 'yearly') timeframeDate.setMonth(0, 1);
      else timeframeDate.setTime(0);

      if (timeframeDate > startDate) {
        startDate = timeframeDate;
      }

      let totalDays = 0;
      let completedDays = 0;
      
      let currDate = new Date(startDate);
      while (currDate <= today) {
        if (!r.days || r.days.includes(currDate.getDay())) {
          totalDays++;
          const dateStr = getLocalDateStr(currDate);
          if (r.logs[dateStr]) {
            completedDays++;
          }
        }
        currDate.setDate(currDate.getDate() + 1);
      }
      
      if (totalDays === 0) totalDays = 1;

      const percentage = Math.round((completedDays / totalDays) * 100);

      return {
        ...r,
        historyStats: {
          percentage,
          completedDays,
          totalDays
        }
      };
    });
  }, [routines]);

  const getTimeframeAggregate = useCallback((timeframe) => {
    const stats = getRoutineHistoryStats(timeframe);
    let totalPossible = 0;
    let totalCompleted = 0;
    const byCategory = {};

    stats.forEach(s => {
      totalPossible += s.historyStats.totalDays;
      totalCompleted += s.historyStats.completedDays;

      if (!byCategory[s.category]) byCategory[s.category] = { total: 0, completed: 0, routines: [] };
      byCategory[s.category].total += s.historyStats.totalDays;
      byCategory[s.category].completed += s.historyStats.completedDays;
      byCategory[s.category].routines.push(s);
    });

    const overall = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
    const categories = Object.keys(byCategory).map(cat => ({
      name: cat,
      percentage: byCategory[cat].total === 0 ? 0 : Math.round((byCategory[cat].completed / byCategory[cat].total) * 100),
      routines: byCategory[cat].routines
    }));

    return { overall, categories };
  }, [getRoutineHistoryStats]);

  return (
    <RoutineContext.Provider
      value={{
        routines,
        isLoaded,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleRoutineForDate,
        getProgressForDate,
        getTopicAnalytics,
        getRoutineHistoryStats,
        getTimeframeAggregate,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutines() {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutines must be used within a RoutineProvider');
  }
  return context;
}
