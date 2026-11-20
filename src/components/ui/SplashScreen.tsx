import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { BrandGLogoAnimation } from './BrandGLogoAnimation';

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check setup mode silently without blocking
    if (typeof window !== 'undefined' && window.location.pathname !== '/setup') {
      fetch('/api/v1/health')
        .then((res) => res.json())
        .then((data) => {
          if (data?.data?.database === 'setup_mode') {
            window.location.href = '/setup';
          }
        })
        .catch(() => {});
    }

    if (shouldReduceMotion) {
      const quickTimer = window.setTimeout(() => {
        setIsVisible(false);
        onCompleteRef.current?.();
      }, 280);
      return () => window.clearTimeout(quickTimer);
    }

    // 0.36s max delay + 1.35s draw = 1.71s completion, brief 280ms settle -> smooth exit
    const dismissTimer = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(() => {
        onCompleteRef.current?.();
      }, 360);
    }, 1980);

    return () => window.clearTimeout(dismissTimer);
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f0f13] flex flex-col items-center justify-center overflow-hidden pointer-events-auto px-6"
          aria-label="Genç Sosyal açılıyor"
        >
          {/* Animated 4-color trail "G" opening animation */}
          <div className="relative z-10 flex flex-col items-center">
            <BrandGLogoAnimation size={160} mode="splash" showWordmark />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
