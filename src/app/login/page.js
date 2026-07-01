'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithOTP } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setAuthLoading(true);
      setError(null);
      await signInWithOTP(email);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading || user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <Sparkles size={40} className="text-blue" />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: 'var(--space-xl)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: 'var(--space-2xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xl)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
            <Sparkles size={48} className="text-purple" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>Welcome to LifeLine</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to sync your tasks and routines.</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            color: 'var(--danger-color)',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', height: '48px' }}
            onClick={handleGoogleLogin}
            disabled={authLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
