'use client';

/**
 * Button Component
 *
 * Reusable button with purple theme variants and support for links.
 * Includes primary and secondary variants with hover states.
 *
 * Usage:
 * <Button variant="primary" onClick={handleClick}>Click Me</Button>
 * <Button variant="secondary" href="/about">Learn More</Button>
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  href,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className,
  onClick,
  type = 'button',
}) => {
  const baseStyles = cn(
    // Base button styles
    'inline-flex items-center justify-center',
    'rounded-lg px-6 py-3',
    'font-medium text-base',
    'transition-all duration-300',
    'focus:outline-none focus:ring-2',
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',
    // Full width option
    fullWidth && 'w-full',
    // Variant styles
    variant === 'primary' && [
      'bg-[var(--primary-500)] text-[var(--primary-foreground)]',
      'hover:bg-[var(--primary-400)]',
      'focus:ring-[var(--primary-500)]',
      'shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]',
      'border border-[var(--primary-500)]',
    ],
    variant === 'secondary' && [
      'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
      'hover:bg-[var(--secondary-foreground)] hover:text-[var(--secondary)]',
      'focus:ring-[var(--secondary)]',
      'border border-[var(--secondary)]',
    ],
    variant === 'outline' && [
      'border-2 border-[var(--primary-500)] text-[var(--primary-500)]',
      'hover:bg-[var(--primary-500)] hover:text-[var(--primary-foreground)]',
      'focus:ring-[var(--primary-500)]',
    ],
    className
  );

  const MotionComponent = motion.button;

  // If href is provided, render as Link
  if (href && !disabled) {
    return (
      <Link href={href} className={baseStyles}>
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center w-full"
        >
          {children}
        </motion.span>
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <MotionComponent
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseStyles}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </MotionComponent>
  );
};

Button.displayName = 'Button';
