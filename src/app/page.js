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
import DraftView from '@/components/DraftView';
import FocusView from '@/components/FocusView';
import FloatingClock from '@/components/FloatingClock';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu } from 'lucide-react';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      case 'drafts':
        return <DraftView />;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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
          <div className="loading-dots" style={{ justifyContent: 'center' }}>
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TaskProvider>
      <RoutineProvider>
        <AppContent />
      </RoutineProvider>
    </TaskProvider>
  );
}
