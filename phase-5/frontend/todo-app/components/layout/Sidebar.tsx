/**
 * Sidebar Component
 *
 * Collapsible navigation sidebar with active state styling,
 * keyboard navigation support, and responsive behavior.
 * Uses per-page accent colors for active states.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Clock,
  Bell,
  Settings,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, accent: 'dashboard' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, accent: 'tasks' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, accent: 'analytics' },
  { label: 'History', href: '/history', icon: Clock, accent: 'history' },
  { label: 'Notifications', href: '/notifications', icon: Bell, accent: 'notifications' },
  { label: 'Settings', href: '/settings', icon: Settings, accent: 'settings' },
  { label: 'Chat', href: '/chat', icon: MessageCircle, accent: 'chat' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getAccentColor = (accent: string) => {
    return `var(--accent-${accent})`;
  };

  const getAccentColorMuted = (accent: string) => {
    return `var(--accent-${accent}-muted)`;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
          x: isMobileOpen ? 0 : 0,
        }}
        className={cn(
          'fixed lg:relative top-0 left-0 h-screen z-50 lg:z-0',
          'flex flex-col bg-[var(--bg-card)] border-r border-[var(--border)]',
          'transition-all duration-300 ease-out',
          isMobileOpen ? 'w-72' : '',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-dashboard)' }}
                >
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <span
                  className="font-semibold text-lg"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Todo App
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className={cn(
              'p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors',
              'hidden lg:flex'
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'transition-all duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                      isCollapsed && 'justify-center',
                      active
                        ? ''
                        : 'hover:bg-[var(--bg-elevated)]'
                    )}
                    style={{
                      backgroundColor: active
                        ? getAccentColorMuted(item.accent)
                        : 'transparent',
                    }}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon
                      className="w-5 h-5 flex-shrink-0"
                      style={{
                        color: active
                          ? getAccentColor(item.accent)
                          : 'var(--text-secondary)',
                      }}
                    />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium truncate"
                          style={{
                            color: active
                              ? getAccentColor(item.accent)
                              : 'var(--text-primary)',
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getAccentColor(item.accent) }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                Press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] font-mono text-[10px]">
                  Tab
                </kbd>{' '}
                to navigate
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
