/**
 * StatsPreviewArea Component
 *
 * Creates placeholder containers for charts ready for Chart Visualizer Sub-Agent integration.
 * Displays responsive grid of stat containers with skeleton loaders and purple theme styling.
 *
 * Usage:
 * <StatsPreviewArea />
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 6: T045-T055
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../shared/Card';
import { LoadingState } from '../shared/LoadingState';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { cn } from '@/lib/utils';

// Define the shape of a stat placeholder
export interface StatPlaceholder {
  id: string;
  label: string;
  description: string;
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
}

export interface StatsPreviewAreaProps {
  stats?: StatPlaceholder[];
  isLoading?: boolean;
  className?: string;
}

/**
 * StatsPreviewArea Component
 *
 * Creates placeholder containers for charts ready for Chart Visualizer Sub-Agent integration.
 */
export const StatsPreviewArea: React.FC<StatsPreviewAreaProps> = ({
  stats = [
    {
      id: 'stats-1',
      label: 'System Performance',
      description: 'Real-time performance metrics',
      chartType: 'line'
    },
    {
      id: 'stats-2',
      label: 'User Activity',
      description: 'Active users and engagement',
      chartType: 'area'
    },
    {
      id: 'stats-3',
      label: 'Resource Usage',
      description: 'CPU, memory, and storage utilization',
      chartType: 'bar'
    }
  ],
  isLoading = false,
  className
}) => {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    }
  };

  return (
    <ErrorBoundary className={cn('w-full py-12 px-4 sm:px-6 lg:px-8', className)}>
      <section
        className={cn('w-full', className)}
        aria-labelledby="stats-preview-title"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="stats-preview-title"
            className="mb-8 text-center text-3xl font-bold text-purple-800 dark:text-purple-200 sm:text-4xl"
          >
            System Analytics
          </h2>

          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              role="list"
              aria-label="Statistics preview containers"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  variants={itemVariants}
                  layout
                  role="listitem"
                >
                  <Card className="h-full flex flex-col p-6 transition-all duration-300 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-1">
                        {stat.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {stat.description}
                      </p>
                    </div>

                    {/* Chart Placeholder - Awaiting Chart Visualizer Sub-Agent Integration */}
                    <div className="flex-1 flex items-center justify-center">
                      {isLoading ? (
                        <div className="w-full h-48 flex items-center justify-center">
                          <LoadingState className="w-full h-full" rounded="lg" />
                        </div>
                      ) : (
                        <div className="w-full h-48 flex flex-col items-center justify-center bg-purple-50/50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                          {/*
                            CHART VISUALIZER SUB-AGENT INTEGRATION INSTRUCTIONS:

                            The Chart Visualizer Sub-Agent should replace this placeholder div with actual chart components.
                            Expected prop interface when integrating:

                            <ChartComponent
                              data={stat.data} // Array of data points from metrics API
                              type={stat.chartType} // Chart type: 'line', 'bar', 'pie', 'area', etc.
                              dimensions={{ width: '100%', height: '100%' }} // Responsive dimensions
                              theme="purple" // Use purple theme to match overall design
                              loading={false} // Loading state from hook
                              error={null} // Error state from hook
                            />

                            The chart component should maintain the same dimensions and responsive behavior
                            while implementing the Recharts library with the purple theme.
                          */}
                          <div className="text-center">
                            <div className="text-purple-600 dark:text-purple-400 mb-2">
                              <svg
                                className="w-12 h-12 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Chart placeholder
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {stat.chartType ? `Type: ${stat.chartType}` : 'Awaiting Chart Visualizer'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer with integration hint */}
                    <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800 text-xs text-gray-500 dark:text-gray-400">
                      <p>Ready for Chart Visualizer Sub-Agent integration</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </ErrorBoundary>
  );
};

StatsPreviewArea.displayName = 'StatsPreviewArea';