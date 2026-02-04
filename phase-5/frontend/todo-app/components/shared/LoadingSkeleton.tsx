/**
 * LoadingSkeleton Component
 *
 * Glassmorphism skeleton loaders with shimmer animation for loading states.
 *
 * Features:
 * - Glass background with backdrop blur
 * - Neon shimmer animation
 * - Multiple variants (card, list, text)
 * - Customizable dimensions
 * - Smooth gradient animation
 *
 * @module components/shared/LoadingSkeleton
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton animation variant
 */
const shimmerAnimation = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 2,
    ease: "linear" as const,
    repeat: Infinity,
  },
};

/**
 * LoadingSkeleton props
 */
interface LoadingSkeletonProps {
  /** Height of skeleton (default: auto) */
  height?: string | number;
  /** Width of skeleton (default: 100%) */
  width?: string | number;
  /** Border radius (default: 0.5rem) */
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Base skeleton component with shimmer animation
 */
export function LoadingSkeleton({
  height = 'auto',
  width = '100%',
  rounded = 'md',
  className = '',
}: LoadingSkeletonProps) {
  const roundedClass = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <motion.div
      className={`relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 ${roundedClass} ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: height === 'auto' ? '1rem' : undefined,
      }}
      {...shimmerAnimation}
    >
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.1) 20%, rgba(59, 130, 246, 0.15) 50%, rgba(6, 182, 212, 0.1) 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
        }}
      />
    </motion.div>
  );
}

/**
 * Task card skeleton loader
 */
export function TaskCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <LoadingSkeleton height={24} width="70%" rounded="md" />
        <div className="flex items-center gap-2">
          <LoadingSkeleton height={24} width={80} rounded="full" />
          <LoadingSkeleton height={20} width={20} rounded="full" />
        </div>
      </div>

      {/* Description */}
      <LoadingSkeleton height={40} width="100%" rounded="md" className="mb-3" />

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <LoadingSkeleton height={24} width={60} rounded="full" />
        <LoadingSkeleton height={24} width={70} rounded="full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <LoadingSkeleton height={20} width={100} rounded="md" />
        <div className="flex gap-2">
          <LoadingSkeleton height={28} width={28} rounded="md" />
          <LoadingSkeleton height={28} width={28} rounded="md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Task list skeleton loader
 */
export function TaskListSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Text skeleton loader
 */
export function TextSkeleton({
  lines = 1,
  spacing = 'normal',
  className = '',
}: {
  lines?: number;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}) {
  const spacingClass = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    loose: 'space-y-4',
  }[spacing];

  return (
    <div className={`${spacingClass} ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '80%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
}

/**
 * Stat card skeleton loader
 */
export function StatCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <LoadingSkeleton height={56} width={56} rounded="xl" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton height={16} width="40%" rounded="sm" />
          <LoadingSkeleton height={32} width="60%" rounded="md" />
        </div>
      </div>
      <div className="pt-4 border-t border-white/10">
        <LoadingSkeleton height={12} width="80%" rounded="sm" />
      </div>
    </div>
  );
}

/**
 * Page skeleton loader
 */
export function PageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <LoadingSkeleton height={64} width={64} rounded="xl" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton height={40} width="50%" rounded="md" />
            <LoadingSkeleton height={20} width="70%" rounded="sm" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Content */}
      <TaskListSkeleton count={5} />
    </div>
  );
}

/**
 * Add shimmer keyframe animation to global styles
 * (This should be added to your global CSS file)
 */
export const shimmerStyles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
`;

export default LoadingSkeleton;
