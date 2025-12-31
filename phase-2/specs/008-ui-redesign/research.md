# Research: Todo App UI Redesign

## Decision: CSS Variables Implementation
**Rationale**: Implementing the specified color palette and design tokens as CSS variables ensures consistency across the application and enables easy theme switching.
**Alternatives considered**: Styled components, CSS modules, inline styles - CSS variables were chosen for their simplicity and effectiveness in maintaining design consistency.

## Decision: Glassmorphism Effects
**Rationale**: Using backdrop-filter with appropriate fallbacks creates the requested glass-like effect that's central to the cyberpunk neon elegance theme.
**Alternatives considered**: Pure gradient backgrounds, transparency with borders - backdrop-filter provides the authentic frosted glass effect requested.

## Decision: Framer Motion for Animations
**Rationale**: Framer Motion provides the specific animation patterns requested in the specification (fade-in-up, stagger children, scale hover, glow pulse).
**Alternatives considered**: CSS animations, React Spring, GSAP - Framer Motion offers the best integration with React and the specific animation patterns needed.

## Decision: Lucide React Icons
**Rationale**: Lucide React provides clean, consistent icons that can be styled with the requested neon glow effects and match the modern aesthetic.
**Alternatives considered**: Feather Icons, Heroicons, Material Icons - Lucide offers the right balance of simplicity and customizability.

## Decision: Theme Toggle Implementation
**Rationale**: Using a context-based approach with CSS variables allows for smooth theme transitions and persistence across sessions.
**Alternatives considered**: Multiple CSS files, CSS-in-JS libraries - Context with CSS variables provides the most maintainable solution.

## Decision: Responsive Breakpoints
**Rationale**: Using Tailwind's standard breakpoints (mobile-first approach) ensures consistency with the existing codebase and industry standards.
**Alternatives considered**: Custom breakpoints - Tailwind's standard breakpoints are sufficient and maintain consistency.

# Todo App UI Redesign — Complete Specification

## Design Vision & Aesthetic Direction

**Core Theme:** Cyberpunk Neon Elegance — A premium dark interface with ethereal purplish-blue glows, subtle gradients, and floating glass-morphism elements

### Design Philosophy
The UI should feel like a high-end premium SaaS product like todo application. Every element should have depth, subtle animations, and that "expensive" feeling through careful use of glows, gradients, and micro-interactions.

---

## Global Design System

### Color Palette

```css
/* Primary Colors */
--primary-50: #f5f3ff;
--primary-100: #ede9fe;
--primary-200: #ddd6fe;
--primary-300: #c4b5fd;
--primary-400: #a78bfa;
--primary-500: #8b5cf6;      /* Main accent */
--primary-600: #7c3aed;
--primary-700: #6d28d9;
--primary-800: #5b21b6;
--primary-900: #4c1d95;

/* Neon Accents */
--neon-purple: #a855f7;
--neon-blue: #3b82f6;
--neon-cyan: #06b6d4;
--neon-pink: #ec4899;
--neon-green: #10b981;      /* For success/completed states */
--neon-red: #ef4444;        /* For delete/error states */
--neon-yellow: #f59e0b;     /* For update/warning states */

/* Dark Theme Backgrounds */
--bg-darkest: #030014;      /* Deepest background */
--bg-dark: #0a0a1a;         /* Main background */
--bg-card: #0f0f23;         /* Card backgrounds */
--bg-elevated: #1a1a2e;     /* Elevated surfaces */
--bg-hover: #252542;        /* Hover states */

/* Light Theme Backgrounds */
--bg-light-main: #f8f7ff;
--bg-light-card: #ffffff;
--bg-light-elevated: #f0eeff;

/* Glass Effects */
--glass-bg: rgba(255, 255, 255, 0.03);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-highlight: rgba(255, 255, 255, 0.1);

/* Text Colors */
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-muted: #64748b;
--text-accent: #c4b5fd;
```

### Typography

