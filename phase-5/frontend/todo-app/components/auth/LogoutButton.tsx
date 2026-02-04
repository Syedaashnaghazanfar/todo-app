/**
 * Logout Button Component
 *
 * Provides logout functionality with purple theme styling.
 * Displays SweetAlert2 success message before logging out.
 *
 * Features:
 * - Calls useAuth().logout() to end session
 * - Shows logoutSuccess() SweetAlert2 alert
 * - Purple theme button matching application design
 * - LogOut icon from lucide-react
 *
 * Usage:
 * <LogoutButton />
 *
 * @see /specs/006-auth-integration/spec.md - FR-014, FR-015
 */

'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { logoutSuccess } from '@/utils/authAlerts';
import { cn } from '@/lib/utils';

/**
 * LogoutButton Component Props
 */
interface LogoutButtonProps {
  /**
   * Optional additional CSS classes
   */
  className?: string;
  /**
   * Display mode: icon-only or with text
   * @default 'with-text'
   */
  variant?: 'icon-only' | 'with-text';
}

/**
 * LogoutButton Component
 *
 * Renders a purple-themed logout button with icon.
 * Shows SweetAlert2 confirmation before logging out.
 *
 * @param props.className - Optional additional CSS classes
 * @param props.variant - Display mode (icon-only or with-text)
 *
 * @example
 * // With text (default)
 * <LogoutButton />
 *
 * @example
 * // Icon only
 * <LogoutButton variant="icon-only" />
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className,
  variant = 'with-text',
}) => {
  const { logout } = useAuth();

  /**
   * Handle logout button click
   *
   * 1. Show SweetAlert2 success message
   * 2. Call logout() to destroy session
   * 3. AuthContext handles redirect to /login
   */
  const handleLogout = async () => {
    // Show success message first
    await logoutSuccess();

    // Logout (AuthContext handles redirect)
    await logout();
  };

  if (variant === 'icon-only') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className={cn(
          'flex items-center justify-center rounded-lg p-2',
          'text-purple-100 transition-colors',
          'hover:bg-white/10 hover:text-white',
          className
        )}
        aria-label="Logout"
      >
        <LogOut className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogout}
      className={cn(
        'flex items-center space-x-2 rounded-lg px-4 py-2',
        'text-purple-100 transition-colors',
        'hover:bg-white/10 hover:text-white',
        className
      )}
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" />
      <span className="font-medium">Logout</span>
    </motion.button>
  );
};

LogoutButton.displayName = 'LogoutButton';
