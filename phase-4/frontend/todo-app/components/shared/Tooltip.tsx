/**
 * Tooltip Component
 *
 * Displays additional information in a floating tooltip when hovering over an element.
 * Supports positioning, accessibility, and responsive behavior.
 *
 * Usage:
 * <Tooltip content="Additional information">
 *   <button>Hover me</button>
 * </Tooltip>
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 5: T040
 */

'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

/**
 * Tooltip Component
 *
 * Displays additional information in a floating tooltip when hovering over an element.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Handle mount state for proper animation
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Calculate position based on specified position
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  // Get the trigger element for positioning
  const triggerElement = triggerRef.current;

  return (
    <div
      className="relative inline-block"
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {/* Trigger element */}
      <div>{children}</div>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-purple-800 rounded-lg shadow-lg whitespace-nowrap',
              'max-w-xs break-words',
              'pointer-events-none',
              getPositionStyles(),
              className
            )}
            role="tooltip"
          >
            {content}
            {/* Tooltip arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-purple-800 rotate-45',
                position === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1',
                position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
                position === 'left' && 'right-full top-1/2 -translate-y-1/2 -mr-1',
                position === 'right' && 'left-full top-1/2 -translate-y-1/2 -ml-1',
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Tooltip.displayName = 'Tooltip';