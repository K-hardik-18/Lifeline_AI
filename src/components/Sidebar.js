"use client";
import { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, MessageSquare, CalendarDays, BarChart3, PenTool, Sparkles, Timer, Activity, Menu, X, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '@/context/ThemeContext';

import ProfileMenu from './ProfileMenu';

export default function Sidebar({ currentView, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme() || { theme: 'light', toggleTheme: () => {} };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "notes", label: "Brain Dump", icon: PenTool },
    { id: "focus", label: "Focus Mode", icon: Timer },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "routines", label: "Routines", icon: Activity },
  ];

  return (
    <header className="top-navbar">
      <div className="navbar-container">
        <motion.div 
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          onClick={() => {
            if (isMobile) setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          style={{ cursor: isMobile ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
        >
          {isMobile && (
            <div className="mobile-menu-trigger" style={{ marginRight: '8px' }}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
          )}
          <Sparkles className="logo-icon" size={24} color="var(--accent-purple)" />
          <span>LifeLine AI</span>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="navbar-nav desktop-nav">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-item ${isActive ? "active" : ""}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="nav-label">{item.label}</span>
                {isActive && (
                  <motion.div 
                    className="nav-item-indicator" 
                    layoutId="activeIndicatorNavbar" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Mobile Vertical Menu */}
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <motion.div
              className="mobile-vertical-menu"
              initial={{ opacity: 0, x: -20, y: 70 }}
              animate={{ opacity: 1, x: 0, y: 70 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            >
              <div className="mobile-menu-inner">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`mobile-nav-item ${isActive ? "active" : ""}`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="mobile-nav-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button onClick={toggleTheme} className="btn btn-icon btn-ghost" aria-label="Toggle Dark Mode">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <ProfileMenu />
        </div>
      </div>
      
    </header>
  );
}

