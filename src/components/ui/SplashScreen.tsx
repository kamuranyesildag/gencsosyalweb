import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // Total duration around 800ms
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow exit animation to finish
    }, 800);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] bg-[#09090b] flex items-center justify-center overflow-hidden"
        >
          {/* Glow effect using purely radial-gradient (no blur filter) for performance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0.4], scale: [0.8, 1.2, 1] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] rounded-full pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
              willChange: 'opacity, transform' 
            }}
          />
          
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
            className="relative text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2"
          >
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{ willChange: 'opacity, transform' }}
            >
              Genç
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-slate-400"
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
