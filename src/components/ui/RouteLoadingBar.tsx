import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router';
import { BrandGLogoAnimation } from './BrandGLogoAnimation';

/**
 * Full-screen kinetic page-to-page loading transition overlay.
 * Displays the iconic 4-color trail "G" animation + crisp progress bar
 * smoothly whenever navigating between routes across Genç Sosyal.
 */
export function RouteLoadingBar() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isFirstRender = useRef(true);
  const prevPathnameRef = useRef(location.pathname);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    // Skip initial mount because SplashScreen plays on first load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathnameRef.current = location.pathname;
      return;
    }

    // Only trigger full-screen loader when pathname changes (not minor query tweaks)
    if (prevPathnameRef.current === location.pathname) {
      return;
    }
    prevPathnameRef.current = location.pathname;

    setTransitionKey((k) => k + 1);
    setIsTransitioning(true);

    const dismissMs = shouldReduceMotion ? 140 : 620;
    const timer = window.setTimeout(() => {
      setIsTransitioning(false);
    }, dismissMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname, shouldReduceMotion]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key={`fullscreen-route-loader-${transitionKey}`}
          role="status"
          aria-live="polite"
          aria-label="Sayfa yükleniyor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-white/95 dark:bg-[#0f0f13]/95 backdrop-blur-md pointer-events-none select-none"
        >
          {/* Top Edge Luminous 4-Color Gradient Progress Bar */}
          <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-200/50 dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ scaleX: 0.05 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.12 : 0.58, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left center', willChange: 'transform' }}
              className="h-full w-full bg-gradient-to-r from-[#EA4335] via-[#FBBC05] via-55% to-[#4285F4]"
            />
          </div>

          {/* Centerpiece Animated 4-Color Trail "G" Mark */}
          <div className="relative flex flex-col items-center">
            <BrandGLogoAnimation size={108} mode="route" showWordmark />

            {/* Compact Refined Progress Pill Track Under Wordmark */}
            <div className="mt-5 w-32 h-[3px] rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.56, ease: [0.65, 0, 0.35, 1] }}
                style={{ transformOrigin: 'left center', willChange: 'transform' }}
                className="h-full w-full rounded-full bg-gradient-to-r from-[#EA4335] via-[#34A853] to-[#4285F4]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
