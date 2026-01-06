/**
 * CompletionPieChart Component
 *
 * Displays task completion status as a pie chart using Recharts.
 * Shows the proportion of completed vs incomplete tasks.
 * Uses green for completed and orange for incomplete tasks.
 *
 * @see /specs/004-frontend-backend-integration/ - Analytics dashboard
 */

"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, CHART_CONFIG } from "@/lib/chartConfig";

interface CompletionPieChartProps {
  completed: number;
  incomplete: number;
}

export default function CompletionPieChart({ completed, incomplete }: CompletionPieChartProps) {
  // Prepare data for pie chart with neon colors
  const data = [
    { name: "Completed", value: completed, color: "#10b981" }, // neon-green
    { name: "Incomplete", value: incomplete, color: "#f59e0b" }, // neon-yellow
  ];

  // If no data, show empty state
  if (completed === 0 && incomplete === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary">
        <p>No task data available</p>
      </div>
    );
  }

  // Calculate total and percentages
  const total = completed + incomplete;
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const incompletePercent = total > 0 ? Math.round((incomplete / total) * 100) : 0;

  // Custom label to show percentages with neon glow
  const renderCustomLabel = (entry: any) => {
    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
    return `${percent}%`;
  };

  // Custom tooltip with glassmorphism
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-bg-card/95 backdrop-blur-xl border border-primary-500/30 rounded-lg p-3 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <p className="text-sm font-semibold text-text-primary mb-1">{data.name}</p>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span className="text-text-secondary">Count:</span>
            <span className="text-text-primary font-semibold">{data.value} tasks</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <defs>
            {/* Neon glow filter for pie slices */}
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={{
              stroke: 'rgba(255, 255, 255, 0.3)',
              strokeWidth: 1,
            }}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
              if (!midAngle || !cx || !cy || !outerRadius || !percent) return null;
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 25;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  fill="rgba(255, 255, 255, 0.9)"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  className="text-sm font-bold"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))' }}
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
            outerRadius={110}
            innerRadius={60}
            paddingAngle={2}
            dataKey="value"
            animationDuration={1200}
            animationBegin={100}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Stats Below Chart */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="text-center p-3 bg-neon-green/5 backdrop-blur-sm border border-neon-green/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-neon-green shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm font-medium text-text-secondary">Completed</span>
          </div>
          <p className="text-3xl font-bold text-neon-green drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">{completed}</p>
          <p className="text-xs text-text-muted mt-1">{completedPercent}% of total</p>
        </div>
        <div className="text-center p-3 bg-neon-yellow/5 backdrop-blur-sm border border-neon-yellow/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-neon-yellow shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-sm font-medium text-text-secondary">Incomplete</span>
          </div>
          <p className="text-3xl font-bold text-neon-yellow drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{incomplete}</p>
          <p className="text-xs text-text-muted mt-1">{incompletePercent}% of total</p>
        </div>
      </div>
    </div>
  );
}
