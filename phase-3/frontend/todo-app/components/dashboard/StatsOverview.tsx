/**
 * StatsOverview Component
 *
 * Displays 4 compact stat cards for the dashboard:
 * Due Today, Overdue, Completed, Total Tasks
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  colorMuted: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  colorMuted,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--border)]',
        'bg-[var(--bg-card)] p-4',
        'transition-all duration-200 hover:shadow-md'
      )}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-20"
        style={{ backgroundColor: colorMuted }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: colorMuted }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>

          {trend && trendValue && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                trend === 'up' && 'bg-emerald-500/10 text-emerald-500',
                trend === 'down' && 'bg-red-500/10 text-red-500',
                trend === 'neutral' && 'bg-gray-500/10 text-gray-500'
              )}
            >
              <TrendingUp
                className={cn(
                  'w-3 h-3',
                  trend === 'down' && 'rotate-180'
                )}
              />
              {trendValue}
            </div>
          )}
        </div>

        <div className="mb-1">
          <span
            className="text-3xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}
          </span>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

interface StatsOverviewProps {
  dueToday?: number;
  overdue?: number;
  completed?: number;
  total?: number;
  className?: string;
}

export function StatsOverview({
  dueToday = 5,
  overdue = 2,
  completed = 24,
  total = 48,
  className,
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Due Today',
      value: dueToday,
      icon: Clock,
      color: 'var(--accent-dashboard)',
      colorMuted: 'var(--accent-dashboard-muted)',
      trend: 'up' as const,
      trendValue: '+2',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: '#EF4444',
      colorMuted: 'oklch(0.956 0.043 25)',
      trend: 'down' as const,
      trendValue: '-1',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle,
      color: '#10B981',
      colorMuted: 'oklch(0.954 0.045 156)',
      trend: 'up' as const,
      trendValue: '+5',
    },
    {
      label: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'var(--accent-tasks)',
      colorMuted: 'var(--accent-tasks-muted)',
    },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6',
        className
      )}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}
