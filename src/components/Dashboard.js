'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTasks } from '@/context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ListTodo, Plus, CheckCircle, Clock, AlertTriangle, Calendar, RefreshCw, CheckCircle2, CalendarDays, Zap, Lightbulb, MessageSquare, Volume2, Square, CalendarPlus } from 'lucide-react';
import { marked } from 'marked';
import { useAuth } from '@/context/AuthContext';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useNotes } from '@/context/NoteContext';
import { Send } from 'lucide-react';
import NotesView from './NotesView';

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

  if (due >= today && due < tomorrow) {
    return `Today at ${timeStr}`;
  }
  if (due >= tomorrow && due < dayAfter) {
    return `Tomorrow at ${timeStr}`;
  }
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard({ onNavigate }) {
  const {
    tasks,
    isLoaded,
    toggleTaskStatus,
    getStats,
    getTasksDueToday,
    getOverdueTasks,
  } = useTasks();

  const { addNote } = useNotes();
  const [quickNote, setQuickNote] = useState('');
  const [briefing, setBriefing] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { connectGoogleCalendar } = useAuth();
  const { fetchTodayEvents, createEvent, loading: calLoading, error: calError, isConnected } = useGoogleCalendar();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [schedulingTaskId, setSchedulingTaskId] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchTodayEvents().then(setCalendarEvents);
    }
  }, [isConnected, fetchTodayEvents]);

  const handlePushToCalendar = async (task) => {
    setSchedulingTaskId(task.id);
    try {
      await createEvent(task.title, task.estimatedMinutes || 30);
      alert(`Successfully scheduled "${task.title}" in Google Calendar!`);
    } catch (err) {
      alert('Failed to schedule in calendar.');
    } finally {
      setSchedulingTaskId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (typeof window === 'undefined') return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!briefing) return;

    const textToSpeak = briefing.replace(/[#*`_]/g, '');

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('Speech synthesis error', e);
      }
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const fetchBriefing = useCallback(async () => {
    if (!tasks.length) return;
    setBriefingLoading(true);
    setBriefingError('');
    try {
      const res = await fetch('/api/ai/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tasks: Array.from(tasks.values()),
          currentTime: new Date().toString()
        }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('rate_limit');
        }
        throw new Error('Failed to fetch briefing');
      }
      const data = await res.json();
      setBriefing(data.briefing || data.result || data.text || JSON.stringify(data));
    } catch (err) {
      if (err.message === 'rate_limit') {
        setBriefingError('AI is thinking too fast! Taking a quick breath... retrying shortly.');
      } else {
        setBriefingError('Could not load AI briefing right now. Try again later.');
      }
    } finally {
      setBriefingLoading(false);
    }
  }, [tasks]);

  useEffect(() => {
    // Only fetch automatically if they click the button, don't auto-fetch on load anymore as requested.
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const todayTasks = getTasksDueToday();
  const overdueTasks = getOverdueTasks();
  const criticalTasks = tasks.filter(
    (t) => t.priority === 'critical' && t.status !== 'completed'
  );
  const dangerTasks = [
    ...overdueTasks,
    ...criticalTasks.filter((ct) => !overdueTasks.find((ot) => ot.id === ct.id)),
  ];

  if (tasks.length === 0) {
    return (
      <div className="page-body flex items-center justify-center">
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          <div className="empty-state-icon" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <Zap size={48} strokeWidth={1.5} />
          </div>
          <h3 className="empty-state-title">Welcome to LifeLine AI</h3>
          <p className="empty-state-text">
            Your dashboard is empty. Add your first task to get started with AI-powered productivity.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg mt-4"
            onClick={() => onNavigate('tasks')}
          >
            <Plus size={18} /> Add Your First Task
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="page-body"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Quick Actions (Moved to Top) ── */}
      <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="quick-action" onClick={() => onNavigate('tasks')}>
            <Plus size={16} /> Add Task
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="quick-action" onClick={() => onNavigate('calendar')}>
            <CalendarDays size={16} /> View Calendar
          </motion.button>
        </div>
      </motion.section>

      {/* ── AI Daily Briefing ── */}
      <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <Brain className="text-purple" size={24} /> AI Daily Briefing
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="btn btn-primary" 
              onClick={fetchBriefing}
            >
              <RefreshCw size={16} /> Get Briefing
            </motion.button>
            {briefing && !briefingLoading && !briefingError && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline"
                onClick={toggleSpeech}
              >
                {isSpeaking ? (
                  <><Square size={16} color="var(--accent-red)" /> Stop</>
                ) : (
                  <><Volume2 size={16} /> Read Aloud</>
                )}
              </motion.button>
            )}
          </div>
        </div>

        <div className="briefing-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-5 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
          
          <AnimatePresence mode="wait">
            {briefingLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Analyzing your tasks and generating briefing...
                </span>
              </motion.div>
            ) : briefingError ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 text-orange"
              >
                <AlertTriangle size={20} />
                <p style={{ fontSize: 14 }}>{briefingError}</p>
              </motion.div>
            ) : briefing ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-sm max-w-none prose-p:text-sm prose-p:leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-li:my-1"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(briefing),
                }}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '32px',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.95rem',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}
              >
                Click "Get Briefing" to generate your personalized daily summary.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ── Stats Grid ── */}
      <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="stats-grid">
          <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('tasks')} className="stat-card blue relative overflow-hidden" style={{ cursor: 'pointer' }}>
            <div className="absolute -right-4 -bottom-4 opacity-10"><ListTodo size={80} /></div>
            <div className="stat-icon blue"><ListTodo size={20} /></div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </motion.div>
          <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('tasks')} className="stat-card green relative overflow-hidden" style={{ cursor: 'pointer' }}>
            <div className="absolute -right-4 -bottom-4 opacity-10"><CheckCircle2 size={80} /></div>
            <div className="stat-icon green"><CheckCircle2 size={20} /></div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </motion.div>
          <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('tasks')} className="stat-card orange relative overflow-hidden" style={{ cursor: 'pointer' }}>
            <div className="absolute -right-4 -bottom-4 opacity-10"><CalendarDays size={80} /></div>
            <div className="stat-icon orange"><CalendarDays size={20} /></div>
            <div className="stat-value">{stats.dueToday}</div>
            <div className="stat-label">Due Today</div>
          </motion.div>
          <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('tasks')} className="stat-card red relative overflow-hidden" style={{ cursor: 'pointer' }}>
            <div className="absolute -right-4 -bottom-4 opacity-10"><AlertTriangle size={80} /></div>
            <div className="stat-icon red"><AlertTriangle size={20} /></div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Today's Schedule (Google Calendar) ── */}
      <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <CalendarDays className="text-blue" size={24} /> Today&apos;s Schedule
          </h2>
          {!isConnected && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-outline btn-sm"
              onClick={connectGoogleCalendar}
            >
              <Calendar size={14} /> Connect Google Calendar
            </motion.button>
          )}
        </div>

        {isConnected ? (
          <div className="card" style={{ padding: 'var(--space-lg)', minHeight: 120 }}>
            {calLoading && !calendarEvents.length ? (
               <div className="flex items-center justify-center h-full"><div className="loading-dots"><span></span><span></span><span></span></div></div>
            ) : calError ? (
               <div className="text-red flex items-center gap-2"><AlertTriangle size={16} /> {calError}</div>
            ) : calendarEvents.length > 0 ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {calendarEvents.map(ev => {
                   const start = new Date(ev.start.dateTime || ev.start.date);
                   const end = new Date(ev.end.dateTime || ev.end.date);
                   const isAllDay = !ev.start.dateTime;
                   return (
                     <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--accent-blue)' }}>
                       <div style={{ minWidth: '85px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                         {isAllDay ? 'All Day' : start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                       <div style={{ flex: 1, fontWeight: 500 }}>{ev.summary}</div>
                     </div>
                   )
                 })}
               </div>
            ) : (
               <div className="empty-state">No upcoming meetings today. Time to get some deep work done!</div>
            )}
          </div>
        ) : (
          <div className="card empty-state" style={{ padding: 'var(--space-xl)' }}>
            <CalendarDays size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
            <p>Connect your Google Calendar to see your upcoming meetings alongside your tasks.</p>
          </div>
        )}
      </motion.section>

      {/* ── Danger Zone ── */}
      {dangerTasks.length > 0 && (
        <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <AlertTriangle className="text-red" size={24} /> Danger Zone
            </h2>
            <span className="badge badge-critical">{dangerTasks.length} urgent</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <AnimatePresence>
              {dangerTasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={task.id}
                  className="card relative overflow-hidden border-red"
                  style={{
                    background: 'rgba(239,68,68,0.04)',
                    boxShadow: '0 0 20px rgba(239,68,68,0.1) inset'
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                    <span
                      className={`priority-dot ${task.priority}`}
                      style={{ marginTop: 6 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                          marginBottom: 4,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {task.title}
                      </div>
                      <div className="task-meta">
                        <span className="task-meta-item overdue flex items-center gap-1">
                          <Calendar size={14} /> {formatDueDate(task.dueDate)}
                        </span>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          color: 'var(--accent-orange)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Lightbulb size={14} /> {isOverdue(task.dueDate)
                          ? 'This task is overdue — prioritize it immediately.'
                          : 'Critical priority — tackle this before anything else.'}
                      </div>
                    </div>
                    {isConnected && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn btn-ghost btn-icon"
                        title="Schedule in Google Calendar"
                        disabled={schedulingTaskId === task.id}
                        onClick={() => handlePushToCalendar(task)}
                        style={{ alignSelf: 'center' }}
                      >
                        {schedulingTaskId === task.id ? <span className="spinner" style={{width: 14, height:14, borderTopColor: 'var(--text-primary)'}}/> : <CalendarPlus size={18} className="text-blue" />}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* ── Today's Focus ── */}
      <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <Zap className="text-blue" size={24} /> Today&apos;s Focus
          </h2>
          {todayTasks.length > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {todayTasks.length === 0 ? (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="card flex flex-col items-center justify-center py-12"
          >
            <div className="text-green mb-4 opacity-50"><CheckCircle2 size={48} /></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Nothing due today — great job staying ahead!
            </p>
          </motion.div>
        ) : (
          <div className="task-list">
            <AnimatePresence>
              {todayTasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={task.id}
                  className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
                >
                  <div
                    className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                    onClick={() => toggleTaskStatus(task.id)}
                  >
                    <AnimatePresence>
                      {task.status === 'completed' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <CheckCircle2 size={14} color="white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className="priority-dot" style={{ width: 8, height: 8 }}>
                        <span className={`priority-dot ${task.priority}`} />
                      </span>
                      <span className="task-meta-item flex items-center gap-1">
                        <Calendar size={12} /> {formatDueDate(task.dueDate)}
                      </span>
                      {task.category && (
                        <span className={`badge badge-${task.category}`}>{task.category}</span>
                      )}
                    </div>
                  </div>
                  {isConnected && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn btn-ghost btn-icon"
                      title="Schedule in Google Calendar"
                      disabled={schedulingTaskId === task.id}
                      onClick={(e) => { e.stopPropagation(); handlePushToCalendar(task); }}
                      style={{ marginLeft: 'auto' }}
                    >
                      {schedulingTaskId === task.id ? <span className="spinner" style={{width: 14, height:14, borderTopColor: 'var(--text-primary)'}}/> : <CalendarPlus size={18} className="text-blue" />}
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

    </motion.div>
  );
}
