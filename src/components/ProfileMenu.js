'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Check, Edit2, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileMenu() {
  const { user, signOut, updateProfileName } = useAuth();
  const { theme, toggleTheme } = useTheme() || { theme: 'light', toggleTheme: () => {} };
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const menuRef = useRef(null);

  const rawName = user?.user_metadata?.full_name || '';
  const email = user?.email || '';
  const initial = (rawName || email).charAt(0).toUpperCase();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName === rawName) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfileName(editName.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update name', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container" ref={menuRef}>
      <motion.button 
        className="avatar-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setEditName(rawName);
        }}
      >
        {initial}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="profile-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="profile-header">
              <div className="profile-avatar-large">{initial}</div>
              
              {isEditing ? (
                <form onSubmit={handleSaveName} className="edit-name-form">
                  <input
                    autoFocus
                    className="input input-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your Name"
                    disabled={isSaving}
                  />
                  <button type="submit" className="btn btn-primary btn-sm btn-icon" disabled={isSaving}>
                    {isSaving ? <span className="spinner" style={{width: 12, height: 12}} /> : <Check size={14} />}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <div className="profile-name-display">
                  <div className="name-text">{rawName || 'Add your name'}</div>
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
              
              <div className="profile-email">{email}</div>
            </div>

            <div className="dropdown-divider" />

            <button className="dropdown-item" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button className="dropdown-item logout-item" onClick={signOut}>
              <LogOut size={16} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
