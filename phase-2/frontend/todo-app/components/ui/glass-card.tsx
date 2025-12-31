"use client";

/**
 * Glass Card Component
 *
 * Glassmorphism card with backdrop filter and neon accents
 * Based on research.md cyberpunk neon elegance theme
 */

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Card variant - standard or elevated with gradient */
  variant?: "standard" | "elevated";
  /** Enable hover lift effect */
  hover?: boolean;
  /** Enable border glow effect */
  glow?: boolean;
  /** Custom glass opacity (0-1) */
  glassOpacity?: number;
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "standard",
      hover = false,
      glow = false,
      glassOpacity = 0.6,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "backdrop-blur-[20px] rounded-2xl border transition-all duration-300";

    const variantStyles = {
      standard: cn(
        "bg-[rgba(15,15,35,var(--glass-opacity))]",
        "border-white/[0.15]",
        "shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
      ),
      elevated: cn(
        "bg-gradient-to-br from-primary-500/15 via-blue-500/10 to-cyan-500/15",
        "border-white/[0.2]",
        "shadow-[0_8px_32px_rgba(139,92,246,0.25)]"
      )
    };

    const hoverStyles = hover
      ? "hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(139,92,246,0.4)] hover:border-white/30"
      : "";

    const glowStyles = glow
      ? "hover:border-primary-500/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
      : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          hoverStyles,
          glowStyles,
          className
        )}
        style={
          {
            "--glass-opacity": glassOpacity
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
