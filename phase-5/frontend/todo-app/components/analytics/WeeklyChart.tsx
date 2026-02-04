/**
 * WeeklyChart Component
 *
 * Displays weekly task completion data as a bar chart using Recharts.
 * Shows completed vs incomplete tasks for the current week.
 * Uses purple theme colors from chartConfig.ts (#7c3aed, #a78bfa).
 *
 * @see /specs/004-frontend-backend-integration/ - Weekly analytics chart
 */

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, CHART_CONFIG } from "@/lib/chartConfig";

interface DayData {
  day: string;
  completed: number;
  incomplete: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary">
        <p>No weekly data available</p>
      </div>
    );
  }

  // Format data for Recharts (ensure day names are short)
  const formattedData = data.map((item) => ({
    ...item,
    day: item.day.substring(0, 3), // Mon, Tue, Wed, etc.
  }));

  // Custom tooltip with neon styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card/95 backdrop-blur-xl border border-primary-500/30 rounded-lg p-3 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <p className="text-sm font-semibold text-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-text-secondary">{entry.name}:</span>
              <span className="text-text-primary font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        barSize={40}
      >
        <defs>
          {/* Neon gradient for completed bar */}
          <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
          </linearGradient>
          {/* Neon gradient for incomplete bar */}
          <linearGradient id="incompleteGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12, fontWeight: 500 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
        />
        <YAxis
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '14px',
            fontWeight: '500',
          }}
          iconType="circle"
        />
        <Bar
          dataKey="completed"
          name="Completed"
          fill="url(#completedGradient)"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
          animationBegin={0}
        />
        <Bar
          dataKey="incomplete"
          name="Incomplete"
          fill="url(#incompleteGradient)"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
          animationBegin={200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
