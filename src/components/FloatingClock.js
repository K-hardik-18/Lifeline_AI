'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Minimize2, Maximize2 } from 'lucide-react';

export default function FloatingClock() {
  const [time, setTime] = useState(new Date());
  const [clickState, setClickState] = useState(0); // 0: HH:MM:SS, 1: HH:MM, 2: "C" icon

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('floatingClockState');
    if (saved) {
      setClickState(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStringHMS = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timeStringHM = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const handleClick = () => {
    setClickState(prev => {
      const nextState = (prev + 1) % 3;
      localStorage.setItem('floatingClockState', nextState.toString());
      return nextState;
    });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 1000
    }}>
      <AnimatePresence mode="wait">
        {clickState !== 2 ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="card-glass"
            onClick={handleClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 20px',
              minWidth: '140px',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                {dateString}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} className="text-blue" />
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {clickState === 0 ? timeStringHMS : timeStringHM}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.5, x: -50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={handleClick}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              fontWeight: 800,
              userSelect: 'none'
            }}
            title="Expand Clock"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            C
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
