import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { BrandGLogoAnimation } from './BrandGLogoAnimation';

const BOT_UA_PATTERN =
  /bot|crawler|spider|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora|pinterest|slackbot|whatsapp|telegrambot|applebot|lighthouse|pagespeed|headlesschrome/i;

function isSearchCrawler(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return BOT_UA_PATTERN.test(navigator.userAgent || '');
  } catch {
    return false;
  }
}

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [isVisible, setIsVisible] = useState(() => !isSearchCrawler());

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

    if (!isVisible) {
      onCompleteRef.current?.();
      return;
    }

    // Wait for full 4-layer G logo draw (1.71s) + wordmark reveal + brief settle
    const duration = shouldReduceMotion ? 500 : 2100;
    const dismissTimer = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(() => {
        onCompleteRef.current?.();
      }, 450);
    }, duration);

    return () => window.clearTimeout(dismissTimer);
  }, [shouldReduceMotion, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f0f13] flex flex-col items-center justify-center overflow-hidden pointer-events-auto px-6"
          aria-label="Genç Sosyal açılıyor"
        >
          <div className="relative z-10 flex flex-col items-center">
            <BrandGLogoAnimation size={152} mode="splash" showWordmark />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
