# Typography Patterns

Text styling, hierarchy, and readability patterns.

## Heading Hierarchy

### Standard Headings

```tsx
<h1 className="text-4xl font-bold tracking-tight">Page Title</h1>
<h2 className="text-3xl font-semibold tracking-tight">Section Title</h2>
<h3 className="text-2xl font-semibold">Subsection Title</h3>
<h4 className="text-xl font-semibold">Heading 4</h4>
<h5 className="text-lg font-medium">Heading 5</h5>
<h6 className="text-base font-medium">Heading 6</h6>
```

### Responsive Headings

```tsx
// Hero heading - scales with viewport
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
  Welcome to Our Platform
</h1>

// Page heading
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Dashboard
</h1>

// Section heading
<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">
  Recent Activity
</h2>
```

### Heading with Description

```tsx
<div className="space-y-1">
  <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
  <p className="text-muted-foreground">
    Manage your account settings and preferences.
  </p>
</div>

// Card header pattern
<div className="space-y-1.5">
  <h3 className="text-lg font-semibold leading-none tracking-tight">
    Card Title
  </h3>
  <p className="text-sm text-muted-foreground">
    Card description goes here.
  </p>
</div>
```

## Body Text

### Paragraph Styles

```tsx
// Standard paragraph
<p className="text-base text-foreground leading-7">
  Body text with comfortable line height for reading.
</p>

// Muted paragraph
<p className="text-sm text-muted-foreground">
  Secondary or helper text with reduced emphasis.
</p>

// Large paragraph (intro text)
<p className="text-lg text-muted-foreground leading-8">
  Introduction or lead paragraph with larger size.
</p>

// Small text
<p className="text-sm text-muted-foreground">
  Small print, captions, or metadata.
</p>

// Extra small
<p className="text-xs text-muted-foreground">
  Very small text for timestamps, etc.
</p>
```

### Text Colors

```tsx
// Primary text (default)
<p className="text-foreground">Primary text color</p>

// Muted/Secondary
<p className="text-muted-foreground">Muted text for less emphasis</p>

// Destructive
<p className="text-destructive">Error or warning text</p>

// Success (custom or semantic)
<p className="text-green-600 dark:text-green-400">Success message</p>

// Link color
<a href="#" className="text-primary hover:underline">Link text</a>
```

## Text Formatting

### Font Weight

```tsx
<p className="font-normal">Normal weight (400)</p>
<p className="font-medium">Medium weight (500)</p>
<p className="font-semibold">Semibold weight (600)</p>
<p className="font-bold">Bold weight (700)</p>
```

### Text Transforms

```tsx
<p className="uppercase tracking-wider text-sm">Uppercase Label</p>
<p className="lowercase">Lowercase Text</p>
<p className="capitalize">capitalize each word</p>
<p className="normal-case">Normal Case</p>
```

### Text Decoration

```tsx
<p className="underline">Underlined text</p>
<p className="line-through">Strikethrough text</p>
<p className="no-underline">Remove underline</p>
<a href="#" className="underline-offset-4 hover:underline">
  Link with offset underline
</a>
```

## Text Alignment

```tsx
<p className="text-left">Left aligned (default)</p>
<p className="text-center">Center aligned</p>
<p className="text-right">Right aligned</p>
<p className="text-justify">Justified text spreads evenly</p>

// Responsive alignment
<h1 className="text-center md:text-left">
  Centered on mobile, left on desktop
</h1>
```

## Line Height & Spacing

### Line Height

```tsx
<p className="leading-none">Leading none (1)</p>
<p className="leading-tight">Leading tight (1.25)</p>
<p className="leading-snug">Leading snug (1.375)</p>
<p className="leading-normal">Leading normal (1.5)</p>
<p className="leading-relaxed">Leading relaxed (1.625)</p>
<p className="leading-loose">Leading loose (2)</p>

// Fixed line height
<p className="leading-6">Fixed 24px line height</p>
<p className="leading-7">Fixed 28px line height</p>
<p className="leading-8">Fixed 32px line height</p>
```

### Letter Spacing

