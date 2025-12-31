/**
 * History Page - Cyberpunk Neon Elegance Theme
 *
 * Enhanced with glassmorphism and color-coded timeline.
 * Preserves all history functionality and backend integration.
 */

"use client";

import React, { useEffect } from "react";
import { useHistory } from "@/hooks/useHistory";
import { ArrowLeft, Clock, TrendingUp, RefreshCw } from "lucide-react";
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
          <div className="h-full w-full rounded-full border-4 border---accent-history/20 border-t---accent-history filter: drop-shadow(var(--shadow-sm))" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Vibrant Animated Neon Background */}

      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button and Refresh */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/")}
            className="flex items-center gap-2 var(--text-secondary) hover:var(--text-secondary) font-medium transition-all duration-300 hover:gap-3 focus:outline-none focus:ring-2 focus:ring-var(--accent-dashboard)/50 rounded px-2 py-1"
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
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--bg-elevated)]/30 backdrop-blur-sm border border-[var(--border)]/30 rounded-xl box-shadow: var(--shadow-md)">
              <Clock className="h-8 w-8 var(--accent-history) filter: drop-shadow(var(--shadow-sm))" />
            </div>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-history), #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Task History
              </h1>
              <p className="text-text-secondary mt-1 flex items-center gap-2">
                <TrendingUp size={16} className="var(--accent-history)" />
                Track every action and change in your tasks
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {!loading && pagination.total_count > 0 && (
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
            >
              <GlassCard variant="elevated" className="p-4">
                <div className="text-sm text-text-secondary">Total Events</div>
                <div className="text-2xl font-bold var(--text-secondary) mt-1">
                  {pagination.total_count}
                </div>
              </GlassCard>
              <GlassCard variant="elevated" className="p-4">
                <div className="text-sm text-text-secondary">Current Page</div>
                <div className="text-2xl font-bold text-neon-blue mt-1">
                  {pagination.page} / {pagination.total_pages}
                </div>
              </GlassCard>
              <GlassCard variant="elevated" className="p-4">
                <div className="text-sm text-text-secondary">Showing</div>
                <div className="text-2xl font-bold text-neon-cyan mt-1">
                  {entries.length} events
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
            <GlassCard variant="standard" className="p-4 border-neon-red/30">
              <div className="flex items-center justify-between">
                <p className="text-neon-red font-medium">{error}</p>
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
              <div className="h-full w-full rounded-full border-4 border---accent-history/20 border-t---accent-history filter: drop-shadow(var(--shadow-sm))" />
            </motion.div>
            <p className="mt-6 text-lg font-medium bg-gradient-to-r from---accent-history to-neon-cyan bg-clip-text text-transparent">
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
