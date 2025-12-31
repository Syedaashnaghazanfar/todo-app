/**
 * GlassCard Component
 *
 * Reusable card container with cyberpunk glassmorphism styling and optional click handler.
 * Supports glass effect, animations, and multiple variants.
 *
 * Usage:
 * <Card variant="glass" animated={true}>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 *   <CardFooter>Footer</CardFooter>
 * </Card>
 */

'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  variant?: 'default' | 'glass' | 'elevated';
  animated?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    children,
    className,
    onClick,
    hover = true,
    variant = 'glass',
    animated = false,
    glowIntensity = 'medium'
  }, ref) => {
    const isClickable = !!onClick;

    // Determine styling based on variant
    const getVariantClasses = () => {
      switch (variant) {
        case 'glass':
          return [
            'bg-[var(--glass-bg)]',
            'backdrop-blur-xl',
            'border border-[var(--glass-border)]',
            'shadow-sm',
            'dark:bg-[var(--glass-bg)]',
            'dark:border-[var(--glass-border)]',
          ];
        case 'elevated':
          return [
            'bg-[var(--bg-elevated)]',
            'backdrop-blur-xl',
            'border border-[var(--glass-border)]',
            'shadow-md',
            'dark:bg-[var(--bg-elevated)]',
            'dark:border-[var(--glass-border)]',
          ];
        case 'default':
        default:
          return [
            'bg-card',
            'border border-border',
            'shadow-sm',
          ];
      }
    };

    // Determine glow effect based on intensity
    const getGlowClasses = () => {
      if (variant === 'glass' || variant === 'elevated') {
        switch (glowIntensity) {
          case 'high':
            return 'shadow-[var(--glow-purple)]';
          case 'medium':
            return 'shadow-[0_0_20px_rgba(139,92,246,0.15)]';
          case 'low':
            return 'shadow-[0_0_10px_rgba(139,92,246,0.1)]';
          default:
            return '';
        }
      }
      return '';
    };

    const baseClassName = cn(
      // Base styles
      'rounded-xl p-6',
      // Apply variant-specific styles
      ...getVariantClasses(),
      // Apply glow effect if applicable
      getGlowClasses(),
      // Hover effects (only if clickable or hover prop is true)
      (isClickable || hover) && [
        'transition-all duration-300',
      ],
      // Clickable styles
      isClickable && [
        'cursor-pointer',
        'hover:-translate-y-1',
        'active:translate-y-0',
      ],
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          onClick={onClick}
          className={baseClassName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={isClickable ? { scale: 1.02 } : {
            boxShadow: glowIntensity === 'high' ? 'var(--border-glow)' :
                      glowIntensity === 'medium' ? '0 0 15px rgba(139, 92, 246, 0.3)' :
                      '0 0 10px rgba(139, 92, 246, 0.2)',
            transition: { duration: 0.2 }
          }}
          whileTap={isClickable ? { scale: 0.98 } : undefined}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={baseClassName}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-0 pt-6', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
