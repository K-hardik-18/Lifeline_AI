'use client';

import { useState, useCallback } from 'react';
import { useTasks } from '@/context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Plus, Search, Calendar, Clock, 
  Trash2, X, Check, ArrowRight, CornerDownRight, Target, LayoutList, Edit2
} from 'lucide-react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'critical', label: 'Critical' },
];

const CATEGORIES = ['work', 'study', 'personal', 'finance', 'health'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 7) return `Due in ${days}d`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  category: 'work',
  priority: 'medium',
  estimatedMinutes: 30,
};

export default function TaskManager() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();

  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [smartInput, setSmartInput] = useState('');
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartSuccess, setSmartSuccess] = useState(false);
  const [prioritizeLoading, setPrioritizeLoading] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [subtasks, setSubtasks] = useState({});
  const [breakdownLoading, setBreakdownLoading] = useState(null);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  // --- Filtered tasks ---
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !(task.description || '').toLowerCase().includes(q)
      )
        return false;
    }
    if (activeFilter === 'pending') return task.status !== 'completed';
    if (activeFilter === 'completed') return task.status === 'completed';
    if (activeFilter === 'critical')
      return task.priority === 'critical' && task.status !== 'completed';
    return true;
  });

  // --- AI Smart Add ---
  const handleSmartAdd = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!smartInput.trim() || smartLoading) return;

      setSmartLoading(true);
      setError('');

      try {
        const res = await fetch('/api/ai/parse-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: smartInput }),
        });

        if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'parse_failed');

        const data = await res.json();
        if (data.task) {
          addTask(data.task);
        } else {
          addTask(data);
        }
        setSmartInput('');
        setSmartSuccess(true);
        setTimeout(() => setSmartSuccess(false), 2000);
      } catch (err) {
        if (err.message === 'rate_limit') {
           setError('AI is thinking too fast! Taking a quick breath... retrying shortly.');
        } else {
           setError('AI couldn\'t parse that. Try adding manually.');
        }
      } finally {
        setSmartLoading(false);
      }
    },
    [smartInput, smartLoading, addTask],
  );

  // --- AI Prioritize ---
  const handlePrioritize = useCallback(async () => {
    const pendingTasks = tasks.filter((t) => t.status !== 'completed');
    if (pendingTasks.length === 0 || prioritizeLoading) return;

    setPrioritizeLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: pendingTasks }),
      });

      if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'prioritize_failed');

      const data = await res.json();
      if (data.prioritizedTasks) {
        data.prioritizedTasks.forEach((pt) => {
          updateTask(pt.id, { priority: pt.priority });
        });
      }
    } catch (err) {
      if (err.message === 'rate_limit') {
         setError('AI is thinking too fast! Taking a quick breath... retrying shortly.');
      } else {
         setError('AI prioritization failed. Please try again.');
      }
    } finally {
      setPrioritizeLoading(false);
    }
  }, [tasks, prioritizeLoading, updateTask]);

  // --- AI Breakdown ---
  const handleBreakdown = useCallback(
    async (task) => {
      if (expandedTaskId === task.id && subtasks[task.id]) {
        setExpandedTaskId(null);
        return;
      }

      setExpandedTaskId(task.id);

      if (subtasks[task.id]) return;

      setBreakdownLoading(task.id);
      setError('');

      try {
        const res = await fetch('/api/ai/breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task }),
        });

        if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'breakdown_failed');

        const data = await res.json();
        setSubtasks((prev) => ({ ...prev, [task.id]: data.subtasks || [] }));
      } catch (err) {
        if (err.message === 'rate_limit') {
           setError('AI is thinking too fast! Taking a quick breath... retrying shortly.');
        } else {
           setError('Couldn\'t break down this task. Try again.');
        }
        setExpandedTaskId(null);
      } finally {
        setBreakdownLoading(null);
      }
    },
    [expandedTaskId, subtasks],
  );

  const handleAutoFill = async () => {
    if (!formData.title.trim() || autoFillLoading) return;
    setAutoFillLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: formData.title + (formData.description ? ' - ' + formData.description : '') }),
      });
      if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'parse_failed');
      const data = await res.json();
      if (data.task) {
        setFormData(prev => ({
          ...prev,
          ...data.task,
          title: data.task.title || prev.title
        }));
      }
    } catch (err) {
      if (err.message === 'rate_limit') {
         setError('AI is busy! Try again shortly.');
      } else {
         setError('Auto-fill failed. Try again.');
      }
    } finally {
      setAutoFillLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      estimatedMinutes: parseInt(formData.estimatedMinutes, 10) || 30,
    };

    if (formData.id) {
      updateTask(formData.id, taskData);
    } else {
      addTask(taskData);
    }

    setFormData(emptyForm);
    setShowModal(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <LayoutList className="text-blue" /> My Tasks
            </h1>
            <p className="page-subtitle">
              {tasks.filter((t) => t.status !== 'completed').length} pending ·{' '}
              {tasks.filter((t) => t.status === 'completed').length} completed
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary"
              onClick={handlePrioritize}
              disabled={prioritizeLoading}
            >
              {prioritizeLoading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} /> Prioritizing…
                </>
              ) : (
                <><Brain size={16} /> AI Prioritize</>
              )}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary" 
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} /> Add Task
            </motion.button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card"
              style={{
                borderColor: 'var(--accent-red)',
                marginBottom: 'var(--space-lg)',
                padding: 'var(--space-md) var(--space-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--accent-red)', fontSize: 14 }}>{error}</span>
              <button className="btn btn-ghost" onClick={() => setError('')}>
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Smart Add */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-gradient" 
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Sparkles size={20} className="text-purple" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>AI Smart Add</span>
            <AnimatePresence>
              {smartSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="badge badge-done"
                  style={{ marginLeft: 'auto' }}
                >
                  <Check size={12} /> Task added!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <form onSubmit={handleSmartAdd} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              className="input input-lg"
              style={{ flex: 1 }}
              placeholder="Type naturally... e.g., Submit assignment by Friday 5pm"
              value={smartInput}
              onChange={(e) => setSmartInput(e.target.value)}
              disabled={smartLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={smartLoading || !smartInput.trim()}
              style={{ minWidth: 52 }}
            >
              {smartLoading ? (
                <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} />
              ) : (
                <ArrowRight size={20} />
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Filter Tabs + Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
            flexWrap: 'wrap',
          }}
        >
          <div className="tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`tab${activeFilter === f.key ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-secondary pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
            <input
              className="input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: 260, paddingLeft: 36 }}
            />
          </div>
        </motion.div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state"
          >
            <div className="empty-state-icon"><Target size={48} className="text-blue opacity-50" /></div>
            <div className="empty-state-title">
              {searchQuery ? 'No matching tasks' : 'No tasks here'}
            </div>
            <p className="empty-state-text">
              {searchQuery
                ? 'Try a different search term.'
                : 'Add a task with the AI Smart Add bar above, or click "Add Task".'}
            </p>
          </motion.div>
        ) : (
          <div className="task-list">
            <AnimatePresence>
              {filteredTasks.map((task, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={task.id} 
                >
                  <div className={`task-item${task.status === 'completed' ? ' completed' : ''}`}>
                    {/* Priority dot */}
                    <div
                      className={`priority-dot ${task.priority}`}
                      style={{ marginTop: 8 }}
                    />

                    {/* Checkbox */}
                    <div
                      className={`task-checkbox${task.status === 'completed' ? ' checked' : ''}`}
                      onClick={() => toggleTaskStatus(task.id)}
                    >
                      <AnimatePresence>
                        {task.status === 'completed' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check size={14} color="white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Content */}
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <p
                          style={{
                            fontSize: 13,
                            color: 'var(--text-tertiary)',
                            marginBottom: 8,
                            lineHeight: 1.5,
                          }}
                        >
                          {task.description}
                        </p>
                      )}
                      <div className="task-meta">
                        {task.dueDate && (
                          <span
                            className={`task-meta-item flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'completed' ? ' overdue' : ''}`}
                          >
                            <Calendar size={12} /> {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.category && (
                          <span className={`badge badge-${task.category}`}>
                            {task.category}
                          </span>
                        )}
                        <span className={`badge badge-${task.priority}`}>
                          {task.priority}
                        </span>
                        {task.estimatedMinutes && (
                          <span className="task-meta-item flex items-center gap-1">
                            <Clock size={12} /> {task.estimatedMinutes}m
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="task-actions">
                      <button
                        className="btn btn-ghost btn-icon"
                        title="AI Break Down"
                        onClick={() => handleBreakdown(task)}
                        disabled={breakdownLoading === task.id}
                      >
                        {breakdownLoading === task.id ? (
                          <span className="spinner" style={{ width: 14, height: 14 }} />
                        ) : (
                          <Sparkles size={16} className="text-purple" />
                        )}
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Edit Task"
                        onClick={() => {
                          setFormData(task);
                          setShowModal(true);
                        }}
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Delete"
                        onClick={() => deleteTask(task.id)}
                        style={{ color: 'var(--accent-red)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Subtask Breakdown */}
                  <AnimatePresence>
                    {expandedTaskId === task.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="subtask-list overflow-hidden"
                      >
                        {breakdownLoading === task.id ? (
                          <div
                            className="subtask-item"
                            style={{ justifyContent: 'center', padding: 'var(--space-md)' }}
                          >
                            <div className="loading-dots">
                              <span /><span /><span />
                            </div>
                            <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                              AI is breaking this down…
                            </span>
                          </div>
                        ) : subtasks[task.id]?.length > 0 ? (
                          subtasks[task.id].map((st, si) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: si * 0.1 }}
                              className="subtask-item" 
                              key={si}
                            >
                              <CornerDownRight size={14} className="text-blue" />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>
                                  {st.title}
                                </div>
                                {st.description && (
                                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                                    {st.description}
                                  </div>
                                )}
                              </div>
                              {st.estimatedMinutes && (
                                <span className="subtask-time">~{st.estimatedMinutes}m</span>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <div className="subtask-item" style={{ color: 'var(--text-tertiary)' }}>
                            No subtasks returned.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">{formData.id ? 'Edit Task' : 'Add New Task'}</h2>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="input-label">Title *</label>
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        disabled={autoFillLoading || !formData.title.trim()}
                        style={{ fontSize: 13, color: 'var(--accent-purple)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}
                      >
                        {autoFillLoading ? <span className="spinner" style={{width: 14, height: 14, borderTopColor: 'var(--accent-purple)'}}/> : <Sparkles size={14}/>}
                        Auto-Fill with AI
                      </button>
                    </div>
                    <input
                      className="input"
                      placeholder="What do you need to do?"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description</label>
                    <textarea
                      className="textarea"
                      placeholder="Add details..."
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Due Date</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={formData.dueDate || ''}
                      onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="input-group">
                      <label className="input-label">Category</label>
                      <select
                         className="select"
                        value={formData.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Priority</label>
                      <select
                        className="select"
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Estimated time (minutes)</label>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      placeholder="30"
                      value={formData.estimatedMinutes}
                      onChange={(e) => handleFormChange('estimatedMinutes', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
