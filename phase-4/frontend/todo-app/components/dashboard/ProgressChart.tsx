/**
 * ProgressChart Component
 *
 * Donut chart showing task completion distribution.
 * Uses Recharts for visualization.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface ProgressChartProps {
  completed: number;
  pending: number;
  overdue: number;
  className?: string;
}

export function ProgressChart({
  completed = 24,
  pending = 22,
  overdue = 2,
  className,
}: ProgressChartProps) {
  const total = completed + pending + overdue;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const data = [
    { name: 'Completed', value: completed, color: '#10B981' },
    { name: 'Pending', value: pending, color: 'var(--accent-dashboard)' },
    { name: 'Overdue', value: overdue, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (cx === undefined || cy === undefined || midAngle === undefined ||
        innerRadius === undefined || outerRadius === undefined || percent === undefined) {
      return null;
    }
    if (percent < 0.05) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border border-[var(--border)]',
        'bg-[var(--bg-card)] p-4 lg:p-6',
        className
      )}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Progress Overview
      </h3>

      <div className="flex items-center justify-between">
        {/* Chart */}
        <div className="relative w-40 h-40 lg:w-48 lg:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value?: number) => [`${value ?? 0} tasks`, '']}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {completionRate}%
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Complete
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.name}
              </span>
              <span
                className="text-sm font-medium ml-auto"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div
        className="mt-4 pt-4 border-t border-[var(--border)] text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        <p className="text-sm">
          {completed} of {total} tasks completed this week
        </p>
      </div>
    </motion.div>
  );
}
