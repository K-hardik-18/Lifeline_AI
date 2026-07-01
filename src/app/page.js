'use client';

import { useState, useEffect } from 'react';
import { TaskProvider } from '@/context/TaskContext';
import { RoutineProvider } from '@/context/RoutineContext';
import Navbar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import TaskManager from '@/components/TaskManager';
import ChatView from '@/components/ChatView';
import CalendarView from '@/components/CalendarView';
import Analytics from '@/components/Analytics';
import RoutineView from '@/components/RoutineView';
import NotesView from '@/components/NotesView';
import FocusView from '@/components/FocusView';
import FloatingClock from '@/components/FloatingClock';
import { NoteProvider } from '@/context/NoteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveView(hash);
    }
    
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash) setActiveView(newHash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} />;
      case 'tasks':
        return <TaskManager />;
      case 'chat':
        return <ChatView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <Analytics />;
      case 'routines':
        return <RoutineView />;
      case 'notes':
        return <NotesView />;
      case 'focus':
        return <FocusView />;
      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        currentView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.location.hash = view;
          setSidebarOpen(false);
        }}
      />

      <main className="main-content">
        <header className="page-header" style={{ display: 'none' /* handled by inner components */ }} />
        
        <div style={{ height: '100%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <FloatingClock />
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
            animation: 'gentleFloat 2s ease-in-out infinite',
          }}>
            <Sparkles size={48} className="text-purple" />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #4F6EF7 0%, #8B5CF6 50%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            LifeLine AI
          </div>
        </div>
      </div>
    );
  }

  return (
    <TaskProvider>
      <RoutineProvider>
        <NoteProvider>
          <AppContent />
        </NoteProvider>
      </RoutineProvider>
    </TaskProvider>
  );
}
