/**
 * Framer Motion Animation Utilities
 *
 * Cyberpunk Neon Elegance theme animation tokens
 * Based on research.md specifications
 */

import { Variants, Transition } from "framer-motion";

// Easing curves
export const easeCustom = [0.25, 0.46, 0.45, 0.94] as const;

// Fade In Up
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInUpTransition: Transition = {
  duration: 0.5,
  ease: easeCustom
};

// Stagger Children
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Scale on Hover
export const scaleHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 }
};

// Glow Pulse
export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(139, 92, 246, 0.3)",
      "0 0 40px rgba(139, 92, 246, 0.5)",
      "0 0 20px rgba(139, 92, 246, 0.3)"
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

// Slide In from Left
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
};

export const slideInLeftTransition: Transition = {
  duration: 0.4,
  ease: "easeOut"
};

// Slide In from Right
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 }
};

// Page Transition
export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const pageTransitionConfig: Transition = {
  duration: 0.3
};

// Card Lift
export const cardLift = {
  whileHover: {
    y: -4,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Icon Glow
export const iconGlow = {
  whileHover: {
    filter: [
      "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))",
      "drop-shadow(0 0 12px rgba(168, 85, 247, 0.7))",
      "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))"
    ],
    transition: { duration: 1, repeat: Infinity }
  }
};

// Modal Overlay
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Modal Content
export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};

export const modalContentTransition: Transition = {
  duration: 0.3,
  ease: easeCustom
};

// Checkbox Check Animation
export const checkboxCheck: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  exit: { pathLength: 0, opacity: 0 }
};

export const checkboxCheckTransition: Transition = {
  duration: 0.3,
  ease: "easeOut"
};

// Loading Spinner
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Fade In (simple)
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Scale In
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

// Slide Up
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

// List Item Animation (for stagger)
export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// Shimmer Effect (for loading skeletons)
export const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Bounce
export const bounce = {
  whileHover: {
    y: [0, -10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Glow Border Pulse (for inputs/cards)
export const borderGlowPulse: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.1)",
      "0 0 0 1px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.2)",
      "0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.1)"
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};
