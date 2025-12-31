"use client";

/**
 * Neon Input Component
 *
 * Enhanced input field with neon glow effects and glassmorphism.
 * Based on research.md cyberpunk neon elegance theme.
 */

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface NeonInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Icon to display (left side) */
  icon?: LucideIcon;
  /** Icon to display (right side) */
  iconRight?: React.ReactNode;
  /** Input size */
  inputSize?: "sm" | "md" | "lg";
  /** Enable focus glow effect */
  glow?: boolean;
}

export const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(
  (
    {
      label,
      error,
      success,
      icon: Icon,
      iconRight,
      inputSize = "md",
      glow = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const sizeStyles = {
      sm: "h-9 text-sm",
      md: "h-11 text-base",
      lg: "h-13 text-lg",
    };

    const paddingStyles = {
      sm: Icon ? "pl-10 pr-4" : "px-4",
      md: Icon ? "pl-12 pr-4" : "px-4",
      lg: Icon ? "pl-14 pr-4" : "px-5",
    };

    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const iconPositions = {
      sm: "left-3",
      md: "left-4",
      lg: "left-4",
    };

    const baseStyles = cn(
      "w-full rounded-xl border transition-all duration-300",
      "bg-white/5 backdrop-blur-sm",
      "text-text-primary placeholder:text-text-muted",
      "focus:outline-none",
      sizeStyles[inputSize],
      paddingStyles[inputSize],
      error
        ? "border-neon-red/50 focus:border-neon-red focus:ring-2 focus:ring-neon-red/20"
        : success
        ? "border-neon-green/50 focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
        : "border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
      glow &&
        !error &&
        !success &&
        "focus:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
      error && glow && "focus:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      success && glow && "focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
            {props.required && (
              <span className="text-neon-red ml-1">*</span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 pointer-events-none",
                iconPositions[inputSize]
              )}
            >
              <Icon
                className={cn(
                  iconSizes[inputSize],
                  error
                    ? "text-neon-red"
                    : success
                    ? "text-neon-green"
                    : "text-primary-400"
                )}
              />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={baseStyles}
            {...props}
          />

          {/* Right Icon/Element */}
          {iconRight && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {iconRight}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-neon-red flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-neon-red animate-pulse" />
            {error}
          </motion.p>
        )}

        {/* Success Message */}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-neon-green flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-neon-green animate-pulse" />
            {success}
          </motion.p>
        )}
      </div>
    );
  }
);

NeonInput.displayName = "NeonInput";
