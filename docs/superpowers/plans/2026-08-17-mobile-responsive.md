# Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page in the UHPPA app fully responsive across phone (≤480px), tablet (≤768px), and small laptop (≤1024px) screens.

**Architecture:** CSS media queries in `index.css` override inline styles via `!important`. Components get minimal `className` additions so CSS can target them. The only React logic change is a hamburger menu toggle in `App.jsx` and dual-render (chips + dots) in Calendar cells.

**Tech Stack:** CSS media queries, existing React components, no new dependencies.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/index.css` | Modify | All responsive media queries |
| `src/App.jsx` | Modify | Hamburger menu + classNames on header/nav |
| `src/components/Home.jsx` | Modify | classNames on hero, feature grid, stats strip, subtitle |
| `src/components/Calendar.jsx` | Modify | classNames on grid/cells + render dots alongside chips |
| `src/components/Points.jsx` | Modify | classNames on layout grid, activity table |
| `src/components/Leaderboard.jsx` | Modify | classNames on podium, rankings table |
| `src/components/Gallery.jsx` | Modify | className on photo grid |
| `src/components/Officers.jsx` | Modify | className on card grid |
| `src/components/Sponsors.jsx` | Modify | className on sponsor grid |
| `src/components/Login.jsx` | Modify | className on modal |
| `src/components/SignUp.jsx` | Modify | className on modal |
| `src/components/AdminNav.jsx` | Modify | className on container |
| `src/components/EventEditor.jsx` | Modify | classNames on table, rows, form |
| `src/components/PointsQueue.jsx` | Modify | classNames on table, rows |
| `src/components/MemberRoster.jsx` | Modify | classNames on table, rows |
| `src/components/OfficerEditor.jsx` | Modify | classNames on table, rows, form |
| `src/components/SponsorEditor.jsx` | Modify | classNames on table, rows, form |
| `src/components/GalleryEditor.jsx` | Modify | className on photo grid |

---

### Task 1: Global CSS Media Queries + Page Containers

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add responsive meta tag check**

Verify `public/index.html` has the viewport meta tag. If it does, skip this step.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

- [ ] **Step 2: Add all media queries to index.css**

Append the following to the end of `src/index.css`:

```css
/* ===== RESPONSIVE ===== */

/* --- Small laptop (≤1024px) --- */
@media (max-width: 1024px) {
  .page-container { padding: 28px 28px 60px !important; }
  .hero-letters > div > div { font-size: 160px !important; }
  .site-header-inner { padding: 14px 28px !important; }
}

/* --- Tablet (≤768px) --- */
@media (max-width: 768px) {
  .page-container { padding: 20px 20px 60px !important; }
  .site-header-inner { padding: 10px 16px !important; }

  /* Nav hamburger */
  .nav-links { display: none !important; }
  .hamburger-btn { display: flex !important; }
  .mobile-nav-overlay { display: flex !important; }

  /* Hero */
  .hero-letters > div > div { font-size: 100px !important; padding: 10px 12px 4px !important; }
  .hero-subtitle-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
  .hero-subtitle-grid > div:last-child { min-height: auto !important; }

  /* Grids → 2 columns */
  .feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .stats-strip { grid-template-columns: repeat(2, 1fr) !important; }
  .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
  .officers-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .sponsors-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .editor-photo-grid { grid-template-columns: repeat(2, 1fr) !important; }

  /* Points page → single column */
  .points-layout { grid-template-columns: 1fr !important; gap: 24px !important; }

  /* Leaderboard podium → stack */
  .podium-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
  .podium-grid .podium-card { width: 100% !important; }
  .podium-grid .podium-rank { font-size: 36px !important; }
  .podium-grid .podium-bar { height: auto !important; min-height: 100px !important; }

  /* Calendar compact */
  .calendar-grid .cal-cell { min-height: 48px !important; padding: 4px !important; }
  .calendar-grid .cal-day-num { font-size: 14px !important; }
  .calendar-grid .cal-event-chip { display: none !important; }
  .calendar-grid .cal-event-dot { display: flex !important; }
  .calendar-grid .cal-day-header { font-size: 10px !important; padding: 6px 4px !important; }
  .calendar-nav-btn { padding: 6px 10px !important; font-size: 10px !important; }
  .calendar-hint { display: none !important; }

  /* Admin tables → card stack */
  .admin-table-header { display: none !important; }
  .admin-table-row {
    display: flex !important;
    flex-direction: column !important;
    padding: 14px 16px !important;
    gap: 6px !important;
    border-top: 2px solid var(--ink) !important;
  }
  .admin-table-row > div { padding: 2px 0 !important; }
  .admin-table-row .row-label { display: inline !important; }

  /* Activity table → card stack */
  .activity-table-header { display: none !important; }
  .activity-table-row {
    display: flex !important;
    flex-direction: column !important;
    padding: 12px 16px !important;
    gap: 4px !important;
  }
  .activity-table-row > div { padding: 2px 0 !important; }

  /* Leaderboard rankings → card stack */
  .rankings-row {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 4px 12px !important;
    padding: 12px 16px !important;
  }
  .rankings-row > span:first-child { min-width: 50px !important; }

  /* Admin forms → single column */
  .admin-form-grid { grid-template-columns: 1fr !important; }

  /* Modals */
  .modal-box { width: 90vw !important; max-width: 460px !important; }

  /* Lightbox */
  .lightbox-inner { max-width: 90vw !important; padding: 10px !important; }
}

