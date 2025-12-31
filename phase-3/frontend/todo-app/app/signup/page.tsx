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
      <div className="absolute inset-0 bg-gradient-radial from-var(--accent-dashboard)/30 via-var(--accent-dashboard)/10 to-transparent blur-3xl" />
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

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT SIDE - Animated Notepad (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Notepad Container */}
              <div
                className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-100/10 dark:to-yellow-100/5 rounded-lg shadow-2xl p-8 pb-12 relative overflow-hidden"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    transparent,
                    transparent 31px,
                    rgba(59, 130, 246, 0.15) 31px,
                    rgba(59, 130, 246, 0.15) 32px
                  )`,
                  backgroundSize: '100% 32px',
                  animation: 'float 6s ease-in-out infinite'
                }}
              >
                {/* Red margin line */}
                <div className="absolute left-12 top-0 bottom-0 w-[2px] bg-red-400/30" />

                {/* Paper texture overlay */}
                <div className="absolute inset-0 opacity-5 mix-blend-multiply pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4' /%3E%3C/svg%3E")`
                  }}
                />

                {/* Animated Tasks */}
                <div className="relative space-y-8 pl-8">
                  {[
                    { text: '☐ Buy groceries', delay: '0s' },
                    { text: '☐ Finish project report', delay: '2s' },
                    { text: '☐ Plan tomorrow', delay: '4s' },
                    { text: '☐ Review emails', delay: '6s' }
                  ].map((task, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span
                        className="font-handwriting text-xl text-gray-800 dark:text-gray-300"
                        style={{
                          animation: `typewriter 1.5s steps(${task.text.length}) ${task.delay} 1 normal both, fadeIn 0.5s ${task.delay} ease-out both`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          borderRight: '2px solid transparent',
                          display: 'inline-block',
                        }}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}

                  {/* Blinking cursor at the end */}
                  <div
                    className="w-0.5 h-5 bg-gray-800 dark:bg-gray-300"
                    style={{
                      animation: 'blink 1s step-end 8s infinite'
                    }}
                  />
                </div>

                {/* Notepad spiral binding effect */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-400/20 to-transparent" />
              </div>

              {/* Shadow beneath notepad */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/10 blur-xl rounded-full" />
            </div>
          </div>

          {/* RIGHT SIDE - Signup Form */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={fadeInUpTransition}
            className="relative w-full"
          >
            <GlassCard variant="elevated" className="p-8 md:p-10">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 var(--text-secondary) hover:text-primary-300 text-sm font-medium mb-6 transition-all duration-300 hover:gap-3 focus:outline-none focus:ring-2 focus:ring-var(--accent-dashboard)/50 focus:ring-offset-2 focus:ring-offset-transparent rounded px-2 py-1"
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
                className="font-semibold var(--text-secondary) hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-var(--accent-dashboard)/50 focus:ring-offset-2 focus:ring-offset-transparent rounded px-1 transition-all duration-300 hover:underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Decorative Bottom Border with glow */}
          <div className="mt-8 pt-6 border-t border-[var(--border)]/30">
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
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');

        .font-handwriting {
          font-family: 'Indie Flower', cursive;
        }

        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
