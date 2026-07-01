"use client";
import { LayoutDashboard, CheckSquare, MessageSquare, CalendarDays, BarChart3, PenTool, Sparkles, Timer, Activity } from "lucide-react";
import { motion } from "framer-motion";

import ProfileMenu from './ProfileMenu';

export default function Sidebar({ currentView, onNavigate }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "focus", label: "Focus Mode", icon: Timer },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "routines", label: "Routines", icon: Activity },
    { id: "drafts", label: "Drafts", icon: PenTool },
  ];

  return (
    <header className="top-navbar">
      <div className="navbar-container">
        <motion.div 
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Sparkles className="logo-icon" size={24} color="var(--accent-purple)" />
          <span>LifeLine AI</span>
        </motion.div>

        <nav className="navbar-nav">
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

        <div className="navbar-actions">
          <ProfileMenu />
        </div>
      </div>
      
      <style jsx>{`
        .top-navbar {
          background: rgba(253, 251, 247, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
        }
        
        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-xl);
          height: 70px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-icon {
          -webkit-text-fill-color: initial;
        }
        
        .navbar-nav {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .navbar-nav::-webkit-scrollbar {
          display: none;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-md) var(--space-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          white-space: nowrap;
        }
        
        .nav-item:hover {
          color: var(--accent-blue);
        }
        
        .nav-item.active {
          color: var(--accent-blue);
          font-weight: 700;
        }

        .nav-item-indicator {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: var(--accent-blue);
          border-radius: 3px 3px 0 0;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .nav-label {
            display: none;
          }
          .nav-item {
            padding: var(--space-sm);
          }
          .navbar-container {
            padding: 0 var(--space-md);
          }
        }
      `}</style>
    </header>
  );
}
