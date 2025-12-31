# Layout Patterns

Common layout patterns with Flexbox and Grid.

## Flexbox Layouts

### Center Everything

```tsx
// Center horizontally and vertically
<div className="flex items-center justify-center h-screen">
  <div>Centered content</div>
</div>

// Center text only
<div className="flex items-center justify-center h-64">
  <p className="text-center">Centered text</p>
</div>
```

### Space Between Items

```tsx
// Header with logo and nav
<header className="flex items-center justify-between px-4 h-16">
  <Logo />
  <nav className="flex gap-4">
    <Link href="/">Home</Link>
    <Link href="/about">About</Link>
  </nav>
</header>

// Card footer with buttons
<div className="flex items-center justify-between pt-4">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>
```

### Equal Width Children

```tsx
// Three equal columns
<div className="flex">
  <div className="flex-1">Column 1</div>
  <div className="flex-1">Column 2</div>
  <div className="flex-1">Column 3</div>
</div>

// With gap
<div className="flex gap-4">
  <div className="flex-1 p-4 border rounded">Column 1</div>
  <div className="flex-1 p-4 border rounded">Column 2</div>
  <div className="flex-1 p-4 border rounded">Column 3</div>
</div>
```

### Fixed + Flexible

```tsx
// Sidebar + Main content
<div className="flex">
  <aside className="w-64 shrink-0 border-r">
    Fixed width sidebar
  </aside>
  <main className="flex-1 p-6">
    Flexible main content
  </main>
</div>

// Input with button
<div className="flex gap-2">
  <input className="flex-1 px-3 py-2 border rounded" />
  <button className="px-4 py-2 bg-primary text-white rounded">
    Submit
  </button>
</div>
```

### Responsive Stack to Row

```tsx
// Stack on mobile, row on tablet+
<div className="flex flex-col md:flex-row gap-4">
  <div className="md:w-1/2">Left column</div>
  <div className="md:w-1/2">Right column</div>
</div>

// Three columns that stack
<div className="flex flex-col lg:flex-row gap-6">
  <div className="lg:flex-1">Feature 1</div>
  <div className="lg:flex-1">Feature 2</div>
  <div className="lg:flex-1">Feature 3</div>
</div>
```

### Wrap Items

```tsx
// Tags that wrap
<div className="flex flex-wrap gap-2">
  {tags.map(tag => (
    <span key={tag} className="px-2 py-1 bg-muted rounded-full text-sm">
      {tag}
    </span>
  ))}
</div>

// Card grid with flex (prefer grid for this)
<div className="flex flex-wrap -mx-2">
  {items.map(item => (
    <div key={item.id} className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4">
      <Card>{item.content}</Card>
    </div>
  ))}
</div>
```

### Vertical Centering

```tsx
// Center icon with text
<div className="flex items-center gap-2">
  <Icon className="h-5 w-5" />
  <span>Label text</span>
</div>

// Avatar with name and email
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarImage src="/avatar.jpg" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <div>
    <p className="font-medium">John Doe</p>
    <p className="text-sm text-muted-foreground">john@example.com</p>
  </div>
</div>
```

## Grid Layouts

### Basic Grid

```tsx
// 3 columns
<div className="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// 4 columns
<div className="grid grid-cols-4 gap-6">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Responsive Grid

```tsx
// 1 → 2 → 3 → 4 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// 1 → 2 → 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {features.map(feature => (
    <FeatureCard key={feature.id} {...feature} />
  ))}
</div>
```

### Auto-Fill Grid

```tsx
// As many as fit, minimum 250px each
<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>

// Auto-fit (stretches to fill)
<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Grid with Spanning

