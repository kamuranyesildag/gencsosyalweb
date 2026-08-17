import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full flex-1 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full h-full flex-1 flex flex-col"
          style={{ willChange: 'opacity, transform' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Mini Brand Indicator / Pulse during route change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`indicator-${location.pathname}`}
          initial={{ opacity: 0.8, scaleX: 0.8 }}
          animate={{ opacity: 0, scaleX: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="pointer-events-none fixed top-0 left-0 right-0 h-[2px] z-[9999] flex justify-center"
        >
          <div 
            className="w-1/2 max-w-[200px] h-full" 
            style={{ 
              background: 'linear-gradient(90deg, rgba(99,102,241,0) 0%, rgba(99,102,241,1) 50%, rgba(99,102,241,0) 100%)',
              willChange: 'opacity, transform' 
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
