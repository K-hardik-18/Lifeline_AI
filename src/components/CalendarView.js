'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, X, CheckCircle2, Clock 
} from 'lucide-react';

function formatDueDate(dateStr) {
  if (!dateStr) return '';
  const due = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const timeStr = due.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (due >= today && due < tomorrow) return `Today at ${timeStr}`;
  if (due >= tomorrow && due < dayAfter) return `Tomorrow at ${timeStr}`;
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CalendarView() {
  const { tasks, toggleTaskStatus } = useTasks();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const selectedPanelRef = useRef(null);

  // Auto-scroll to task panel when a date is selected
  useEffect(() => {
    if (selectedDate && selectedPanelRef.current) {
      setTimeout(() => {
        selectedPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedDate]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  // Build task count map keyed by "YYYY-MM-DD"
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

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = [];

    // Blank cells for offset
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, key: `blank-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasksByDate[dateKey] || [];
      const isToday =
        d === now.getDate() &&
        currentMonth === now.getMonth() &&
        currentYear === now.getFullYear();
      cells.push({ day: d, key: dateKey, tasks: dayTasks, isToday });
    }

    return cells;
  }, [currentMonth, currentYear, tasksByDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const getLevel = (count) => {
    if (count === 0) return 'level-0';
    if (count === 1) return 'level-1';
    if (count === 2) return 'level-2';
    return 'level-3';
  };

  const selectedDayKey = selectedDate;
  const selectedTasks = selectedDayKey ? (tasksByDate[selectedDayKey] || []) : [];

  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="page-body h-full">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <CalendarIcon className="text-orange" /> Calendar
            </h1>
            <p className="page-subtitle">Deadline heatmap & schedule</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        {/* Month Header */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn btn-ghost p-2" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </motion.button>
          <motion.h2 
            key={`${currentMonth}-${currentYear}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }}
          >
            {MONTH_NAMES[currentMonth]} {currentYear}
          </motion.h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn btn-ghost p-2" onClick={nextMonth}>
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>

        {/* Weekday Headers */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            marginBottom: 'var(--space-sm)',
          }}
        >
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              style={{
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: 'var(--space-sm) 0',
              }}
            >
              {wd}
            </div>
          ))}
        </motion.div>

        {/* Calendar Grid */}
        <motion.div variants={itemVariants} className="heatmap-grid" style={{ marginBottom: 'var(--space-xl)', gap: 8 }}>
          <AnimatePresence mode="popLayout">
            {calendarDays.map((cell, i) => {
              if (cell.day === null) {
                return <div key={cell.key} style={{ aspectRatio: '1' }} />;
              }
              const count = cell.tasks.length;
              const level = getLevel(count);
              const isSelected = cell.key === selectedDate;

              return (
                <motion.div
                  key={cell.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`heatmap-cell ${level} ${cell.isToday ? 'today' : ''}`}
                  style={{
                    flexDirection: 'column',
                    outline: isSelected ? '2px solid var(--accent-purple)' : 'none',
                    outlineOffset: -2,
                    borderRadius: 'var(--radius-md)',
                  }}
                  onClick={() => setSelectedDate(cell.key)}
                >
                  <span style={{ fontSize: 14, fontWeight: cell.isToday ? 800 : 500 }}>
                    {cell.day}
                  </span>
                  {count > 0 && (
                    <span style={{ fontSize: 10, opacity: 0.8, marginTop: 2, fontWeight: 500 }}>
                      {count} task{count > 1 ? 's' : ''}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Legend */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-lg)',
            justifyContent: 'center',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>LEGEND:</span>
          {[
            { level: 'level-0', label: 'No tasks' },
            { level: 'level-1', label: '1 task' },
            { level: 'level-2', label: '2 tasks' },
            { level: 'level-3', label: '3+ tasks' },
          ].map(({ level, label }) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                className={`heatmap-cell ${level}`}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  aspectRatio: 'unset',
                  cursor: 'default',
                  fontSize: 0,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Selected Day Panel */}
        <AnimatePresence>
          {selectedDate && (
            <motion.section
              ref={selectedPanelRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{ marginBottom: 'var(--space-2xl)' }}
            >
              <div className="section-header">
                <h2 className="section-title flex items-center gap-2">
                  <MapPin size={20} className="text-purple" /> {selectedLabel}
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  className="btn btn-ghost p-2" 
                  onClick={() => setSelectedDate(null)}
                >
                  <X size={16} />
                </motion.button>
              </div>

              {selectedTasks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                  <div className="text-green mb-4 opacity-50"><CheckCircle2 size={48} className="mx-auto" /></div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                    No tasks scheduled for this day. Enjoy!
                  </p>
                </div>
              ) : (
                <div className="task-list">
                  {selectedTasks.map((task, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={task.id}
                      className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
                    >
                      <div
                        className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <AnimatePresence>
                          {task.status === 'completed' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <CheckCircle2 size={14} color="white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="task-content">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span className={`priority-dot ${task.priority}`} />
                          <span className="task-meta-item flex items-center gap-1"><Clock size={12} /> {formatDueDate(task.dueDate)}</span>
                          {task.category && (
                            <span className={`badge badge-${task.category}`}>{task.category}</span>
                          )}
                          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
