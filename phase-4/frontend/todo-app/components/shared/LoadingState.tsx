/**
 * LoadingState Component
 *
 * Skeleton loader with shimmer animation for loading states.
 * Supports multiple skeleton lines for list loading.
 *
 * Usage:
 * <LoadingState height="h-20" width="w-full" count={3} />
 * <LoadingState height="h-32" width="w-64" />
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  height?: string;
  width?: string;
  count?: number;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  height = 'h-20',
  width = 'w-full',
  count = 1,
  className,
  rounded = 'md',
}) => {
  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.1,
          }}
          className={cn(
            height,
            width,
            roundedClass,
            'relative overflow-hidden',
            'bg-purple-100 dark:bg-purple-900/20'
          )}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: index * 0.1,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

LoadingState.displayName = 'LoadingState';

/**
 * LoadingCard - Preset loading state for card skeletons
 */
export const LoadingCard: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-950/30"
      >
        <LoadingState height="h-6" width="w-3/4" count={1} className="mb-4" />
        <LoadingState height="h-4" width="w-full" count={2} />
      </div>
    ))}
  </div>
);

LoadingCard.displayName = 'LoadingCard';

/**
 * LoadingList - Preset loading state for list skeletons
 */
export const LoadingList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-4 rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-purple-950/20"
      >
        <LoadingState height="h-10" width="w-10" count={1} rounded="full" />
        <div className="flex-1">
          <LoadingState height="h-4" width="w-full" count={2} />
        </div>
      </div>
    ))}
  </div>
);

LoadingList.displayName = 'LoadingList';
