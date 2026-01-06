# Component Usage Guide

This document provides usage instructions for the main components in the Phase 2 Homepage UI project.

## Shared Components

### PurpleSpinner
A custom animated spinner with purple theme for loading states.

```tsx
import { PurpleSpinner } from '@/components/shared/PurpleSpinner';

// Basic usage
<PurpleSpinner />

// With custom size and label
<PurpleSpinner size="lg" label="Loading data..." />

// With custom styling
<PurpleSpinner className="text-purple-700" size="md" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: Additional CSS classes
- `label`: Loading message (default: 'Loading...')

### LoadingPage
Full-page loading component with purple spinner.

```tsx
import { LoadingPage } from '@/components/shared/LoadingPage';

// Basic usage
<LoadingPage />

// With custom message and size
<LoadingPage message="Loading your dashboard..." size="lg" />
```

**Props:**
- `message`: Loading message (default: 'Loading...')
- `size`: 'sm' | 'md' | 'lg' (default: 'lg')
- `className`: Additional CSS classes

### ErrorFallback
Fallback UI component for ErrorBoundary with purple theme.

```tsx
import { ErrorFallback } from '@/components/shared/ErrorFallback';

// Basic usage
<ErrorFallback />

// With custom error and messages
<ErrorFallback
  error={error}
  resetError={() => window.location.reload()}
  title="Something went wrong"
  message="We're sorry, but something went wrong. Please try again."
/>
```

**Props:**
- `error`: Error object to display
- `resetError`: Function to reset the error state
- `title`: Error title (default: 'Something went wrong')
- `message`: Error message (default: 'We\'re sorry, but something went wrong...')
- `className`: Additional CSS classes

### ErrorBoundary
React Error Boundary to catch JavaScript errors and display fallback UI.

```tsx
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<div>Custom error message</div>}>
  <YourComponent />
</ErrorBoundary>

// With full-page fallback
<ErrorBoundary showPageFallback={true}>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children`: Child components to wrap
- `fallback`: Custom fallback component
- `className`: Additional CSS classes
- `showPageFallback`: Show full-page error UI (default: false)

### LazyComponent
Higher-order component for lazy loading with suspense and fallback UI.

```tsx
import { LazyComponent } from '@/components/shared/LazyComponent';

// Create a lazy-loaded component
const LazyStatsPreviewArea = LazyComponent(() => import('./StatsPreviewArea'));

// Use with Suspense
<Suspense fallback={<PurpleSpinner />}>
  <LazyStatsPreviewArea />
</Suspense>
```

### LazyLoad
Component that wraps lazy loading functionality with error boundary.

```tsx
import { LazyLoad } from '@/components/shared/LazyComponent';

// Basic usage
<LazyLoad importFunc={() => import('./StatsPreviewArea')} />
```

**Props:**
- `importFunc`: Function that imports the component
- `fallback`: Fallback UI while loading
- `errorFallback`: Fallback UI when error occurs
- Additional props are passed to the loaded component

## HomePage Components

### HeroSection
Displays the main headline and call-to-action for the homepage.

### QuickActionCards
Renders a responsive grid of quick-action cards with icons and navigation.

### SystemStatusWidget
Displays real-time MCP server health status with color-coded indicators.

### StatsPreviewArea
Creates placeholder containers for charts ready for Chart Visualizer integration.

## Theme and Styling

All components follow the purple theme consistently:
- Primary purple: `text-purple-600`, `bg-purple-600`
- Darker purple: `text-purple-800`, `bg-purple-800`
- Light purple: `text-purple-200`, `bg-purple-200`
- Accent colors for different states (healthy: green, degraded: yellow, offline: red)

## Accessibility

All components include proper ARIA attributes, keyboard navigation support, and WCAG AAA contrast ratios.