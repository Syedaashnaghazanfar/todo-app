"use client";

/**
 * Neon Button Component
 *
 * Button with neon glow effects and gradient backgrounds
 * Based on research.md cyberpunk neon elegance theme
 */

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { scaleHover } from "@/lib/animations";

export interface NeonButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Enable neon glow on hover */
  glow?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Icon to display (left side) */
  icon?: React.ReactNode;
  /** Icon to display (right side) */
  iconRight?: React.ReactNode;
  children: React.ReactNode;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      glow = true,
      loading = false,
      icon,
      iconRight,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2",
      "font-medium rounded-xl",
      "transition-all duration-300",
      "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
    );

    const variantStyles = {
      primary: cn(
        "bg-gradient-to-r from-primary-500 to-blue-500",
        "text-white",
        "shadow-[0_4px_16px_rgba(139,92,246,0.3)]",
        glow &&
          "hover:shadow-[0_0_30px_rgba(139,92,246,0.5),0_0_60px_rgba(139,92,246,0.3)]"
      ),
      secondary: cn(
        "bg-white/5 border border-white/10",
        "text-white",
        "hover:bg-white/10 hover:border-white/20"
      ),
      ghost: cn(
        "border border-primary-500/50",
        "text-primary-400",
        "hover:bg-primary-500/10",
        glow && "hover:border-primary-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
      ),
      destructive: cn(
        "bg-red-500/10 border border-red-500/30",
        "text-red-400",
        "hover:bg-red-500/20 hover:border-red-500/50",
        glow && "hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
      )
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...(glow && !disabled && !loading ? scaleHover : {})}
        {...props}
      >
        {loading ? (
          <>
            <motion.svg
              className="w-4 h-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span className="inline-flex">{icon}</span>}
            {children}
            {iconRight && <span className="inline-flex">{iconRight}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

NeonButton.displayName = "NeonButton";
