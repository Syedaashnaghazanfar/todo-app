/**
 * Custom Notification Modal Component
 *
 * Beautiful modal for displaying notification alerts with purple theme.
 * Used for real-time notifications when VERY_IMPORTANT tasks are created/updated.
 *
 * @module components/notifications/NotificationModal
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  priority: 'VERY_IMPORTANT' | 'HIGH' | 'MEDIUM' | 'LOW';
  onViewAll?: () => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  priority,
  onViewAll,
}: NotificationModalProps) {
  const isVeryImportant = priority === 'VERY_IMPORTANT';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div
              className={`relative rounded-2xl shadow-2xl overflow-hidden ${
                isVeryImportant
                  ? 'ring-2 ring-purple-500/50'
                  : 'border border-[var(--border)]'
              }`}
              style={{
                background: 'linear-gradient(135deg, #1f1f2e 0%, #2a2a3e 100%)',
              }}
            >
              {/* Animated gradient overlay for VERY_IMPORTANT */}
              {isVeryImportant && (
                <motion.div
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-blue-600/20 pointer-events-none"
                />
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
                aria-label="Close notification"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>

              {/* Content */}
              <div className="relative p-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    delay: 0.1,
                    damping: 15,
                    stiffness: 200,
                  }}
                  className="flex items-center justify-center mb-4"
                >
                  <div
                    className={`p-4 rounded-full ${
                      isVeryImportant
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                        : 'bg-purple-600'
                    } shadow-lg`}
                  >
                    {isVeryImportant ? (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      >
                        <AlertCircle className="w-8 h-8 text-white" />
                      </motion.div>
                    ) : (
                      <Bell className="w-8 h-8 text-white" />
                    )}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-center mb-2"
                  style={{
                    background:
                      'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #f472b6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-300 text-center mb-6 leading-relaxed"
                >
                  {message}
                </motion.p>

                {/* Priority Badge */}
                {isVeryImportant && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2 mb-6"
                  >
                    <Clock className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-semibold text-pink-400">
                      Urgent - Requires immediate attention
                    </span>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-300 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    Dismiss
                  </button>
                  {onViewAll && (
                    <button
                      onClick={() => {
                        onViewAll();
                        onClose();
                      }}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      style={{
                        background:
                          'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      }}
                    >
                      View All
                    </button>
                  )}
                </motion.div>
              </div>

              {/* Bottom decorative line */}
              {isVeryImportant && (
                <motion.div
                  animate={{
                    scaleX: [0, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2,
                  }}
                  className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600"
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
