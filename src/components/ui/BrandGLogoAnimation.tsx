import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface BrandGLogoAnimationProps {
  size?: number;
  mode?: 'splash' | 'route' | 'loop';
  showWordmark?: boolean;
  className?: string;
}

const G_PATH = 'M 78 28 A 36 36 0 1 0 85 52 L 52 52';

const TRAIL_LAYERS = [
  { id: 'iz-1', color: '#EA4335', splashDelay: 0, routeDelay: 0 },
  { id: 'iz-2', color: '#FBBC05', splashDelay: 0.12, routeDelay: 0.06 },
  { id: 'iz-3', color: '#34A853', splashDelay: 0.24, routeDelay: 0.12 },
  { id: 'ana-cizgi', color: '#4285F4', splashDelay: 0.36, routeDelay: 0.18 },
] as const;

/**
 * Iconic 4-layer color-trail animated "G" logo for Genç Sosyal.
 * Layers draw sequentially (Red -> Yellow -> Green -> Brand Blue)
 * along the geometric "G" path so the final blue stroke cleanly completes the mark.
 */
export function BrandGLogoAnimation({
  size = 152,
  mode = 'splash',
  showWordmark = true,
  className = '',
}: BrandGLogoAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  const isRoute = mode === 'route';
  const isLoop = mode === 'loop';
  const duration = isRoute ? 0.52 : isLoop ? 1.15 : 1.35;
  const repeatCount = isLoop ? Infinity : 0;
  const repeatDelay = isLoop ? 0.45 : 0;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Soft ambient radial halo that blooms gently as the final blue layer closes */}
        {!shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{
              opacity: isRoute ? [0, 0.55, 0.35] : [0, 0.65, 0.4],
              scale: isRoute ? [0.78, 1.08, 1] : [0.72, 1.12, 1],
            }}
            transition={{
              duration: isRoute ? 0.55 : 1.5,
              delay: isRoute ? 0.08 : 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(66,133,244,0.22) 0%, rgba(52,168,83,0.06) 45%, rgba(66,133,244,0) 72%)',
              transform: 'scale(1.55)',
              willChange: 'opacity, transform',
            }}
          />
        )}

        {/* Animated "G" SVG Logo */}
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 overflow-visible"
          role="img"
          aria-label="Genç Sosyal"
          initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.94 }}
          animate={
            shouldReduceMotion
              ? { scale: 1 }
              : isRoute
                ? { scale: [0.94, 1.02, 1] }
                : { scale: [0.94, 1.03, 1] }
          }
          transition={{
            duration: isRoute ? 0.55 : 1.55,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Subtle faint track silhouette underneath for crisp spatial grounding */}
          <path
            d={G_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="butt"
            className="text-slate-900/[0.04] dark:text-white/[0.05]"
          />

          {/* 4 Stacked Color Trail Layers */}
          {TRAIL_LAYERS.map((layer) => {
            const delay = isRoute ? layer.routeDelay : layer.splashDelay;

            if (shouldReduceMotion) {
              return layer.id === 'ana-cizgi' ? (
                <path
                  key={layer.id}
                  d={G_PATH}
                  fill="none"
                  stroke={layer.color}
                  strokeWidth="14"
                  strokeLinecap="butt"
                />
              ) : null;
            }

            return (
              <motion.path
                key={layer.id}
                d={G_PATH}
                fill="none"
                stroke={layer.color}
                strokeWidth="14"
                strokeLinecap="butt"
                strokeDasharray="260"
                initial={{ strokeDashoffset: 260 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  duration,
                  delay,
                  ease: [0.65, 0, 0.35, 1],
                  repeat: repeatCount,
                  repeatDelay,
                }}
              />
            );
          })}
        </motion.svg>
      </div>

      {showWordmark && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: isRoute ? 0.24 : 0.45,
            delay: shouldReduceMotion ? 0 : isRoute ? 0.08 : 0.78,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-5 flex flex-col items-center gap-1"
        >
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            Genç <span className="text-[#4285F4]">Sosyal</span>
          </div>
          {!isRoute && (
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mt-1">
              Genç Üretici Platformu
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Full-page seamless brand loader (replaces any spinning circle during auth/app initialization)
 */
export function BrandGLogoLoader({ fullPage = true }: { fullPage?: boolean }) {
  return (
    <div
      className={`${
        fullPage ? 'min-h-screen' : 'min-h-[50vh]'
      } w-full flex flex-col items-center justify-center bg-white dark:bg-[#0f0f13] transition-colors px-6`}
    >
      <BrandGLogoAnimation size={124} mode="loop" showWordmark />
    </div>
  );
}
