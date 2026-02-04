/**
 * WelcomeHeader Component
 *
 * Displays personalized greeting with user's name and current date.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeHeaderProps {
  userName?: string;
  className?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function WelcomeHeader({ userName = 'there', className }: WelcomeHeaderProps) {
  const greeting = getGreeting();
  const formattedDate = getFormattedDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('mb-6', className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl lg:text-3xl font-bold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {greeting}, {userName}!
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <Calendar
              className="w-4 h-4"
              style={{ color: 'var(--text-muted)' }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Sparkle accent */}
        <div
          className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full"
          style={{ backgroundColor: 'var(--accent-dashboard-muted)' }}
        >
          <Sparkles
            className="w-5 h-5"
            style={{ color: 'var(--accent-dashboard)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
