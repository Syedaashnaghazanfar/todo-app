# Tailwind CSS Utilities Reference

Complete reference for core utility classes.

## Layout

### Display

```tsx
// Display types
<div className="block" />      // display: block
<div className="inline-block" />
<div className="inline" />
<div className="flex" />       // display: flex
<div className="inline-flex" />
<div className="grid" />       // display: grid
<div className="hidden" />     // display: none
<div className="contents" />   // display: contents
```

### Flexbox

```tsx
// Direction
<div className="flex-row" />        // default
<div className="flex-row-reverse" />
<div className="flex-col" />
<div className="flex-col-reverse" />

// Wrap
<div className="flex-wrap" />
<div className="flex-nowrap" />
<div className="flex-wrap-reverse" />

// Flex grow/shrink
<div className="flex-1" />     // flex: 1 1 0%
<div className="flex-auto" />  // flex: 1 1 auto
<div className="flex-initial" /> // flex: 0 1 auto
<div className="flex-none" />  // flex: none

<div className="grow" />       // flex-grow: 1
<div className="grow-0" />     // flex-grow: 0
<div className="shrink" />     // flex-shrink: 1
<div className="shrink-0" />   // flex-shrink: 0

// Justify content (main axis)
<div className="justify-start" />
<div className="justify-end" />
<div className="justify-center" />
<div className="justify-between" />  // space-between
<div className="justify-around" />
<div className="justify-evenly" />

// Align items (cross axis)
<div className="items-start" />
<div className="items-end" />
<div className="items-center" />
<div className="items-baseline" />
<div className="items-stretch" />    // default

// Align self
<div className="self-auto" />
<div className="self-start" />
<div className="self-end" />
<div className="self-center" />
<div className="self-stretch" />

// Gap
<div className="gap-4" />      // gap: 1rem
<div className="gap-x-4" />    // column-gap: 1rem
<div className="gap-y-2" />    // row-gap: 0.5rem
```

### Grid

```tsx
// Grid template columns
<div className="grid-cols-1" />
<div className="grid-cols-2" />
<div className="grid-cols-3" />
<div className="grid-cols-4" />
<div className="grid-cols-6" />
<div className="grid-cols-12" />
<div className="grid-cols-none" />
<div className="grid-cols-subgrid" />

// Grid template rows
<div className="grid-rows-1" />
<div className="grid-rows-2" />
<div className="grid-rows-3" />
<div className="grid-rows-none" />

// Grid column span
<div className="col-span-1" />
<div className="col-span-2" />
<div className="col-span-full" />
<div className="col-start-1" />
<div className="col-end-3" />

// Grid row span
<div className="row-span-1" />
<div className="row-span-2" />
<div className="row-span-full" />

// Auto-fill/fit
<div className="grid-cols-[repeat(auto-fill,minmax(200px,1fr))]" />
<div className="grid-cols-[repeat(auto-fit,minmax(200px,1fr))]" />
```

### Position

```tsx
// Position type
<div className="static" />     // default
<div className="relative" />
<div className="absolute" />
<div className="fixed" />
<div className="sticky" />

// Inset (top, right, bottom, left)
<div className="inset-0" />        // all sides 0
<div className="inset-x-0" />      // left and right 0
<div className="inset-y-0" />      // top and bottom 0
<div className="top-0" />
<div className="right-0" />
<div className="bottom-0" />
<div className="left-0" />
<div className="top-4" />
<div className="right-4" />

// Z-index
<div className="z-0" />
<div className="z-10" />
<div className="z-20" />
<div className="z-30" />
<div className="z-40" />
<div className="z-50" />
<div className="z-auto" />
```

## Spacing

### Padding

```tsx
// All sides
<div className="p-0" />
<div className="p-1" />   // 0.25rem = 4px
<div className="p-2" />   // 0.5rem = 8px
<div className="p-4" />   // 1rem = 16px
<div className="p-6" />   // 1.5rem = 24px
<div className="p-8" />   // 2rem = 32px

// Horizontal and Vertical
<div className="px-4" />  // padding-left + padding-right
<div className="py-4" />  // padding-top + padding-bottom

// Individual sides
<div className="pt-4" />  // padding-top
<div className="pr-4" />  // padding-right
<div className="pb-4" />  // padding-bottom
<div className="pl-4" />  // padding-left

// Start/End (RTL support)
<div className="ps-4" />  // padding-inline-start
<div className="pe-4" />  // padding-inline-end
```

