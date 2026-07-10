'use client';

import { useEffect, useRef } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useRoutines } from '@/context/RoutineContext';

export default function NotificationDaemon() {
  const { tasks } = useTasks();
  const { routines } = useRoutines();
  const notifiedTasks = useRef(new Set());
  const notifiedRoutines = useRef(new Set());

  useEffect(() => {
    // Request permission on mount if needed safely
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {}); // catch promise rejection on Safari
        }
      }
    } catch (e) {}

    const sendNotification = (title, options) => {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            if (registration && registration.showNotification) {
              registration.showNotification(title, options);
            } else {
              new Notification(title, options);
            }
          }).catch(e => {
            try { new Notification(title, options); } catch(err){}
          });
        } else {
          new Notification(title, options);
        }
      } catch (e) {
        console.warn('Failed to show notification:', e);
      }
    };

    const checkNotifications = () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      try {
        if (Notification.permission !== 'granted') return;
      } catch(e) { return; }

      const now = new Date();
      
      // Check Tasks (1 hour remaining)
      tasks.forEach(task => {
        if (task.status === 'completed' || !task.dueDate) return;
        const due = new Date(task.dueDate);
        const diffMs = due - now;
        const diffMins = Math.floor(diffMs / 60000);
        
        // If due in between 50 and 65 mins, notify once
        if (diffMins > 50 && diffMins <= 65 && !notifiedTasks.current.has(task.id)) {
          sendNotification('Task Due Soon', {
            body: `Your task "${task.title}" is due in about 1 hour!`,
            icon: '/favicon.ico'
          });
          notifiedTasks.current.add(task.id);
        }
      });

      // Check Routines (e.g. daily review at 9 PM)
      if (now.getHours() === 21 && now.getMinutes() < 15) {
        const todayStr = now.toLocaleDateString();
        if (!notifiedRoutines.current.has(todayStr)) {
          sendNotification('Evening Routine Reminder', {
            body: 'Time to review your day and plan for tomorrow!',
            icon: '/favicon.ico'
          });
          notifiedRoutines.current.add(todayStr);
        }
      }
    };

    // Run every minute
    const intervalId = setInterval(checkNotifications, 60000);
    // Initial check
    checkNotifications();

    return () => clearInterval(intervalId);
  }, [tasks, routines]);

  return null;
}
