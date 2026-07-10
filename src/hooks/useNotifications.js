'use client';

import { useEffect, useRef, useCallback } from 'react';

const getLocalDateStr = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

export function useNotifications(tasks, routines) {
  const notifiedTaskIds = useRef(new Set());
  const routineNotifiedDate = useRef(null);
  const swRegistration = useRef(null);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      swRegistration.current = reg;
      console.log('Service Worker registered');
    }).catch((err) => {
      console.warn('SW registration failed:', err);
    });
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  // Send a notification
  const sendNotification = useCallback((title, body, tag) => {
    if (Notification.permission !== 'granted') return;

    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'lifeline-' + Date.now(),
      renotify: true,
      requireInteraction: true,
    };

    // Try service worker first (works in background), fall back to Notification API
    if (swRegistration.current) {
      swRegistration.current.showNotification(title, options).catch(() => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  }, []);

  // Check tasks for upcoming deadlines (1 hour before)
  const checkTaskDeadlines = useCallback(() => {
    if (!tasks || tasks.length === 0) return;

    const now = new Date();

    tasks.forEach((task) => {
      if (!task.dueDate || task.status === 'completed') return;
      if (notifiedTaskIds.current.has(task.id)) return;

      const deadline = new Date(task.dueDate);
      const diffMs = deadline.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      // Notify if deadline is 55-65 minutes away
      if (diffMinutes > 0 && diffMinutes >= 55 && diffMinutes <= 65) {
        const priorityLabel = task.priority === 'critical' ? '🔴 URGENT' :
                              task.priority === 'high' ? '🟠 Important' : '';
        const prefix = priorityLabel ? priorityLabel + ' — ' : '';

        sendNotification(
          '⚠️ Deadline Alert',
          `${prefix}"${task.title}" is due in 1 hour. Don't let this slip!`,
          `task-deadline-${task.id}`
        );
        notifiedTaskIds.current.add(task.id);
      }
    });
  }, [tasks, sendNotification]);

  // Check routines at 9 PM
  const checkMissedRoutines = useCallback(() => {
    if (!routines || routines.length === 0) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const todayStr = getLocalDateStr(now);

    // Only fire between 9:00 PM and 9:01 PM
    if (hours !== 21 || minutes > 1) return;

    // Don't send twice on the same day
    if (routineNotifiedDate.current === todayStr) return;

    const dayIndex = now.getDay();

    // Find routines scheduled for today that are NOT completed
    const missedRoutines = routines.filter((r) => {
      if (!r.days || !r.days.includes(dayIndex)) return false;
      return !r.logs || !r.logs[todayStr];
    });

    if (missedRoutines.length === 0) {
      routineNotifiedDate.current = todayStr;
      return;
    }

    const routineNames = missedRoutines.map(r => r.title);
    const count = missedRoutines.length;

    let body;
    if (count === 1) {
      body = `You haven't completed "${routineNames[0]}" today. Still time to get it done!`;
    } else if (count <= 3) {
      body = `You missed ${count} routines today: ${routineNames.join(', ')}. There's still time to knock them out!`;
    } else {
      const shown = routineNames.slice(0, 3).join(', ');
      body = `You missed ${count} routines today: ${shown}, and ${count - 3} more. Don't end the day without checking these off!`;
    }

    sendNotification(
      '📋 Daily Routine Check-in',
      body,
      `routine-daily-${todayStr}`
    );
    routineNotifiedDate.current = todayStr;
  }, [routines, sendNotification]);

  // Run checks every 60 seconds
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Request permission on mount
    requestPermission();

    // Initial check
    checkTaskDeadlines();
    checkMissedRoutines();

    const interval = setInterval(() => {
      checkTaskDeadlines();
      checkMissedRoutines();
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [requestPermission, checkTaskDeadlines, checkMissedRoutines]);

  return { requestPermission };
}
