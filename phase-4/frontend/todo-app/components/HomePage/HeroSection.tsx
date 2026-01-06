"use client";

/**
 * HeroSection Component - Cyberpunk Neon Elegance Theme
 *
 * Enhanced hero banner with glassmorphism and neon effects.
 * Preserves all existing functionality while upgrading visuals.
 */

import React from "react";
import { motion } from "framer-motion";
import { useResponsive } from "@/hooks/useResponsive";
import { ArrowRight, Sparkles } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import type { HeroSectionProps } from "@/types/components";
import { staggerContainer, fadeInUp } from "@/lib/animations";

/**
 * Default props for HeroSection
 */
const defaultProps: Required<Omit<HeroSectionProps, "backgroundImage" | "theme">> = {
  headline: "Welcome to Your Dashboard",
  description:
    "Streamline your workflow with our powerful, intuitive platform. Manage tasks, track progress, and collaborate seamlessly—all in one place.",
  ctaText: "Get Started",
  ctaLink: "/features",
};

/**
 * HeroSection Component
 */
export const HeroSection: React.FC<Partial<HeroSectionProps>> = (props) => {
  const { headline, description, ctaText, ctaLink, backgroundImage } = {
    ...defaultProps,
    ...props,
  };

  const { isMobile } = useResponsive();

  /**
   * Background style (gradient or image)
   */
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(10, 10, 26, 0.7), rgba(10, 10, 26, 0.8)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <motion.section
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden px-4 py-12 md:px-8 md:py-16 lg:px-12 lg:py-20"
      style={backgroundStyle}
      role="banner"
    >
      {/* Glassmorphism overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 backdrop-blur-sm opacity-90" />
      )}

      {/* Animated background elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-blue rounded-full mix-blend-screen opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Content container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 md:space-y-10">
        {/* Decorative icon */}
        <motion.div
          variants={fadeInUp}
          className="flex justify-center mb-4"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-12 h-12 text-primary-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
          </motion.div>
        </motion.div>

        {/* Headline with gradient effect - VISIBLE FALLBACK */}
        <motion.h1
          variants={fadeInUp}
          className="font-bold leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white"
          style={{
            background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          <span>
            {headline}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeInUp}
          className="text-text-secondary text-lg leading-relaxed max-w-3xl mx-auto font-medium sm:text-xl md:text-2xl"
        >
          {description}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeInUp}
          className="flex justify-center pt-6"
        >
          <NeonButton
            variant="primary"
            size="lg"
            glow
            iconRight={<ArrowRight className="w-6 h-6" />}
            onClick={() => {
              if (ctaLink) {
                window.location.href = ctaLink;
              }
            }}
            className="text-xl px-10 py-4"
          >
            {ctaText}
          </NeonButton>
        </motion.div>

        {/* Decorative bottom glow */}
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary-500/10 blur-3xl rounded-full"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.section>
  );
};

HeroSection.displayName = "HeroSection";
