'use client';

import { useState, useEffect } from 'react';
import { TaskProvider, useTasks } from '@/context/TaskContext';
import { RoutineProvider, useRoutines } from '@/context/RoutineContext';
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
import { useNotifications } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import AIChatPanel from '@/components/AIChatPanel';
import { MessageSquare } from 'lucide-react';
import NotificationDaemon from '@/components/NotificationDaemon';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { tasks } = useTasks();
  const { routines } = useRoutines();

  // Initialize notification system
  useNotifications(tasks, routines);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'chat') {
      setActiveView(hash);
    }
    
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && newHash !== 'chat') setActiveView(newHash);
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

      <main className="main-content" style={{ paddingBottom: '70px' }}>
        <header className="page-header" style={{ display: 'none' /* handled by inner components */ }} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Chat Button (FAB) */}
      <motion.button
        className="fab-chat-btn"
        onClick={() => setIsChatOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          zIndex: 900,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <MessageSquare size={24} />
      </motion.button>

      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
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
          <NotificationDaemon />
          <AppContent />
        </NoteProvider>
      </RoutineProvider>
    </TaskProvider>
  );
}
