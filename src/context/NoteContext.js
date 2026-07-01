'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const NoteContext = createContext();
const STORAGE_KEY = 'lifeline-ai-notes';

const getLocalDateStr = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

export function NoteProvider({ children }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
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
          setNotes(cached);
        } else {
          setNotes([]);
        }
        setIsLoaded(true);

        if (user && Date.now() - lastSynced > 300000) {
          const { data, error } = await supabase
            .from('notes')
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
            setNotes(mappedData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: mappedData, lastSynced: Date.now() }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotes();
  }, [user]);

  const syncNote = async (note, action = 'upsert') => {
    if (!user) return;
    try {
      if (action === 'delete') {
        await supabase.from('notes').delete().eq('id', note.id).eq('user_id', user.id);
      } else {
        await supabase.from('notes').upsert({ ...note, user_id: user.id });
      }
    } catch (err) {
      console.error('Supabase sync error', err);
    }
  };

  const addNote = useCallback((noteContent, category = 'general', customDate = null) => {
    const newNote = {
      id: crypto.randomUUID(),
      content: noteContent,
      category,
      date: customDate || getLocalDateStr(),
      createdAt: new Date().toISOString()
    };
    
    setNotes(prev => {
      const updated = [newNote, ...prev]; // newer first
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updated, lastSynced: Date.now() }));
      return updated;
    });
    syncNote(newNote, 'upsert');
  }, [user]);

  const updateNote = useCallback((id, updates) => {
    setNotes((prev) => {
      let updatedNote = null;
      const updatedList = prev.map((n) => {
        if (n.id === id) {
          updatedNote = { ...n, ...updates };
          return updatedNote;
        }
        return n;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updatedList, lastSynced: Date.now() }));
      if (updatedNote) syncNote(updatedNote, 'upsert');
      return updatedList;
    });
  }, [user]);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updated, lastSynced: Date.now() }));
      return updated;
    });
    syncNote({ id }, 'delete');
  }, [user]);

  return (
    <NoteContext.Provider
      value={{
        notes,
        isLoaded,
        addNote,
        updateNote,
        deleteNote
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}
