'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount & check cache TTL
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        let cached = null;
        let lastSynced = 0;
        
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const rawCached = parsed.data || parsed;
          
          const uniqueCached = [];
          const ids = new Set();
          for (const item of rawCached) {
            if (!ids.has(item.id)) {
              ids.add(item.id);
              uniqueCached.push(item);
            }
          }
          cached = uniqueCached;
          
          lastSynced = parsed.lastSynced || 0;
          setRoutines(cached);
        } else {
          setRoutines(defaultRoutines);
        }
        setIsLoaded(true);

        if (user && Date.now() - lastSynced > 300000) {
          const { data, error } = await supabase
            .from('routines')
            .select('*')
            .eq('user_id', user.id);
            
          if (!error && data) {
            const mappedData = [];
            const dbIds = new Set();
            for (const r of data) {
              if (!dbIds.has(r.id)) {
                dbIds.add(r.id);
                mappedData.push(r);
              }
            }
            setRoutines(mappedData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: mappedData, lastSynced: Date.now() }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoutines();
  }, [user]);

  const updateCacheAndState = (newRoutines) => {
    setRoutines(newRoutines);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newRoutines, lastSynced: Date.now() }));
  };

  const syncRoutine = async (routine, action = 'upsert') => {
    if (!user) return;
    try {
      if (action === 'delete') {
        await supabase.from('routines').delete().eq('id', routine.id).eq('user_id', user.id);
      } else {
        await supabase.from('routines').upsert({ ...routine, user_id: user.id });
      }
    } catch (err) {
      console.error('Supabase sync error', err);
    }
  };

  const addRoutine = useCallback((routine) => {
    const newRoutine = {
      ...routine,
      createdAt: new Date().toISOString(),
      startDate: routine.startDate || getLocalDateStr(),
      days: routine.days || [0, 1, 2, 3, 4, 5, 6],
      logs: {},
      id: crypto.randomUUID()
    };
    setRoutines(prev => {
      const updated = [...prev, newRoutine];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updated, lastSynced: Date.now() }));
      return updated;
    });
    syncRoutine(newRoutine, 'upsert');
  }, [user]);

  const updateRoutine = useCallback((id, updates) => {
    setRoutines((prev) => {
      let updatedRoutine = null;
      const updatedList = prev.map((r) => {
        if (r.id === id) {
          updatedRoutine = { ...r, ...updates };
          return updatedRoutine;
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updatedList, lastSynced: Date.now() }));
      if (updatedRoutine) syncRoutine(updatedRoutine, 'upsert');
      return updatedList;
    });
  }, [user]);

  const deleteRoutine = useCallback((id) => {
    setRoutines((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updated, lastSynced: Date.now() }));
      return updated;
    });
    syncRoutine({ id }, 'delete');
  }, [user]);

  const toggleRoutineForDate = useCallback((id, dateStr) => {
    const targetDate = dateStr || getLocalDateStr();
    
    setRoutines((prev) => {
      let updatedRoutine = null;
      const updatedList = prev.map((r) => {
        if (r.id === id) {
          const newLogs = { ...r.logs };
          if (newLogs[targetDate]) {
            delete newLogs[targetDate];
          } else {
            newLogs[targetDate] = true;
          }
          updatedRoutine = { ...r, logs: newLogs };
          return updatedRoutine;
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updatedList, lastSynced: Date.now() }));
      if (updatedRoutine) syncRoutine(updatedRoutine, 'upsert');
      return updatedList;
    });
  }, [user]);

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
