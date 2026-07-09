import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useGoogleCalendar() {
  const { providerToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodayEvents = useCallback(async () => {
    if (!providerToken) return [];
    
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const params = new URLSearchParams({
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Calendar access denied or expired. Please re-connect Google Calendar.');
        }
        throw new Error('Failed to fetch calendar events.');
      }

      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.error('Google Calendar API Error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [providerToken]);

  const createEvent = useCallback(async (taskTitle, durationMinutes = 30) => {
    if (!providerToken) throw new Error('Not connected to Google Calendar');

    setLoading(true);
    setError(null);
    try {
      // Find the next available slot or just schedule it for 'now'
      // For simplicity, schedule it starting now or at the top of the next hour
      const now = new Date();
      // Round to next 15 min block
      const startMinutes = Math.ceil(now.getMinutes() / 15) * 15;
      now.setMinutes(startMinutes, 0, 0);
      
      const endTime = new Date(now.getTime() + durationMinutes * 60000);

      const eventBody = {
        summary: taskTitle,
        description: 'Scheduled via Lifeline AI',
        start: {
          dateTime: now.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${providerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      });

      if (!res.ok) throw new Error('Failed to create event in Google Calendar');
      
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Google Calendar Push Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [providerToken]);

  return {
    fetchTodayEvents,
    createEvent,
    loading,
    error,
    isConnected: !!providerToken
  };
}
