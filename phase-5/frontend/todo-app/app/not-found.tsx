"use client";

/**
 * 404 Not Found Page - Cyberpunk Neon Elegance Theme
 *
 * Custom error page with animated gradient text and glassmorphism.
 * Features floating animations and neon glow effects.
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { fadeInUp, fadeInUpTransition } from '@/lib/animations';

/**
 * Animated Background Component
 */
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-bg-darkest via-bg-dark to-bg-darkest" />

    {/* Animated gradient orbs */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20"
      animate={{
        x: [0, 100, 0],
        y: [0, -50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-neon-red/40 via-neon-red/10 to-transparent blur-3xl" />
    </motion.div>

    <motion.div
      className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] translate-x-1/2 translate-y-1/2 opacity-20"
      animate={{
        x: [0, -80, 0],
        y: [0, 60, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/30 via-primary-500/10 to-transparent blur-3xl" />
    </motion.div>

    {/* Glitch grid effect */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "30px 30px",
      }}
    />
  </div>
);

/**
 * 404 Not Found Page Component
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated cyberpunk background */}
      <AnimatedBackground />

      {/* Main Content */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={fadeInUpTransition}
        className="relative z-10 max-w-2xl w-full"
      >
        <GlassCard variant="elevated" className="p-8 md:p-12 text-center">
          {/* Animated 404 Text with Glitch Effect */}
          <motion.div
            className="mb-8"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <h1 className="text-8xl md:text-9xl font-bold mb-4">
              <span className="bg-gradient-to-r from-neon-red via-primary-400 to-neon-pink bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                404
              </span>
            </h1>
          </motion.div>

          {/* Icon with glow */}
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="h-16 w-16 text-neon-red drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
          </motion.div>

          {/* Main Message */}
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Page Not Found
          </h2>

          <p className="text-text-secondary text-base md:text-lg mb-8 max-w-md mx-auto">
            The page you&apos;re looking for seems to have vanished into the digital void. It might have been moved, deleted, or never existed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <NeonButton
                variant="primary"
                size="lg"
                glow
                icon={<Home className="w-5 h-5" />}
              >
                Back to Home
              </NeonButton>
            </Link>

            <NeonButton
              variant="ghost"
              size="lg"
              onClick={() => window.history.back()}
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Go Back
            </NeonButton>
          </div>

          {/* Decorative Bottom Section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-xs text-text-muted">
              Error Code: 404 | Page Not Found
            </p>
          </div>
        </GlassCard>

        {/* Decorative glow effects */}
        <div className="absolute -bottom-4 left-1/4 w-1/2 h-12 bg-neon-red/20 blur-3xl rounded-full" />
        <div className="absolute -top-4 right-1/4 w-1/2 h-12 bg-primary-500/20 blur-3xl rounded-full" />
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