/* --- Phone (≤480px) --- */
@media (max-width: 480px) {
  .page-container { padding: 16px 14px 40px !important; }

  /* Hero letters shrink further */
  .hero-letters > div > div { font-size: 60px !important; padding: 6px 8px 2px !important; }

  /* Single columns */
  .feature-grid { grid-template-columns: 1fr !important; }
  .officers-grid { grid-template-columns: 1fr !important; }
  .gallery-grid { grid-template-columns: 1fr !important; }

  /* Stats */
  .stats-strip .stat-number { font-size: 32px !important; }

  /* Points */
  .points-total { font-size: 60px !important; }
  .points-name { font-size: 24px !important; }
  .points-actions { flex-direction: column !important; }
  .points-actions > button { width: 100% !important; }

  /* Admin nav */
  .admin-nav { gap: 6px !important; }
  .admin-nav > button { padding: 6px 10px !important; font-size: 10px !important; }

  /* Calendar */
  .calendar-grid .cal-cell { min-height: 40px !important; padding: 2px !important; }
  .calendar-grid .cal-day-num { font-size: 12px !important; }
}

/* Dots hidden by default, shown on mobile */
.cal-event-dot { display: none; }

/* Hamburger hidden by default, shown on mobile */
.hamburger-btn { display: none; }
.mobile-nav-overlay {
  display: none;
  position: fixed; inset: 0; z-index: 100;
  background: var(--paper);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

/* Row labels hidden on desktop, shown in card-stack mobile */
.row-label { display: none; }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds (CSS is valid, no errors).

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: add responsive CSS media queries for mobile/tablet/laptop"
```

---

### Task 2: Hamburger Menu in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add hamburger menu state and mobile nav overlay**

Add `menuOpen` state after the existing state declarations:

```jsx
const [menuOpen, setMenuOpen] = useState(false);
```

Add className `"site-header-inner"` to the header inner div (the one with `maxWidth: 1400`):

Change:
```jsx
<div style={{
  maxWidth: 1400, margin: '0 auto',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 48px',
}}>
```
To:
```jsx
<div className="site-header-inner" style={{
  maxWidth: 1400, margin: '0 auto',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 48px',
}}>
```

Add className `"nav-links"` to the `<nav>` element:

Change:
```jsx
<nav style={{ display: 'flex', gap: 10 }}>
```
To:
```jsx
<nav className="nav-links" style={{ display: 'flex', gap: 10 }}>
```

Add the hamburger button and mobile overlay right after the closing `</nav>`:

```jsx
{/* Hamburger button — visible on mobile only */}
<button className="hamburger-btn" onClick={() => setMenuOpen(true)} style={{
  background: 'none', border: '2px solid var(--ink)', padding: '6px 10px',
  fontFamily: "'Archivo Black', sans-serif", fontSize: 18, cursor: 'pointer',
  boxShadow: '2px 2px 0 var(--ink)',
}}>&#9776;</button>

{/* Mobile nav overlay */}
{menuOpen && (
  <div className="mobile-nav-overlay" style={{
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'var(--paper)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
  }}>
    <button onClick={() => setMenuOpen(false)} style={{
      position: 'absolute', top: 16, right: 16,
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: "'Alfa Slab One', serif", fontSize: 28, color: 'var(--ink)',
    }}>&times;</button>
    {tabs.map(t => (
      <button key={t.id} onClick={() => { navigate(t.path); setMenuOpen(false); }} style={{
        padding: '12px 28px',
        border: '2px solid var(--ink)',
        background: isActive(t.path) ? 'var(--ink)' : 'white',
        color: isActive(t.path) ? 'var(--paper)' : 'var(--ink)',
        fontFamily: "'Archivo Black', sans-serif",
        letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
        cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
        width: 220,
      }}>{t.label}</button>
    ))}
    {!loading && user && role === 'officer' && (
      <button onClick={() => { navigate('/admin/approvals'); setMenuOpen(false); }} style={{
        padding: '12px 28px',
        border: '2px solid var(--ink)', background: 'var(--tape)',
        fontFamily: "'Archivo Black', sans-serif",
        letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
        cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
        width: 220,
      }}>Admin</button>
    )}
    {!loading && (user ? (
      <button onClick={() => { signOut(); setMenuOpen(false); }} style={{
        padding: '12px 28px',
        border: '2px solid var(--ink)', background: 'var(--pink)',
        fontFamily: "'Archivo Black', sans-serif",
        letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
        cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
        width: 220,
      }}>Log Out</button>
    ) : (
      <button onClick={() => { setLoginOpen(true); setMenuOpen(false); }} style={{
        padding: '12px 28px',
        border: '2px solid var(--ink)', background: 'var(--green)',
        fontFamily: "'Archivo Black', sans-serif",
        letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
        cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
        width: 220,
      }}>&#10022; Login</button>
    ))}
  </div>
)}
```

- [ ] **Step 2: Verify**

Run `npm run dev`, resize browser to ≤768px. Hamburger icon should appear, clicking opens overlay with all nav links. Desktop width should show normal nav.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add hamburger menu for mobile navigation"
```

---

### Task 3: Home Page ClassNames

**Files:**
- Modify: `src/components/Home.jsx`

- [ ] **Step 1: Add classNames to Home.jsx**

Add `className="page-container"` to the outermost div:
```jsx
<div className="page-container" style={{ position: 'relative', padding: '28px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
```

Add `className="hero-letters"` to the wrapper div that contains the 5 letter divs (the one with `display:'flex', alignItems:'flex-start'`):
```jsx
<div className="hero-letters" style={{ position:'relative', display:'flex', alignItems:'flex-start', gap: 0, flexWrap:'wrap' }}>
```

Add `className="hero-subtitle-grid"` to the subtitle grid div:
```jsx
<div className="hero-subtitle-grid" style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 40, marginTop: 48, alignItems:'start' }}>
```

Add `className="feature-grid"` to the feature cards grid:
```jsx
<div className="feature-grid" style={{
  marginTop: 36, display:'grid', gap: 28,
  gridTemplateColumns:'repeat(4, 1fr)',
}}>
```

Add `className="stats-strip"` to the stats strip div, and `className="stat-number"` to each stat number:
```jsx
<div className="stats-strip" style={{
  marginTop: 80,
  display:'grid', gridTemplateColumns:'repeat(4,1fr)',
  border:'2px solid var(--ink)', background:'white',
}}>
```

For the stat numbers, change the inner render to add the className:
```jsx
<div className="stat-number" style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 56, lineHeight:1, color:'var(--ink)' }}>{n}</div>
```

- [ ] **Step 2: Verify**

Run `npm run dev`, resize to 480px. Hero letters should shrink, feature cards should go single column, stats should be 2×2.

- [ ] **Step 3: Commit**

```bash
git add src/components/Home.jsx
git commit -m "feat: add responsive classNames to Home page"
```

---

### Task 4: Calendar ClassNames + Dots

**Files:**
- Modify: `src/components/Calendar.jsx`

- [ ] **Step 1: Add classNames and dot rendering**

Add `className="page-container"` to the outermost div:
```jsx
<div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
```

Add `className="calendar-nav-btn"` to each prev/today/next button by spreading into the style object:
```jsx
<button onClick={prev} className="calendar-nav-btn" style={arrowBtn}>&larr; prev</button>
<button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }} className="calendar-nav-btn" style={arrowBtn}>today</button>
<button onClick={next} className="calendar-nav-btn" style={arrowBtn}>next &rarr;</button>
```

Add `className="calendar-hint"` to the hint span:
```jsx
<span className="calendar-hint" style={{ marginLeft: 'auto', fontFamily: "'Kalam', cursive", fontSize: 20, color: 'var(--margin)' }}>
```

Add `className="calendar-grid"` to the main grid div:
```jsx
<div className="calendar-grid" style={{
  marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 0, border: '2px solid var(--ink)', background: 'white',
}}>
```

Add `className="cal-day-header"` to each day header div:
```jsx
{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
  <div key={d} className="cal-day-header" style={{
```

In the `Cell` component, add classNames and add dot rendering. Change the Cell component:

```jsx
const Cell = ({ d, events, isLast, isBottom, onEventClick }) => {
  if (!d) return <div style={{
    minHeight: 120, background: 'var(--paper-2)',
    borderRight: isLast ? 'none' : '2px solid var(--ink)',
    borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
    backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.86 0.03 85) 6px 7px)',
  }} />;
  return (
    <div className="cal-cell" style={{
      minHeight: 120, padding: 8, position: 'relative',
      borderRight: isLast ? 'none' : '2px solid var(--ink)',
      borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
      background: 'white',
    }}>
      <div className="cal-day-num" style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, lineHeight: 1 }}>{d}</div>
      {/* Full event chips — hidden on mobile by CSS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
        {events.map((e, i) => (
          <div key={e.id || i} className="cal-event-chip" onClick={() => onEventClick(e)} style={{
            background: cmap(e.color),
            color: e.color === 'ink' ? 'var(--paper)' : 'var(--ink)',
            padding: '3px 6px',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 11, fontWeight: 600, lineHeight: 1.2,
            border: '1.5px solid var(--ink)',
            transform: `rotate(${(i % 2 ? 1 : -1) * 0.5}deg)`,
            display: 'flex', justifyContent: 'space-between', gap: 4,
            cursor: 'pointer',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.title}{e.time ? ` · ${e.time}` : ''}
            </span>
            {e.points > 0 && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>+{e.points}</span>}
          </div>
        ))}
      </div>
      {/* Colored dots — shown on mobile by CSS */}
      {events.length > 0 && (
        <div className="cal-event-dot" onClick={() => onEventClick(events[0])} style={{
          display: 'none', gap: 2, marginTop: 4, flexWrap: 'wrap', cursor: 'pointer',
        }}>
          {events.map((e, i) => (
            <span key={e.id || i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: cmap(e.color), border: '1px solid var(--ink)',
            }} />
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verify**

Run `npm run dev`, resize to ≤768px. Calendar cells should shrink, event chips should disappear, colored dots should appear. Tapping a dot-cell should open the event modal.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar.jsx
git commit -m "feat: responsive calendar with compact dot view on mobile"
```

---

### Task 5: Points Page ClassNames

**Files:**
- Modify: `src/components/Points.jsx`

- [ ] **Step 1: Add classNames**

Add `className="page-container"` to the outermost div:
```jsx
<div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
```

Add `className="points-layout"` to the 2-column grid:
```jsx
<div className="points-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, marginTop: 32 }}>
```

Add `className="points-total"` to the big points number:
```jsx
<span className="points-total" style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 130, lineHeight: .85 }}>{total}</span>
```

Add `className="points-name"` to the member name:
```jsx
<div className="points-name" style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, lineHeight: 1, marginTop: 6 }}>{user?.displayName || 'Member'}</div>
```

Add `className="points-actions"` to the action buttons container:
```jsx
<div className="points-actions" style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
```

Add `className="activity-table-header"` to the activity table header row (the div with `background: 'var(--ink)'`):
```jsx
<div className="activity-table-header" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px', background: 'var(--ink)', color: 'var(--paper)', ... }}>
```

Add `className="activity-table-row"` to each activity table row:
```jsx
<div key={r.id} className="activity-table-row" style={{
  display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px',
```

- [ ] **Step 2: Verify**

Resize to 480px. Points should stack vertically, total font shrinks, action buttons stack full-width.

- [ ] **Step 3: Commit**

```bash
git add src/components/Points.jsx
git commit -m "feat: responsive classNames for Points page"
```

---

### Task 6: Leaderboard ClassNames

**Files:**
- Modify: `src/components/Leaderboard.jsx`

- [ ] **Step 1: Add classNames**

Add `className="page-container"` to the outermost div:
```jsx
<div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
```

Add `className="podium-grid"` to the podium container:
```jsx
<div className="podium-grid" style={{ marginTop: 52, display: 'grid', gridTemplateColumns: `repeat(${Math.min(top3.length, 3)}, 1fr)`, gap: 24, alignItems: 'end' }}>
```

In the `Podium` component, add classNames:

Add `className="podium-card"` to the outer div:
```jsx
<div className="podium-card" style={{ position: 'relative', textAlign: 'center' }}>
```

Add `className="podium-rank"` to the rank number:
```jsx
<span className="podium-rank" style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 72, lineHeight: 1 }}>#{rank}</span>
```

Add `className="podium-bar"` to the colored bar div:
```jsx
<div className="podium-bar" style={{
  background: color, border: '2px solid var(--ink)',
  boxShadow: '5px 5px 0 var(--ink)',
  padding: '18px 10px',
  height: h,
```

Add `className="rankings-row"` to each ranking row:
```jsx
<div key={r.id} className="rankings-row" style={{
  display: 'grid',
  gridTemplateColumns: '80px 1fr 120px',
```

- [ ] **Step 2: Verify**

Resize to ≤768px. Podium cards should stack vertically, rank font shrinks.

- [ ] **Step 3: Commit**

```bash
git add src/components/Leaderboard.jsx
git commit -m "feat: responsive classNames for Leaderboard"
```

---

### Task 7: Public Pages ClassNames (Gallery, Officers, Sponsors)

**Files:**
- Modify: `src/components/Gallery.jsx`
- Modify: `src/components/Officers.jsx`
- Modify: `src/components/Sponsors.jsx`

- [ ] **Step 1: Gallery.jsx**

Add `className="page-container"` to the outermost div:
```jsx
<div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
```

Add `className="gallery-grid"` to the photo grid:
```jsx
<div className="gallery-grid" style={{
  marginTop: 36, display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)', gap: 32,
}}>
```

Add `className="lightbox-inner"` to the lightbox content div:
```jsx
<div className="lightbox-inner" onClick={e => e.stopPropagation()} style={{
  background: 'white', border: '2px solid var(--ink)',
  boxShadow: '10px 10px 0 var(--ink)', padding: 16, maxWidth: 700,
  transform: 'rotate(-1deg)',
}}>
```

- [ ] **Step 2: Officers.jsx**

Add `className="officers-grid"` to the officer cards grid:
```jsx
<div className="officers-grid" style={{
  marginTop: 36, display: 'grid', gap: 28,
  gridTemplateColumns: 'repeat(3, 1fr)',
}}>
```

- [ ] **Step 3: Sponsors.jsx**

Add `className="sponsors-grid"` to the sponsor grid:
```jsx
<div className="sponsors-grid" style={{
  marginTop: 28, display: 'grid', gap: 14,
  gridTemplateColumns: 'repeat(4, 1fr)',
}}>
```

- [ ] **Step 4: Verify**

Resize to 480px. Gallery, officers → single column. Sponsors → 2 columns.

- [ ] **Step 5: Commit**

```bash
git add src/components/Gallery.jsx src/components/Officers.jsx src/components/Sponsors.jsx
git commit -m "feat: responsive classNames for Gallery, Officers, Sponsors"
```

---

### Task 8: Modal ClassNames (Login, SignUp)

**Files:**
- Modify: `src/components/Login.jsx`
- Modify: `src/components/SignUp.jsx`

- [ ] **Step 1: Login.jsx**

Add `className="modal-box"` to the modal content div (the one with `width: 460`):

Find the div with `width: 460, background: 'white', border: '2px solid var(--ink)'` and add the className:
```jsx
<div className="modal-box" onClick={e => e.stopPropagation()} style={{
  width: 460, background: 'white', border: '2px solid var(--ink)',
```

- [ ] **Step 2: SignUp.jsx**

Same change — add `className="modal-box"` to the modal content div with `width: 460`:
```jsx
<div className="modal-box" onClick={e => e.stopPropagation()} style={{
  width: 460, background: 'white', border: '2px solid var(--ink)',
```

- [ ] **Step 3: Verify**

Resize to 400px, open login modal. Should be 90vw wide, not overflowing.

- [ ] **Step 4: Commit**

```bash
git add src/components/Login.jsx src/components/SignUp.jsx
git commit -m "feat: responsive modal widths for Login and SignUp"
```

---

### Task 9: Admin Pages ClassNames (AdminNav + All Editors)

**Files:**
- Modify: `src/components/AdminNav.jsx`
- Modify: `src/components/EventEditor.jsx`
- Modify: `src/components/PointsQueue.jsx`
- Modify: `src/components/MemberRoster.jsx`
- Modify: `src/components/OfficerEditor.jsx`
- Modify: `src/components/SponsorEditor.jsx`
- Modify: `src/components/GalleryEditor.jsx`

- [ ] **Step 1: AdminNav.jsx**

Add `className="admin-nav"` to the container div:
```jsx
<div className="admin-nav" style={{
  display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap',
}}>
```

- [ ] **Step 2: EventEditor.jsx**

Add `className="page-container"` to the outermost div.

Add `className="admin-table-header"` to the table header div (the one with `background: 'var(--ink)'`).

Add `className="admin-table-row"` to each event row div.

Add `className="admin-form-grid"` to the form grid div (the one with `gridTemplateColumns: '1fr 1fr'` or similar in the create/edit form).

- [ ] **Step 3: PointsQueue.jsx**

Add `className="page-container"` to the outermost div.

Add `className="admin-table-header"` to the table header div.

Add `className="admin-table-row"` to each pending request row div.

- [ ] **Step 4: MemberRoster.jsx**

Add `className="page-container"` to the outermost div.

Add `className="admin-table-header"` to both `TableHeader` instances (pending and active tables). Specifically, add it inside the `TableHeader` component to the div with `headerStyle`:
```jsx
const TableHeader = () => (
  <div className="admin-table-header" style={headerStyle}>
```

Add `className="admin-table-row"` inside the `MemberRow` component to the outer div:
```jsx
const MemberRow = ({ member, isYou, user, changeRole, i }) => {
  ...
  return (
    <div className="admin-table-row" style={{
      display: 'grid', gridTemplateColumns: gridCols,
```

- [ ] **Step 5: OfficerEditor.jsx**

Add `className="page-container"` to the outermost div.

Add `className="admin-table-header"` to the table header div.

Add `className="admin-table-row"` to each officer row div.

Add `className="admin-form-grid"` to the form grid div (the one with `gridTemplateColumns: '1fr 1fr'`).

- [ ] **Step 6: SponsorEditor.jsx**

Add `className="page-container"` to the outermost div.

Add `className="admin-table-header"` to the table header div.

Add `className="admin-table-row"` to each sponsor row div.

Add `className="admin-form-grid"` to the form grid div.

- [ ] **Step 7: GalleryEditor.jsx**

Add `className="page-container"` to the outermost div.

Add `className="editor-photo-grid"` to the photo grid div:
```jsx
<div className="editor-photo-grid" style={{
  marginTop: 14, display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)', gap: 18,
}}>
```

- [ ] **Step 8: Verify**

Resize to ≤768px. Admin tables should show card-stack layout, forms should be single column, gallery editor grid should be 2 columns.

- [ ] **Step 9: Commit**

```bash
git add src/components/AdminNav.jsx src/components/EventEditor.jsx src/components/PointsQueue.jsx src/components/MemberRoster.jsx src/components/OfficerEditor.jsx src/components/SponsorEditor.jsx src/components/GalleryEditor.jsx
git commit -m "feat: responsive classNames for all admin pages"
```

---

### Task 10: Verify Full Build + Cross-Page Test

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Test all pages at phone width (375px)**

Open dev tools, set viewport to 375px wide. Check each page:
1. Home — hero letters small, feature cards stacked, stats 2×2
2. Gallery — single column photos
3. Calendar — compact grid with dots, tap opens modal
4. Points — stacked layout, 60px total, card-stack activity
5. Leaderboard — stacked podium, card-stack rankings
6. Admin pages — card-stack tables, single-column forms
7. Login/SignUp — modal fits screen
8. Nav — hamburger menu works

- [ ] **Step 3: Test at tablet width (768px)**

Set viewport to 768px. Check grids are 2-column, nav shows hamburger.

- [ ] **Step 4: Test at small laptop (1024px)**

Set viewport to 1024px. Check hero letters medium-sized, reduced padding.

- [ ] **Step 5: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix: responsive layout adjustments from cross-page testing"
```
