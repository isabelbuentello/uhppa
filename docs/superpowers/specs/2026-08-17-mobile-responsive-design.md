# Mobile Responsive Design

## Overview

Make every page in the UHPPA app work on mobile, tablet, and small laptop screens. The approach uses CSS media queries in `index.css` with `!important` overrides on inline styles, plus minimal `className` additions to components so CSS can target them. No JS resize listeners, no React re-renders on resize.

## Breakpoints

| Breakpoint | Target | Key Changes |
|---|---|---|
| `≤1024px` | Small laptop | Hero font scales down, nav padding shrinks |
| `≤768px` | Tablet | Grids go to 2 columns, nav becomes hamburger menu |
| `≤480px` | Phone | Single column, minimal padding, card-stack tables |

Everything between breakpoints flows naturally via `fr` units and `maxWidth` containers.

## Implementation Strategy

All responsive rules go in `src/index.css` as media queries. Components get `className` props added to key elements (grids, tables, hero, etc.) so CSS can target them. Component logic does not change — only class names are added.

One exception: the hamburger menu requires a small React state toggle (`menuOpen`) in `App.jsx` to show/hide the mobile nav overlay.

## Navigation Header (`App.jsx`)

**Desktop (>768px):** Current layout — logo left, nav buttons + login right.

**Mobile (≤768px):** Hamburger menu.
- Logo and hamburger icon (☰) stay in the header bar
- Login/logout button stays visible next to hamburger
- Tapping ☰ opens a full-screen overlay with nav links stacked vertically
- Overlay has a close button (×)
- Active page highlighted in the overlay list

**1024px:** Reduce header padding from `48px` to `28px`.

## Home Page (`Home.jsx`)

### Hero Wordmark
- **1024px:** Letter font sizes scale from 240px → 160px
- **768px:** Letters scale to 100px
- **480px:** Letters scale to 60px, margins/padding between letters reduced

### Subtitle + Logo Section
- **Desktop:** 2-column grid (`1.1fr 1fr`, gap 40)
- **≤768px:** Single column stack. Subtitle text first, CTA buttons, socials. Logo/sticky note/stamp section below.

### Feature Cards
- **Desktop:** 4-column grid
- **≤768px:** 2-column grid
- **≤480px:** Single column

### Stats Strip
- **Desktop:** 4-column grid
- **≤768px:** 2×2 grid
- **≤480px:** 2×2 grid, font size 56px → 32px

### Marquee
- No changes needed — already scrolls horizontally.

## Calendar (`Calendar.jsx`)

**Desktop (>768px):** Full 7-column grid with event chips showing title, time, points.

**Mobile (≤768px):** Compact mini-grid.
- 7-column grid stays, but cells shrink to minimum
- Cell `minHeight` drops from 120px to 48px
- Day number only, no event text
- Events shown as small colored dots (4px circles)
- Tapping a day with events opens the existing event modal
- Day headers shorten: `SUN` → `S`, etc.
- Nav buttons (prev/today/next) shrink padding

**≤480px:** Same compact grid, further reduced padding.

## Points Page (`Points.jsx`)

### Stat + Category Layout
- **Desktop:** 2-column grid (`1.2fr 1fr`, gap 40)
- **≤768px:** Single column stack. Stat card on top, category breakdown below.
- **≤480px:** Points total font 130px → 60px. Name font 42px → 24px.

### Action Buttons (check-in, submit missing)
- **≤480px:** Stack vertically instead of side-by-side. Full width.

### Activity Table
- **Desktop:** 4-column grid table
- **≤768px:** Card stack. Each entry becomes a card showing date, event name, points, and status.

## Leaderboard (`Leaderboard.jsx`)

### Podium
- **Desktop:** 3-column grid for top 3
- **≤768px:** Stack vertically. Rank number font 72px → 36px. Card width 160px → full width.

### Rankings Table
- **Desktop:** Grid table (rank, name, points)
- **≤768px:** Card stack.

## Gallery (`Gallery.jsx`)

