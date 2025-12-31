/**
 * Analytics Dashboard Page - Cyberpunk Neon Elegance Theme
 *
 * Enhanced with glassmorphism and neon accents.
 * Preserves all Recharts functionality and backend integration.
 */

"use client";

import React, { useEffect } from "react";
import { useStats } from "@/hooks/useStats";
import { ArrowLeft, RefreshCw, BarChart3, TrendingUp } from "lucide-react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import WeeklyChart from "@/components/analytics/WeeklyChart";
import MetricCard from "@/components/analytics/MetricCard";
import ActivityTimeline from "@/components/analytics/ActivityTimeline";
import CompletionPieChart from "@/components/analytics/CompletionPieChart";
import { AnimatedNeonBackground } from "@/components/shared/AnimatedNeonBackground";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

// Transform WeeklyStats into chart data format
interface WeeklyStatsData {
  tasks_created_this_week: number;
  tasks_completed_this_week: number;
  total_tasks: number;
  total_completed: number;
  total_incomplete: number;
}

function transformWeeklyData(stats: WeeklyStatsData) {
  return [
    {
      day: "This Week",
      completed: stats.tasks_completed_this_week,
      incomplete: stats.tasks_created_this_week - stats.tasks_completed_this_week,
    }
  ];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { stats, loading, error, fetchStats, clearError } = useStats();
  const { isLoading: authLoading } = useProtectedRoute();

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="h-16 w-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-full w-full rounded-full border-4 border-primary-200/20 border-t-primary-500 shadow-glow-purple" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Vibrant Animated Neon Background */}
      <AnimatedNeonBackground variant="mixed" opacity={0.35} />

      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button and Refresh */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-all duration-300 hover:gap-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded px-2 py-1"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <NeonButton
              variant="secondary"
              size="md"
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </NeonButton>
          </motion.div>
        </div>

        {/* Page Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mb-10"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <BarChart3 className="h-8 w-8 text-neon-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Analytics
              </h1>
              <p className="text-text-secondary mt-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-neon-blue" />
                Track your productivity and task completion patterns
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard variant="standard" className="p-4 border-neon-red/30">
              <div className="flex items-center justify-between">
                <p className="text-neon-red">{error}</p>
                <button
                  onClick={clearError}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Stats Grid */}
        {stats && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Tasks"
                value={stats.total_tasks}
                type="total"
              />
              <MetricCard
                title="Completed"
                value={stats.total_completed}
                type="completed"
              />
              <MetricCard
                title="Incomplete"
                value={stats.total_incomplete}
                type="incomplete"
              />
              <MetricCard
                title="This Week"
                value={stats.tasks_created_this_week}
                type="created"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Chart */}
              <GlassCard variant="elevated" className="p-6">
                <h3
                  className="text-xl font-bold mb-4 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Weekly Activity
                </h3>
                <WeeklyChart data={transformWeeklyData(stats)} />
              </GlassCard>

              {/* Pie Chart */}
              <GlassCard variant="elevated" className="p-6">
                <h3
                  className="text-xl font-bold mb-4 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Completion Status
                </h3>
                <CompletionPieChart
                  completed={stats.total_completed}
                  incomplete={stats.total_incomplete}
                />
              </GlassCard>
            </div>

            {/* Activity Timeline */}
            <GlassCard variant="elevated" className="p-6">
              <h3
                className="text-xl font-bold mb-4 text-white"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Recent Activity
              </h3>
              <ActivityTimeline data={transformWeeklyData(stats)} />
            </GlassCard>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && !stats && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="h-16 w-16"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="h-full w-full rounded-full border-4 border-neon-blue/20 border-t-neon-blue shadow-glow-blue" />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
