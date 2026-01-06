/**
 * Navigation Component
 *
 * Responsive header with logo/brand name, mobile hamburger menu, and desktop navigation links.
 * Sticky positioning with purple background gradient.
 * Shows logout button when user is authenticated.
 *
 * Usage:
 * <Navigation />
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, ListTodo, History, BarChart3, Settings, User, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useTheme } from '@/hooks/useTheme';

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationLinks: NavLink[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Tasks', href: '/tasks', icon: ListTodo },
  { label: 'History', href: '/history', icon: History },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { mode, toggleDarkMode } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--bg-card)] backdrop-blur-xl border-b border-[var(--glass-border)] shadow-[var(--shadow-glow)]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <ListTodo className="h-6 w-6 text-[var(--primary-400)]" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[var(--primary-300)] via-[var(--primary-400)] to-[var(--primary-300)] bg-clip-text text-transparent">
                Todo App
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex items-center space-x-2 rounded-lg px-4 py-2',
                      'text-[var(--text-secondary)] transition-colors',
                      'hover:bg-[var(--glass-bg)] hover:text-[var(--primary-400)] border border-transparent hover:border-[var(--glass-border)]'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="flex items-center justify-center rounded-lg p-2 text-[var(--text-primary)] hover:bg-[var(--glass-bg)] hover:text-[var(--primary-400)] border border-[var(--glass-border)]"
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            >
              {mode === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Logout Button - visible only when authenticated */}
            {isAuthenticated && <LogoutButton variant="with-text" />}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            className="flex items-center justify-center rounded-lg p-2 text-[var(--text-primary)] hover:bg-[var(--glass-bg)] hover:text-[var(--primary-400)] border border-[var(--glass-border)]"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--glass-border)] bg-[var(--bg-card)] backdrop-blur-xl md:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex items-center space-x-3 rounded-lg px-4 py-3',
                          'text-[var(--text-secondary)] transition-colors',
                          'hover:bg-[var(--glass-bg)] hover:text-[var(--primary-400)] border border-transparent hover:border-[var(--glass-border)]'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{link.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Theme Toggle - mobile view */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    toggleDarkMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-4 py-3',
                    'text-[var(--text-secondary)] transition-colors',
                    'hover:bg-[var(--glass-bg)] hover:text-[var(--primary-400)] border border-transparent hover:border-[var(--glass-border)]'
                  )}
                  aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {mode === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span className="font-medium">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span className="font-medium">Dark Mode</span>
                    </>
                  )}
                </motion.button>

                {/* Logout Button - mobile view (visible only when authenticated) */}
                {isAuthenticated && (
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    <LogoutButton
                      variant="with-text"
                      className="w-full flex items-center space-x-3 rounded-lg px-4 py-3"
                    />
                  </div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

Navigation.displayName = 'Navigation';
