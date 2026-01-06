import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Cyberpunk Purple Color Scale
        'purple-50': 'oklch(var(--primary-50) / <alpha-value>)',
        'purple-100': 'oklch(var(--primary-100) / <alpha-value>)',
        'purple-200': 'oklch(var(--primary-200) / <alpha-value>)',
        'purple-300': 'oklch(var(--primary-300) / <alpha-value>)',
        'purple-400': 'oklch(var(--primary-400) / <alpha-value>)',
        'purple-500': 'oklch(var(--primary-500) / <alpha-value>)',
        'purple-600': 'oklch(var(--primary-600) / <alpha-value>)',
        'purple-700': 'oklch(var(--primary-700) / <alpha-value>)',
        'purple-800': 'oklch(var(--primary-800) / <alpha-value>)',
        'purple-900': 'oklch(var(--primary-900) / <alpha-value>)',

        // Neon Accents
        'neon-purple': 'oklch(var(--neon-purple) / <alpha-value>)',
        'neon-blue': 'oklch(var(--neon-blue) / <alpha-value>)',
        'neon-cyan': 'oklch(var(--neon-cyan) / <alpha-value>)',
        'neon-pink': 'oklch(var(--neon-pink) / <alpha-value>)',
        'neon-green': 'oklch(var(--neon-green) / <alpha-value>)',
        'neon-red': 'oklch(var(--neon-red) / <alpha-value>)',
        'neon-yellow': 'oklch(var(--neon-yellow) / <alpha-value>)',

        // Theme Colors
        'primary': 'oklch(var(--primary) / <alpha-value>)',
        'primary-foreground': 'oklch(var(--primary-foreground) / <alpha-value>)',
        'secondary': 'oklch(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'oklch(var(--secondary-foreground) / <alpha-value>)',
        'accent': 'oklch(var(--accent) / <alpha-value>)',
        'accent-foreground': 'oklch(var(--accent-foreground) / <alpha-value>)',
        'destructive': 'oklch(var(--destructive) / <alpha-value>)',
        'destructive-foreground': 'oklch(var(--destructive-foreground) / <alpha-value>)',
        'muted': 'oklch(var(--muted) / <alpha-value>)',
        'muted-foreground': 'oklch(var(--muted-foreground) / <alpha-value>)',
        'background': 'oklch(var(--background) / <alpha-value>)',
        'foreground': 'oklch(var(--foreground) / <alpha-value>)',
        'card': 'oklch(var(--card) / <alpha-value>)',
        'card-foreground': 'oklch(var(--card-foreground) / <alpha-value>)',
        'popover': 'oklch(var(--popover) / <alpha-value>)',
        'popover-foreground': 'oklch(var(--popover-foreground) / <alpha-value>)',
        'border': 'oklch(var(--border) / <alpha-value>)',
        'input': 'oklch(var(--input) / <alpha-value>)',
        'ring': 'oklch(var(--ring) / <alpha-value>)',
        'text-primary': 'oklch(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'oklch(var(--text-secondary) / <alpha-value>)',
        'text-muted': 'oklch(var(--text-muted) / <alpha-value>)',
        'text-accent': 'oklch(var(--text-accent) / <alpha-value>)',

        // Backgrounds
        'bg-darkest': 'oklch(var(--bg-darkest) / <alpha-value>)',
        'bg-dark': 'oklch(var(--bg-dark) / <alpha-value>)',
        'bg-card': 'oklch(var(--bg-card) / <alpha-value>)',
        'bg-elevated': 'oklch(var(--bg-elevated) / <alpha-value>)',
        'bg-hover': 'oklch(var(--bg-hover) / <alpha-value>)',
        'bg-light-main': 'oklch(var(--bg-light-main) / <alpha-value>)',
        'bg-light-card': 'oklch(var(--bg-light-card) / <alpha-value>)',
        'bg-light-elevated': 'oklch(var(--bg-light-elevated) / <alpha-value>)',

        // Glass Effects
        'glass-bg': 'oklch(var(--glass-bg) / <alpha-value>)',
        'glass-border': 'oklch(var(--glass-border) / <alpha-value>)',
        'glass-highlight': 'oklch(var(--glass-highlight) / <alpha-value>)',
      },
      boxShadow: {
        'glow-purple': 'var(--glow-purple)',
        'glow-blue': 'var(--glow-blue)',
        'glow-cyan': 'var(--glow-cyan)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
        'border-glow': 'var(--border-glow)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 var(--neon-purple)' },
          '50%': { boxShadow: '0 0 0 8px transparent' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        'xl': 'var(--radius-xl)',
        'lg': 'var(--radius-lg)',
        'md': 'var(--radius-md)',
        'sm': 'var(--radius-sm)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
} satisfies Config;