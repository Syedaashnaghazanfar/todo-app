# Phase 2 Homepage UI

A production-ready, responsive homepage UI built with React + TypeScript, featuring TailwindCSS purple theme, Lucide icons, and Framer Motion animations. The homepage includes a hero section, quick-action cards, system status widget (connected to MCP servers), and placeholder containers for Chart Visualizer sub-agent integration.

## Features

- **Responsive Design**: Mobile-first approach with responsive layouts for all screen sizes
- **Purple Theme**: Consistent purple color scheme throughout the application
- **Animations**: Smooth animations using Framer Motion
- **MCP Integration**: Real-time system status widget with MCP server monitoring
- **Error Handling**: Comprehensive error boundaries and fallback UIs
- **Loading States**: Custom purple spinner and loading pages
- **Accessibility**: WCAG AAA compliant with keyboard navigation support
- **Performance**: Optimized with lazy loading and code splitting

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── not-found.tsx      # 404 error page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── HomePage/          # Homepage-specific components
│   └── shared/            # Reusable components
├── hooks/                 # Custom React hooks
├── services/              # API services
├── styles/                # Styling files
├── types/                 # TypeScript type definitions
└── lib/                   # Utility functions
```

## Key Components

- `HeroSection`: Main headline and call-to-action
- `QuickActionCards`: Grid of quick-access cards with icons
- `SystemStatusWidget`: Real-time MCP server status monitoring
- `StatsPreviewArea`: Placeholder for chart visualizer integration
- `PurpleSpinner`: Custom purple loading spinner
- `ErrorBoundary`: Error handling with fallback UI
- `LoadingPage`: Full-page loading component

## Development

### Adding New Components

New components should be added to the appropriate directory:
- Page-specific components: `components/HomePage/`
- Reusable components: `components/shared/`

All components should follow the purple theme and accessibility guidelines.

### Theming

The application uses a consistent purple theme. When adding new styles:
- Use Tailwind's purple color classes: `text-purple-600`, `bg-purple-100`, etc.
- Maintain WCAG AAA contrast ratios
- Support both light and dark modes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Production-ready animation library
- [TypeScript](https://www.typescriptlang.org) - Typed JavaScript
