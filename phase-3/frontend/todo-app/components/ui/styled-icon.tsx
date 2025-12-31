"use client";

/**
 * Styled Icon Component
 *
 * Wrapper for Lucide icons with neon glow effects
 * Based on research.md cyberpunk neon elegance theme
 */

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";

export interface StyledIconProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /** Lucide icon component */
  icon: React.ComponentType<LucideProps>;
  /** Icon size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Glow color variant */
  glowColor?: "purple" | "blue" | "cyan" | "green" | "red" | "yellow";
  /** Enable hover glow effect */
  hoverGlow?: boolean;
  /** Custom icon props */
  iconProps?: LucideProps;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

const glowColorMap = {
  purple: "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
  blue: "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]",
  cyan: "drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]",
  green: "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  red: "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  yellow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
};

const hoverGlowMap = {
  purple: "hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]",
  blue: "hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]",
  cyan: "hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]",
  green: "hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]",
  red: "hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]",
  yellow: "hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]"
};

export const StyledIcon: React.FC<StyledIconProps> = ({
  icon: Icon,
  size = "md",
  glowColor = "purple",
  hoverGlow = false,
  iconProps,
  className,
  ...props
}) => {
  return (
    <motion.div
      className={cn(
        "inline-flex items-center justify-center",
        glowColorMap[glowColor],
        hoverGlow && hoverGlowMap[glowColor],
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      <Icon size={sizeMap[size]} {...iconProps} />
    </motion.div>
  );
};

StyledIcon.displayName = "StyledIcon";
