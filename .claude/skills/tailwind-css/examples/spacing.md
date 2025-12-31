# Spacing Patterns

Consistent spacing with margin, padding, and gap utilities.

## Spacing Scale Reference

| Value | Size | Pixels |
|-------|------|--------|
| `0` | 0 | 0px |
| `0.5` | 0.125rem | 2px |
| `1` | 0.25rem | 4px |
| `1.5` | 0.375rem | 6px |
| `2` | 0.5rem | 8px |
| `2.5` | 0.625rem | 10px |
| `3` | 0.75rem | 12px |
| `3.5` | 0.875rem | 14px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `7` | 1.75rem | 28px |
| `8` | 2rem | 32px |
| `9` | 2.25rem | 36px |
| `10` | 2.5rem | 40px |
| `11` | 2.75rem | 44px |
| `12` | 3rem | 48px |
| `14` | 3.5rem | 56px |
| `16` | 4rem | 64px |
| `20` | 5rem | 80px |
| `24` | 6rem | 96px |
| `28` | 7rem | 112px |
| `32` | 8rem | 128px |
| `36` | 9rem | 144px |
| `40` | 10rem | 160px |
| `44` | 11rem | 176px |
| `48` | 12rem | 192px |

## Component Padding

### Card Padding

```tsx
// Standard card padding
<Card className="p-6">
  <CardContent>Content</CardContent>
</Card>

// Smaller card padding
<Card className="p-4">
  <CardContent>Compact content</CardContent>
</Card>

// Card with header and content padding
<Card>
  <CardHeader className="p-6 pb-4">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    Content here
  </CardContent>
</Card>
```

### Button Padding

```tsx
// Standard button
<button className="px-4 py-2">Button</button>

// Small button
<button className="px-3 py-1.5 text-sm">Small</button>

// Large button
<button className="px-6 py-3">Large Button</button>

// Icon button (square)
<button className="p-2">
  <Icon className="h-5 w-5" />
</button>
```

### Input Padding

```tsx
// Standard input
<input className="px-3 py-2 border rounded" />

// With icon (extra left padding)
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <input className="pl-10 pr-3 py-2 border rounded" />
</div>

// Textarea
<textarea className="px-3 py-2 border rounded" rows={4} />
```

## Section Spacing

### Page Sections

```tsx
// Standard section spacing
<section className="py-12 md:py-16 lg:py-20">
  <div className="container">
    Section content
  </div>
</section>

// Smaller section spacing
<section className="py-8 md:py-12">
  <div className="container">
    Content
  </div>
</section>

// Hero section (larger)
<section className="py-20 md:py-28 lg:py-32">
  <div className="container">
    Hero content
  </div>
</section>
```

### Content Sections

```tsx
// Article sections
<article>
  <section className="mb-8">
    <h2 className="text-2xl font-bold mb-4">Section 1</h2>
    <p>Content...</p>
  </section>

  <section className="mb-8">
    <h2 className="text-2xl font-bold mb-4">Section 2</h2>
    <p>Content...</p>
  </section>
</article>
```

## Gap Patterns

### Flex Gap

```tsx
// Horizontal items with gap
<div className="flex gap-4">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
  <Button>Button 3</Button>
</div>

// Smaller gap
<div className="flex gap-2">
  <Badge>Tag 1</Badge>
  <Badge>Tag 2</Badge>
</div>

// Responsive gap
<div className="flex gap-2 md:gap-4 lg:gap-6">
  Items with responsive gap
</div>
```

### Grid Gap

```tsx
// Standard grid gap
<div className="grid grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>

// Different horizontal/vertical gaps
<div className="grid grid-cols-2 gap-x-6 gap-y-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
  <Card>Card 4</Card>
</div>

// Responsive gap
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  Cards with responsive gap
</div>
```

### Space Between

```tsx
// Vertical space between children
<div className="space-y-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>

// Horizontal space between
<div className="flex space-x-4">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</div>

// Form fields spacing
<form className="space-y-6">
  <div className="space-y-2">
    <Label>Email</Label>
    <Input type="email" />
  </div>
  <div className="space-y-2">
    <Label>Password</Label>
    <Input type="password" />
  </div>
  <Button type="submit">Submit</Button>
</form>
```

