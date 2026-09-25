import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Only show splash once per session to prevent repeated delay on in-app refreshes
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem('gencsosyal_splash_shown');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!isVisible) {
      onCompleteRef.current?.();
      return;
    }

    try {
      sessionStorage.setItem('gencsosyal_splash_shown', 'true');
    } catch {}

    // Check setup mode silently without blocking
    if (window.location.pathname !== '/setup') {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => {
          if (data?.data?.database === 'setup_mode') {
            window.location.href = '/setup';
          }
        })
        .catch(() => {});
    }

    if (shouldReduceMotion) {
      setIsVisible(false);
      onCompleteRef.current?.();
      return;
    }

    // Dismiss splash screen smoothly after 600ms
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onCompleteRef.current?.();
      }, 250);
    }, 600);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion, isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] bg-[#09090b] flex items-center justify-center overflow-hidden pointer-events-auto"
        >
          {/* Glow effect using radial-gradient */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0.4], scale: [0.8, 1.2, 1] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] rounded-full pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)',
              willChange: 'opacity, transform' 
            }}
          />
          
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
            className="relative text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2"
          >
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              style={{ willChange: 'opacity, transform' }}
            >
              Genç
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="text-blue-500"
              style={{ willChange: 'opacity, transform' }}
            >
              Sosyal
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
