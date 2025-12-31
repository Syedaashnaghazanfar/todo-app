# Responsive Design Reference

Tailwind's mobile-first responsive design system.

## Breakpoints

| Prefix | Min-width | CSS Media Query |
|--------|-----------|-----------------|
| (none) | 0px | Default (mobile) |
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

## Mobile-First Approach

Tailwind uses a mobile-first approach. Unprefixed utilities target mobile, and prefixed utilities target larger screens.

```tsx
// Mobile first - starts small, grows larger
<div className="text-sm md:text-base lg:text-lg xl:text-xl">
  Text that grows with screen size
</div>

// Layout changes at breakpoints
<div className="flex flex-col md:flex-row">
  Mobile: stacked | Desktop: side-by-side
</div>

// Grid columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  Responsive grid
</div>
```

## Common Responsive Patterns

### Show/Hide Elements

```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop only content
</div>

// Show on mobile, hide on desktop
<div className="md:hidden">
  Mobile only content
</div>

// Hide on medium screens only
<div className="block md:hidden lg:block">
  Visible except on md screens
</div>
```

### Responsive Navigation

```tsx
// Mobile hamburger + Desktop nav
<header className="flex items-center justify-between">
  <Logo />

  {/* Mobile menu button - hidden on desktop */}
  <button className="md:hidden">
    <Menu className="h-6 w-6" />
  </button>

  {/* Desktop navigation - hidden on mobile */}
  <nav className="hidden md:flex md:gap-6">
    <Link href="/">Home</Link>
    <Link href="/about">About</Link>
    <Link href="/contact">Contact</Link>
  </nav>
</header>
```

### Responsive Grid

```tsx
// 1 column mobile, 2 tablet, 3 desktop, 4 large desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>

// Auto-fill grid (as many as fit)
<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Responsive Typography

```tsx
// Heading sizes
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Responsive Heading
</h1>

// Body text
<p className="text-sm md:text-base lg:text-lg leading-relaxed">
  Body text that adjusts to screen size
</p>

// Line length control
<article className="max-w-prose mx-auto px-4">
  <p>Optimal reading width maintained across all screens</p>
</article>
```

### Responsive Spacing

```tsx
// Padding increases with screen size
<section className="px-4 md:px-8 lg:px-16 xl:px-24">
  Content with responsive horizontal padding
</section>

// Gap increases with screen size
<div className="flex gap-2 md:gap-4 lg:gap-6">
  <Item />
  <Item />
  <Item />
</div>

// Margin adjusts
<div className="mt-8 md:mt-12 lg:mt-16">
  Section with responsive top margin
</div>
```

### Responsive Layout

```tsx
// Sidebar layout
<div className="flex flex-col lg:flex-row">
  {/* Sidebar: full width mobile, fixed width desktop */}
  <aside className="w-full lg:w-64 lg:shrink-0">
    Sidebar
  </aside>

  {/* Main content */}
  <main className="flex-1 p-4 lg:p-8">
    Main content
  </main>
</div>

// Two-column with order change
<div className="flex flex-col md:flex-row">
  <div className="order-2 md:order-1 md:w-1/2">
    First on desktop, second on mobile
  </div>
  <div className="order-1 md:order-2 md:w-1/2">
    Second on desktop, first on mobile
  </div>
</div>
```

### Responsive Card

```tsx
<div className="
  flex flex-col sm:flex-row
  rounded-lg border bg-card
  overflow-hidden
">
  {/* Image: full width mobile, fixed on tablet+ */}
  <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0">
    <img src="/image.jpg" className="w-full h-full object-cover" />
  </div>

  {/* Content */}
  <div className="p-4 sm:p-6">
    <h3 className="text-lg sm:text-xl font-semibold">Card Title</h3>
    <p className="text-sm sm:text-base text-muted-foreground mt-2">
      Card description
    </p>
  </div>
</div>
```

## Container

```tsx
// Centered container with responsive max-width
<div className="container mx-auto px-4">
  Content centered with max-width at each breakpoint
</div>

// Container breakpoints:
// sm: max-width: 640px
// md: max-width: 768px
// lg: max-width: 1024px
// xl: max-width: 1280px
// 2xl: max-width: 1536px
```

## Max-Width Breakpoints

```tsx
// Content width matching screen breakpoints
<div className="max-w-screen-sm" />  // max-width: 640px
<div className="max-w-screen-md" />  // max-width: 768px
<div className="max-w-screen-lg" />  // max-width: 1024px
<div className="max-w-screen-xl" />  // max-width: 1280px
<div className="max-w-screen-2xl" /> // max-width: 1536px
```

## Custom Breakpoints

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
  },
}
```

## Range Breakpoints

```tsx
// Max-width (applies below breakpoint)
<div className="max-md:hidden">
  Hidden below md (768px)
</div>

// Range (between two breakpoints)
<div className="md:max-lg:bg-red-500">
  Red background between md and lg only
</div>
```

## Container Queries

Tailwind v3.4+ supports container queries:

```tsx
// Parent with container context
<div className="@container">
  {/* Child responds to parent width, not viewport */}
  <div className="@md:flex @md:gap-4">
    <div className="@md:w-1/2">Column 1</div>
    <div className="@md:w-1/2">Column 2</div>
  </div>
</div>

// Named containers
<div className="@container/sidebar">
  <div className="@md/sidebar:block">
    Responds to sidebar container width
  </div>
</div>
```

## Print Styles

```tsx
// Print-specific styles
<div className="hidden print:block">
  Only visible when printing
</div>

<div className="print:hidden">
  Hidden when printing
</div>

<header className="bg-primary print:bg-white print:text-black">
  Header adjusts for printing
</header>
```

## Best Practices

1. **Start mobile**: Write mobile styles first, then add larger breakpoints
2. **Use consistent breakpoints**: Stick to the default scale when possible
3. **Test real devices**: Breakpoints are guidelines, test on actual devices
4. **Consider content**: Let content determine breakpoints, not device widths
5. **Minimize breakpoint-specific styles**: Good layouts need fewer overrides
