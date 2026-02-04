/**
 * StatusIndicator Component
 *
 * Displays health status with color-coded indicators.
 * Supports healthy (green), degraded (yellow), and offline (red) states.
 *
 * Usage:
 * <StatusIndicator status="healthy" label="API Server" />
 * <StatusIndicator status="degraded" label="Database" />
 * <StatusIndicator status="offline" label="Cache Service" />
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'healthy' | 'degraded' | 'offline' | 'loading' | 'error';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  healthy: {
    color: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    dotColor: 'bg-green-500',
    Icon: CheckCircle,
    message: 'Operational',
  },
  degraded: {
    color: 'text-yellow-500 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
    Icon: AlertCircle,
    message: 'Degraded Performance',
  },
  offline: {
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
    Icon: XCircle,
    message: 'Offline',
  },
  loading: {
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
    Icon: null,
    message: 'Loading',
  },
  error: {
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
    Icon: XCircle,
    message: 'Error',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showIcon = true,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Animated status dot */}
      <motion.div
        className={cn('h-2 w-2 rounded-full', config.dotColor)}
        animate={
          status === 'loading'
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }
            : {
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }
        }
        transition={{
          duration: status === 'loading' ? 1.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Label (optional) */}
      {label && (
        <span className="text-sm font-medium text-foreground">
          {label}
        </span>
      )}

      {/* Icon (optional) */}
      {showIcon && Icon && (
        <Icon
          className={cn('h-3 w-3', config.color)}
          aria-label={config.message}
        />
      )}

      {/* Status message */}
      <span className={cn('text-xs font-medium', config.color)}>
        {config.message}
      </span>
    </motion.div>
  );
};

StatusIndicator.displayName = 'StatusIndicator';
