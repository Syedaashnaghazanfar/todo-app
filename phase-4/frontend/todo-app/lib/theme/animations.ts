/**
 * Calm Design System - Animation Variants
 * Phase 3 Todo App - UI Redesign
 *
 * Physics-based animation configurations using Framer Motion.
 * All animations respect reduced-motion preferences.
 */

import { Variants } from 'framer-motion';

/* ========================================
   SPRING CONFIGURATIONS
   Physics-based timing for natural feel
   ======================================== */

export const spring: {
  gentle: { type: 'spring'; stiffness: number; damping: number; mass: number };
  responsive: { type: 'spring'; stiffness: number; damping: number; mass: number };
  snappy: { type: 'spring'; stiffness: number; damping: number; mass: number };
  bouncy: { type: 'spring'; stiffness: number; damping: number; mass: number };
} = {
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    mass: 1,
  },
  responsive: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
    mass: 1,
  },
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  bouncy: {
    type: 'spring',
    stiffness: 500,
    damping: 15,
    mass: 1,
  },
};

/* ========================================
   TRANSITION DEFAULTS
   ======================================== */

export const transition: {
  fast: { duration: number; ease: [number, number, number, number] };
  normal: { duration: number; ease: [number, number, number, number] };
  slow: { duration: number; ease: [number, number, number, number] };
} = {
  fast: {
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1.0],
  },
  normal: {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1.0],
  },
  slow: {
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1.0],
  },
};

/* ========================================
   FADE ANIMATIONS
   ======================================== */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    transition: transition.fast,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.responsive,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transition.fast,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.responsive,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: transition.fast,
  },
};

/* ========================================
   SCALE ANIMATIONS
   ======================================== */

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transition.fast,
  },
};

export const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: spring.responsive,
  },
  tap: {
    scale: 0.98,
    transition: spring.snappy,
  },
};

/* ========================================
   SLIDE ANIMATIONS
   ======================================== */

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: spring.responsive,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transition.fast,
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: spring.responsive,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transition.fast,
  },
};

/* ========================================
   STAGGER ANIMATIONS
   For lists and grids
   ======================================== */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.responsive,
  },
};

/* ========================================
   COLLAPSE ANIMATIONS
   For expandable sections
   ======================================== */

export const collapseHeight: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: transition.fast,
  },
};

/* ========================================
   CHECKBOX ANIMATIONS
   Task completion feedback
   ======================================== */

export const checkboxCheck: Variants = {
  unchecked: { scale: 1 },
  checked: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const strikethrough: Variants = {
  incomplete: { width: 0 },
  complete: {
    width: '100%',
    transition: {
      duration: 0.3,
      ease: [0.42, 0, 0.58, 1.0],
    },
  },
};

/* ========================================
   FOCUS RING ANIMATIONS
   Accessible focus states
   ======================================== */

export const focusRing: Variants = {
  focusable: {
    outline: 'none',
  },
  focused: {
    boxShadow: '0 0 0 2px var(--ring, #8B5CF6)',
    transition: {
      duration: 0.15,
    },
  },
};

/* ========================================
   TYPE EXPORTS
   ======================================== */

export type SpringConfig = keyof typeof spring;
