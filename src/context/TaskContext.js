'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const TaskContext = createContext();

const STORAGE_KEY = 'lifeline-ai-tasks';

const defaultTasks = [
  {
    id: 'welcome-task',
    title: '✨ Welcome to LifeLine AI! (Click my checkbox to complete me)',
    description: '1. Try the "Auto-Fill with AI" button in the Add Task menu.\n2. Click the purple Sparkles icon to let AI break down complex tasks.\n3. Head over to Focus Mode for deep work sessions!',
    dueDate: new Date().toISOString(),
    category: 'personal',
    priority: 'high',
    status: 'pending',
    estimatedMinutes: 5,
    subtasks: [],
    createdAt: new Date().toISOString(),
  }
];

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  const forceSyncTasks = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
        
      if (!error && data) {
        const mappedData = [];
        const dbIds = new Set();
        for (const t of data) {
          if (!dbIds.has(t.id)) {
            dbIds.add(t.id);
            mappedData.push({
              ...t,
              status: t.completed ? 'completed' : 'pending'
            });
          }
        }
        setTasks(mappedData);
        const now = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: mappedData, lastSynced: now }));
        setLastSyncTime(now);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  // Load from localStorage on mount & check cache TTL
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let cached = null;
        let lastSynced = 0;
        
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const rawCached = parsed.data || parsed; // fallback for older format
          
          // Deduplicate tasks by ID to fix React duplicate key errors from old Date.now() collisions
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
          setTasks(cached);
          setLastSyncTime(lastSynced);
        } else {
          setTasks(defaultTasks);
        }
        setIsLoaded(true);

        // Fetch from Supabase if authenticated and cache is older than 2 mins
        if (user && Date.now() - lastSynced > 120000) {
          await forceSyncTasks();
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, [user]);

  const updateCacheAndState = (newTasks) => {
    setTasks(newTasks);
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newTasks, lastSynced: now }));
    setLastSyncTime(now);
  };

  const syncTask = async (task, action = 'upsert') => {
    if (!user) return;
    try {
      if (action === 'delete') {
        await supabase.from('tasks').delete().eq('id', task.id).eq('user_id', user.id);
      } else {
        const payload = { 
          id: task.id,
          user_id: user.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          category: task.category,
          priority: task.priority,
          status: task.status,
          completed: task.status === 'completed',
          estimatedMinutes: task.estimatedMinutes,
          subtasks: task.subtasks || [],
          createdAt: task.createdAt
        };
        await supabase.from('tasks').upsert(payload);
      }
    } catch (err) {
      console.error('Supabase sync error', err);
    }
  };

  const addTask = useCallback((task) => {
    const newTask = {
      status: 'pending',
      subtasks: [],
      createdAt: new Date().toISOString(),
      ...task,
      id: crypto.randomUUID(), // Ensure this cannot be overwritten by AI responses
    };
    setTasks(prev => {
      const updated = [newTask, ...prev];
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updated, lastSynced: now }));
      setLastSyncTime(now);
      return updated;
    });
    syncTask(newTask, 'upsert');
    return newTask;
  }, [user]);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => {
      let updatedTask = null;
      const updatedList = prev.map(t => {
        if (t.id === id) {
          updatedTask = { ...t, ...updates };
          return updatedTask;
        }
        return t;
      });
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updatedList, lastSynced: now }));
      setLastSyncTime(now);
      if (updatedTask) syncTask(updatedTask, 'upsert');
      return updatedList;
    });
  }, [user]);

  const deleteTask = useCallback((id) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updated, lastSynced: now }));
      setLastSyncTime(now);
      return updated;
    });
    syncTask({ id }, 'delete');
  }, [user]);

  const toggleTaskStatus = useCallback((id) => {
    setTasks(prev => {
      let updatedTask = null;
      const updatedList = prev.map(t => {
        if (t.id !== id) return t;
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';
        updatedTask = { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null };
        return updatedTask;
      });
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updatedList, lastSynced: now }));
      setLastSyncTime(now);
      if (updatedTask) syncTask(updatedTask, 'upsert');
      return updatedList;
    });
  }, [user]);

  const getTasksByPriority = useCallback(() => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...tasks].sort((a, b) => (order[a.priority] || 3) - (order[b.priority] || 3));
  }, [tasks]);

  const getTasksDueToday = useCallback(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const due = new Date(t.dueDate);
      return due >= startOfDay && due <= today;
    });
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < now;
    });
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter(t => t.status === 'completed');
  }, [tasks]);

  const getPendingTasks = useCallback(() => {
    return tasks.filter(t => t.status !== 'completed');
  }, [tasks]);

  const getStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = getOverdueTasks().length;
    const dueToday = getTasksDueToday().length;
    const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, dueToday, critical, completionRate };
  }, [tasks, getOverdueTasks, getTasksDueToday]);

  return (
    <TaskContext.Provider value={{
      tasks,
      isLoaded,
      lastSyncTime,
      forceSyncTasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      updateCacheAndState,
      getTasksByPriority,
      getTasksDueToday,
      getOverdueTasks,
      getCompletedTasks,
      getPendingTasks,
      getStats,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
