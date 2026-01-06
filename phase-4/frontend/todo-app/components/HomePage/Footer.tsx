/**
 * Footer Component
 *
 * Footer with organized link sections, branding, and copyright information.
 * Responsive layout: single column on mobile, multi-column on desktop.
 *
 * Usage:
 * <Footer />
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Status", href: "/status" },
      { label: "Report Bug", href: "/report-bug" },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@todoapp.com", label: "Email" },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--bg-darkest)] text-[var(--text-primary)] mt-auto border-t border-[var(--glass-border)]">
      <div className="container mx-auto px-6 py-12 md:px-8 lg:px-12">
        {/* Glassmorphism container */}
        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-8 shadow-[var(--shadow-glow)]">
          {/* Main footer content */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="mb-4 text-lg font-semibold text-[var(--text-accent)]">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>
                        <motion.span
                          whileHover={{ x: 4 }}
                          className="inline-block text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-400)]"
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-[var(--primary-500)] to-transparent" />

          {/* Bottom section */}
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            {/* Branding & Copyright */}
            <div className="flex flex-col items-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <span className="text-sm text-[var(--text-secondary)]">
                &copy; {currentYear} Todo App. All rights reserved.
              </span>
              <span className="hidden text-[var(--text-muted)] md:inline">•</span>
              <div className="flex items-center space-x-1 text-sm text-[var(--text-secondary)]">
                <span>Made with</span>
                <Heart className="h-4 w-4 fill-current text-[var(--neon-red)]" />
                <span className="text-[var(--text-primary)]">
                  by{" "}
                  <Link
                    href="https://www.linkedin.com/in/ashna-ghazanfar-b268522b4/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary-400)] hover:text-[var(--primary-300)]"
                  >
                    Ashna Ghazanfar
                  </Link>
                </span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center",
                        "rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)]",
                        "transition-colors hover:bg-[var(--primary-500)/20] hover:text-[var(--primary-400)] shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";
