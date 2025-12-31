/**
 * History Page
 *
 * Displays task activity history with pagination.
 * Preserves all history functionality and backend integration.
 */

"use client";

import React, { useEffect } from "react";
import { useHistory } from "@/hooks/useHistory";
import { ArrowLeft, Clock, TrendingUp, RefreshCw, Plus, CheckCircle2, Edit, Trash2, Circle } from "lucide-react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useRouter } from "next/navigation";
import HistoryList from "@/components/history/HistoryList";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import apiClient from "@/services/api";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function HistoryPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useProtectedRoute();

  const {
    entries,
    loading,
    error,
    pagination,
    fetchHistory,
    clearError,
  } = useHistory();

  // State to track total action counts
  const [totalCounts, setTotalCounts] = React.useState({
    created: 0,
    completed: 0,
    updated: 0,
    deleted: 0,
    incompleted: 0,
  });
  const [statsLoading, setStatsLoading] = React.useState(true);

  // Fetch history stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const stats = await apiClient.getHistoryStats();
        setTotalCounts(stats);
      } catch (err) {
        console.error('Failed to fetch history stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch first page on mount
  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handlePageChange = (page: number) => {
    fetchHistory(page);
  };

  const handleRefresh = () => {
    fetchHistory(pagination.page);
  };

  /**
   * Handle delete history entry
   */
  const handleDeleteEntry = async (historyId: string) => {
    try {
      await apiClient.deleteHistoryEntry(historyId);

      await Swal.fire({
        icon: 'success',
        title: 'History Entry Cleared',
        text: 'The history entry has been removed.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });

      fetchHistory(pagination.page);
    } catch (err) {
      console.error('Error deleting history entry:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error Deleting Entry',
        text: err instanceof Error ? err.message : 'Failed to delete history entry',
        confirmButtonColor: '#8B5CF6',
      });
    }
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
          <div className="h-full w-full rounded-full border-4 border-primary-500/20 border-t-primary-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button and Refresh */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-secondary font-medium transition-all duration-300 hover:gap-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded px-2 py-1"
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
            <div className="p-3 bg-[var(--bg-elevated)]/30 backdrop-blur-sm border border-[var(--border)]/30 rounded-xl">
              <Clock className="h-8 w-8 text-primary-400" />
            </div>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold text-text-primary"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Task History
              </h1>
              <p className="text-text-secondary mt-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary-400" />
                Track every action and change in your tasks
              </p>
            </div>
          </motion.div>

          {/* Stats Cards - Action Summary */}
          {statsLoading ? (
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6"
            >
              {[...Array(5)].map((_, i) => (
                <GlassCard key={i} variant="elevated" className="p-5 border-l-4 border-gray-500/20">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-gray-500/10 animate-pulse w-12 h-12" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-500/20 rounded animate-pulse w-16 mb-2" />
                        <div className="h-6 bg-gray-500/20 rounded animate-pulse w-20" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6"
            >
              {/* Created */}
              <GlassCard variant="elevated" className="p-5 border-l-4 border-green-500">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-green-500/20">
                      <Plus size={22} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Created</div>
                      <div className="text-2xl font-bold text-green-400">
                        {totalCounts.created} {totalCounts.created === 1 ? 'task' : 'tasks'}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Completed */}
              <GlassCard variant="elevated" className="p-5 border-l-4 border-pink-500">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-pink-500/20">
                      <CheckCircle2 size={22} className="text-pink-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Completed</div>
                      <div className="text-2xl font-bold text-pink-400">
                        {totalCounts.completed} {totalCounts.completed === 1 ? 'task' : 'tasks'}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Updated */}
              <GlassCard variant="elevated" className="p-5 border-l-4 border-yellow-500">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-yellow-500/20">
                      <Edit size={22} className="text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Updated</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {totalCounts.updated} {totalCounts.updated === 1 ? 'task' : 'tasks'}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Deleted */}
              <GlassCard variant="elevated" className="p-5 border-l-4 border-red-500">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-red-500/20">
                      <Trash2 size={22} className="text-red-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Deleted</div>
                      <div className="text-2xl font-bold text-red-400">
                        {totalCounts.deleted} {totalCounts.deleted === 1 ? 'task' : 'tasks'}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Incompleted */}
              <GlassCard variant="elevated" className="p-5 border-l-4 border-blue-500">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/20">
                      <Circle size={22} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">Incompleted</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {totalCounts.incompleted} {totalCounts.incompleted === 1 ? 'task' : 'tasks'}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard variant="standard" className="p-4 border-red-500/30">
              <div className="flex items-center justify-between">
                <p className="text-red-400 font-medium">{error}</p>
                <button
                  onClick={clearError}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              className="inline-block h-16 w-16"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="h-full w-full rounded-full border-4 border-primary-500/20 border-t-primary-500" />
            </motion.div>
            <p className="mt-6 text-lg font-medium text-text-primary">
              Loading your activity timeline...
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Gathering all your task events
            </p>
          </motion.div>
        )}

        {/* History List */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <HistoryList
              entries={entries}
              pagination={pagination}
              onPageChange={handlePageChange}
              onDeleteEntry={handleDeleteEntry}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