- **Desktop:** 3-column grid
- **≤768px:** 2-column grid
- **≤480px:** Single column

## Officers (`Officers.jsx`)

- **Desktop:** 3-column polaroid cards
- **≤768px:** 2-column
- **≤480px:** Single column

## Sponsors (`Sponsors.jsx`)

- **Desktop:** 4-column grid
- **≤768px:** 2-column
- **≤480px:** 2-column (logos are small enough)

## Login / SignUp Modals

- **Desktop:** Fixed `width: 460px`
- **All sizes:** Change to `width: 90vw; max-width: 460px`

## Admin Nav (`AdminNav.jsx`)

- Already uses `flexWrap: 'wrap'` — works on all sizes
- **≤480px:** Reduce button padding from `8px 16px` to `6px 10px`, font from 11px to 10px

## Admin Tables (EventEditor, PointsQueue, MemberRoster, OfficerEditor, SponsorEditor)

**Desktop (>768px):** Current grid tables.

**Mobile (≤768px):** Card stack layout.
- Each row becomes a card with key info displayed as label:value pairs
- Action buttons (edit, del, approve, deny) shown at bottom of each card
- Table header row hidden

Each table needs a `className` on the container and rows. CSS hides the header and switches row display from `grid` to `block` on mobile.

## Admin Forms (inline create/edit)

All inline forms use `gridTemplateColumns: '1fr 1fr'`.

- **≤768px:** Switch to single column (`gridTemplateColumns: '1fr'`)

## Gallery Editor (`GalleryEditor.jsx`)

- **Desktop:** 4-column drag grid
- **≤768px:** 2-column
- **≤480px:** 2-column (drag still works with touch via @dnd-kit PointerSensor)

## Global Changes

### Page Container Padding
- **Desktop:** `padding: 28px 48px 80px`
- **≤1024px:** `padding: 28px 28px 60px`
- **≤768px:** `padding: 20px 20px 60px`
- **≤480px:** `padding: 16px 14px 40px`

### SectionHeading Font
- **≤480px:** Title font scales down proportionally (handled by the component's existing sizing, may need override if too large)

## Files Modified

| File | Change |
|---|---|
| `src/index.css` | All media queries added here |
| `src/App.jsx` | Add hamburger menu state + mobile nav overlay + className on header/nav |
| `src/components/Home.jsx` | Add classNames to hero letters, feature grid, stats strip, subtitle grid |
| `src/components/Calendar.jsx` | Add classNames to grid, cells, day headers. Modify Cell to show dots on mobile (needs minor logic: render dots when class is present) |
| `src/components/Points.jsx` | Add classNames to 2-column grid, activity table |
| `src/components/Leaderboard.jsx` | Add classNames to podium grid, rankings table |
| `src/components/Gallery.jsx` | Add className to photo grid |
| `src/components/Officers.jsx` | Add className to card grid |
| `src/components/Sponsors.jsx` | Add className to sponsor grid |
| `src/components/Login.jsx` | Add className to modal container |
| `src/components/SignUp.jsx` | Add className to modal container |
| `src/components/EventEditor.jsx` | Add classNames to table header, rows, form grid |
| `src/components/PointsQueue.jsx` | Add classNames to table header, rows |
| `src/components/MemberRoster.jsx` | Add classNames to table header, rows |
| `src/components/OfficerEditor.jsx` | Add classNames to table header, rows, form grid |
| `src/components/SponsorEditor.jsx` | Add classNames to table header, rows, form grid |
| `src/components/GalleryEditor.jsx` | Add className to photo grid |
| `src/components/AdminNav.jsx` | Add className to container |

## Calendar Mobile Dots

The Calendar `Cell` component needs a small logic addition: when the grid has the mobile class, render colored dots instead of full event chips. This is the one place where component logic changes beyond just adding classNames.

Approach: always render both the full chips and the dots. CSS hides chips and shows dots on mobile, hides dots and shows chips on desktop. No JS resize logic needed.
