'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Brain, AlertCircle, ArrowRight, Check } from 'lucide-react';

const ONBOARDING_SLIDES = [
  {
    id: 0,
    icon: <Target size={64} className="text-blue" />,
    title: "Meet LifeLine AI",
    description: "Organize your life with the power of artificial intelligence. Everything you need in one place."
  },
  {
    id: 1,
    icon: <Sparkles size={64} className="text-purple" />,
    title: "AI Task Breakdown",
    description: "Stop feeling overwhelmed. Let our AI instantly turn your massive tasks into bite-sized, actionable steps."
  },
  {
    id: 2,
    icon: <Brain size={64} style={{ color: 'var(--accent-green)' }} />,
    title: "AI Habit Coach",
    description: "Track your daily routines and let the AI coach analyze your consistency to build unstoppable momentum."
  }
];

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [hasMounted, setHasMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const seen = localStorage.getItem('hasSeenOnboarding');
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

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

  const nextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  if (!hasMounted || loading || user) {
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
      padding: 'var(--space-xl)',
      overflow: 'hidden'
    }}>
      <AnimatePresence mode="wait">
        {showOnboarding ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card-glass"
            style={{
              width: '100%',
              maxWidth: '440px',
              minHeight: '480px',
              padding: 'var(--space-2xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {/* Skip Button */}
            <button 
              onClick={completeOnboarding}
              style={{
                position: 'absolute',
                top: 'var(--space-lg)',
                right: 'var(--space-lg)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Skip
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xl)', width: '100%' }}
              >
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'rgba(79, 110, 247, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-sm)'
                }}>
                  {ONBOARDING_SLIDES[currentSlide].icon}
                </div>
                
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>
                    {ONBOARDING_SLIDES[currentSlide].title}
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {ONBOARDING_SLIDES[currentSlide].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2xl)', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {ONBOARDING_SLIDES.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: currentSlide === idx ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: currentSlide === idx ? 'var(--accent-blue)' : 'rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={nextSlide}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', height: '56px', fontSize: '1.1rem' }}
              >
                {currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>LifeLine AI</h1>
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
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', height: '56px', fontSize: '1.1rem' }}
                onClick={handleGoogleLogin}
                disabled={authLoading}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
