/**
 * HistoryList Component
 *
 * Displays list of history entries with pagination controls.
 * Shows Previous/Next buttons with page numbers.
 *
 * @see /specs/004-frontend-backend-integration/ - History list with pagination
 */

"use client";

import React from "react";
import { HistoryEntry as HistoryEntryType, PaginationMeta } from "@/services/api";
import HistoryEntry from "./HistoryEntry";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

interface HistoryListProps {
  entries: HistoryEntryType[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onDeleteEntry?: (historyId: string) => void;
}

export default function HistoryList({
  entries,
  pagination,
  onPageChange,
  onDeleteEntry,
}: HistoryListProps) {
  const { page, total_pages, total_count } = pagination;

  // Empty state
  if (entries.length === 0) {
    return (
      <GlassCard variant="elevated" className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
              <svg
                className="w-10 h-10 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No History Yet
          </h3>
          <p className="text-text-secondary">
            Your task activity timeline will appear here. Start creating, updating, and completing tasks to see your history!
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Entries List */}
      <div className="space-y-0">
        {entries.map((entry, index) => (
          <HistoryEntry
            key={entry.history_id}
            entry={entry}
            index={index}
            onDelete={onDeleteEntry}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {total_pages > 1 && (
        <GlassCard variant="elevated" className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Page Info */}
            <div className="text-sm">
              <span className="text-text-secondary">Showing page</span>{" "}
              <span className="font-bold text-text-primary">{page}</span>{" "}
              <span className="text-text-secondary">of</span>{" "}
              <span className="font-bold text-text-primary">{total_pages}</span>
              <div className="mt-1 text-xs text-text-muted">
                {total_count} total {total_count === 1 ? "event" : "events"}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                whileHover={{ scale: page > 1 ? 1.02 : 1 }}
                whileTap={{ scale: page > 1 ? 0.98 : 1 }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[var(--bg-elevated)] hover:bg-[var(--primary)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--bg-elevated)] disabled:hover:text-inherit"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
                Previous
              </motion.button>
              <motion.button
                onClick={() => onPageChange(page + 1)}
                disabled={page === total_pages}
                whileHover={{ scale: page < total_pages ? 1.02 : 1 }}
                whileTap={{ scale: page < total_pages ? 0.98 : 1 }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[var(--primary)] text-white hover:bg-[var(--primary-400)] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                Next
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
