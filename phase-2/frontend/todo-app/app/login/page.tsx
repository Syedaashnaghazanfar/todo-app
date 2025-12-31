"use client";

/**
 * Login Page Route - Cyberpunk Neon Elegance Theme
 *
 * Enhanced authentication page with glassmorphism and neon accents.
 * Preserves all backend integration logic while upgrading visuals.
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { GlassCard } from '@/components/ui/glass-card';
import { fadeInUp, fadeInUpTransition } from '@/lib/animations';
import { PurpleSpinner } from '@/components/shared/PurpleSpinner';

/**
 * Animated Background Component
 */
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-bg-darkest via-bg-dark to-bg-darkest" />

    {/* Animated gradient orbs */}
    <motion.div
      className="absolute top-0 left-1/4 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20"
      animate={{
        x: [0, 50, 0],
        y: [0, -30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/30 via-primary-500/10 to-transparent blur-3xl" />
    </motion.div>

    <motion.div
      className="absolute bottom-0 right-1/4 w-[600px] h-[600px] translate-x-1/2 translate-y-1/2 opacity-20"
      animate={{
        x: [0, -40, 0],
        y: [0, 40, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-neon-blue/30 via-neon-blue/10 to-transparent blur-3xl" />
    </motion.div>

    {/* Subtle grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    />
  </div>
);

/**
 * Login Page Component
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated cyberpunk background */}
      <AnimatedBackground />

      {/* Main Content Card */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={fadeInUpTransition}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard variant="elevated" className="p-8 md:p-10">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium mb-6 transition-all duration-300 hover:gap-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Page Header with gradient text */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center mb-4"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-8 w-8 text-primary-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            </motion.div>

            <h1
              className="text-3xl md:text-4xl font-bold mb-2 text-white"
              style={{
                background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome Back
            </h1>
            <p className="text-text-secondary text-sm md:text-base">
              Log in to access your tasks and continue where you left off
            </p>
          </div>

          {/* Login Form - Preserves all backend integration */}
          <div className="flex flex-col items-center">
            <Suspense fallback={<PurpleSpinner />}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-primary-400 hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded px-1 transition-all duration-300 hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Decorative Bottom Border with glow */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-center text-text-muted flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              Your session will remain active for 30 days
            </p>
          </div>
        </GlassCard>

        {/* Decorative glow effect under card */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary-500/20 blur-2xl rounded-full" />
      </motion.div>
    </div>
  );
}
