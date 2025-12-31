"use client";

/**
 * Signup Page Route - Cyberpunk Neon Elegance Theme
 *
 * Enhanced registration page with glassmorphism and neon accents.
 * Preserves all backend integration logic while upgrading visuals.
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';
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
      className="absolute top-0 right-1/4 w-[800px] h-[800px] translate-x-1/2 -translate-y-1/2 opacity-20"
      animate={{
        x: [0, -50, 0],
        y: [0, 30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-neon-cyan/30 via-neon-cyan/10 to-transparent blur-3xl" />
    </motion.div>

    <motion.div
      className="absolute bottom-0 left-1/4 w-[600px] h-[600px] -translate-x-1/2 translate-y-1/2 opacity-20"
      animate={{
        x: [0, 40, 0],
        y: [0, -40, 0],
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
 * Signup Page Component
 */
export default function SignupPage() {
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
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <UserPlus className="h-8 w-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
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
              Create Account
            </h1>
            <p className="text-text-secondary text-sm md:text-base">
              Join TodoApp and start managing your tasks
            </p>
          </div>

          {/* Signup Form - Preserves all backend integration */}
          <div className="flex flex-col items-center">
            <Suspense fallback={<PurpleSpinner />}>
              <SignupForm />
            </Suspense>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary-400 hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded px-1 transition-all duration-300 hover:underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Decorative Bottom Border with glow */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-center text-text-muted flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </GlassCard>

        {/* Decorative glow effect under card */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-neon-cyan/20 blur-2xl rounded-full" />
      </motion.div>
    </div>
  );
}
