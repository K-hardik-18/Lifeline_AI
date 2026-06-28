'use client';

import { useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { motion } from 'framer-motion';
import { 
  Trophy, FolderOpen, SlidersHorizontal, CheckCircle2, 
  Lightbulb, Target, Timer, Maximize, NotebookPen, Clock 
} from 'lucide-react';

const CATEGORY_COLORS = {
  work: { bg: 'rgba(79,110,247,0.18)', fill: 'var(--accent-blue)', label: 'Work' },
  study: { bg: 'rgba(139,92,246,0.18)', fill: 'var(--accent-purple)', label: 'Study' },
  personal: { bg: 'rgba(236,72,153,0.18)', fill: 'var(--accent-pink)', label: 'Personal' },
  finance: { bg: 'rgba(245,158,11,0.18)', fill: 'var(--accent-orange)', label: 'Finance' },
  health: { bg: 'rgba(16,185,129,0.18)', fill: 'var(--accent-green)', label: 'Health' },
};

const PRIORITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.15)', fill: 'var(--accent-red)', label: 'Critical' },
  high: { bg: 'rgba(245,158,11,0.15)', fill: 'var(--accent-orange)', label: 'High' },
  medium: { bg: 'rgba(79,110,247,0.15)', fill: 'var(--accent-blue)', label: 'Medium' },
  low: { bg: 'rgba(16,185,129,0.15)', fill: 'var(--accent-green)', label: 'Low' },
};

function formatCompletedAt(dateStr) {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Analytics() {
  const { tasks, getStats, getCompletedTasks } = useTasks();
  const stats = getStats();
  const completedTasks = getCompletedTasks();

  const categoryData = useMemo(() => {
    const counts = {};
    tasks.forEach((t) => {
      const cat = t.category || 'personal';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(CATEGORY_COLORS).map(([key, style]) => ({
      key,
      ...style,
      count: counts[key] || 0,
      pct: Math.round(((counts[key] || 0) / max) * 100),
    }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = {};
    tasks.forEach((t) => {
      const p = t.priority || 'medium';
      counts[p] = (counts[p] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(PRIORITY_COLORS).map(([key, style]) => ({
      key,
      ...style,
      count: counts[key] || 0,
      pct: Math.round(((counts[key] || 0) / max) * 100),
    }));
  }, [tasks]);

  const recentCompleted = useMemo(() => {
    return [...completedTasks]
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
      .slice(0, 6);
  }, [completedTasks]);

  if (tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center page-body">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state"
        >
          <div className="empty-state-icon"><SlidersHorizontal size={48} className="text-purple opacity-50" /></div>
          <h3 className="empty-state-title">No Data Yet</h3>
          <p className="empty-state-text">
            Add some tasks and complete them to see your productivity analytics here.
          </p>
        </motion.div>
      </div>
    );
  }

  const completionDeg = (stats.completionRate / 100) * 360;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="page-body h-full"
    >
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <SlidersHorizontal className="text-pink" /> Analytics
            </h1>
            <p className="page-subtitle">Track your productivity patterns</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        {/* ── Completion Overview ── */}
        <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Trophy size={20} className="text-orange" /> Completion Overview
            </h2>
          </div>

          <div className="card-gradient" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2xl)', flexWrap: 'wrap' }}>
            {/* Circular Progress */}
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: `conic-gradient(
                  var(--accent-blue) 0deg,
                  var(--accent-purple) ${completionDeg * 0.5}deg,
                  var(--accent-pink) ${completionDeg}deg,
                  rgba(255,255,255,0.05) ${completionDeg}deg
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 124,
                  height: 124,
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    letterSpacing: '-1px',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stats.completionRate}%
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Complete
                </span>
              </div>
            </div>

            {/* Side Stats */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{stats.completed}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Completed</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{stats.total - stats.completed}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Remaining</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-red)', letterSpacing: '-1px' }}>{stats.overdue}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Overdue</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-orange)', letterSpacing: '-1px' }}>{stats.dueToday}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Due Today</div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-lg)' }}>
                <div className="progress-bar" style={{ height: 8 }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="progress-fill" 
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid-2">
          {/* ── Category Breakdown ── */}
          <motion.section variants={itemVariants}>
            <div className="section-header">
              <h2 className="section-title flex items-center gap-2">
                <FolderOpen size={20} className="text-blue" /> Categories
              </h2>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {categoryData.map((cat, i) => (
                <div key={cat.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.label}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {cat.count}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-glass)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{
                        height: '100%',
                        background: cat.fill,
                        borderRadius: 'var(--radius-full)',
                        minWidth: cat.count > 0 ? 8 : 0,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── Priority Distribution ── */}
          <motion.section variants={itemVariants}>
            <div className="section-header">
              <h2 className="section-title flex items-center gap-2">
                <Target size={20} className="text-red" /> Priorities
              </h2>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {priorityData.map((p, i) => (
                <div key={p.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span className={`badge badge-${p.key}`}>{p.label}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.count}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-glass)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{
                        height: '100%',
                        background: p.fill,
                        borderRadius: 'var(--radius-full)',
                        minWidth: p.count > 0 ? 8 : 0,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ── Recent Completions ── */}
        <motion.section variants={itemVariants} style={{ marginTop: 'var(--space-2xl)' }}>
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green" /> Recent Completions
            </h2>
          </div>

          {recentCompleted.length === 0 ? (
            <div className="card flex items-center justify-center p-8">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                No completed tasks yet. Check one off to see it here!
              </p>
            </div>
          ) : (
            <div className="task-list">
              {recentCompleted.map((task, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={task.id} 
                  className="task-item completed"
                >
                  <div className="task-checkbox checked">
                    <CheckCircle2 size={14} color="white" />
                  </div>
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className="task-meta-item flex items-center gap-1">
                        <Clock size={12} /> {formatCompletedAt(task.completedAt)}
                      </span>
                      {task.category && (
                        <span className={`badge badge-${task.category}`}>{task.category}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Productivity Tips ── */}
        <motion.section variants={itemVariants} style={{ marginTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Lightbulb size={20} className="text-orange" /> Productivity Tips
            </h2>
          </div>

          <div className="card-gradient">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {[
                {
                  icon: <Target className="text-red" size={24} />,
                  title: 'Eat the Frog First',
                  text: 'Tackle your most critical or dreaded task first thing in the morning when your willpower is highest.',
                },
                {
                  icon: <Timer className="text-blue" size={24} />,
                  title: 'Use the 2-Minute Rule',
                  text: 'If a task takes less than 2 minutes, do it immediately instead of adding it to your list.',
                },
                {
                  icon: <Maximize className="text-purple" size={24} />,
                  title: 'Time-Box Your Work',
                  text: 'Work in focused 25-minute sprints (Pomodoro Technique) followed by 5-minute breaks to maintain energy.',
                },
                {
                  icon: <NotebookPen className="text-green" size={24} />,
                  title: 'Review & Reflect Daily',
                  text: 'Spend 5 minutes each evening reviewing completed tasks and planning tomorrow — it reduces morning anxiety.',
                },
              ].map((tip, i) => (
                <motion.div
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.04)' }}
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    alignItems: 'flex-start',
                    padding: 'var(--space-md)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ flexShrink: 0 }}>{tip.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--text-primary)' }}>
                      {tip.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {tip.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