## Margin Patterns

### Auto Margins

```tsx
// Center horizontally
<div className="mx-auto max-w-md">
  Centered content
</div>

// Push to right
<div className="flex">
  <Logo />
  <nav className="ml-auto">Right-aligned nav</nav>
</div>

// Push to bottom
<div className="flex flex-col h-screen">
  <main className="flex-1">Content</main>
  <footer className="mt-auto">Footer pushed to bottom</footer>
</div>
```

### Negative Margins

```tsx
// Full-bleed image
<article className="px-6">
  <p>Content with padding</p>
  <img
    src="/image.jpg"
    className="-mx-6 my-6 w-[calc(100%+3rem)]"
    alt="Full bleed"
  />
  <p>More content</p>
</article>

// Card that breaks out of container
<div className="px-4">
  <Card className="-mx-4 md:mx-0 rounded-none md:rounded-lg">
    Full-width on mobile, normal on desktop
  </Card>
</div>
```

### Responsive Margins

```tsx
// Increase margin on larger screens
<section className="mt-8 md:mt-12 lg:mt-16">
  Section with responsive top margin
</section>

// Different margins at breakpoints
<div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
  Content with responsive bottom margin
</div>
```

## Form Spacing

### Form Layout

```tsx
<form className="space-y-8">
  {/* Section 1 */}
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Personal Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>First Name</Label>
        <Input />
      </div>
      <div className="space-y-2">
        <Label>Last Name</Label>
        <Input />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Email</Label>
      <Input type="email" />
    </div>
  </div>

  {/* Section 2 */}
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Address</h3>
    <div className="space-y-2">
      <Label>Street Address</Label>
      <Input />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>City</Label>
        <Input />
      </div>
      <div className="space-y-2">
        <Label>State</Label>
        <Input />
      </div>
      <div className="space-y-2">
        <Label>ZIP</Label>
        <Input />
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="flex justify-end gap-4 pt-4 border-t">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

## List Spacing

### Simple List

```tsx
<ul className="space-y-2">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

### List with Dividers

```tsx
<ul className="divide-y">
  <li className="py-4">Item 1</li>
  <li className="py-4">Item 2</li>
  <li className="py-4">Item 3</li>
</ul>

// First and last item adjustments
<ul className="divide-y">
  <li className="py-4 first:pt-0 last:pb-0">Item 1</li>
  <li className="py-4 first:pt-0 last:pb-0">Item 2</li>
  <li className="py-4 first:pt-0 last:pb-0">Item 3</li>
</ul>
```

### Card List

```tsx
<div className="space-y-4">
  {items.map(item => (
    <Card key={item.id} className="p-4">
      <div className="flex items-center gap-4">
        <Avatar />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-sm text-muted-foreground truncate">{item.email}</p>
        </div>
        <Button size="sm">View</Button>
      </div>
    </Card>
  ))}
</div>
```

## Consistent Spacing System

### Recommended Scale

| Use Case | Mobile | Desktop |
|----------|--------|---------|
| Component padding | `p-4` | `p-6` |
| Card gap | `gap-4` | `gap-6` |
| Section padding | `py-8` | `py-16` |
| Form field gap | `space-y-4` | `space-y-6` |
| Text block margin | `mb-4` | `mb-6` |
| Container padding | `px-4` | `px-6` |

### Example System

```tsx
// Consistent spacing throughout
const spacing = {
  page: "py-8 md:py-12 lg:py-16",
  section: "py-8 md:py-12",
  container: "px-4 md:px-6",
  card: "p-4 md:p-6",
  stack: "space-y-4 md:space-y-6",
  grid: "gap-4 md:gap-6",
  inline: "gap-2 md:gap-4",
};

// Usage
<section className={spacing.section}>
  <div className={`container ${spacing.container}`}>
    <div className={`grid grid-cols-3 ${spacing.grid}`}>
      <Card className={spacing.card}>
        <div className={spacing.stack}>
          Content
        </div>
      </Card>
    </div>
  </div>
</section>
```
