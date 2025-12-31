/**
 * Extended Tailwind CSS Configuration Template
 *
 * This template provides a comprehensive Tailwind configuration with:
 * - CSS variable-based theming (shadcn/ui compatible)
 * - Custom brand colors
 * - Extended typography
 * - Custom animations
 * - Plugin configurations
 *
 * Usage:
 * 1. Copy this file to your project root as tailwind.config.ts
 * 2. Customize colors, fonts, and other values
 * 3. Update content paths for your project structure
 * 4. Add corresponding CSS variables to globals.css
 */

import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  // Enable dark mode via class on <html>
  darkMode: ["class"],

  // Content paths - adjust for your project
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    // Container configuration
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      // ==========================================
      // COLORS
      // Using CSS variables for theme switching
      // ==========================================
      colors: {
        // Semantic colors (CSS variable based)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Brand colors (customize for your brand)
        brand: {
          50: "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
          800: "hsl(var(--brand-800))",
          900: "hsl(var(--brand-900))",
          950: "hsl(var(--brand-950))",
        },

        // Status colors (optional direct values)
        success: {
          DEFAULT: "hsl(142.1 76.2% 36.3%)",
          foreground: "hsl(355.7 100% 97.3%)",
        },
        warning: {
          DEFAULT: "hsl(47.9 95.8% 53.1%)",
          foreground: "hsl(26 83.3% 14.1%)",
        },
        info: {
          DEFAULT: "hsl(221.2 83.2% 53.3%)",
          foreground: "hsl(210 40% 98%)",
        },
      },

      // ==========================================
      // TYPOGRAPHY
      // ==========================================
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },

      // ==========================================
      // BORDER RADIUS
      // ==========================================
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ==========================================
      // SPACING
      // ==========================================
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "128": "32rem",
        "144": "36rem",
      },

      // ==========================================
      // ANIMATIONS
      // ==========================================
      keyframes: {
        // Accordion animations (Radix UI)
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        // Collapsible animations (Radix UI)
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },

        // Fade animations
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },

        // Slide animations
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },

        // Scale animations
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },

        // Other animations
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "slide-up-fade": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        // Accordion
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // Collapsible
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",

        // Fade
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",

        // Slide
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",

        // Scale
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",

        // Other
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        wiggle: "wiggle 0.3s ease-in-out",
        "slide-up-fade": "slide-up-fade 0.4s ease-out",
      },

      // ==========================================
      // SHADOWS
      // ==========================================
      boxShadow: {
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgb(59 130 246 / 0.5)",
        "glow-lg": "0 0 40px rgb(59 130 246 / 0.3)",
      },

      // ==========================================
      // Z-INDEX (additional levels)
      // ==========================================
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },

      // ==========================================
      // ASPECT RATIO
      // ==========================================
      aspectRatio: {
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "2/3": "2 / 3",
        "9/16": "9 / 16",
      },
    },
  },

  // ==========================================
  // PLUGINS
  // ==========================================
  plugins: [
    // Required for shadcn/ui animations
    require("tailwindcss-animate"),

    // Optional: Typography plugin for prose content
    // require("@tailwindcss/typography"),

    // Optional: Forms plugin for better form defaults
    // require("@tailwindcss/forms"),

    // Optional: Container queries
    // require("@tailwindcss/container-queries"),
  ],
};

export default config;

/**
 * ==========================================
 * CORRESPONDING CSS VARIABLES
 * ==========================================
 *
 * Add to your globals.css:
 *
 * @tailwind base;
 * @tailwind components;
 * @tailwind utilities;
 *
 * @layer base {
 *   :root {
 *     --background: 0 0% 100%;
 *     --foreground: 222.2 84% 4.9%;
 *     --card: 0 0% 100%;
 *     --card-foreground: 222.2 84% 4.9%;
 *     --popover: 0 0% 100%;
 *     --popover-foreground: 222.2 84% 4.9%;
 *     --primary: 222.2 47.4% 11.2%;
 *     --primary-foreground: 210 40% 98%;
 *     --secondary: 210 40% 96.1%;
 *     --secondary-foreground: 222.2 47.4% 11.2%;
 *     --muted: 210 40% 96.1%;
 *     --muted-foreground: 215.4 16.3% 46.9%;
 *     --accent: 210 40% 96.1%;
 *     --accent-foreground: 222.2 47.4% 11.2%;
 *     --destructive: 0 84.2% 60.2%;
 *     --destructive-foreground: 210 40% 98%;
 *     --border: 214.3 31.8% 91.4%;
 *     --input: 214.3 31.8% 91.4%;
 *     --ring: 222.2 84% 4.9%;
 *     --radius: 0.5rem;
 *
 *     // Brand colors (customize)
 *     --brand-50: 220 100% 97%;
 *     --brand-100: 220 100% 94%;
 *     --brand-200: 220 100% 88%;
 *     --brand-300: 220 100% 78%;
 *     --brand-400: 220 100% 66%;
 *     --brand-500: 220 100% 54%;
 *     --brand-600: 220 100% 46%;
 *     --brand-700: 220 100% 38%;
 *     --brand-800: 220 100% 30%;
 *     --brand-900: 220 100% 22%;
 *     --brand-950: 220 100% 14%;
 *   }
 *
 *   .dark {
 *     --background: 222.2 84% 4.9%;
 *     --foreground: 210 40% 98%;
 *     --card: 222.2 84% 4.9%;
 *     --card-foreground: 210 40% 98%;
 *     --popover: 222.2 84% 4.9%;
 *     --popover-foreground: 210 40% 98%;
 *     --primary: 210 40% 98%;
 *     --primary-foreground: 222.2 47.4% 11.2%;
 *     --secondary: 217.2 32.6% 17.5%;
 *     --secondary-foreground: 210 40% 98%;
 *     --muted: 217.2 32.6% 17.5%;
 *     --muted-foreground: 215 20.2% 65.1%;
 *     --accent: 217.2 32.6% 17.5%;
 *     --accent-foreground: 210 40% 98%;
 *     --destructive: 0 62.8% 30.6%;
 *     --destructive-foreground: 210 40% 98%;
 *     --border: 217.2 32.6% 17.5%;
 *     --input: 217.2 32.6% 17.5%;
 *     --ring: 212.7 26.8% 83.9%;
 *   }
 * }
 *
 * @layer base {
 *   * {
 *     @apply border-border;
 *   }
 *   body {
 *     @apply bg-background text-foreground;
 *   }
 * }
 */
