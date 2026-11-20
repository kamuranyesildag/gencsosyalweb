import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Scroll smoothly to top when switching top-level routes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full flex-1 flex flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.11, ease: 'easeIn' } }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full flex-1 flex flex-col"
          style={{ willChange: 'opacity, transform' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
