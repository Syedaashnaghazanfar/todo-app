# Dark Mode Reference

Implementing dark mode with Tailwind CSS.

## Dark Mode Strategies

### Class Strategy (Recommended)

Toggle dark mode by adding/removing `dark` class on the `<html>` element.

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

```tsx
// Usage
<div className="bg-white dark:bg-slate-900">
  <p className="text-slate-900 dark:text-slate-100">
    Content adapts to theme
  </p>
</div>
```

### Media Strategy

Follows system preference automatically using `prefers-color-scheme`.

```js
// tailwind.config.js
module.exports = {
  darkMode: 'media', // or remove (media is default)
  // ...
}
```

### Selector Strategy (v3.4+)

Custom selector for more control:

```js
// tailwind.config.js
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  // ...
}
```

## Theme Toggle Implementation

### Simple Toggle (Class Strategy)

```tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  function toggleTheme() {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### With System Preference (next-themes)

```tsx
// Install: npm install next-themes

// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// components/theme-toggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Flash Prevention Script

Add to `<head>` to prevent flash of wrong theme:

```tsx
// app/layout.tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          const theme = localStorage.getItem('theme');
          if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          }
        })();
      `,
    }}
  />
</head>
```

## Dark Mode Utilities

### Basic Patterns

```tsx
// Background
<div className="bg-white dark:bg-slate-950" />
<div className="bg-slate-50 dark:bg-slate-900" />
<div className="bg-slate-100 dark:bg-slate-800" />

// Text
<p className="text-slate-900 dark:text-slate-100" />
<p className="text-slate-700 dark:text-slate-300" />
<p className="text-slate-500 dark:text-slate-400" />

// Borders
<div className="border-slate-200 dark:border-slate-700" />
<div className="border-slate-300 dark:border-slate-600" />

// Shadows (often remove in dark mode)
<div className="shadow-lg dark:shadow-none" />
<div className="shadow-md dark:shadow-slate-900/50" />
```

### Complete Component Example

```tsx
<div className="
  bg-white dark:bg-slate-900
  border border-slate-200 dark:border-slate-700
  rounded-lg
  shadow-sm dark:shadow-none
  p-6
">
  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
    Card Title
  </h2>
  <p className="mt-2 text-slate-600 dark:text-slate-400">
    Card description text that adapts to the current theme.
  </p>
  <div className="mt-4 flex gap-2">
    <button className="
      px-4 py-2 rounded-md
      bg-slate-900 dark:bg-white
      text-white dark:text-slate-900
      hover:bg-slate-800 dark:hover:bg-slate-100
    ">
      Primary Action
    </button>
    <button className="
      px-4 py-2 rounded-md
      border border-slate-300 dark:border-slate-600
      text-slate-700 dark:text-slate-300
      hover:bg-slate-50 dark:hover:bg-slate-800
    ">
      Secondary
    </button>
  </div>
</div>
```

## CSS Variables for Theming

### shadcn/ui Approach

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### Using CSS Variables

```tsx
// With CSS variables, no dark: prefix needed!
<div className="bg-background text-foreground" />
<div className="bg-card text-card-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="border-border" />
```

## Color Scheme Property

```css
/* Tells browser to use dark scrollbars, form controls, etc. */
@layer base {
  :root {
    color-scheme: light;
  }

  .dark {
    color-scheme: dark;
  }
}
```

## Testing Dark Mode

### Browser DevTools

1. Open DevTools → Three dots menu → More tools → Rendering
2. Find "Emulate CSS media feature prefers-color-scheme"
3. Select "prefers-color-scheme: dark"

### Or toggle class manually

```js
// In browser console
document.documentElement.classList.toggle('dark')
```

## Best Practices

1. **Use CSS variables**: Easier to maintain than `dark:` on every element
2. **Test both themes**: Always verify both light and dark appearances
3. **Consider contrast**: Dark mode needs different contrast ratios
4. **Reduce shadows**: Heavy shadows look unnatural in dark mode
5. **Mind your images**: Some images may need different variants
6. **Use semantic colors**: `bg-background` instead of `bg-white dark:bg-slate-900`
