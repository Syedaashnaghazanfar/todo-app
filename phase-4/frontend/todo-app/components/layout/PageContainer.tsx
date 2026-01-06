/**
 * PageContainer Component
 *
 * Consistent wrapper for page content with proper spacing,
 * background color, and scroll handling.
 */

'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  showSidebar?: boolean;
}

/**
 * Get page-specific accent color from route
 */
function getPageAccent(pathname: string): string {
  if (pathname === '/' || pathname === '/dashboard') {
    return 'dashboard';
  }
  if (pathname.startsWith('/tasks')) {
    return 'tasks';
  }
  if (pathname.startsWith('/analytics')) {
    return 'analytics';
  }
  if (pathname.startsWith('/history')) {
    return 'history';
  }
  if (pathname.startsWith('/notifications')) {
    return 'notifications';
  }
  if (pathname.startsWith('/settings')) {
    return 'settings';
  }
  if (pathname.startsWith('/chat')) {
    return 'chat';
  }
  return 'dashboard';
}

export function PageContainer({
  children,
  className,
  title,
  showSidebar = true,
}: PageContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.3,
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.2,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'min-h-screen',
        'bg-[var(--bg-dark)]',
        'transition-colors duration-300'
      )}
    >
      <motion.main
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className={cn(
          'flex flex-col',
          showSidebar ? 'lg:pl-72' : '',
          className
        )}
      >
        {/* Page Title (for non-sidebar pages) */}
        {title && !showSidebar && (
          <motion.div
            variants={childVariants}
            className="px-6 pt-6 pb-4"
          >
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h1>
          </motion.div>
        )}

        {/* Page Content */}
        <motion.div
          variants={childVariants}
          className="flex-1 p-4 lg:p-6"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <motion.footer
          variants={childVariants}
          className="px-6 py-4 mt-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          <p className="text-sm text-center">
            Todo App - Stay productive, stay calm
          </p>
        </motion.footer>
      </motion.main>
    </div>
  );
}

/**
 * Section Component - For grouping related content
 */
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Section({ children, className, title, description }: SectionProps) {
  return (
    <section className={cn('mb-6', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Card Component - For contained content
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 lg:p-6',
    lg: 'p-6 lg:p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)]',
        'bg-[var(--bg-card)]',
        'shadow-sm',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Grid Component - For responsive grid layouts
 */
interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export function Grid({ children, className, cols = 2, gap = 'md' }: GridProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 lg:gap-6',
    lg: 'gap-6 lg:gap-8',
  };

  return (
    <div className={cn('grid', colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}