### Margin

```tsx
// All sides
<div className="m-0" />
<div className="m-4" />
<div className="m-auto" />  // margin: auto

// Horizontal and Vertical
<div className="mx-4" />
<div className="my-4" />
<div className="mx-auto" /> // center horizontally

// Individual sides
<div className="mt-4" />
<div className="mr-4" />
<div className="mb-4" />
<div className="ml-4" />

// Negative margins
<div className="-m-4" />
<div className="-mt-4" />
<div className="-mx-4" />

// Start/End
<div className="ms-4" />
<div className="me-4" />
```

### Space Between

```tsx
// Space between children (flex/grid)
<div className="space-x-4" /> // horizontal space
<div className="space-y-4" /> // vertical space

// Reverse space (for flex-row-reverse)
<div className="space-x-reverse" />
<div className="space-y-reverse" />
```

## Sizing

### Width

```tsx
// Fixed widths
<div className="w-0" />
<div className="w-1" />    // 0.25rem
<div className="w-4" />    // 1rem
<div className="w-8" />    // 2rem
<div className="w-16" />   // 4rem
<div className="w-32" />   // 8rem
<div className="w-64" />   // 16rem
<div className="w-96" />   // 24rem

// Fractional widths
<div className="w-1/2" />  // 50%
<div className="w-1/3" />  // 33.333%
<div className="w-2/3" />  // 66.667%
<div className="w-1/4" />  // 25%
<div className="w-3/4" />  // 75%

// Viewport and special
<div className="w-full" />   // 100%
<div className="w-screen" /> // 100vw
<div className="w-min" />    // min-content
<div className="w-max" />    // max-content
<div className="w-fit" />    // fit-content
<div className="w-auto" />   // auto

// Arbitrary value
<div className="w-[200px]" />
<div className="w-[50vw]" />
```

### Height

```tsx
// Fixed heights
<div className="h-0" />
<div className="h-4" />
<div className="h-8" />
<div className="h-16" />
<div className="h-32" />
<div className="h-64" />

// Screen/viewport
<div className="h-full" />    // 100%
<div className="h-screen" />  // 100vh
<div className="h-svh" />     // 100svh (small viewport)
<div className="h-lvh" />     // 100lvh (large viewport)
<div className="h-dvh" />     // 100dvh (dynamic viewport)

// Min/Max height
<div className="min-h-0" />
<div className="min-h-full" />
<div className="min-h-screen" />
<div className="min-h-[500px]" />

<div className="max-h-full" />
<div className="max-h-screen" />
<div className="max-h-[80vh]" />
```

### Max Width

```tsx
<div className="max-w-xs" />   // 20rem = 320px
<div className="max-w-sm" />   // 24rem = 384px
<div className="max-w-md" />   // 28rem = 448px
<div className="max-w-lg" />   // 32rem = 512px
<div className="max-w-xl" />   // 36rem = 576px
<div className="max-w-2xl" />  // 42rem = 672px
<div className="max-w-3xl" />  // 48rem = 768px
<div className="max-w-4xl" />  // 56rem = 896px
<div className="max-w-5xl" />  // 64rem = 1024px
<div className="max-w-6xl" />  // 72rem = 1152px
<div className="max-w-7xl" />  // 80rem = 1280px
<div className="max-w-full" />
<div className="max-w-prose" /> // 65ch (optimal reading)
<div className="max-w-screen-sm" /> // 640px
<div className="max-w-screen-md" /> // 768px
<div className="max-w-screen-lg" /> // 1024px
```

## Typography

### Font Size

