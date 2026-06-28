'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(defaultTasks);
      }
    } catch {
      setTasks(defaultTasks);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback((task) => {
    const newTask = {
      id: Date.now().toString(),
      status: 'pending',
      subtasks: [],
      createdAt: new Date().toISOString(),
      ...task,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskStatus = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newStatus = t.status === 'completed' ? 'pending' : 'completed';
      return { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null };
    }));
  }, []);

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
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
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
