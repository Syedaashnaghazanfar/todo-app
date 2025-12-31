# Tailwind Customization Reference

Extending and customizing Tailwind CSS.

## Configuration File

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    // Override default theme values
    screens: { /* ... */ },
    colors: { /* ... */ },

    extend: {
      // Extend default theme (recommended)
      colors: { /* ... */ },
      spacing: { /* ... */ },
    },
  },
  plugins: [],
}
```

## Extending Colors

### Add Brand Colors

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Single color
        brand: "#ff6b35",

        // Color with shades
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",  // default
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },

        // Using CSS variables (shadcn approach)
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
    },
  },
}
```

### Using Extended Colors

```tsx
<div className="bg-brand" />
<div className="bg-brand-500" />
<div className="text-brand-700" />
<div className="border-brand-200" />
<div className="ring-brand-500/50" />
```

## Extending Fonts

```js
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },
    },
  },
}
```

### With Next.js Font

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

## Extending Spacing

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",  // 18px
        "5.5": "1.375rem",  // 22px
        "13": "3.25rem",    // 52px
        "15": "3.75rem",    // 60px
        "18": "4.5rem",     // 72px
        "22": "5.5rem",     // 88px
        "128": "32rem",     // 512px
        "144": "36rem",     // 576px
      },
    },
  },
}
```

## Extending Border Radius

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
      },
    },
  },
}
```

## Extending Animations

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
}
```

## Extending Shadows

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgb(59 130 246 / 0.5)",
        "glow-lg": "0 0 40px rgb(59 130 246 / 0.3)",
      },
    },
  },
}
```

## Arbitrary Values

For one-off values without config:

```tsx
// Arbitrary values using square brackets
<div className="w-[237px]" />
<div className="h-[calc(100vh-80px)]" />
<div className="top-[117px]" />
<div className="bg-[#1da1f2]" />
<div className="bg-[rgb(255,0,0)]" />
<div className="bg-[hsl(220,100%,50%)]" />
<div className="text-[22px]" />
<div className="leading-[3rem]" />
<div className="grid-cols-[200px_1fr_200px]" />
<div className="shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]" />

// Arbitrary properties
<div className="[mask-type:luminance]" />
<div className="[--my-variable:20px]" />

// Using CSS variables in arbitrary values
<div className="bg-[var(--brand-color)]" />
<div className="w-[var(--sidebar-width)]" />
```

## Custom Plugins

### Simple Plugin

```js
// tailwind.config.js
const plugin = require("tailwindcss/plugin");

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {
      // Add utilities
      addUtilities({
        ".text-shadow": {
          "text-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
        ".text-shadow-md": {
          "text-shadow": "0 4px 8px rgba(0, 0, 0, 0.12)",
        },
        ".text-shadow-lg": {
          "text-shadow": "0 15px 30px rgba(0, 0, 0, 0.11)",
        },
        ".text-shadow-none": {
          "text-shadow": "none",
        },
      });

      // Add components
      addComponents({
        ".btn": {
          padding: theme("spacing.2") + " " + theme("spacing.4"),
          borderRadius: theme("borderRadius.md"),
          fontWeight: theme("fontWeight.semibold"),
        },
        ".btn-primary": {
          backgroundColor: theme("colors.blue.500"),
          color: theme("colors.white"),
          "&:hover": {
            backgroundColor: theme("colors.blue.600"),
          },
        },
      });
    }),
  ],
}
```

### Using matchUtilities for Dynamic Values

```js
// tailwind.config.js
const plugin = require("tailwindcss/plugin");

module.exports = {
  plugins: [
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    }),
  ],
  theme: {
    textShadow: {
      sm: "0 1px 2px var(--tw-shadow-color)",
      DEFAULT: "0 2px 4px var(--tw-shadow-color)",
      lg: "0 8px 16px var(--tw-shadow-color)",
    },
  },
}
```

## Official Plugins

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require("@tailwindcss/typography"),    // Prose styles
    require("@tailwindcss/forms"),          // Form resets
    require("@tailwindcss/aspect-ratio"),   // Aspect ratio utilities
    require("@tailwindcss/container-queries"), // Container queries
    require("tailwindcss-animate"),         // Animation utilities
  ],
}
```

### Typography Plugin

```tsx
// After installing @tailwindcss/typography
<article className="prose dark:prose-invert lg:prose-lg max-w-none">
  <h1>Article Title</h1>
  <p>Styled paragraph with proper typography.</p>
  <ul>
    <li>Styled list item</li>
  </ul>
  <pre><code>Styled code block</code></pre>
</article>
```

## @apply Directive

Use sparingly for repeated patterns:

```css
/* globals.css */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium;
    @apply transition-colors focus-visible:outline-none focus-visible:ring-2;
    @apply disabled:pointer-events-none disabled:opacity-50;
  }

  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }

  .btn-outline {
    @apply border border-input bg-background hover:bg-accent hover:text-accent-foreground;
  }
}
```

## Presets

Share configuration between projects:

```js
// my-preset.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#ff6b35",
          // ...
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}

// tailwind.config.js
module.exports = {
  presets: [require("./my-preset")],
  // Project-specific config...
}
```

## Important Modifier

Force specificity when needed:

```tsx
<div className="!p-4" />     // !important on padding
<div className="!mt-0" />    // !important on margin-top
```

## Best Practices

1. **Extend, don't override**: Use `theme.extend` to add to defaults
2. **Use CSS variables**: For values that change (themes, dynamic values)
3. **Component abstraction > @apply**: Prefer React components over CSS
4. **Arbitrary values for one-offs**: Don't pollute config with single-use values
5. **Keep plugins focused**: One concern per plugin
