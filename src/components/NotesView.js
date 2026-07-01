'use client';

import { useState, useMemo } from 'react';
import { useNotes } from '@/context/NoteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Plus, Trash2, X, Pencil, Check } from 'lucide-react';

const CATEGORY_COLORS = {
  general: '#fef3c7', // yellow-100
  idea: '#dbeafe',    // blue-100
  todo: '#fce7f3',    // pink-100
  reminder: '#dcfce3' // green-100
};

export default function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  // Group notes by date, then by category
  const groupedNotes = useMemo(() => {
    const groups = {};
    notes.forEach(note => {
      if (!groups[note.date]) groups[note.date] = {};
      if (!groups[note.date][note.category]) groups[note.date][note.category] = [];
      groups[note.date][note.category].push(note);
    });
    
    // Sort dates descending (newest first)
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
    
    return sortedDates.map(date => ({
      date,
      categories: groups[date]
    }));
  }, [notes]);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addNote(newContent, newCategory);
    setNewContent('');
    setIsAdding(false);
  };

  const handleSaveEdit = (id) => {
    if (editingContent.trim()) {
      updateNote(id, { content: editingContent });
    }
    setEditingNoteId(null);
  };

  const formatDate = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    const d = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div 
      className="notes-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="notes-header">
        <div>
          <h2>Brain Dump</h2>
          <p className="subtitle">Jot down your ideas and thoughts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> New Note
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className="add-note-card"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          >
            <div className="add-note-content">
              <textarea
                autoFocus
                placeholder="What's on your mind?..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="note-textarea"
                rows={3}
              />
              <div className="add-note-actions">
                <div className="category-selector">
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <button
                      key={cat}
                      className={`cat-btn ${newCategory === cat ? 'active' : ''}`}
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      onClick={() => setNewCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="action-buttons">
                  <button className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAdd}>Save Note</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="notes-timeline">
        {groupedNotes.length === 0 && !isAdding ? (
          <div className="empty-state">
            <PenTool size={48} className="empty-icon" />
            <p>Your brain dump is empty.</p>
            <p className="subtitle">Start jotting down some ideas!</p>
          </div>
        ) : (
          groupedNotes.map((group) => (
            <div key={group.date} className="date-group">
              <h3 className="date-header">{formatDate(group.date)}</h3>
              <div className="masonry-grid">
                {Object.keys(group.categories).map(cat => 
                  group.categories[cat].map(note => (
                    <motion.div 
                      key={note.id} 
                      className="sticky-note"
                      style={{ backgroundColor: CATEGORY_COLORS[note.category] }}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02, rotate: -1 }}
                    >
                      <div className="note-actions">
                        {editingNoteId === note.id ? (
                          <button className="icon-btn save-btn" onClick={() => handleSaveEdit(note.id)}>
                            <Check size={14} />
                          </button>
                        ) : (
                          <button className="icon-btn edit-btn" onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingContent(note.content);
                          }}>
                            <Pencil size={12} />
                          </button>
                        )}
                        <button className="icon-btn delete-btn" onClick={() => deleteNote(note.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                      
                      {editingNoteId === note.id ? (
                        <textarea
                          autoFocus
                          className="note-text-edit"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                        />
                      ) : (
                        <div className="note-text">{note.content}</div>
                      )}
                      <div className="note-footer">
                        <span className="note-category">{note.category}</span>
                        <span className="note-time">
                          {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .notes-view {
          padding: var(--space-xl) 0;
          max-width: 1000px;
          margin: 0 auto;
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .notes-header h2 {
          font-family: var(--font-heading);
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
        }

        .subtitle {
          color: var(--text-secondary);
        }

        .add-note-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .add-note-content {
          padding: var(--space-md);
        }

        .note-textarea {
          width: 100%;
          border: none;
          resize: none;
          font-family: var(--font-caveat), cursive;
          font-size: 1.5rem;
          line-height: 1.4;
          outline: none;
          background: transparent;
          color: var(--text-primary);
          margin-bottom: var(--space-md);
        }
        
        .note-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .add-note-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-sm);
          border-top: 1px dashed var(--border-color);
        }

        .category-selector {
          display: flex;
          gap: var(--space-xs);
        }

        .cat-btn {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          border: 2px solid transparent;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-transform: capitalize;
          transition: all var(--transition-fast);
          color: var(--text-secondary);
        }

        .cat-btn.active {
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .action-buttons {
          display: flex;
          gap: var(--space-sm);
        }

        .date-group {
          margin-bottom: var(--space-2xl);
        }

        .date-header {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-xs);
          border-bottom: 2px solid var(--border-color);
        }

        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--space-lg);
        }

        .sticky-note {
          padding: var(--space-lg);
          border-radius: 4px 4px 16px 4px;
          box-shadow: 2px 4px 10px rgba(0,0,0,0.05);
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 150px;
        }

        /* Fold effect for sticky note */
        .sticky-note::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          border-width: 0 0 16px 16px;
          border-style: solid;
          border-color: transparent transparent rgba(0,0,0,0.05) transparent;
          border-radius: 0 0 16px 0;
        }

        .note-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
          opacity: 1; /* Always visible to ensure mobile users can see it */
          transition: opacity var(--transition-fast);
        }
        
        @media (min-width: 769px) {
          .note-actions {
            opacity: 0; /* Hide by default on desktop to keep it clean */
          }
          .sticky-note:hover .note-actions {
            opacity: 1;
          }
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.4);
          border: none;
          color: rgba(0,0,0,0.4);
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.8);
          color: rgba(0,0,0,0.8);
        }
        
        .delete-btn:hover {
          color: var(--accent-red);
          background: rgba(239, 68, 68, 0.1);
        }
        
        .save-btn {
          color: var(--accent-green);
          background: rgba(16, 185, 129, 0.2);
        }

        .note-text {
          font-family: var(--font-caveat), cursive;
          font-size: 1.6rem;
          line-height: 1.4;
          color: #1f2937;
          flex: 1;
          white-space: pre-wrap;
          margin-bottom: var(--space-md);
        }
        
        .note-text-edit {
          font-family: var(--font-caveat), cursive;
          font-size: 1.6rem;
          line-height: 1.4;
          color: #1f2937;
          flex: 1;
          width: 100%;
          border: 1px dashed rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          resize: none;
          outline: none;
          margin-bottom: var(--space-md);
          padding: 4px;
        }

        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: rgba(0,0,0,0.4);
          margin-top: auto;
        }

        .note-category {
          text-transform: capitalize;
          font-weight: 600;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          color: var(--text-tertiary);
          text-align: center;
        }

        .empty-icon {
          margin-bottom: var(--space-md);
          opacity: 0.5;
        }
        
        @media (max-width: 768px) {
          .notes-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-md);
          }
          .add-note-actions {
            flex-direction: column;
            gap: var(--space-md);
            align-items: flex-start;
          }
          .masonry-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .masonry-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
}
