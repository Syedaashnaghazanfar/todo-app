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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-16 text-center border border-purple-100 dark:border-purple-900">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-purple-400"
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
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No History Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your task activity timeline will appear here. Start creating, updating, and completing tasks to see your history!
          </p>
        </div>
      </div>
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
        <div className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border border-purple-100 dark:border-purple-900">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Page Info */}
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Showing page</span>{" "}
              <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{page}</span>{" "}
              <span className="text-gray-600 dark:text-gray-400">of</span>{" "}
              <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{total_pages}</span>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {total_count} total {total_count === 1 ? "event" : "events"}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 text-purple-600 dark:text-purple-400 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none border border-purple-200 dark:border-purple-800"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === total_pages}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:from-gray-800 dark:disabled:to-gray-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                aria-label="Next page"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
