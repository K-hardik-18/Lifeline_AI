'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import ChatView from './ChatView';
import { useState, useEffect } from 'react';

export default function AIChatPanel({ isOpen, onClose }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // for desktop expand

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const panelVariants = {
    hidden: { 
      x: '100%', 
      opacity: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          {isMobile && (
            <motion.div
              className="chat-panel-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 999
              }}
            />
          )}

          {/* Sliding Panel */}
          <motion.div
            className={`chat-panel ${isExpanded && !isMobile ? 'expanded' : ''}`}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              position: 'fixed',
              top: isMobile ? 0 : 70, // 70px is navbar height on desktop
              right: 0,
              bottom: 0,
              width: isMobile ? '100%' : (isExpanded ? '600px' : '380px'),
              backgroundColor: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid var(--border-color)',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div className="chat-panel-header" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}>
                  <Sparkles className="text-white" size={16} />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>
                    LifeLine AI
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent-green)',
                      boxShadow: '0 0 6px rgba(16,185,129,0.5)'
                    }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Online</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isMobile && (
                  <button 
                    className="btn btn-icon btn-ghost" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                )}
                <button className="btn btn-icon btn-ghost text-secondary" onClick={onClose}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <ChatView />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
