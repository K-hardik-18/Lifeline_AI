"use client";
import { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Timer, BarChart3, Activity, Sparkles, PenTool } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from '@/context/ThemeContext';

import ProfileMenu from './ProfileMenu';

export default function Sidebar({ currentView, onNavigate }) {
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
    { id: "routines", label: "Routines", icon: Activity },
    { id: "focus", label: "Focus", icon: Timer },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <>
      <header className="top-navbar">
        <div className="navbar-container">
          <motion.div 
            className="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Sparkles className="logo-icon" size={24} color="var(--accent-purple)" />
            <span>LifeLine AI</span>
          </motion.div>

          {/* Desktop Nav */}
          {!isMobile && (
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
          )}

          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <div className="bottom-tab-bar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`tab-item ${isActive ? "active" : ""}`}
              >
                <div className="tab-icon-wrapper">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      className="tab-indicator"
                      layoutId="mobileTabIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                <span className="tab-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
