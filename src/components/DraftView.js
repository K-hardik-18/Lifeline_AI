'use client';

import { useState, useCallback } from 'react';
import { useTasks } from '@/context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Check, Copy, Sparkles, FileText, FileSignature, AlertCircle, RefreshCw, XCircle, Clock, Save, History, RotateCcw, Mail, AlignLeft, Lightbulb, CalendarX, CheckCircle, GraduationCap, Briefcase
} from 'lucide-react';
import { marked } from 'marked';

const TEMPLATES = [
  {
    icon: Mail,
    color: 'text-blue',
    title: 'Request deadline extension',
    description: 'Politely ask for more time on a deadline',
    prompt: 'Draft an email requesting a deadline extension for my assignment/project.',
  },
  {
    icon: CalendarX,
    color: 'text-orange',
    title: 'Cancel a meeting',
    description: 'Professionally cancel or reschedule',
    prompt: 'Draft a message to cancel a meeting and suggest rescheduling.',
  },
  {
    icon: CheckCircle,
    color: 'text-green',
    title: 'Follow up on a task',
    description: 'Check in on progress or status',
    prompt: 'Draft a follow-up message checking on the status of a task or deliverable.',
  },
  {
    icon: GraduationCap,
    color: 'text-purple',
    title: 'Ask professor a question',
    description: 'Academic inquiry or clarification',
    prompt: 'Draft an email to my professor asking a question about the course material.',
  },
  {
    icon: Briefcase,
    color: 'text-pink',
    title: 'Update project status',
    description: 'Report progress to stakeholders',
    prompt: 'Draft a project status update summarizing recent progress and next steps.',
  },
  {
    icon: FileSignature,
    color: 'text-secondary',
    title: 'Custom draft',
    description: 'Write anything you need',
    prompt: '',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DraftView() {
  const { tasks } = useTasks();

  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template.title);
    setPrompt(template.prompt);
    setDraft('');
    setError('');
  };

  const generateDraft = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setDraft('');

    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'draft_failed');

      const data = await res.json();
      const draftText = data.draft || data.response || '';
      setDraft(draftText);

      // Add to history
      if (draftText) {
        setHistory((prev) => [
          {
            prompt,
            context,
            draft: draftText,
            timestamp: new Date(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      if (err.message === 'rate_limit') {
         setError('AI is thinking too fast! Taking a quick breath... retrying shortly.');
      } else {
         setError('Failed to generate draft. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, context, isLoading]);

  const handleRegenerate = () => {
    generateDraft();
  };

  const handleCopy = async (textToCopy = draft) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <PenTool className="text-pink" /> AI Message Drafts
            </h1>
            <p className="page-subtitle">
              Let AI draft emails, messages, and more
            </p>
          </div>
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`btn ${showHistory ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowHistory((p) => !p)}
            >
              <History size={16} /> History ({history.length})
            </motion.button>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Template Grid */}
        <motion.div variants={itemVariants} className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <Lightbulb size={20} className="text-orange" /> Quick Templates
          </h2>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid-3"
          style={{ marginBottom: 'var(--space-2xl)' }}
        >
          {TEMPLATES.map((tpl, idx) => {
            const Icon = tpl.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="card-glass"
                onClick={() => handleTemplateClick(tpl)}
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  border:
                    selectedTemplate === tpl.title
                      ? '1px solid var(--accent-blue)'
                      : undefined,
                  boxShadow:
                    selectedTemplate === tpl.title
                      ? 'var(--shadow-glow)'
                      : undefined,
                }}
              >
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <Icon size={28} className={tpl.color} />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 4,
                    color: 'var(--text-primary)',
                  }}
                >
                  {tpl.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {tpl.description}
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Draft Input */}
        <motion.div
          variants={itemVariants}
          className="card-gradient"
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <div className="section-header" style={{ marginBottom: 'var(--space-md)' }}>
            <h2 className="section-title flex items-center gap-2">
              <PenTool size={18} className="text-blue" /> Describe your draft
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
            }}
          >
            <div className="input-group">
              <label className="input-label">What would you like to draft?</label>
              <textarea
                className="textarea"
                placeholder="e.g., Write a professional email to my professor requesting an extension on the research paper due next Monday..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                style={{ minHeight: 100 }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Any additional context?{' '}
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <textarea
                className="textarea"
                placeholder="e.g., The professor is strict but fair. I've been sick for the past week. My name is Alex."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={2}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary btn-lg"
              onClick={generateDraft}
              disabled={isLoading || !prompt.trim()}
              style={{ alignSelf: 'flex-start' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} />
                  Generating…
                </>
              ) : (
                <><Sparkles size={18} /> Generate Draft</>
              )}
            </motion.button>
          </div>
        </motion.div>

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
              <span style={{ color: 'var(--accent-red)', fontSize: 14 }} className="flex items-center gap-2">
                <XCircle size={16} /> {error}
              </span>
              <button
                className="btn btn-ghost"
                onClick={() => setError('')}
                style={{ fontSize: 12 }}
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {isLoading && !draft && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card" 
            style={{ marginBottom: 'var(--space-lg)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="skeleton" style={{ height: 16, width: '80%' }} />
              <div className="skeleton" style={{ height: 16, width: '95%' }} />
              <div className="skeleton" style={{ height: 16, width: '70%' }} />
              <div className="skeleton" style={{ height: 16, width: '90%' }} />
              <div className="skeleton" style={{ height: 16, width: '60%' }} />
            </div>
          </motion.div>
        )}

        {/* Generated Draft */}
        <AnimatePresence>
          {draft && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 'var(--space-2xl)' }}
            >
              <div className="section-header">
                <h2 className="section-title flex items-center gap-2">
                  <FileSignature size={20} className="text-purple" /> Generated Draft
                </h2>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-secondary" onClick={handleRegenerate} disabled={isLoading}>
                    <RotateCcw size={16} /> Regenerate
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => handleCopy()}>
                    {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                  </motion.button>
                </div>
              </div>

              <div 
                className="draft-result prose prose-sm max-w-none prose-p:text-sm prose-p:leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: marked.parse(draft) }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draft History */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="section-header">
                <h2 className="section-title flex items-center gap-2">
                  <History size={20} className="text-blue" /> Draft History
                </h2>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowHistory(false)}
                >
                  Hide
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {history.map((item, idx) => (
                  <details
                    key={idx}
                    className="card"
                    style={{ cursor: 'pointer' }}
                  >
                    <summary
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        listStyle: 'none',
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {item.prompt.slice(0, 80)}
                        {item.prompt.length > 80 ? '…' : ''}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-tertiary)',
                          marginLeft: 'var(--space-md)',
                          flexShrink: 0,
                        }}
                      >
                        {new Date(item.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </summary>
                    <div
                      className="draft-result prose prose-sm max-w-none prose-p:text-sm prose-p:leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-li:my-1"
                      style={{ marginTop: 'var(--space-md)' }}
                      dangerouslySetInnerHTML={{ __html: marked.parse(item.draft) }}
                    />
                    <div style={{ marginTop: 'var(--space-sm)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost flex items-center gap-1"
                        onClick={() => handleCopy(item.draft)}
                        style={{ fontSize: 12 }}
                      >
                        <Copy size={14} /> Copy
                      </button>
                    </div>
                  </details>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no draft and no history */}
        {!draft && !isLoading && history.length === 0 && (
          <motion.div 
            variants={itemVariants}
            className="empty-state"
          >
            <div className="empty-state-icon"><Sparkles size={48} className="text-purple opacity-50" /></div>
            <div className="empty-state-title">Ready to draft</div>
            <p className="empty-state-text">
              Pick a template above or describe what you need. AI will generate a
              polished, professional draft in seconds.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
