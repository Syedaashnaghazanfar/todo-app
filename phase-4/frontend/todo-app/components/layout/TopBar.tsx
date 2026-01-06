/**
 * TopBar Component
 *
 * Page header with title, user menu, and theme toggle.
 * Adapts to mobile viewports.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Search,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
  className?: string;
}

export function TopBar({ title, className }: TopBarProps) {
  const { mode, toggleDarkMode } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'flex items-center justify-between',
        'h-16 px-4 lg:px-6',
        'bg-[var(--bg-card)]/80 backdrop-blur-sm',
        'border-b border-[var(--border)]',
        'transition-colors duration-300',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Search Toggle (Mobile) */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Toggle search"
        >
          <Search className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>

        {/* Page Title */}
        {title && (
          <h1
            className="text-lg font-semibold hidden sm:block"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Center Section - Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute lg:relative top-16 left-0 right-0 px-4 lg:top-0 lg:px-0 lg:w-96"
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-notifications)]" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait">
            {mode === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-dashboard)' }}
            >
              <User className="w-4 h-4 text-white" />
            </div>
            <ChevronDown
              className="w-4 h-4 hidden sm:block"
              style={{
                color: 'var(--text-secondary)',
                transform: isUserMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--border)] shadow-xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <div className="p-3 border-b border-[var(--border)]">
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    Demo User
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    demo@example.com
                  </p>
                </div>
                <ul className="p-1">
                  <li>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Settings className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      Settings
                    </button>
                  </li>
                  <li className="border-t border-[var(--border)] mt-1 pt-1">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[var(--destructive)]/10 transition-colors"
                      style={{ color: 'var(--destructive)' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
