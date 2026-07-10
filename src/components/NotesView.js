'use client';

import { useState, useMemo } from 'react';
import { useNotes } from '@/context/NoteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Plus, Trash2, X, Pencil, Check } from 'lucide-react';

const CATEGORY_COLORS = {
  general: 'var(--note-general)',
  idea: 'var(--note-idea)',
  todo: 'var(--note-todo)',
  reminder: 'var(--note-reminder)'
};

export default function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort all notes by newest first and filter by search query
  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      
      result = result.filter(note => {
        const d = new Date(note.createdAt);
        const shortDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
        const longDate = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
        const numDate = d.toLocaleDateString().toLowerCase();
        
        const today = new Date().toLocaleDateString();
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toLocaleDateString();
        
        let relativeDay = "";
        if (d.toLocaleDateString() === today) relativeDay = "today";
        if (d.toLocaleDateString() === yesterday) relativeDay = "yesterday";

        const searchableText = [
          note.content,
          note.category,
          shortDate,
          longDate,
          numDate,
          relativeDay,
        ].join(' ').toLowerCase();

        // Every word typed must be found somewhere in the searchable text
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    return result;
  }, [notes, searchQuery]);

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
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-body notes-view">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}
      >
      <div className="notes-header">
        <div>
          <h2 className="notes-title">Brain Dump</h2>
          <p className="subtitle notes-subtitle">Your boundless canvas for ideas and thoughts</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <input 
              type="text" 
              placeholder="Search notes or dates..."
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '16px', width: '100%', background: 'var(--bg-tertiary)', border: 'none' }}
            />
          </div>
          <button className="btn btn-primary btn-new-note" style={{ flex: '1 1 120px' }} onClick={() => setIsAdding(true)}>
            <Plus size={20} /> New Note
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className="add-note-card"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="add-note-content" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              <textarea
                autoFocus
                placeholder="What's on your mind?..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="note-textarea"
                rows={3}
                style={{ width: '100%', border: 'none', background: 'transparent', resize: 'none', fontSize: '1.75rem', fontFamily: 'var(--font-caveat), cursive', outline: 'none', color: 'var(--text-primary)' }}
              />
              <div className="add-note-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                <div className="category-selector" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <button
                      key={cat}
                      className={`cat-btn ${newCategory === cat ? 'active' : ''}`}
                      style={{ 
                        backgroundColor: CATEGORY_COLORS[cat], 
                        padding: '6px 16px', 
                        borderRadius: '20px', 
                        border: newCategory === cat ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: 'var(--note-text-primary)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setNewCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAdd}>Save Note</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="notes-timeline">
        {filteredAndSortedNotes.length === 0 && !isAdding ? (
          <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem 0', color: 'var(--text-tertiary)' }}>
            <PenTool size={64} style={{ opacity: 0.2, marginBottom: '24px' }} />
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {searchQuery ? 'No notes matched your search.' : 'Your canvas is blank.'}
            </p>
            <p style={{ fontSize: '1.1rem' }}>
              {searchQuery ? 'Try a different keyword or date.' : 'Start jotting down some ideas!'}
            </p>
          </div>
        ) : (
          <div className="true-masonry-grid">
            <AnimatePresence>
              {filteredAndSortedNotes.map((note) => (
                <motion.div 
                  key={note.id} 
                  className="sticky-note"
                  style={{ backgroundColor: CATEGORY_COLORS[note.category] }}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, rotate: Math.random() > 0.5 ? 1 : -1, zIndex: 10 }}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="note-text">{note.content}</div>
                  <div className="note-footer">
                    <div>
                      <span className="note-category">{note.category}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="note-date">{formatDate(note.date)}</div>
                      <div className="note-time">{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => { setSelectedNote(null); setEditingNoteId(null); }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal note-modal" 
              style={{ backgroundColor: CATEGORY_COLORS[selectedNote.category], width: '90%', maxWidth: '700px', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-xl)', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => { setSelectedNote(null); setEditingNoteId(null); }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div className="modal-body">
                {editingNoteId === selectedNote.id ? (
                  <textarea
                    autoFocus
                    className="note-text-edit modal-note-edit"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    style={{ width: '100%', height: '300px', border: '1px dashed rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.3)', borderRadius: '8px', padding: '16px', fontSize: '2rem', fontFamily: 'var(--font-caveat), cursive', resize: 'none', outline: 'none' }}
                  />
                ) : (
                  <div className="note-text modal-note-text" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-caveat), cursive', whiteSpace: 'pre-wrap', marginBottom: '32px', lineHeight: 1.4 }}>{selectedNote.content}</div>
                )}
                
                <div className="note-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: 'rgba(0,0,0,0.5)', fontWeight: 600, fontSize: '0.9rem', marginTop: '24px' }}>
                  <span className="note-category" style={{ textTransform: 'capitalize' }}>{selectedNote.category} Note</span>
                  <span className="note-time">
                    {formatDate(selectedNote.date)} · {new Date(selectedNote.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: '24px', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {editingNoteId === selectedNote.id ? (
                  <>
                    <button className="btn btn-ghost" onClick={() => setEditingNoteId(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                      handleSaveEdit(selectedNote.id);
                      setSelectedNote(prev => ({ ...prev, content: editingContent }));
                    }}>Save Changes</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-ghost" style={{ color: 'var(--accent-red)' }} onClick={() => {
                      deleteNote(selectedNote.id);
                      setSelectedNote(null);
                    }}>
                      <Trash2 size={16} style={{ marginRight: '8px' }} /> Delete
                    </button>
                    <button className="btn btn-secondary" onClick={() => {
                      setEditingNoteId(selectedNote.id);
                      setEditingContent(selectedNote.content);
                    }}>
                      <Pencil size={16} style={{ marginRight: '8px' }} /> Edit
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .notes-view {
          padding: var(--space-2xl) var(--space-xl);
          width: 100%;
          min-height: calc(100vh - 100px);
          background-image: radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 48px;
        }

        .true-masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 32px;
          align-items: start;
        }

        .sticky-note {
          padding: 24px;
          border-radius: 2px 2px 24px 2px;
          box-shadow: 2px 6px 15px rgba(0,0,0,0.06);
          position: relative;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
          min-height: 260px;
        }
        
        .sticky-note:hover {
          box-shadow: 4px 15px 30px rgba(0,0,0,0.12);
          transform: translateY(-5px) scale(1.03) !important;
          z-index: 20 !important;
        }

        /* Fold effect for sticky note */
        .sticky-note::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          border-width: 0 0 24px 24px;
          border-style: solid;
          border-color: transparent transparent rgba(0,0,0,0.08) transparent;
          border-radius: 0 0 24px 0;
        }

        /* Tape effect at the top */
        .sticky-note::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%) rotate(-2deg);
          width: 80px;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          z-index: 2;
        }

        .note-text {
          font-family: var(--font-caveat), cursive;
          font-size: 2rem;
          line-height: 1.3;
          color: var(--note-text-primary);
          flex: 1;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word;
          margin-bottom: 24px;
          margin-top: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 8;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 0.85rem;
          color: var(--note-text-secondary);
          margin-top: auto;
          font-weight: 600;
        }

        .note-category {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 800;
          font-size: 0.75rem;
        }

        .notes-title {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .notes-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .btn-new-note {
          padding: 12px 24px;
          font-size: 1.1rem;
          border-radius: 50px;
        }

        @media (max-width: 768px) {
          .notes-view {
            padding: var(--space-lg) var(--space-md);
            min-height: calc(100vh - 140px); /* Account for mobile tab bar */
          }
          .notes-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
          }
          .notes-title {
            font-size: 2rem;
          }
          .btn-new-note {
            width: 100%;
            justify-content: center;
          }
          .true-masonry-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .sticky-note {
            min-height: 200px;
            padding: 16px;
          }
          .note-text {
            -webkit-line-clamp: 4;
            font-size: 1.6rem;
            margin-bottom: 16px;
          }
        }
      `}</style>
      </motion.div>
    </div>
  );
}
