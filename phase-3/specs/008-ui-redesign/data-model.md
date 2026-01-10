# Data Model: Todo App UI Redesign

## UI State Models

### Theme State
- **Entity**: ThemeState
- **Fields**:
  - theme: "light" | "dark"
  - isTransitioning: boolean
  - persistedTheme: "light" | "dark"
- **Validation**: theme must be one of the allowed values
- **State transitions**: light ↔ dark with smooth transition

### Animation State
- **Entity**: AnimationState
- **Fields**:
  - isActive: boolean
  - animationType: string
  - animationProps: object
- **Validation**: animationType must be a valid Framer Motion animation
- **State transitions**: enabled ↔ disabled based on user preferences

## Component Data Models

### Glass Card Component
- **Entity**: GlassCardProps
- **Fields**:
  - children: ReactNode
  - className: string (optional)
  - blurIntensity: number (default: 20)
  - borderOpacity: number (default: 0.08)
  - gradientIntensity: number (optional)
- **Validation**: blurIntensity between 10-40px, borderOpacity between 0-1

### Neon Button Component
- **Entity**: NeonButtonProps
- **Fields**:
  - children: ReactNode
  - variant: "primary" | "secondary" | "ghost"
  - size: "sm" | "md" | "lg"
  - glowColor: string
  - isLoading: boolean
  - disabled: boolean
- **Validation**: variant and size must be from allowed values

### Icon Props
- **Entity**: StyledIconProps
- **Fields**:
  - icon: LucideIcon
  - size: number (default: 20)
  - glowIntensity: number (default: 8)
  - glowColor: string (default: neon-purple)
- **Validation**: size must be positive, glowIntensity between 0-20

## Theme Configuration
- **Entity**: ThemeConfig
- **Fields**:
  - colors: object (CSS variables mapping)
  - typography: object (font sizes, families)
  - shadows: object (glow effects, standard shadows)
  - animations: object (motion presets)
- **Validation**: All values must be valid CSS values

## Responsive Configuration
- **Entity**: ResponsiveConfig
- **Fields**:
  - breakpoints: { mobile: number, tablet: number, desktop: number, wide: number }
  - mobileFirst: boolean (default: true)
- **Validation**: Breakpoint values must be in ascending order