```css
/* Font Stack - Use a premium combination */
--font-display: 'Space Grotesk', 'Outfit', sans-serif;  /* For headings */
--font-body: 'Inter', 'DM Sans', sans-serif;            /* For body text */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;  /* For stats/numbers */

/* Size Scale */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### Shadow & Glow Effects

```css
/* Neon Glow Effects */
--glow-purple: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2);
--glow-blue: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
--glow-cyan: 0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2);

/* Card Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 40px rgba(139, 92, 246, 0.15);

/* Border Glow on Hover */
--border-glow: 0 0 0 1px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.2);
```

### Glassmorphism Standards

```css
.glass-card {
  background: rgba(15, 15, 35, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.glass-card-elevated {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(59, 130, 246, 0.05) 50%,
    rgba(6, 182, 212, 0.1) 100%
  );
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Animation Tokens (Framer Motion)

```typescript
// Fade In Up
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
};

// Stagger Children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Scale on Hover
export const scaleHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 }
};

// Glow Pulse
export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(139, 92, 246, 0.3)",
      "0 0 40px rgba(139, 92, 246, 0.5)",
      "0 0 20px rgba(139, 92, 246, 0.3)"
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};

// Slide In from Side
export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Page Transition
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};
```

---

## Recommended Icon Library

Use **Lucide React** icons with custom styling:

```tsx
import { 
  CheckCircle2, Circle, Trash2, Edit3, Plus, Search, 
  Filter, Calendar, BarChart3, History, Settings, 
  LogOut, Moon, Sun, Lock, User, Mail, Eye, EyeOff,
  ChevronDown, ArrowUpRight, Sparkles, Zap
} from 'lucide-react';

// Icon styling for neon effect
<Icon className="w-5 h-5 text-primary-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
```

---

## Page-by-Page UI Specifications

---

### 1. Landing Page

**Purpose:** First impression, convert visitors to sign up
**Layout:** Full viewport sections with scroll-triggered animations

#### Hero Section
- **Background:** 
  - Animated gradient mesh (purples, blues, cyans blending)
  - Subtle grid pattern overlay (like the Futureswap reference)
  - Floating particle effect using canvas or CSS
  - Optional: Animated wave/curve line (like the chart line in reference)

- **Content:**
  - Large hero headline with gradient text effect
    ```css
    .gradient-text {
      background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    ```
  - Subheadline in muted text color
  - Two CTA buttons:
    - Primary: "Get Started" — Filled with gradient, neon glow on hover
    - Secondary: "Learn More" — Ghost button with border glow on hover

- **Visual Element:**
  - 3D-like floating task cards preview
  - Or animated mockup of the app dashboard
  - Subtle floating icons (checkmarks, stars) with parallax effect

#### Stats Section (Like Futureswap reference)
- Dark glass card containing key stats
- Large numbers in monospace font with gradient coloring
- Labels in small muted text
- Stats: "Tasks Completed", "Active Users", "Time Saved"
- Numbers should have counting animation on scroll into view

#### Features Grid
- 6 feature cards in 3x2 grid (2x3 on mobile)
- Each card:
  - Glass background with subtle gradient border
  - Icon with neon glow effect (cyan, purple, blue variations)
  - Feature title in white
  - Short description in muted text
  - Hover: Lift up + border glow intensifies

#### CTA Section
- Centered text with "Ready to boost your productivity?"
- Large gradient CTA button
- Subtle background glow behind the section

#### Footer
- Minimal, dark background
- Logo, copyright, social links
- Links have underline animation on hover

---

### 2. Login Page

**Layout:** Split screen or centered card
**Recommended:** Centered glass card on animated background

#### Background
- Same gradient mesh as landing page
- Subtle grid/dot pattern
- Optional: Slow-moving gradient orbs

#### Login Card
- Glassmorphism card (max-width: 420px)
- Centered vertically and horizontally

#### Content Structure
1. **Logo/Brand** at top with subtle glow
2. **Heading:** "Welcome back" (gradient text)
3. **Subheading:** "Sign in to continue" (muted)

4. **Form Fields:**
   - Email input with mail icon
   - Password input with lock icon + show/hide toggle
   - Input styling:
     ```css
     .input-field {
       background: rgba(255, 255, 255, 0.03);
       border: 1px solid rgba(255, 255, 255, 0.1);
       border-radius: 12px;
       padding: 14px 16px 14px 44px;
       color: white;
       transition: all 0.3s ease;
     }
     .input-field:focus {
       border-color: rgba(139, 92, 246, 0.6);
       box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
       outline: none;
     }
     ```

5. **Remember me** checkbox + **Forgot password** link

6. **Sign In Button:**
   - Full width
   - Gradient background (purple to blue)
   - Neon glow on hover
   - Loading spinner state

7. **Divider:** "or continue with"

8. **Social Login Buttons** (if applicable):
   - Ghost buttons with icons
   - Google, GitHub, etc.

9. **Sign up link:** "Don't have an account? Sign up"

#### Animations
- Card fades in and slides up on mount
- Input fields have subtle focus animations
- Button has scale + glow animation on hover

---

### 3. Sign Up Page

**Layout:** Same as Login for consistency

#### Differences from Login
- Heading: "Create your account"
- Additional fields:
  - Name input with user icon
  - Confirm password input
- Password strength indicator:
  - Progress bar that fills with color gradient
  - Weak (red) → Medium (yellow) → Strong (green)
- Terms checkbox with link to terms
- Primary CTA: "Create Account"
- Bottom link: "Already have an account? Sign in"

---

### 4. Tasks Page (Main Dashboard)

**Purpose:** Core functionality — view, filter, search, add, manage tasks
**Layout:** Sidebar (optional) + Main content area

#### Overall Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Navigation | Theme Toggle | User Menu   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Page Title: "My Tasks"              [+ Add Task Button]│
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Search Bar              │  Filter Dropdown     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Filter Chips: All | Active | Completed                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Task Item 1                                     │   │
│  │  Task Item 2                                     │   │
│  │  Task Item 3                                     │   │
│  │  ...                                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Header/Navigation Bar
- Fixed top position
- Glass background with blur
- Logo on left (with subtle glow)
- Nav links: Tasks | Analytics | History | Settings
- Active link has gradient underline or pill background
- Right side: Theme toggle button + User avatar dropdown

#### Page Title Area
- Large heading with optional greeting: "My Tasks" or "Good morning, [Name]"
- Task count badge: "24 tasks"
- Add Task button (floating or inline):
  - Gradient background
  - Plus icon
  - Neon glow on hover
  - Opens modal or drawer

#### Search & Filter Bar
- Search input:
  - Search icon (magnifying glass)
  - Placeholder: "Search tasks..."
  - Glass background
  - Expands slightly on focus
  
- Filter dropdown:
  - Custom styled select with chevron icon
  - Options: All, Priority, Due Date, Created Date
  - Dropdown uses glass styling

#### Filter Chips/Tabs
- Horizontal pill buttons
- States: All | Active | Completed
- Active state: Gradient background + glow
- Inactive: Ghost style with border
- Smooth transition between states
- Show count next to each: "All (24)" "Active (18)" "Completed (6)"

#### Task List
- Each task is a glass card with:
  - Left: Checkbox (custom styled)
    - Unchecked: Circle outline with subtle glow
    - Checked: Filled circle with checkmark, green glow, strike-through text
  - Center: 
    - Task title (primary text)
    - Due date / metadata (muted text, small)
    - Priority badge (if applicable): Low (gray), Medium (yellow), High (red glow)
  - Right:
    - Edit button (pencil icon) — ghost, shows on hover
    - Delete button (trash icon) — ghost, red glow on hover
  
- Task card hover effect:
  - Lift up slightly (translateY: -2px)
  - Border glow intensifies
  - Action buttons fade in

- Completed tasks:
  - Text has strike-through
  - Opacity reduced slightly
  - Green checkmark glow

- Empty state:
  - Centered illustration or icon
  - "No tasks yet" message
  - "Create your first task" CTA

#### Add Task Modal/Drawer
- Glass overlay background (dark with blur)
- Centered modal with glass card styling
- Fields:
  - Task title (required)
  - Description (textarea, optional)
  - Due date (date picker with calendar icon)
  - Priority (segmented control: Low | Medium | High)
- Buttons:
  - Cancel (ghost)
  - Create Task (gradient, primary)
- Smooth open/close animations (scale + fade)

#### Animations (Framer Motion)
- Task list items stagger in on page load
- New tasks animate in from top
- Deleted tasks animate out (scale down + fade)
- Checkbox has satisfying check animation
- Filter changes trigger smooth list reorder

---

### 5. Analytics Page

**Purpose:** Visual representation of task completion data
**Layout:** Stats cards at top, charts below

#### Page Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header (same as Tasks page)                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Page Title: "Analytics"                                │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Total    │  │Completed │  │ Pending  │  │Completion│ │
│  │ Tasks    │  │ Tasks    │  │ Tasks    │  │ Rate     │ │
│  │   124    │  │    89    │  │    35    │  │   72%    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │        Completion Over Time (Line/Area Chart)   │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌───────────────────┐  ┌───────────────────────────┐  │
│  │                   │  │                           │  │
│  │  Status Breakdown │  │  Tasks by Priority        │  │
│  │  (Donut Chart)    │  │  (Bar Chart)              │  │
│  │                   │  │                           │  │
│  └───────────────────┘  └───────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Stat Cards (Top Row)
- 4 glass cards in a row
- Each card:
  - Icon with neon glow (different color per card)
  - Large number in monospace font
  - Label in muted text
  - Optional: Trend indicator (↑ 12% with green glow)
  
- Card backgrounds:
  - Total: Purple accent gradient
  - Completed: Green/cyan accent
  - Pending: Blue accent
  - Rate: Pink/magenta accent

- Hover: Subtle lift + glow intensify

#### Charts (Recharts Styling)

**Common Chart Styling:**
```tsx
// Custom chart theme
const chartTheme = {
  background: 'transparent',
  textColor: '#94a3b8',
  gridColor: 'rgba(255, 255, 255, 0.05)',
  colors: {
    primary: '#8b5cf6',
    secondary: '#3b82f6',
    tertiary: '#06b6d4',
    completed: '#10b981',
    pending: '#f59e0b',
  }
};

// Custom tooltip
const CustomTooltip = ({ active, payload }) => (
  <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
    {/* Tooltip content */}
  </div>
);
```

**Completion Over Time (Area/Line Chart):**
- Glass card container
- Gradient fill under the line (purple to blue, fading to transparent)
- Glowing line with drop shadow
- Dots at data points with glow on hover
- X-axis: Dates (muted text)
- Y-axis: Count (muted text)
- Grid lines: Very subtle (rgba white 5%)
- Hover shows custom tooltip with glass styling

**Status Breakdown (Donut/Pie Chart):**
- Glass card container
- Donut chart with:
  - Completed segment: Cyan/green gradient
  - Incomplete segment: Purple gradient
- Center text showing total or percentage
- Legend below with colored dots
- Hover segment: Slight scale + glow

**Tasks by Priority (Bar Chart):**
- Glass card container
- Horizontal or vertical bars
- Bar colors:
  - Low: Cyan
  - Medium: Yellow/amber
  - High: Red/pink
- Bars have rounded corners
- Gradient fill or solid with glow
- Hover: Bar glows + tooltip appears

#### Animations
- Stat cards count up on mount
- Charts animate in (draw effect for lines, grow effect for bars)
- Staggered card animations

---

### 6. History Page

**Purpose:** Show timeline of all task activities
**Layout:** Timeline/list view with color-coded actions

#### Page Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header (same as other pages)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Page Title: "Activity History"    [Clear History Btn]  │
│                                                         │
│  Date Filter: Today | This Week | This Month | All      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Timeline                                        │   │
│  │  ┌─ TODAY ─────────────────────────────────────┐│   │
│  │  │  ● Created "New task name"        10:30 AM  ││   │
│  │  │  ● Completed "Task name"           9:15 AM  ││   │
│  │  │  ● Updated "Task name"             8:45 AM  ││   │
│  │  │  ● Deleted "Task name"             8:00 AM  ││   │
│  │  └─────────────────────────────────────────────┘│   │
│  │  ┌─ YESTERDAY ─────────────────────────────────┐│   │
│  │  │  ...                                        ││   │
│  │  └─────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### History Item Styling

**Color Coding by Action Type:**
```css
/* Created - Cyan/Blue */
.history-created {
  --action-color: #06b6d4;
  --action-glow: 0 0 12px rgba(6, 182, 212, 0.4);
}

/* Completed - Green */
.history-completed {
  --action-color: #10b981;
  --action-glow: 0 0 12px rgba(16, 185, 129, 0.4);
}

/* Updated - Yellow/Amber */
.history-updated {
  --action-color: #f59e0b;
  --action-glow: 0 0 12px rgba(245, 158, 11, 0.4);
}

/* Deleted - Red */
.history-deleted {
  --action-color: #ef4444;
  --action-glow: 0 0 12px rgba(239, 68, 68, 0.4);
}
```

**Timeline Item Component:**
- Vertical line connecting items (gradient or dotted)
- Circle indicator with action color + glow
- Glass card for content:
  - Action type badge with color
  - Task name (primary text)
  - Timestamp (muted, right-aligned)
  - Optional: "View details" expandable

**Date Group Headers:**
- Sticky headers for each day/period
- Glass background
- Muted text with subtle divider lines

**Empty State:**
- Illustrated empty state
- "No activity yet"
- Subtle animation

#### Date Filter Chips
- Same styling as task filter chips
- Options: Today | This Week | This Month | All Time
- Active state with gradient background

#### Clear History Button (Destructive Action)
- Outlined red/ghost button
- Trash icon
- Confirmation modal required:
  - Warning icon
  - "Are you sure?" message
  - Cancel + Confirm buttons
  - Confirm has red background

#### Animations
- Timeline items stagger in on load
- New items animate in from top
- Smooth filter transitions
- Clear history: Items animate out sequentially

---

### 7. Settings Page

**Purpose:** User preferences, account management
**Layout:** Sectioned cards or list

#### Page Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header (same as other pages)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Page Title: "Settings"                                 │
│                                                         │
│  ┌─ Appearance ────────────────────────────────────┐   │
│  │                                                  │   │
│  │  Theme              [Dark ● ○ Light]            │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ Account ───────────────────────────────────────┐   │
│  │                                                  │   │
│  │  Change Password    [→]                         │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ Data ──────────────────────────────────────────┐   │
│  │                                                  │   │
│  │  Clear History      [Clear All History]         │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ Session ───────────────────────────────────────┐   │
│  │                                                  │   │
│  │  [🚪 Log Out]                                   │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Settings Sections

**Appearance Section:**
- Glass card with "Appearance" header
- Theme toggle:
  - Custom toggle switch or segmented control
  - Sun icon for light, Moon icon for dark
  - Toggle has smooth animation
  - Active state has gradient/glow
  - Theme change triggers smooth transition on entire app

**Theme Toggle Implementation:**
```tsx
// Toggle styling
<div className="flex items-center gap-3 p-1 bg-white/5 rounded-full">
  <button className={`p-2 rounded-full transition-all ${
    theme === 'light' 
      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30' 
      : 'text-slate-400 hover:text-white'
  }`}>
    <Sun className="w-5 h-5" />
  </button>
  <button className={`p-2 rounded-full transition-all ${
    theme === 'dark' 
      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30' 
      : 'text-slate-400 hover:text-white'
  }`}>
    <Moon className="w-5 h-5" />
  </button>
</div>
```

**Account Section:**
- Glass card
- Change Password row:
  - Lock icon
  - "Change Password" text
  - Chevron right icon
  - Clickable row → Opens modal or navigates to page

**Change Password Modal:**
- Glass modal overlay
- Fields:
  - Current password (with show/hide)
  - New password (with show/hide + strength indicator)
  - Confirm new password
- Cancel + Save buttons
- Success toast notification on completion

**Data Section:**
- Glass card
- Clear History row:
  - Trash icon (red tint)
  - "Clear History" text
  - Red outlined button
  - Warning: Requires confirmation modal

**Session Section:**
- Glass card
- Logout button:
  - Full width or left-aligned
  - LogOut icon
  - Red/danger styling (outlined or ghost)
  - Confirmation optional (or direct logout)

#### Animations
- Sections stagger in on mount
- Toggle has smooth state change
- Buttons have hover/tap animations
- Modals slide in with backdrop blur

---

### 8. 404 Error Page

**Purpose:** Friendly error state for invalid routes
**Layout:** Centered content with visual element

#### Design Elements

**Background:**
- Same gradient mesh as landing/auth pages
- Optional: Glitchy or distorted effect

**Content (Centered):**
- Large "404" text:
  - Gradient text effect
  - Optional: Glitch animation
  - Can use unique display font
  
- Headline: "Page not found"
- Subtext: "The page you're looking for doesn't exist or has been moved."

- Visual element (choose one):
  - Animated floating astronaut/character
  - Broken link icon with glow
  - Glitchy portal effect
  - Abstract geometric shapes

- CTA Button:
  - "Go back home" with home icon
  - Gradient background
  - Neon glow on hover

**Animation Ideas:**
- 404 text has subtle float animation
- Background particles drift
- Visual element has idle animation
- Button has scale hover effect

---

## Responsive Design Guidelines

### Breakpoints
```css
/* Mobile first approach */
--mobile: 0px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

### Mobile Adaptations
- Navigation becomes bottom tab bar or hamburger menu
- Task cards stack vertically
- Charts resize and simplify
- Modals become full-screen drawers
- Touch-friendly tap targets (min 44px)
- Reduced animations for performance

### Tablet Adaptations
- 2-column layouts where appropriate
- Side-by-side charts on analytics
- Sidebar navigation option

---

## Micro-Interactions Checklist

1. **Buttons:** Scale down on click, glow on hover
2. **Inputs:** Border color transition, focus glow
3. **Checkboxes:** Satisfying check animation with ripple
4. **Cards:** Lift on hover with shadow/glow increase
5. **Navigation:** Active indicator slides smoothly
6. **Theme toggle:** Icons rotate/morph during switch
7. **Modals:** Scale + fade in with backdrop blur
8. **Toast notifications:** Slide in from corner with progress bar
9. **Loading states:** Skeleton screens with shimmer effect
10. **Page transitions:** Fade with subtle movement

---

## Accessibility Considerations

- Maintain color contrast ratios (WCAG AA minimum)
- Focus states visible for keyboard navigation
- Reduce motion option respected
- Screen reader friendly labels
- Semantic HTML structure
- Touch targets appropriately sized

---

## Summary of Key Visual Effects

| Effect | Usage | Implementation |
|--------|-------|----------------|
| Neon Glow | Buttons, icons, active states | box-shadow with colored rgba |
| Glassmorphism | Cards, modals, navigation | backdrop-filter: blur() + semi-transparent bg |
| Gradient Text | Headings, CTAs | background-clip: text |
| Gradient Backgrounds | Hero sections, buttons | linear-gradient with purple-blue-cyan |
| Animated Grid/Mesh | Landing, auth backgrounds | CSS or canvas |
| Floating Particles | Background ambiance | Canvas particles or CSS animations |
| Smooth Transitions | All interactive elements | Framer Motion or CSS transitions |

---

## Final Notes

**DO NOT CHANGE:**
- Any existing functionality
- Data structures
- API calls
- State management logic
- Authentication flow

**ONLY UPDATE:**
- CSS/Tailwind classes
- Component visual structure (keeping same elements)
- Add Framer Motion animations
- Apply new color variables
- Add icons where appropriate
- Implement theme toggle functionality (CSS variables based)

**PRESERVE ALL DATA** by ensuring:
- Form submissions work identically
- CRUD operations untouched
- Backend communication unchanged
- Local storage/state persistence maintained