```tsx
<p className="text-xs" />     // 0.75rem, line-height: 1rem
<p className="text-sm" />     // 0.875rem, line-height: 1.25rem
<p className="text-base" />   // 1rem, line-height: 1.5rem
<p className="text-lg" />     // 1.125rem, line-height: 1.75rem
<p className="text-xl" />     // 1.25rem, line-height: 1.75rem
<p className="text-2xl" />    // 1.5rem, line-height: 2rem
<p className="text-3xl" />    // 1.875rem, line-height: 2.25rem
<p className="text-4xl" />    // 2.25rem, line-height: 2.5rem
<p className="text-5xl" />    // 3rem, line-height: 1
<p className="text-6xl" />    // 3.75rem, line-height: 1
<p className="text-7xl" />    // 4.5rem, line-height: 1
<p className="text-8xl" />    // 6rem, line-height: 1
<p className="text-9xl" />    // 8rem, line-height: 1
```

### Font Weight

```tsx
<p className="font-thin" />       // 100
<p className="font-extralight" /> // 200
<p className="font-light" />      // 300
<p className="font-normal" />     // 400
<p className="font-medium" />     // 500
<p className="font-semibold" />   // 600
<p className="font-bold" />       // 700
<p className="font-extrabold" />  // 800
<p className="font-black" />      // 900
```

### Line Height

```tsx
<p className="leading-none" />    // 1
<p className="leading-tight" />   // 1.25
<p className="leading-snug" />    // 1.375
<p className="leading-normal" />  // 1.5
<p className="leading-relaxed" /> // 1.625
<p className="leading-loose" />   // 2
<p className="leading-6" />       // 1.5rem
```

### Letter Spacing

```tsx
<p className="tracking-tighter" /> // -0.05em
<p className="tracking-tight" />   // -0.025em
<p className="tracking-normal" />  // 0
<p className="tracking-wide" />    // 0.025em
<p className="tracking-wider" />   // 0.05em
<p className="tracking-widest" />  // 0.1em
```

### Text Alignment

```tsx
<p className="text-left" />
<p className="text-center" />
<p className="text-right" />
<p className="text-justify" />
<p className="text-start" />
<p className="text-end" />
```

### Text Transform

```tsx
<p className="uppercase" />
<p className="lowercase" />
<p className="capitalize" />
<p className="normal-case" />
```

### Text Overflow

```tsx
<p className="truncate" />         // overflow: hidden, text-overflow: ellipsis, white-space: nowrap
<p className="text-ellipsis" />    // text-overflow: ellipsis
<p className="text-clip" />        // text-overflow: clip
<p className="line-clamp-1" />     // 1 line then ellipsis
<p className="line-clamp-2" />     // 2 lines then ellipsis
<p className="line-clamp-3" />     // 3 lines then ellipsis
```

## Colors

### Text Color

```tsx
<p className="text-inherit" />
<p className="text-current" />
<p className="text-transparent" />
<p className="text-black" />
<p className="text-white" />

// Slate scale
<p className="text-slate-50" />
<p className="text-slate-100" />
<p className="text-slate-200" />
<p className="text-slate-300" />
<p className="text-slate-400" />
<p className="text-slate-500" />
<p className="text-slate-600" />
<p className="text-slate-700" />
<p className="text-slate-800" />
<p className="text-slate-900" />
<p className="text-slate-950" />

// With opacity
<p className="text-slate-500/50" />  // 50% opacity
<p className="text-slate-500/75" />  // 75% opacity
```

### Background Color

```tsx
<div className="bg-inherit" />
<div className="bg-transparent" />
<div className="bg-black" />
<div className="bg-white" />
<div className="bg-slate-100" />
<div className="bg-slate-900" />

// With opacity
<div className="bg-black/50" />    // 50% opacity
<div className="bg-white/80" />    // 80% opacity
```

### Border Color

```tsx
<div className="border-transparent" />
<div className="border-black" />
<div className="border-white" />
<div className="border-slate-200" />
<div className="border-slate-800" />
```

## Borders

### Border Width

```tsx
<div className="border" />     // 1px
<div className="border-0" />   // 0px
<div className="border-2" />   // 2px
<div className="border-4" />   // 4px
<div className="border-8" />   // 8px

// Individual sides
<div className="border-t" />   // border-top
<div className="border-r" />   // border-right
<div className="border-b" />   // border-bottom
<div className="border-l" />   // border-left
<div className="border-x" />   // left + right
<div className="border-y" />   // top + bottom
```

