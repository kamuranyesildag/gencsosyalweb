/**
 * Genç Sosyal Motion Primitives
 * Powered by Framer Motion / Motion for React.
 * Supports prefers-reduced-motion natively via Framer Motion.
 * Optimized for performance: NO layout-triggering properties, minimal springs, strict duration buckets.
 */
import { type Variants, type Transition } from 'motion/react';

// ==========================================
// EASINGS
// ==========================================
const easeOut = [0.16, 1, 0.3, 1] as any; // Clean, fast entrance
const easeIn = [0.32, 0, 0.67, 0] as any; // Fast exit
const easeInOut = [0.65, 0, 0.35, 1] as any;

// ==========================================
// DURATION BUCKETS (Strictly enforced)
// ==========================================
// MICRO: 100-180ms (Buttons, icons, toggles, likes, bookmarks)
const durationMicro = 0.15; 
// STANDARD: 150-220ms (Menus, popovers, toast, dialogs)
const durationStandard = 0.2;
// PAGE: 180-250ms (Page enter, bottom sheets)
const durationPage = 0.25;

// ==========================================
// TRANSITIONS
// ==========================================
export const microTransition: Transition = { duration: durationMicro, ease: easeOut };
export const standardTransition: Transition = { duration: durationStandard, ease: easeOut };
export const standardExitTransition: Transition = { duration: 0.15, ease: easeIn };
export const pageTransition: Transition = { duration: durationPage, ease: easeOut };

// ==========================================
// VARIANTS
// ==========================================

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: standardTransition },
  exit: { opacity: 0, transition: standardExitTransition },
};

export const pageInVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: pageTransition },
  exit: { opacity: 0, transition: standardExitTransition },
};

// Modals & Dialogs
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: standardTransition 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: 4, 
    transition: standardExitTransition 
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: standardTransition },
  exit: { opacity: 0, transition: standardExitTransition },
};

// Dropdowns & Popovers
export const popoverVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: -4 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: standardTransition 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: -4, 
    transition: standardExitTransition 
  },
};

// Bottom Sheet
export const sheetVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: pageTransition 
  },
  exit: { 
    y: '100%', 
    opacity: 0,
    transition: { duration: 0.2, ease: easeIn } 
  },
};

// Toast
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: standardTransition 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: standardExitTransition 
  },
};

// Small micro-interactions
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: microTransition },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1, ease: easeIn } },
};

// Interactions (whileHover, whileTap)
export const interactiveTap = {
  scale: 0.97,
};

// Subtle hover for buttons (Avoid large shifts)
export const interactiveHover = {
  // We strictly avoid heavy scales like 1.05 or large translations.
  scale: 1.01,
};
