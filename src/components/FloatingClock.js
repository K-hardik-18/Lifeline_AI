'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useRouter } from 'next/navigation';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FloatingClock() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  // 0: Minimized (SVG), 1: Normal (small calendar + time), 2: Expanded (full calendar)
  const [clickState, setClickState] = useState(1);
  const { tasks } = useTasks();

  const [currentMonth, setCurrentMonth] = useState(time.getMonth());
  const [currentYear, setCurrentYear] = useState(time.getFullYear());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, key: `blank-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasksByDate[dateKey] || [];
      const isToday =
        d === time.getDate() &&
        currentMonth === time.getMonth() &&
        currentYear === time.getFullYear();
      cells.push({ day: d, key: dateKey, tasks: dayTasks, isToday });
    }
    return cells;
  }, [currentMonth, currentYear, tasksByDate, time]);

  const getLevelColor = (count) => {
    if (count === 0) return 'rgba(0,0,0,0.05)';
    if (count === 1) return '#93c5fd';
    if (count === 2) return '#3b82f6';
    return '#1d4ed8';
  };

  const cycleState = (e) => {
    e.stopPropagation();
    setClickState((prev) => (prev + 1) % 3);
  };

  const prevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="floating-clock">
        <AnimatePresence mode="wait">
          
          {/* STATE 0: Minimized */}
          {clickState === 0 && (
            <motion.button
              key="minimized"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={cycleState}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'var(--bg-glass)', backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-blue)', cursor: 'pointer'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <CalendarIcon size={24} />
            </motion.button>
          )}

          {/* STATE 1: Normal (Small Calendar strip + Time) */}
          {clickState === 1 && (
            <motion.div
              key="normal"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="card-glass mobile-scale"
              onClick={cycleState}
              style={{
                display: 'flex', flexDirection: 'column',
                padding: '16px 20px', minWidth: '180px',
                cursor: 'pointer', boxShadow: 'var(--shadow-lg)', userSelect: 'none',
                borderRadius: 'var(--radius-lg)', background: 'var(--bg-glass)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {dateString}
                </span>
                <Maximize2 size={14} className="text-tertiary" />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} className="text-blue" />
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {timeString}
                </span>
              </div>
            </motion.div>
          )}

          {/* STATE 2: Expanded (Full Month Calendar + Time) */}
          {clickState === 2 && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="card-glass mobile-scale"
              style={{
                display: 'flex', flexDirection: 'column',
                padding: '20px', width: '320px',
                boxShadow: 'var(--shadow-xl)', userSelect: 'none',
                borderRadius: 'var(--radius-xl)', background: 'var(--bg-glass)',
                maxWidth: '90vw'
              }}
            >
              {/* Header: Time & Minimize Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} className="text-blue" />
                    {timeString}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                    {dateString}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={cycleState} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <Minimize2 size={18} />
                </motion.button>
              </div>

              {/* Calendar Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{MONTH_NAMES[currentMonth]} {currentYear}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}><ChevronLeft size={16}/></button>
                  <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}><ChevronRight size={16}/></button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {WEEKDAYS.map((wd, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{wd}</div>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {calendarDays.map((cell, i) => {
                  if (cell.day === null) return <div key={cell.key} />;
                  const count = cell.tasks.length;
                  return (
                    <div key={cell.key} style={{
                      aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '8px', background: cell.isToday ? 'rgba(3, 105, 161, 0.1)' : 'transparent',
                      border: cell.isToday ? '1px solid var(--accent-blue)' : '1px solid transparent'
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: cell.isToday ? 700 : 500, color: cell.isToday ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                        {cell.day}
                      </span>
                      <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                        {count > 0 && (
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: getLevelColor(count) }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </>
  );
}
