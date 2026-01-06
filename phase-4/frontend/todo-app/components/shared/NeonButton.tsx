/**
 * NeonButton Component
 *
 * Reusable button with cyberpunk neon glow effects and multiple variants.
 * Supports different sizes, glow intensities, and interactive states.
 *
 * Usage:
 * <NeonButton variant="primary" size="md" glowIntensity="medium">
 *   Click Me
 * </NeonButton>
 */

'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface NeonButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  glowIntensity?: 'low' | 'medium' | 'high';
  disabled?: boolean;
  animated?: boolean;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    {
      children,
      className,
      onClick,
      variant = 'primary',
      size = 'md',
      glowIntensity = 'medium',
      disabled = false,
      animated = true,
      type = 'button',
      asChild = false,
    },
    ref
  ) => {
    const isDisabled = disabled || !!asChild;

    // Determine sizing classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm';
        case 'lg':
          return 'px-6 py-3 text-lg';
        case 'md':
        default:
          return 'px-4 py-2 text-base';
      }
    };

    // Determine variant classes
    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return [
            'bg-[var(--primary-500)]',
            'text-[var(--primary-foreground)]',
            'border border-[var(--primary-500)]',
            'hover:bg-[var(--primary-400)]',
            'hover:border-[var(--primary-400)]',
            'active:bg-[var(--primary-600)]',
            'active:border-[var(--primary-600)]',
          ];
        case 'secondary':
          return [
            'bg-[var(--secondary)]',
            'text-[var(--secondary-foreground)]',
            'border border-[var(--secondary)]',
            'hover:bg-[var(--secondary-foreground)]',
            'hover:text-[var(--secondary)]',
            'active:bg-[var(--secondary-foreground)]',
            'active:text-[var(--secondary)]',
          ];
        case 'ghost':
          return [
            'bg-transparent',
            'text-[var(--primary-500)]',
            'border border-transparent',
            'hover:bg-[var(--primary-500)]',
            'hover:text-[var(--primary-foreground)]',
            'hover:border-[var(--primary-500)]',
            'active:bg-[var(--primary-600)]',
            'active:text-[var(--primary-foreground)]',
          ];
        case 'outline':
          return [
            'bg-transparent',
            'text-[var(--primary-500)]',
            'border border-[var(--primary-500)]',
            'hover:bg-[var(--primary-500)]',
            'hover:text-[var(--primary-foreground)]',
            'active:bg-[var(--primary-600)]',
            'active:text-[var(--primary-foreground)]',
          ];
        case 'destructive':
          return [
            'bg-[var(--destructive)]',
            'text-[var(--destructive-foreground)]',
            'border border-[var(--destructive)]',
            'hover:bg-[var(--destructive)]',
            'hover:opacity-90',
            'active:bg-[var(--destructive)]',
            'active:opacity-95',
          ];
        default:
          return [
            'bg-[var(--primary-500)]',
            'text-[var(--primary-foreground)]',
            'border border-[var(--primary-500)]',
            'hover:bg-[var(--primary-400)]',
            'hover:border-[var(--primary-400)]',
            'active:bg-[var(--primary-600)]',
            'active:border-[var(--primary-600)]',
          ];
      }
    };

    // Determine glow classes based on intensity
    const getGlowClasses = () => {
      switch (glowIntensity) {
        case 'high':
          return 'shadow-[var(--glow-purple)]';
        case 'medium':
          return 'shadow-[0_0_20px_rgba(139,92,246,0.3)]';
        case 'low':
          return 'shadow-[0_0_10px_rgba(139,92,246,0.2)]';
        default:
          return '';
      }
    };

    // Animation props for Framer Motion
    const animationProps = animated
      ? {
          whileHover: { scale: 1.02, transition: { duration: 0.2 } },
          whileTap: { scale: 0.98, transition: { duration: 0.1 } },
        }
      : {};

    const Comp = animated ? motion.button : 'button';

    return (
      <Comp
        ref={ref}
        type={type}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'relative',
          'inline-flex items-center justify-center',
          'font-medium',
          'rounded-lg',
          'transition-all duration-300',
          'focus:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-[var(--ring)]',
          'focus-visible:ring-offset-2',
          'focus-visible:ring-offset-[var(--background)]',
          // Size classes
          getSizeClasses(),
          // Variant classes
          ...getVariantClasses(),
          // Glow effect
          getGlowClasses(),
          // Disabled state
          isDisabled && [
            'opacity-50',
            'cursor-not-allowed',
            'pointer-events-none',
          ],
          className
        )}
        {...animationProps}
      >
        {children}
      </Comp>
    );
  }
);

NeonButton.displayName = 'NeonButton';