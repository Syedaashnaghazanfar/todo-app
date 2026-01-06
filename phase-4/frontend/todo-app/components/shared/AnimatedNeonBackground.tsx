/**
 * AnimatedNeonBackground Component
 *
 * Vibrant moving neon light background with multiple animated gradient orbs.
 * Creates dynamic, colorful atmosphere that's not "too dark".
 *
 * Features:
 * - 4+ animated gradient orbs
 * - Rotating, scaling, and translating animations
 * - Increased opacity (30-35%) for better visibility
 * - Strong color saturation
 * - Multiple neon colors (purple, blue, cyan, green, yellow, pink)
 *
 * @module components/shared/AnimatedNeonBackground
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedNeonBackgroundProps {
  /** Color scheme variant */
  variant?: 'default' | 'purple' | 'blue' | 'cyan' | 'green' | 'mixed';
  /** Opacity level (0.2 - 0.5) */
  opacity?: number;
}

/**
 * AnimatedNeonBackground component
 *
 * Renders multiple animated gradient orbs for vibrant background effect.
 *
 * @example
 * <AnimatedNeonBackground variant="mixed" opacity={0.35} />
 *
 * @param props - Component props
 * @returns Animated background element
 */
export function AnimatedNeonBackground({
  variant = 'mixed',
  opacity = 0.35,
}: AnimatedNeonBackgroundProps) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-darkest via-bg-dark to-bg-darkest" />

      {/* Orb 1: Purple - Top Left */}
      <motion.div
        className="absolute top-0 left-1/4 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.95, 1],
          rotate: [0, 90, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-primary-500/60 via-primary-500/25 to-transparent blur-3xl" />
      </motion.div>

      {/* Orb 2: Cyan - Bottom Right */}
      <motion.div
        className="absolute bottom-0 right-1/4 w-[800px] h-[800px] translate-x-1/2 translate-y-1/2"
        style={{ opacity }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 50, -30, 0],
          scale: [1, 1.2, 0.9, 1],
          rotate: [0, -90, -180, -360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-neon-cyan/60 via-neon-cyan/25 to-transparent blur-3xl" />
      </motion.div>

      {/* Orb 3: Blue - Top Right */}
      <motion.div
        className="absolute top-1/4 right-1/3 w-[700px] h-[700px] translate-x-1/2"
        style={{ opacity }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.1, 1.05, 1],
          rotate: [0, 120, 240, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-neon-blue/55 via-neon-blue/20 to-transparent blur-3xl" />
      </motion.div>

      {/* Orb 4: Green - Center Left */}
      <motion.div
        className="absolute top-1/2 left-1/3 w-[650px] h-[650px] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity }}
        animate={{
          x: [0, 35, -35, 0],
          y: [0, -45, 45, 0],
          scale: [1, 1.08, 1.12, 1],
          rotate: [360, 270, 180, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-neon-green/50 via-neon-green/20 to-transparent blur-3xl" />
      </motion.div>

      {/* Orb 5: Pink - Bottom Left */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px]"
        style={{ opacity: opacity * 0.8 }}
        animate={{
          x: [0, -45, 45, 0],
          y: [0, 40, -20, 0],
          scale: [1, 1.05, 1.15, 1],
          rotate: [0, 60, 120, 180],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-neon-pink/45 via-neon-pink/15 to-transparent blur-3xl" />
      </motion.div>

      {/* Orb 6: Yellow - Top Center */}
      <motion.div
        className="absolute top-0 left-1/2 w-[550px] h-[550px] -translate-x-1/2"
        style={{ opacity: opacity * 0.7 }}
        animate={{
          x: [0, -25, 25, 0],
          y: [0, 30, -30, 0],
          scale: [1, 1.12, 0.98, 1],
          rotate: [0, -45, -90, -180],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-neon-yellow/40 via-neon-yellow/15 to-transparent blur-3xl" />
      </motion.div>

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}

export default AnimatedNeonBackground;
