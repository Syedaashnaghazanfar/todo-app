# Quickstart: Phase 2 Homepage UI Development

**Date**: 2025-12-10
**Status**: Ready for Implementation

## Overview

This quickstart provides developers with the essential setup and development flow for building the Phase 2 Homepage UI components.

## Prerequisites

Ensure your environment has:
- Node.js 18+ installed
- npm/yarn/pnpm package manager
- Git for version control
- Code editor with TypeScript support (VS Code recommended)

## Installation & Setup

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install core dependencies
npm install react@18+ typescript@5+ tailwindcss@3+ lucide-react framer-motion@11+ recharts

# Install dev dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom eslint typescript-eslint
```

### 2. Verify TailwindCSS Installation

Ensure `tailwind.config.ts` exists and includes purple theme:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f9f5ff',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Primary
          600: '#7c3aed',
          700: '#6d28d9', // Dark
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

### 3. Create Global Styles

Create `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Accessibility: Focus states */
@layer components {
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2;
  }

  /* Support prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

## Component Structure

### Directory Layout

```
frontend/src/components/HomePage/
├── HeroSection.tsx       # Hero section with headline + CTA
├── QuickActionCards.tsx  # Grid of feature cards
├── SystemStatusWidget.tsx # MCP server health widget
├── StatsPreviewArea.tsx  # Chart placeholder containers
├── Navigation.tsx        # Header navigation
├── Sidebar.tsx          # Collapsible sidebar (desktop/mobile)
├── Footer.tsx           # Footer with links
└── HomePage.tsx         # Main container (orchestrates all)

frontend/src/components/shared/
├── Card.tsx             # Reusable card component
├── Button.tsx           # Reusable button component
├── StatusIndicator.tsx  # Health status dot + label
└── LoadingState.tsx     # Skeleton & loading UI

frontend/src/hooks/
├── useMCPStatus.ts      # Fetch MCP server status
├── useResponsive.ts     # Responsive breakpoint detection
└── useTheme.ts          # Theme context & toggle

frontend/src/services/
├── mcpClient.ts         # MCP server communication
└── api.ts              # API utility functions

frontend/src/types/
├── components.ts        # Component prop types
├── mcp.ts              # MCP data types
└── ui.ts               # UI-related types
```

## Development Workflow

### 1. Create a Component

**Example: HeroSection.tsx**

```typescript
import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  description,
  ctaText,
  ctaLink,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
          {headline}
        </h1>
        <p className="mt-6 text-lg text-gray-600 sm:text-xl">
          {description}
        </p>
        <div className="mt-10">
          <a
            href={ctaLink}
            className="focus-ring inline-block rounded-lg bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </motion.section>
  );
};
```

### 2. Use Lucide Icons

```typescript
import {
  Home,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';

// In your component:
<CheckCircle className="w-6 h-6 text-green-500" />
<AlertCircle className="w-6 h-6 text-yellow-500" />
<XCircle className="w-6 h-6 text-red-500" />
```

### 3. Implement Responsive Design

Use TailwindCSS breakpoints (mobile-first):

```typescript
// Mobile: single column
// Tablet (md): 2 columns
// Desktop (lg): 3 columns
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</div>
```

### 4. Fetch MCP Data (useMCPStatus Hook)

```typescript
import { useMCPStatus } from '../hooks/useMCPStatus';

export const SystemStatusWidget: React.FC = () => {
  const { status, loading, error } = useMCPStatus();

  if (loading) return <LoadingState />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="rounded-lg border border-purple-200 p-4">
      <h3 className="font-semibold text-gray-900">System Status</h3>
      <div className="mt-4 space-y-2">
        {status?.servers.map(server => (
          <div key={server.name} className="flex items-center gap-2">
            <StatusIndicator status={server.status} />
            <span>{server.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5. Add Framer Motion Animations

```typescript
import { motion } from 'framer-motion';

// Container stagger animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-1 gap-4 md:grid-cols-3"
>
  {cards.map(card => (
    <motion.div key={card.id} variants={itemVariants}>
      <Card>{card.title}</Card>
    </motion.div>
  ))}
</motion.div>
```

## Testing

### Unit Tests (Vitest + React Testing Library)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders headline and description', () => {
    render(
      <HeroSection
        headline="Test Headline"
        description="Test Description"
        ctaText="Click Me"
        ctaLink="/test"
      />
    );

    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders CTA button with correct link', () => {
    render(
      <HeroSection
        headline="Test"
        description="Test"
        ctaText="Click Me"
        ctaLink="/test"
      />
    );

    const link = screen.getByRole('link', { name: /Click Me/i });
    expect(link).toHaveAttribute('href', '/test');
  });
});
```

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Sub-Agent Delegation

### When to Invoke Each Sub-Agent

| Task | Sub-Agent | How to Invoke |
|------|-----------|--------------|
| Purple theme application, color palette, WCAG AAA verification | Theme Sub-Agent | "Apply purple theme to [component]" |
| React component structure, TSX generation | UI Builder Sub-Agent | "Generate [ComponentName] component" |
| Transform MCP data into component props | Frontend Data Integrator | "Transform [MCP response] into props for [component]" |
| Render charts in stats area | Chart Visualizer Sub-Agent | "Create chart for [metric]" |

## MCP Integration

### System Status Widget

The widget fetches status every 10 seconds:

```typescript
// In SystemStatusWidget.tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchMCPStatus();
  }, 10000);

  return () => clearInterval(interval);
}, []);
```

Implement in `services/mcpClient.ts`:

```typescript
export const fetchMCPStatus = async () => {
  const response = await fetch('/api/mcp/status');
  if (!response.ok) throw new Error('Failed to fetch status');
  return response.json();
};

export const fetchMCPMetrics = async () => {
  const response = await fetch('/api/mcp/metrics');
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
};
```

## Accessibility Checklist

Before submitting PR, verify:

- ✅ All text meets 7:1 contrast ratio (WCAG AAA)
- ✅ All interactive elements keyboard-accessible (Tab, Enter)
- ✅ Focus states clearly visible
- ✅ Semantic HTML (`<button>`, `<nav>`, `<section>`, etc.)
- ✅ ARIA labels for screen readers
- ✅ Images have alt text (or Lucide icons are descriptive)
- ✅ Animations respect `prefers-reduced-motion`

## Common Tasks

### Add a Quick-Action Card

1. Define data in `types/components.ts`
2. Create card component using UI Builder Sub-Agent
3. Apply purple theme with Theme Sub-Agent
4. Test with React Testing Library

### Connect to MCP Server

1. Add endpoint to `services/mcpClient.ts`
2. Create custom hook (e.g., `useMCPMetrics.ts`)
3. Use hook in component
4. Handle loading/error states

### Apply Purple Theme

1. Use TailwindCSS classes: `bg-purple-500`, `text-purple-600`, etc.
2. Verify contrast with Theme Sub-Agent
3. Test on light/dark backgrounds

## Performance Tips

- Use `React.memo()` for components that don't need frequent re-renders
- Implement code splitting for large components with dynamic imports
- Lazy-load images with `<Image>` component (Next.js)
- Monitor bundle size with `npm run build` and `npm run analyze`
- Use `useMemo()` and `useCallback()` for expensive operations

## Debugging

```bash
# Run development server with debug logging
DEBUG=* npm run dev

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint

# Check accessibility with axe-core
npm run test:a11y
```

## Resources

- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev
- **Framer Motion Docs**: https://www.framer.com/motion/
- **Lucide Icons**: https://lucide.dev
- **Recharts**: https://recharts.org/
- **TypeScript**: https://www.typescriptlang.org/docs/

## Next Steps

1. Set up development environment
2. Create shared components (Card, Button, StatusIndicator)
3. Build main components (Hero, Cards, Status Widget, etc.)
4. Integrate MCP endpoints
5. Test responsive design and accessibility
6. Deploy to staging

---

**Ready to start development!** Use `/sp.tasks` to generate specific implementation tasks.
