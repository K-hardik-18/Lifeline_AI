'use client';

import { useState } from 'react';
import { useRoutines } from '@/context/RoutineContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Check, Brain, Sparkles, X, BarChart3, Edit2, CalendarDays, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

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

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function RoutineView() {
  const { routines, toggleRoutineForDate, addRoutine, updateRoutine, deleteRoutine, getProgressForDate, getTopicAnalytics, getRoutineHistoryStats, getTimeframeAggregate } = useRoutines();
  
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' or 'history'
  const [timeframe, setTimeframe] = useState('all'); // 'weekly', 'monthly', 'yearly', 'all'
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'health', priority: 'medium', days: [0, 1, 2, 3, 4, 5, 6] });
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const getLocalDateStr = (date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
    return adjusted.toISOString().split('T')[0];
  };

  const todayStr = getLocalDateStr(currentDate);
  const todayDayIndex = currentDate.getDay();
  const todayDisplayString = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const isActuallyToday = getLocalDateStr(new Date()) === todayStr;

  const todayProgress = getProgressForDate(currentDate);
  const topicStats = getTopicAnalytics();
  
  const { overall, categories: historyCategories } = getTimeframeAggregate(timeframe);

  const todaysRoutines = routines.filter(r => !r.days || r.days.includes(todayDayIndex));

  const openAddModal = () => {
    setFormData({ title: '', category: 'health', priority: 'medium', days: [0, 1, 2, 3, 4, 5, 6], startDate: getLocalDateStr() });
    setShowModal(true);
  };

  const openEditModal = (routine) => {
    setFormData({ ...routine, startDate: routine.startDate || getLocalDateStr(new Date(routine.createdAt || Date.now())) });
    setShowModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || formData.days.length === 0) return;
    
    if (formData.id) {
      updateRoutine(formData.id, formData);
    } else {
      addRoutine(formData);
    }
    setShowModal(false);
  };

  const toggleDay = (dayIdx) => {
    setFormData(prev => {
      const newDays = prev.days.includes(dayIdx) 
        ? prev.days.filter(d => d !== dayIdx) 
        : [...prev.days, dayIdx].sort();
      return { ...prev, days: newDays };
    });
  };

  const toggleAllDays = () => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6]
    }));
  };

  const handleAiAnalysis = async () => {
    if (routines.length === 0) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/routine-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routines }),
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const acceptAiSuggestion = (suggestion) => {
    addRoutine({
      title: suggestion.title,
      category: suggestion.category,
      priority: suggestion.priority,
      days: [0, 1, 2, 3, 4, 5, 6]
    });
    setAiAnalysis(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.title !== suggestion.title)
    }));
  };

  return (
    <motion.div className="page-body" variants={containerVariants} initial="hidden" animate="show">
      <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <h2 className="section-title flex items-center gap-2">
          <Activity className="text-purple" size={24} /> Daily Habits & Routines
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary"
          onClick={openAddModal}
        >
          <Plus size={16} /> New Habit
        </motion.button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <button 
          className={`btn ${activeTab === 'tracker' ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('tracker')}
        >
          <Activity size={16} /> Daily Tracker
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('history')}
        >
          <CalendarDays size={16} /> History & Analytics
        </button>
      </div>

      {activeTab === 'tracker' && (
        <div className="routine-tracker-layout">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {/* AI Analysis Section */}
            <motion.div variants={itemVariants} className="briefing-card" style={{ padding: 'var(--space-lg)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
                  <Brain size={20} /> AI Habit Coach
                </h3>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-ghost btn-sm"
                  onClick={handleAiAnalysis}
                  disabled={aiLoading || routines.length === 0}
                >
                  {aiLoading ? (
                    <span className="flex items-center gap-2"><Sparkles className="spin" size={14}/> Analyzing...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Sparkles size={14}/> Analyze My Routines</span>
                  )}
                </motion.button>
              </div>
              
              {aiAnalysis ? (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="prose">
                    <p>{aiAnalysis.analysis}</p>
                    
                    {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
                      <div style={{ marginTop: 'var(--space-md)' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>Suggested Habits to Add:</h4>
                        <div className="flex flex-col gap-2">
                          {aiAnalysis.suggestions.map((sug, idx) => (
                            <div key={idx} className="card flex items-center justify-between" style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--bg-secondary)' }}>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{sug.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{sug.reason}</div>
                              </div>
                              <button className="btn btn-ghost btn-sm" onClick={() => acceptAiSuggestion(sug)} style={{ color: 'var(--accent-blue)' }}>
                                <Plus size={16} /> Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  Click analyze to get personalized insights and new habit recommendations based on your completion consistency.
                </p>
              )}
            </motion.div>

            {/* Daily Checklist */}
            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-md)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Daily Checklist</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setDate(d.getDate() - 1); return nd; })}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', fontWeight: 500, minWidth: '130px', textAlign: 'center' }}>
                    {todayDisplayString}
                  </span>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setDate(d.getDate() + 1); return nd; })}
                    disabled={isActuallyToday}
                    style={{ opacity: isActuallyToday ? 0.3 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              {todaysRoutines.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                  <Activity size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
                  <p>No routines scheduled for today. Take a break or add a new habit!</p>
                </div>
              ) : (
                <div className="task-list">
                  <AnimatePresence>
                    {todaysRoutines.map((routine) => {
                      const isDone = !!routine.logs[todayStr];
                      return (
                        <motion.div
                          key={routine.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`task-item ${isDone ? 'completed' : ''}`}
                        >
                          <div className={`priority-dot priority-${routine.priority}`} />
                          <button
                            className={`task-checkbox ${isDone ? 'checked' : ''}`}
                            onClick={() => toggleRoutineForDate(routine.id, todayStr)}
                          >
                            {isDone && <Check size={14} strokeWidth={3} />}
                          </button>
                          
                          <div className="task-content">
                            <h3 className="task-title" style={{ fontSize: '1.05rem' }}>{routine.title}</h3>
                          </div>

                          <div className="task-meta">
                            <span className={`badge badge-${routine.category}`}>
                              {routine.category}
                            </span>
                          </div>
                          
                          <div className="task-actions" style={{ marginLeft: 'var(--space-md)', gap: '4px' }}>
                            <button className="btn btn-ghost btn-icon" onClick={() => openEditModal(routine)} title="Edit Habit">
                              <Edit2 size={16} />
                            </button>
                            <button className="btn btn-ghost btn-icon" onClick={() => deleteRoutine(routine.id)} title="Delete Habit">
                              <X size={16} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Analytics */}
          <motion.div variants={itemVariants} className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 className="flex items-center gap-2 mb-6" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              <BarChart3 size={20} className="text-blue" /> Consistency Stats
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
              <div 
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: `conic-gradient(var(--accent-blue) ${todayProgress}%, var(--border-color) 0)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  width: 110,
                  height: 110,
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{todayProgress}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today</span>
                </div>
              </div>
              <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                {todayProgress === 100 ? (isActuallyToday ? "Perfect day! You crushed all your habits! 🎉" : "Perfect day! You crushed it! 🎉") : (isActuallyToday ? "Keep going, build that momentum!" : "You missed some habits this day.")}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>Topic Consistency</h4>
              
              {topicStats.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No data yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {topicStats.map(stat => (
                    <div key={stat.category}>
                      <div className="flex justify-between mb-1">
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize' }}>{stat.category}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percentage}%` }}
                          transition={{ duration: 1, type: "spring" }}
                          style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'history' && (
        <motion.div variants={itemVariants} className="card" style={{ padding: 'var(--space-xl)' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>History & Analytics</h3>
            <div className="flex gap-2">
              {['weekly', 'monthly', 'yearly', 'all'].map(tf => (
                <button
                  key={tf}
                  className={`btn ${timeframe === tf ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
                  onClick={() => { setTimeframe(tf); setExpandedCategory(null); }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>Overall Consistency</h4>
            <div 
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: `conic-gradient(var(--accent-blue) ${overall}%, var(--border-color) 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                width: 130,
                height: 130,
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overall}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{timeframe}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>Category Breakdown</h4>
            
            {historyCategories.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)' }}>No routines tracked yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {historyCategories.map(cat => (
                  <div key={cat.name} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                      style={{ padding: 'var(--space-lg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '1.05rem', fontWeight: 600, textTransform: 'capitalize' }}>{cat.name}</span>
                          {expandedCategory === cat.name ? <ChevronUp size={16} className="text-tertiary" /> : <ChevronDown size={16} className="text-tertiary" />}
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{cat.percentage}%</span>
                      </div>
                      
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 1, type: "spring" }}
                          style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: '4px' }}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedCategory === cat.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden', background: 'var(--bg-secondary)' }}
                        >
                          <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                            {cat.routines.map(stat => (
                              <div key={stat.id} className="card" style={{ padding: 'var(--space-md)', background: 'var(--bg-primary)' }}>
                                <div className="flex justify-between items-start mb-2">
                                  <div style={{ fontWeight: 500 }}>{stat.title}</div>
                                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                    {stat.historyStats.percentage}%
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                  Completed {stat.historyStats.completedDays} out of {stat.historyStats.totalDays} possible days.
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Add/Edit Routine Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">{formData.id ? 'Edit Habit' : 'Create Daily Habit'}</h2>
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="input-group">
                    <label className="input-label">Habit Name</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="e.g. 1 hr LeetCode, 30 min Reading" 
                      value={formData.title || ''}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      autoFocus
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Start Date</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={formData.startDate || ''}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>

                  <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="input-label" style={{ marginBottom: 0 }}>Schedule Days</label>
                      <button 
                        type="button" 
                        onClick={toggleAllDays}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        {formData.days.length === 7 ? 'Clear' : 'Everyday'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                      {DAYS.map((dayLabel, idx) => {
                        const isSelected = formData.days.includes(idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDay(idx)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              border: isSelected ? 'none' : '1px solid var(--border-color)',
                              background: isSelected ? 'var(--gradient-primary)' : 'transparent',
                              color: isSelected ? '#fff' : 'var(--text-secondary)',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                          >
                            {dayLabel}
                          </button>
                        );
                      })}
                    </div>
                    {formData.days.length === 0 && (
                      <p style={{ color: 'var(--priority-critical)', fontSize: '0.8rem', marginTop: '4px' }}>Please select at least one day.</p>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="input-group">
                      <label className="input-label">Category</label>
                      <select 
                        className="select" 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="work">Work</option>
                        <option value="study">Study</option>
                        <option value="personal">Personal</option>
                        <option value="finance">Finance</option>
                        <option value="health">Health</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Priority</label>
                      <select 
                        className="select"
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value})}
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!formData.title?.trim() || formData.days.length === 0}>Save Habit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
