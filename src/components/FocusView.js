'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Target, CheckCircle2, Settings } from 'lucide-react';

let audioCtx = null;
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  return audioCtx;
};

const playTick = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

const playAlarm = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    
    // Play 3 loud beeps
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime + i * 0.4);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + i * 0.4 + 0.3);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.4);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + i * 0.4 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.4 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.4);
      osc.stop(ctx.currentTime + i * 0.4 + 0.3);
    }
  } catch (e) {}
};

export default function FocusView() {
  const { tasks, toggleTaskStatus } = useTasks();
  
  // Pomodoro state
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [showSettings, setShowSettings] = useState(false);
  
  // Selected task state
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
        playTick();
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      playAlarm();
      if (mode === 'work') {
        // Work finished -> Start Break automatically and exit fullscreen
        setMode('break');
        setTimeLeft(breakDuration * 60);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(e => console.log(e));
        }
      } else {
        // Break finished -> Stop completely (no infinite loop)
        setIsActive(false);
        setMode('work');
        setTimeLeft(workDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      if (mode === 'work' && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
      }
    } else {
      setIsActive(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  const setWorkMode = () => {
    setMode('work');
    setIsActive(false);
    setTimeLeft(workDuration * 60);
  };

  const setBreakMode = () => {
    setMode('break');
    setIsActive(false);
    setTimeLeft(breakDuration * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="page-body">
      <div className="page-header" style={{ position: 'relative', top: 0, padding: 0, background: 'transparent', border: 'none' }}>
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Timer className="text-orange" /> Focus Mode
          </h1>
          <p className="page-subtitle">Deep work sessions with Pomodoro</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 'var(--space-2xl)' }}>
        {/* Timer Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-gradient"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', fontStyle: 'italic', maxWidth: '80%' }}>
            "The ideal focus ratio is 25:5 for maximum productivity, but you can adjust it to whatever works best for you!"
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <button 
              className={`btn ${mode === 'work' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={setWorkMode}
            >
              Focus ({workDuration}m)
            </button>
            <button 
              className={`btn ${mode === 'break' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={setBreakMode}
              style={{ background: mode === 'break' ? 'var(--accent-green)' : undefined }}
            >
              Break ({breakDuration}m)
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', width: '100%', maxWidth: 300, marginBottom: 'var(--space-md)' }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: 11 }}>Work (min)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={workDuration}
                      min={1} max={120}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 25;
                        setWorkDuration(val);
                        if (mode === 'work' && !isActive) setTimeLeft(val * 60);
                      }}
                      style={{ padding: '4px 8px', fontSize: 13 }}
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: 11 }}>Break (min)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={breakDuration}
                      min={1} max={60}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 5;
                        setBreakDuration(val);
                        if (mode === 'break' && !isActive) setTimeLeft(val * 60);
                      }}
                      style={{ padding: '4px 8px', fontSize: 13 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Circle Progress */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle 
                cx="140" cy="140" r="130" 
                fill="none" 
                stroke="var(--bg-glass)" 
                strokeWidth="8"
              />
              <motion.circle 
                cx="140" cy="140" r="130" 
                fill="none" 
                stroke={mode === 'work' ? 'var(--accent-orange)' : 'var(--accent-green)'} 
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 130}
                initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 130 * (1 - progress / 100) }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </svg>
            <div style={{ zIndex: 10 }}>
              <motion.div 
                key={timeLeft}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ fontSize: 64, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-2px', lineHeight: 1 }}
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginTop: 8 }}>
                {mode === 'work' ? 'Deep Work' : 'Relax'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-lg"
              onClick={toggleTimer}
              style={{ width: 120 }}
            >
              {isActive ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary btn-lg"
              onClick={resetTimer}
            >
              <RotateCcw size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Task Selection Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Target size={20} className="text-blue" /> Current Focus Task
            </h2>
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedTask ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ marginBottom: 'auto' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: 8 }}>
                    Working On:
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{selectedTask.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{selectedTask.description}</p>
                </div>
                
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                  <button 
                    className="btn btn-primary w-full justify-center"
                    style={{ background: 'var(--accent-green)' }}
                    onClick={() => {
                      toggleTaskStatus(selectedTask.id);
                      setSelectedTaskId(null);
                      if (isActive) setBreakMode();
                    }}
                  >
                    <CheckCircle2 size={20} /> Mark Complete & Take Break
                  </button>
                  <button 
                    className="btn btn-ghost w-full justify-center mt-2"
                    onClick={() => setSelectedTaskId(null)}
                  >
                    Switch Task
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                  Select a task from your pending list to focus on during this Pomodoro session.
                </p>
                
                <div className="task-list" style={{ overflowY: 'auto', maxHeight: 400, paddingRight: 8 }}>
                  {pendingTasks.length === 0 ? (
                    <div className="text-center text-secondary py-8">
                      No pending tasks! You are all caught up.
                    </div>
                  ) : (
                    pendingTasks.map(task => (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="card-glass p-4 cursor-pointer"
                        onClick={() => setSelectedTaskId(task.id)}
                        style={{ borderLeft: `3px solid var(--accent-${task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'orange' : task.priority === 'medium' ? 'blue' : 'green'})` }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                        {task.category && <span className={`badge badge-${task.category} mt-2`}>{task.category}</span>}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Black Overlay for Work Mode */}
      <AnimatePresence>
        {isActive && mode === 'work' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: '#000000',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <div style={{ fontSize: '18vw', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 'bold', lineHeight: 1, letterSpacing: '-4px' }}>
              {formatTime(timeLeft)}
            </div>
            {selectedTask && (
              <div style={{ color: 'var(--text-secondary)', fontSize: 24, marginTop: 40, opacity: 0.7 }}>
                Focusing on: <span style={{ color: 'white' }}>{selectedTask.title}</span>
              </div>
            )}
            <button 
              className="btn btn-ghost"
              onClick={toggleTimer}
              style={{ marginTop: 60, padding: '12px 24px', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 16 }}
            >
              <Pause size={18} style={{ marginRight: 8 }} /> Pause & Exit Fullscreen
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