```tsx
<p className="tracking-tighter">Tighter letter spacing</p>
<p className="tracking-tight">Tight letter spacing</p>
<p className="tracking-normal">Normal letter spacing</p>
<p className="tracking-wide">Wide letter spacing</p>
<p className="tracking-wider">Wider letter spacing</p>
<p className="tracking-widest">Widest letter spacing</p>

// Common pattern: uppercase with wide tracking
<span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
  Category Label
</span>
```

## Text Overflow

### Truncation

```tsx
// Single line truncation
<p className="truncate">
  This very long text will be truncated with an ellipsis when it overflows.
</p>

// Multi-line truncation (line clamp)
<p className="line-clamp-2">
  This text will show maximum 2 lines and then be truncated
  with an ellipsis. Great for card descriptions.
</p>

<p className="line-clamp-3">
  Maximum 3 lines before truncation...
</p>
```

### Word Break

```tsx
// Break long words
<p className="break-words">
  Verylongwordthatneedstobreakverylongwordthatneedstobreak
</p>

// Break all
<p className="break-all">
  Break anywhere if needed
</p>

// No wrap
<p className="whitespace-nowrap">
  This text will not wrap to a new line.
</p>
```

## Lists

### Unordered List

```tsx
<ul className="list-disc list-inside space-y-1 text-muted-foreground">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>

// Custom bullet style
<ul className="space-y-2">
  {items.map(item => (
    <li key={item} className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      <span>{item}</span>
    </li>
  ))}
</ul>
```

### Ordered List

```tsx
<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
  <li>First step</li>
  <li>Second step</li>
  <li>Third step</li>
</ol>
```

### Description List

```tsx
<dl className="space-y-4">
  <div>
    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
    <dd className="mt-1">John Doe</dd>
  </div>
  <div>
    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
    <dd className="mt-1">john@example.com</dd>
  </div>
  <div>
    <dt className="text-sm font-medium text-muted-foreground">Role</dt>
    <dd className="mt-1">Administrator</dd>
  </div>
</dl>
```

## Code & Monospace

```tsx
// Inline code
<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
  npm install
</code>

// Code block
<pre className="rounded-lg bg-muted p-4 overflow-x-auto">
  <code className="font-mono text-sm">
    {`function hello() {
  console.log("Hello, World!");
}`}
  </code>
</pre>

// Keyboard shortcut
<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
  <span className="text-xs">⌘</span>K
</kbd>
```

## Prose (Article Content)

With `@tailwindcss/typography` plugin:

```tsx
<article className="prose dark:prose-invert lg:prose-lg max-w-none">
  <h1>Article Title</h1>
  <p className="lead">
    This is the lead paragraph with slightly larger text.
  </p>
  <p>
    Regular paragraph text with proper styling applied automatically.
  </p>
  <h2>Section Heading</h2>
  <p>More content here...</p>
  <ul>
    <li>Styled list item</li>
    <li>Another item</li>
  </ul>
  <blockquote>
    A beautifully styled blockquote.
  </blockquote>
  <pre><code>Styled code block</code></pre>
</article>
```

## Common Patterns

### Label + Value

```tsx
// Horizontal
<div className="flex items-center justify-between">
  <span className="text-sm text-muted-foreground">Status</span>
  <span className="font-medium">Active</span>
</div>

// Vertical
<div>
  <p className="text-sm text-muted-foreground">Email</p>
  <p className="font-medium">john@example.com</p>
</div>
```

### Stat Display

```tsx
<div className="text-center">
  <p className="text-3xl font-bold">1,234</p>
  <p className="text-sm text-muted-foreground">Total Users</p>
</div>

// With change indicator
<div>
  <p className="text-2xl font-bold">$12,345</p>
  <p className="text-xs text-green-600">+12% from last month</p>
</div>
```

### Quote

```tsx
<blockquote className="border-l-4 border-primary pl-4 italic">
  <p className="text-lg">"Great product, would recommend!"</p>
  <footer className="mt-2 text-sm text-muted-foreground">
    — John Doe, CEO
  </footer>
</blockquote>
```

### Badge Text

```tsx
<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
  New
</span>

<span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
  Draft
</span>
```
