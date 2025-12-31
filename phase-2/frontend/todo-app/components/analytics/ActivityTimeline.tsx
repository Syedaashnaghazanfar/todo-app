/**
 * ActivityTimeline Component
 *
 * Displays task operations over time as a line chart using Recharts.
 * Shows total task activity (completed + incomplete) for the week.
 * Uses purple theme colors from chartConfig.ts.
 *
 * @see /specs/004-frontend-backend-integration/ - Activity timeline chart
 */

"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { CHART_COLORS, CHART_CONFIG } from "@/lib/chartConfig";

interface DayData {
  day: string;
  completed: number;
  incomplete: number;
}

interface ActivityTimelineProps {
  data: DayData[];
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary">
        <p>No activity data available</p>
      </div>
    );
  }

  // Calculate total activity per day
  const formattedData = data.map((item) => ({
    day: item.day.substring(0, 3), // Mon, Tue, Wed, etc.
    total: item.completed + item.incomplete,
    completed: item.completed,
    incomplete: item.incomplete,
  }));

  // Custom tooltip with glassmorphism
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-card/95 backdrop-blur-xl border border-neon-cyan/30 rounded-lg p-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <p className="font-semibold text-text-primary mb-2">{data.day}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_4px_rgba(6,182,212,0.6)]" />
              <span className="text-text-secondary">Total:</span>
              <span className="text-neon-cyan font-semibold">{data.total}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-neon-green" />
              <span className="text-text-secondary">Completed:</span>
              <span className="text-neon-green font-semibold">{data.completed}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-neon-yellow" />
              <span className="text-text-secondary">Incomplete:</span>
              <span className="text-neon-yellow font-semibold">{data.incomplete}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {/* Neon cyan gradient for area fill */}
          <linearGradient id="neonCyanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(6, 182, 212, 0.3)', strokeWidth: 2 }} />
        <Area
          type="monotone"
          dataKey="total"
          name="Total Activity"
          stroke="#06b6d4"
          strokeWidth={3}
          fill="url(#neonCyanGradient)"
          animationDuration={1200}
          animationBegin={0}
          dot={{
            fill: '#06b6d4',
            stroke: 'rgba(6, 182, 212, 0.3)',
            strokeWidth: 4,
            r: 5,
          }}
          activeDot={{
            r: 7,
            fill: '#06b6d4',
            stroke: 'rgba(6, 182, 212, 0.5)',
            strokeWidth: 6,
            filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))',
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
