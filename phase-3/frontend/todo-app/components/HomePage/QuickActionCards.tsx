"use client";

/**
 * QuickActionCards Component - Cyberpunk Neon Elegance Theme
 *
 * Enhanced with glassmorphism cards and neon glow effects.
 * Preserves all existing functionality while upgrading visuals.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/glass-card';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, listItem, cardLift } from '@/lib/animations';

// Define the shape of a quick action card
export interface QuickActionCard {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
}

export interface QuickActionCardsProps {
  cards: QuickActionCard[];
  className?: string;
}

/**
 * QuickActionCards Component
 */
export const QuickActionCards: React.FC<QuickActionCardsProps> = ({
  cards,
  className
}) => {
  return (
    <section
      className={cn('w-full py-16 px-4 sm:px-6 lg:px-12', className)}
      aria-labelledby="quick-actions-title"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2
            id="quick-actions-title"
            className="text-4xl font-bold sm:text-5xl mb-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Quick Actions
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Jump right into your workflow with these shortcuts
          </p>
        </motion.div>

        {/* Cards Grid */}
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            role="list"
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                variants={listItem}
                role="listitem"
              >
                <a
                  href={card.link}
                  target={card.target || '_self'}
                  rel={card.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="block h-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-2xl"
                  aria-label={`${card.title}: ${card.description}`}
                >
                  <GlassCard
                    variant="elevated"
                    hover
                    glow
                    className="relative h-full flex flex-col items-center text-center p-8 group"
                  >
                    {/* Icon container with neon glow */}
                    <motion.div
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 transition-all duration-300"
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
                      }}
                    >
                      <card.icon
                        className="h-12 w-12 text-primary-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                      />
                    </motion.div>

                    {/* Content */}
                    <h3
                      className="mb-3 text-2xl font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {card.title}
                    </h3>

                    <p className="text-text-secondary mb-6 text-base flex-grow">
                      {card.description}
                    </p>

                    {/* CTA with arrow */}
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary-400 group-hover:text-primary-300 transition-colors">
                      Learn more
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>

                    {/* Bottom neon accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-purple via-primary-500 to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />

                    {/* Decorative glow on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                  </GlassCard>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

QuickActionCards.displayName = 'QuickActionCards';