```tsx
// Featured item spans 2 columns
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2">Featured (spans 2)</div>
  <div>Regular</div>
  <div>Regular</div>
  <div>Regular</div>
  <div>Regular</div>
</div>

// Full width item
<div className="grid grid-cols-4 gap-4">
  <div className="col-span-full">Full width header</div>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### Dashboard Grid

```tsx
// Stats row + main content + sidebar
<div className="grid grid-cols-12 gap-6">
  {/* Stats - full width */}
  <div className="col-span-12">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Users" value="1,234" />
      <StatCard title="Revenue" value="$12,345" />
      <StatCard title="Orders" value="456" />
      <StatCard title="Conversion" value="2.4%" />
    </div>
  </div>

  {/* Main content */}
  <div className="col-span-12 lg:col-span-8">
    <Card>
      <CardHeader>
        <CardTitle>Main Content</CardTitle>
      </CardHeader>
      <CardContent>
        Chart or table here
      </CardContent>
    </Card>
  </div>

  {/* Sidebar */}
  <div className="col-span-12 lg:col-span-4">
    <Card>
      <CardHeader>
        <CardTitle>Sidebar</CardTitle>
      </CardHeader>
      <CardContent>
        Secondary content
      </CardContent>
    </Card>
  </div>
</div>
```

## Page Layouts

### Sticky Header

```tsx
<div className="min-h-screen">
  {/* Sticky header */}
  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
    <div className="container flex h-14 items-center">
      <Logo />
      <Navigation />
    </div>
  </header>

  {/* Main content */}
  <main className="container py-6">
    Content here
  </main>
</div>
```

### Fixed Sidebar

```tsx
<div className="flex min-h-screen">
  {/* Fixed sidebar */}
  <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
    <div className="flex h-16 items-center border-b px-6">
      <Logo />
    </div>
    <nav className="p-4">
      Navigation items
    </nav>
  </aside>

  {/* Main content with left margin */}
  <main className="flex-1 ml-64">
    <div className="container py-6">
      Content here
    </div>
  </main>
</div>
```

### Sticky Sidebar

```tsx
<div className="container flex gap-8 py-6">
  {/* Sticky sidebar */}
  <aside className="hidden lg:block w-64 shrink-0">
    <div className="sticky top-20">
      <nav className="space-y-2">
        <Link href="#section-1">Section 1</Link>
        <Link href="#section-2">Section 2</Link>
        <Link href="#section-3">Section 3</Link>
      </nav>
    </div>
  </aside>

  {/* Main content */}
  <main className="flex-1 min-w-0">
    <article>Long content here</article>
  </main>
</div>
```

### Holy Grail Layout

```tsx
<div className="flex flex-col min-h-screen">
  {/* Header */}
  <header className="h-16 border-b">Header</header>

  {/* Middle section */}
  <div className="flex flex-1">
    {/* Left sidebar */}
    <aside className="hidden md:block w-64 border-r">
      Left Sidebar
    </aside>

    {/* Main content */}
    <main className="flex-1 p-6">
      Main Content
    </main>

    {/* Right sidebar */}
    <aside className="hidden lg:block w-64 border-l">
      Right Sidebar
    </aside>
  </div>

  {/* Footer */}
  <footer className="h-16 border-t">Footer</footer>
</div>
```

### Full-Height Card

```tsx
<div className="grid md:grid-cols-3 gap-6">
  {/* Cards stretch to match height */}
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle>Card 1</CardTitle>
    </CardHeader>
    <CardContent className="flex-1">
      Short content
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>

  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle>Card 2</CardTitle>
    </CardHeader>
    <CardContent className="flex-1">
      Much longer content that makes this card taller than the others
      but all cards will still have the same height thanks to flexbox.
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>

  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle>Card 3</CardTitle>
    </CardHeader>
    <CardContent className="flex-1">
      Medium content
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>
</div>
```

### Container Centering

```tsx
// Standard container
<div className="container mx-auto px-4">
  Content centered with max-width
</div>

// Custom max-width
<div className="max-w-4xl mx-auto px-4">
  Narrower content area
</div>

// Prose width (optimal reading)
<div className="max-w-prose mx-auto px-4">
  Article text at ~65 characters per line
</div>
```
