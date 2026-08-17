/**
 * Genç Sosyal Motion Primitives
 * Powered by Framer Motion / Motion for React.
 * Supports prefers-reduced-motion, spring curves, and hardware-accelerated transforms.
 */

import { type Variants, type Transition } from 'motion/react';

// Transitions
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 0.8,
};

export const gentleSpringTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const snappySpringTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
};

export const smoothTransition: Transition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1],
};

export const fastTransition: Transition = {
  duration: 0.15,
  ease: 'easeOut',
};

// Motion Variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: fastTransition },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: 12, transition: fastTransition },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -12, transition: fastTransition },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: -16, transition: fastTransition },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: 16, transition: fastTransition },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.94, transition: fastTransition },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 450, damping: 30 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const bottomSheetVariants: Variants = {
  hidden: { y: '100%', opacity: 0.8 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 350, damping: 32 } 
  },
  exit: { 
    y: '100%', 
    opacity: 0.8,
    transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] } 
  },
};

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 500, damping: 28 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -6, 
    transition: { duration: 0.12, ease: 'easeOut' } 
  },
};

export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 450, damping: 26 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    transition: { duration: 0.15, ease: 'easeOut' } 
  },
};

export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.1, ease: 'easeIn' } },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// Tap and hover interactions
export const interactiveTap = {
  scale: 0.97,
};

export const interactiveHover = {
  scale: 1.02,
};

export const subtleHover = {
  y: -2,
};
