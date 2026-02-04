/**
 * Sidebar Component
 *
 * Vertical navigation sidebar with collapsible behavior.
 * Visible on large screens only, with fixed positioning.
 *
 * Usage:
 * <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ListTodo,
  History,
  Tag,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarLinks: SidebarLink[] = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'All Tasks', href: '/tasks', icon: ListTodo },
  { label: 'History', href: '/history', icon: History },
  { label: 'Analytics', href: '/analytics', icon: Tag },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle },
];

export interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onToggle,
  className,
}) => {
  return (
    <>
      {/* Sidebar - Hidden on mobile/tablet, visible on large screens */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 256 : 80,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]',
          'hidden lg:block',
          'bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] shadow-[var(--shadow-glow)]',
          className
        )}
      >
        {/* Toggle button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          className={cn(
            'absolute -right-3 top-4 z-50',
            'flex h-6 w-6 items-center justify-center',
            'rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[0_0_10px_rgba(139,92,246,0.2)]',
            'text-[var(--primary-400)]',
            'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
          )}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </motion.button>

        {/* Sidebar content */}
        <nav className="flex h-full flex-col px-3 py-6">
          <div className="flex-1 space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2.5',
                      'text-[var(--text-secondary)] transition-colors',
                      'hover:bg-[var(--glass-bg)] hover:text-[var(--primary-400)] border border-transparent hover:border-[var(--glass-border)] shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]',
                      !isOpen && 'justify-center'
                    )}
                    title={!isOpen ? link.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-[var(--primary-400)]" />
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-3 font-medium text-[var(--text-primary)]"
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-[var(--glass-border)] pt-4">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 text-xs text-[var(--text-muted)]"
                >
                  Todo App v1.0
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </motion.aside>

      {/* Spacer for content - adjusts based on sidebar state */}
      <div
        className={cn(
          'hidden lg:block',
          isOpen ? 'w-64' : 'w-20'
        )}
      />
    </>
  );
};

Sidebar.displayName = 'Sidebar';
