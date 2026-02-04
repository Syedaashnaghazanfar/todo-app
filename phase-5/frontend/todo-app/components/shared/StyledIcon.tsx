/**
 * StyledIcon Component
 *
 * Wrapper for Lucide React icons with cyberpunk neon styling.
 * Adds glow effects, color theming, and animation capabilities.
 *
 * Usage:
 * <StyledIcon icon={Home} size={24} color="primary" glowIntensity="medium" />
 * <StyledIcon icon={Settings} size={16} variant="accent" animated={true} />
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Define available icon types - we'll accept any Lucide icon
type LucideIcon = React.FC<React.SVGProps<SVGSVGElement>>;

export interface StyledIconProps {
  icon: LucideIcon;
  size?: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'muted';
  variant?: 'default' | 'glow' | 'outline' | 'filled';
  glowIntensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const StyledIcon: React.FC<StyledIconProps> = ({
  icon: Icon,
  size = 24,
  color = 'primary',
  variant = 'default',
  glowIntensity = 'medium',
  animated = false,
  pulse = false,
  className,
  onClick,
  disabled = false,
}) => {
  // Determine color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-[var(--primary-500)]';
      case 'secondary':
        return 'text-[var(--secondary-500)]';
      case 'accent':
        return 'text-[var(--accent)]';
      case 'success':
        return 'text-[var(--neon-green)]';
      case 'warning':
        return 'text-[var(--neon-yellow)]';
      case 'error':
        return 'text-[var(--neon-red)]';
      case 'info':
        return 'text-[var(--neon-blue)]';
      case 'muted':
        return 'text-[var(--text-secondary)]';
      default:
        return 'text-[var(--primary-500)]';
    }
  };

  // Determine styling based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'glow':
        return [
          'p-2',
          'rounded-full',
          'bg-[var(--glass-bg)]',
          'backdrop-blur-sm',
          'border border-[var(--glass-border)]',
        ];
      case 'outline':
        return [
          'p-2',
          'rounded-full',
          'border-2',
          'border-current',
          'bg-transparent',
        ];
      case 'filled':
        return [
          'p-2',
          'rounded-full',
          'bg-current',
          'text-[var(--primary-foreground)]',
        ];
      case 'default':
      default:
        return [];
    }
  };

  // Determine glow classes based on intensity
  const getGlowClasses = () => {
    if (variant === 'glow' || variant === 'outline') {
      switch (glowIntensity) {
        case 'high':
          return 'shadow-[var(--glow-purple)]';
        case 'medium':
          return 'shadow-[0_0_15px_rgba(139,92,246,0.3)]';
        case 'low':
          return 'shadow-[0_0_8px_rgba(139,92,246,0.2)]';
        default:
          return '';
      }
    }
    return '';
  };

  const baseClassName = cn(
    'inline-flex items-center justify-center',
    'transition-all duration-300',
    // Apply color classes
    getColorClasses(),
    // Apply variant-specific classes
    ...getVariantClasses(),
    // Apply glow effect if applicable
    getGlowClasses(),
    // Clickable styles
    onClick && !disabled && [
      'cursor-pointer',
      'hover:scale-110',
      'active:scale-95',
    ],
    // Disabled state
    disabled && [
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none',
    ],
    className
  );

  if (animated) {
    return (
      <motion.div
        className={baseClassName}
        onClick={disabled ? undefined : onClick}
        animate={{
          rotate: pulse ? [0, 5, -5, 0] : 0,
          scale: pulse ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: pulse ? 2 : 0.5,
          repeat: pulse ? Infinity : 0,
          repeatType: 'reverse' as const,
          ease: 'easeInOut' as const,
        }}
      >
        <Icon
          width={size}
          height={size}
          className={cn(
            'flex-shrink-0'
          )}
        />
      </motion.div>
    );
  }

  return (
    <div
      className={baseClassName}
      onClick={disabled ? undefined : onClick}
    >
      <Icon
        width={size}
        height={size}
        className={cn(
          'flex-shrink-0'
        )}
      />
    </div>
  );
};

StyledIcon.displayName = 'StyledIcon';