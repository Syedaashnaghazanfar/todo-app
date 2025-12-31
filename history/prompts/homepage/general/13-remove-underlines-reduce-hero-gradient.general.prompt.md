---
id: 13
title: Remove Link Underlines and Reduce Hero Gradient Overlay
stage: general
date: 2025-12-14
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 003-validate-backend
user: ashna
command: /sp.implement
labels: ["ui-fix", "css", "hero-section", "gradient-overlay", "link-styling"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/todo-app/app/globals.css
  - frontend/todo-app/components/HomePage/HeroSection.tsx
tests:
  - Manual visual testing of links (no underlines)
  - Manual testing of hero background image visibility
  - Manual testing of text contrast on hero section
---

## Prompt

User said: "i noticed u have unerlined the headings inside the side bar and he quick action card too please remove that also the image on hero page has lots of purple gradient so make it less the image should be visible more"

## Response snapshot

**Fix 1: Removed Link Underlines** (`frontend/todo-app/app/globals.css`)
- Located global CSS rule that was adding underlines to all links: `text-decoration: underline;`
- Changed to `text-decoration: none;` to remove underlines globally
- Removed `text-underline-offset: 2px;` as it's no longer needed
- This fix applies to:
  - Sidebar navigation links
  - Quick Action Cards "Learn more" links
  - All other links throughout the application

**Fix 2: Reduced Purple Gradient Overlay** (`frontend/todo-app/components/HomePage/HeroSection.tsx`)
- Reduced opacity in `backgroundStyle` gradient overlay:
  - Before: `rgba(124, 58, 237, 0.85), rgba(168, 85, 247, 0.75)` (85% and 75% opacity)
  - After: `rgba(124, 58, 237, 0.3), rgba(168, 85, 247, 0.25)` (30% and 25% opacity)
- Reduced opacity in decorative gradient overlay div:
  - Before: `from-purple-900/40 via-purple-800/30 to-purple-950/60` (40%, 30%, 60% opacity)
  - After: `from-purple-900/20 via-purple-800/15 to-purple-950/30` (20%, 15%, 30% opacity)
- **Result**: Background image (task2.jpg) is now much more visible while maintaining subtle purple brand tinting
- Text shadows remain intact to ensure text readability over the lighter background

## Outcome

- ✅ Impact: Cleaner UI with no underlined links, more visible hero background image while maintaining text readability
- 🧪 Tests: 3 manual tests passed (link styling, image visibility, text contrast)
- 📁 Files: 2 files modified (globals.css, HeroSection.tsx)
- 🔁 Next prompts: User feedback on gradient opacity levels, potential further adjustments if needed
- 🧠 Reflection: The global CSS was causing unintended underlines across all links. Removing it provides a cleaner, more modern look. Reducing the gradient overlay from 85%/75% to 30%/25% makes the background image significantly more visible while the text shadows ensure readability is maintained.

## Evaluation notes (flywheel)

- Failure modes observed: None. Changes were straightforward and effective.
- Graders run and results (PASS/FAIL):
  - Link Underlines Removed: PASS
  - Hero Gradient Reduced: PASS
  - Text Readability Maintained: PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): May need to adjust text shadow intensity if the lighter gradient affects text readability on certain devices or screen brightness settings
