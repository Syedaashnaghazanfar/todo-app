"use client";

/**
 * HomePage Container Component - Cyberpunk Neon Elegance Theme
 *
 * Main page container with glassmorphism effects and animated backgrounds.
 * Implements the cyberpunk neon elegance design system from research.md
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "./Navigation";
import { Sidebar } from "./Sidebar";
import { HeroSection } from "./HeroSection";
import { Footer } from "./Footer";
import { QuickActionCards } from "./QuickActionCards";
import { quickActionCards } from "@/data/quickActionCards";
import type { HomePageProps } from "@/types/components";
import { pageTransition, pageTransitionConfig } from "@/lib/animations";

/**
 * Animated Background Component
 */
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {/* Base gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-bg-darkest via-bg-dark to-bg-darkest" />

    {/* Animated gradient orbs */}
    <motion.div
      className="absolute top-0 left-1/4 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20"
      animate={{
        x: [0, 50, 0],
        y: [0, -30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/30 via-primary-500/10 to-transparent blur-3xl" />
    </motion.div>

    <motion.div
      className="absolute bottom-0 right-1/4 w-[600px] h-[600px] translate-x-1/2 translate-y-1/2 opacity-20"
      animate={{
        x: [0, -40, 0],
        y: [0, 40, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-neon-blue/30 via-neon-blue/10 to-transparent blur-3xl" />
    </motion.div>

    <motion.div
      className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 opacity-15"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-neon-cyan/20 via-neon-cyan/5 to-transparent blur-3xl" />
    </motion.div>

    {/* Subtle grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    />
  </div>
);

/**
 * HomePage Container Component
 */
export const HomePage: React.FC<HomePageProps> = ({ initialLoading = false }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { isAuthenticated } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <motion.div
      className="flex min-h-screen flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={pageTransitionConfig}
    >
      {/* Animated cyberpunk background */}
      <AnimatedBackground />

      {/* Navigation with glassmorphism */}
      <Navigation />

      {/* Main layout container */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        {isDesktop ? (
          <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        ) : (
          sidebarOpen &&
          !isDesktop && (
            <>
              {/* Backdrop overlay with blur */}
              <motion.div
                className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              {/* Mobile sidebar with slide animation */}
              <motion.div
                className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <Sidebar
                  isOpen={true}
                  onToggle={() => setSidebarOpen(false)}
                  className="relative w-full border-r-0 block"
                />
              </motion.div>
            </>
          )
        )}

        {/* Main content area */}
        <main className="flex flex-1 flex-col" role="main">
          {/* Hero Section */}
          <HeroSection
            headline="Welcome to Your Dashboard"
            description="Streamline your workflow with our powerful, intuitive platform. Manage tasks, track progress, and collaborate seamlessly—all in one place."
            ctaText={isAuthenticated ? "Go to Tasks" : "Get Started"}
            ctaLink={isAuthenticated ? "/tasks" : "/signup"}
            backgroundImage="/task2.jpg"
          />

          {/* Quick Action Cards */}
          <QuickActionCards cards={quickActionCards} />

          {/* Footer */}
          <Footer />

          {/* Loading state overlay with glassmorphism */}
          {initialLoading && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl"
              style={{
                background: "rgba(10, 10, 26, 0.8)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center space-y-6">
                {/* Animated spinner with neon glow */}
                <motion.div
                  className="relative h-16 w-16"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="absolute inset-0 rounded-full border-4 border-primary-200/20 border-t-primary-500 shadow-glow-purple" />
                </motion.div>

                {/* Loading text with gradient */}
                <motion.p
                  className="text-lg font-medium bg-gradient-to-r from-primary-400 via-neon-blue to-neon-cyan bg-clip-text text-transparent"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Loading your dashboard...
                </motion.p>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

HomePage.displayName = "HomePage";
