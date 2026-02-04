# Purple Theme Quick Reference Card

**Quick Copy-Paste Guide for Developers**

---

## Color Palette (Copy-Paste Hex Codes)

```typescript
Purple-50:  #FAF5FF  // Lightest - subtle backgrounds
Purple-100: #F3E8FF  // Very light - hover backgrounds
Purple-200: #E9D5FF  // Light - disabled states
Purple-300: #C4B5FD  // Light accent - borders
Purple-400: #A78BFA  // Accent - secondary CTAs
Purple-500: #8B5CF6  // PRIMARY BRAND COLOR ⭐
Purple-600: #7C3AED  // Button hover
Purple-700: #6D28D9  // Text, active states (AAA ✅)
Purple-800: #5B21B6  // High contrast text (AAA ✅)
Purple-900: #4C1D95  // Darkest
```

---

## Tailwind Classes (Copy-Paste)

### Buttons

```tsx
// Primary Button
className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white px-4 py-2 rounded-lg"

// Secondary Button
className="bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-800 px-4 py-2 rounded-lg"

// Outline Button
className="border-2 border-purple-500 text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg"
```

### Cards

```tsx
// Standard Card
className="bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-md hover:border-purple-300 p-6"

// Interactive Card
className="bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-lg hover:border-purple-500 transition-all cursor-pointer p-6"
```

### Text

```tsx
// Body Text (AAA Compliant)
className="text-gray-800"

// Purple Text (AAA Compliant)
className="text-purple-700"

// Heading (High Contrast)
className="text-purple-800 font-semibold text-2xl"

// Link (AAA Compliant)
className="text-purple-700 hover:text-purple-500 underline underline-offset-2"
```

### Focus States

```tsx
// Custom Focus Ring
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
```

---

## TypeScript Import

```typescript
import { purpleColors, semanticColors, tailwindClasses } from '@/styles/colors';

// Use hex colors
const primary = purpleColors.purple500; // '#8B5CF6'

// Use semantic tokens
const button = semanticColors.primary; // '#8B5CF6'

// Use pre-defined classes
<button className={tailwindClasses.buttonPrimary}>Click Me</button>
```

---

## CSS Variables (Copy-Paste)

```css
/* Purple Scale */
var(--purple-50)
var(--purple-100)
var(--purple-200)
var(--purple-300)
var(--purple-400)
var(--purple-500)  /* PRIMARY */
var(--purple-600)
var(--purple-700)
var(--purple-800)
var(--purple-900)

/* Semantic Tokens */
var(--primary)              /* Purple-500 */
var(--primary-foreground)   /* White */
var(--secondary)            /* Purple-100 */
var(--accent)               /* Purple-400 */
var(--ring)                 /* Focus ring */
```

---

## Contrast Rules (Copy-Paste)

```tsx
✅ DO: Use purple-700 or purple-800 for body text on white
✅ DO: Use purple-500 with white text for buttons
✅ DO: Use purple-700 for links (AAA compliant)
✅ DO: Add underline to links for accessibility

❌ DON'T: Use purple-500 or lighter for body text (insufficient contrast)
❌ DON'T: Use purple text on purple backgrounds (poor contrast)
❌ DON'T: Remove focus outlines (breaks keyboard navigation)
```

---

## Component Examples (Copy-Paste)

### Hero Section Button

```tsx
<button className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
  Get Started
</button>
```

### Quick-Action Card

```tsx
<div className="bg-white border border-purple-200 rounded-lg shadow-sm hover:shadow-lg hover:border-purple-500 transition-all cursor-pointer p-6">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
      <IconComponent className="text-purple-700 w-6 h-6" />
    </div>
    <div>
      <h3 className="text-purple-800 font-semibold text-lg">Card Title</h3>
      <p className="text-gray-600 text-sm">Card description</p>
    </div>
  </div>
</div>
```

### Link with Icon

```tsx
<a href="#" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-500 underline underline-offset-2">
  <span>Learn More</span>
  <ArrowRight className="w-4 h-4" />
</a>
```

### Input Field

```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 outline-none"
  placeholder="Enter text..."
/>
```

---

## Accessibility Checklist (Copy-Paste)

```markdown
- [ ] All text meets 7:1 contrast ratio (use purple-700+ for text)
- [ ] All buttons have visible focus states (purple-500 outline)
- [ ] All links have underline decoration
- [ ] All interactive elements are keyboard navigable (Tab key)
- [ ] All icons have accessible labels (aria-label or sr-only text)
- [ ] Animations respect prefers-reduced-motion
```

---

## Chart Colors (Copy-Paste)

```typescript
// For Recharts or other chart libraries
const chartColors = [
  '#8B5CF6', // purple-500
  '#A78BFA', // purple-400
  '#6D28D9', // purple-700
  '#C4B5FD', // purple-300
  '#5B21B6', // purple-800
];
```

---

## Dark Mode (Copy-Paste)

```tsx
<div className="dark">
  {/* Primary color automatically becomes purple-400 in dark mode */}
  <button className="bg-primary text-primary-foreground">
    Dark Mode Button
  </button>
</div>
```

---

## Files to Reference

- **Full Documentation**: `styles/THEME-README.md`
- **Color Constants**: `styles/colors.ts`
- **Global Styles**: `app/globals.css`
- **Sign-Off Report**: `THEME-SIGN-OFF.md`