### Border Radius

```tsx
<div className="rounded-none" />   // 0
<div className="rounded-sm" />     // 0.125rem
<div className="rounded" />        // 0.25rem
<div className="rounded-md" />     // 0.375rem
<div className="rounded-lg" />     // 0.5rem
<div className="rounded-xl" />     // 0.75rem
<div className="rounded-2xl" />    // 1rem
<div className="rounded-3xl" />    // 1.5rem
<div className="rounded-full" />   // 9999px

// Individual corners
<div className="rounded-t-lg" />   // top corners
<div className="rounded-r-lg" />   // right corners
<div className="rounded-b-lg" />   // bottom corners
<div className="rounded-l-lg" />   // left corners
<div className="rounded-tl-lg" />  // top-left
<div className="rounded-tr-lg" />  // top-right
<div className="rounded-bl-lg" />  // bottom-left
<div className="rounded-br-lg" />  // bottom-right
```

## Effects

### Box Shadow

```tsx
<div className="shadow-sm" />
<div className="shadow" />
<div className="shadow-md" />
<div className="shadow-lg" />
<div className="shadow-xl" />
<div className="shadow-2xl" />
<div className="shadow-inner" />
<div className="shadow-none" />
```

### Opacity

```tsx
<div className="opacity-0" />
<div className="opacity-5" />
<div className="opacity-10" />
<div className="opacity-25" />
<div className="opacity-50" />
<div className="opacity-75" />
<div className="opacity-100" />
```

### Ring (Focus Ring)

```tsx
<div className="ring" />        // 3px ring
<div className="ring-0" />
<div className="ring-1" />
<div className="ring-2" />
<div className="ring-4" />
<div className="ring-8" />
<div className="ring-inset" />  // inner ring

// Ring color
<div className="ring-primary" />
<div className="ring-slate-500" />

// Ring offset
<div className="ring-offset-2" />
<div className="ring-offset-4" />
<div className="ring-offset-white" />
```

## Transitions & Animation

### Transition

```tsx
<div className="transition" />       // all properties
<div className="transition-none" />
<div className="transition-all" />
<div className="transition-colors" />
<div className="transition-opacity" />
<div className="transition-shadow" />
<div className="transition-transform" />

// Duration
<div className="duration-75" />   // 75ms
<div className="duration-100" />  // 100ms
<div className="duration-150" />  // 150ms
<div className="duration-200" />  // 200ms
<div className="duration-300" />  // 300ms
<div className="duration-500" />  // 500ms
<div className="duration-700" />  // 700ms
<div className="duration-1000" /> // 1000ms

// Timing function
<div className="ease-linear" />
<div className="ease-in" />
<div className="ease-out" />
<div className="ease-in-out" />

// Delay
<div className="delay-75" />
<div className="delay-100" />
<div className="delay-150" />
```

### Transform

```tsx
// Scale
<div className="scale-0" />
<div className="scale-50" />
<div className="scale-75" />
<div className="scale-90" />
<div className="scale-95" />
<div className="scale-100" />
<div className="scale-105" />
<div className="scale-110" />
<div className="scale-125" />
<div className="scale-150" />

// Rotate
<div className="rotate-0" />
<div className="rotate-1" />
<div className="rotate-2" />
<div className="rotate-3" />
<div className="rotate-6" />
<div className="rotate-12" />
<div className="rotate-45" />
<div className="rotate-90" />
<div className="rotate-180" />
<div className="-rotate-45" />  // negative

// Translate
<div className="translate-x-0" />
<div className="translate-x-4" />
<div className="translate-x-full" />
<div className="-translate-x-4" />
<div className="translate-y-4" />
<div className="-translate-y-full" />
```

### Animation

```tsx
<div className="animate-none" />
<div className="animate-spin" />      // 360deg rotation
<div className="animate-ping" />      // ping effect
<div className="animate-pulse" />     // opacity pulse
<div className="animate-bounce" />    // bounce effect
```
