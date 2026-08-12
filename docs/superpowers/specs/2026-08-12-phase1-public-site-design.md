# Phase 1 -- Public Site: Design Document

**Date:** 2026-08-12
**Scope:** Home (Firestore-driven), Photo Gallery, Officer Bios, Sponsors, Calendar (Firestore-driven)
**Constraint:** All content pulled from Firestore; nothing hardcoded.

---

## 1. Current State Analysis

### What exists today

Every component renders **hardcoded mock data** inline. Firebase is wired up (`src/lib/firebase.js`) with emulator support, and the seed script (`scripts/seed-emulator.mjs`) populates four Firestore collections: `clubInfo`, `events`, `officers`, `sponsors`. Security rules already allow public reads on all four. No component currently imports or queries Firestore.

| Component | Hardcoded data | Lines affected |
|-----------|---------------|----------------|
| `Home.jsx` | About text, socials, stats strip (127/31/52/2340), marquee items, CTA labels, "est. 1995" | ~80 lines of literal strings and arrays |
| `Calendar.jsx` | Two months of events in a `months[]` array, legend categories | ~30 lines of event data |
| `Slides.jsx` | 12 deck objects in a `decks[]` array | ~15 lines |
| `Points.jsx` | User object, breakdown array, activity log | All mock -- Phase 3, not Phase 1 |
| `Leaderboard.jsx` | 10 rows of mock members | All mock -- Phase 5, not Phase 1 |
| `App.jsx` | Tab definitions, nav -- no data changes needed for Phase 1 | Needs new routes for Gallery, Officers, Sponsors |

### Firestore collections already seeded

| Collection | Doc count | Fields present |
|-----------|-----------|----------------|
| `clubInfo/main` | 1 | `about`, `socials{instagram,email,linktree}`, `tagline`, `established`, `stats{activeMembers,yearsRunning,eventsPerYear,volunteerHours}` |
| `events` | 15 | `title`, `date` (YYYY-MM-DD string), `category`, `points`, `color` |
| `officers` | 6 | `name`, `position`, `bio`, `sortOrder`, `active`, `termYear` |
| `sponsors` | 6 | `name`, `tier` (gold/silver/bronze), `url`, `sortOrder` |

---

## 2. Data Flow: Which Components Need Which Collections

```
clubInfo/main
  --> Home.jsx        (about, socials, tagline, established, stats)
  --> App.jsx header  (established year in "est. XXXX" badge -- optional)

events
  --> Calendar.jsx    (all events, grouped by month/day)
  --> Home.jsx        (marquee items: next few upcoming event titles)

officers
  --> Officers.jsx    (NEW -- full bios page)
  --> Home.jsx        (optional: "meet the board" teaser section)

sponsors
  --> Sponsors.jsx    (NEW -- logo wall page/section)
  --> Home.jsx        (optional: "our sponsors" strip)

gallery (NEW collection)
  --> Gallery.jsx     (NEW -- photo grid + lightbox)
```

---

## 3. Changes to Existing Components

### 3.1 Home.jsx

**What changes:**
- Replace the hardcoded about paragraph with `clubInfo.about`
- Replace the hardcoded stats strip (`127`, `31`, `52`, `2,340`) with `clubInfo.stats.*`
- Replace the marquee items with a mix of `clubInfo.tagline` and upcoming event titles from the `events` collection
- Replace the socials/CTA section with links from `clubInfo.socials`
- The "est. 1995" badge should use `clubInfo.established`

**Firestore queries:**
1. `getDoc(doc(db, 'clubInfo', 'main'))` -- single doc read, cached
2. `query(collection(db, 'events'), where('date', '>=', todayStr), orderBy('date'), limit(5))` -- next 5 upcoming events for marquee

**Data hook pattern:**
Create a `useClubInfo()` hook and a `useUpcomingEvents(limit)` hook. These can live in `src/hooks/useFirestore.js` or similar. Use `onSnapshot` for real-time updates (so officer edits in Phase 4 reflect immediately) or `getDoc`/`getDocs` for simpler one-shot reads. Recommendation: start with `onSnapshot` -- the scrapbook site benefits from live updates when officers edit content, and the complexity difference is minimal with a thin wrapper.

**Skeleton/loading state:**
While Firestore loads, show the same layout but with placeholder shimmer bars. The scrapbook aesthetic actually helps here -- a "loading" state can be a blank sticky note or tape strip. Defer the full skeleton treatment to Phase 5 but add a simple `if (!data) return <LoadingPlaceholder/>` now.

### 3.2 Calendar.jsx

**What changes:**
- Remove the hardcoded `months[]` array entirely
- Compute month/day grid from real `events` collection data
- Support arbitrary month navigation (not just two hardcoded months)
- Group events by `YYYY-MM-DD` date string, then render into the grid

**Firestore queries:**
- `query(collection(db, 'events'), where('date', '>=', monthStartStr), where('date', '<=', monthEndStr), orderBy('date'))` -- one query per visible month
- Or: `query(collection(db, 'events'), orderBy('date'))` and filter client-side (simpler, fine for <200 events/year)

**Data mapping:**
The current `Cell` component expects `events` as `[{ t, c, pts }]`. The Firestore `events` doc has `{ title, color, points }`. The mapping is: `{ t: doc.title, c: doc.color, pts: doc.points }`. Either map at query time or update `Cell` to use the Firestore field names directly (cleaner long-term).

**Month navigation:**
Currently `month` is an index into a 2-element array. Replace with a `Date` state: `const [currentMonth, setCurrentMonth] = useState(new Date())`. Derive `start` (day-of-week offset) and `days` (days in month) from the Date object. No hardcoded month data needed.

### 3.3 App.jsx

**What changes:**
- Add three new routes: `/gallery`, `/officers`, `/sponsors`
- Add corresponding nav tabs (or place them as sections on the Home page instead of separate routes -- see Section 7 for the decision)
- Import the three new components

---

## 4. New Components Needed

### 4.1 Gallery.jsx (Photo Gallery with Lightbox)

**Purpose:** Grid of club photos from Firebase Storage, clickable to open a lightbox overlay.

**Data source:** New Firestore collection `gallery` (metadata) + Firebase Storage bucket (actual images).

**Firestore `gallery` collection schema:**
```
gallery/{docId}
  imageUrl:     string    // Storage download URL (full-res)
  thumbUrl:     string    // Storage download URL (thumbnail, ~400px wide)
  caption:      string    // optional caption
  eventRef:     string    // optional reference to events/{id}
  uploadedAt:   timestamp
  sortOrder:    number    // manual ordering
  width:        number    // original width (for aspect ratio)
  height:       number    // original height (for aspect ratio)
```

**Firestore query:**
`query(collection(db, 'gallery'), orderBy('sortOrder'), orderBy('uploadedAt', 'desc'))`

**Layout:** Masonry-ish grid or uniform grid of polaroid-style cards. Given the scrapbook aesthetic, a slightly staggered grid with small random rotations (reusing `Tape` and the polaroid pattern from `Leaderboard.jsx`) fits naturally. Each photo card = white border (polaroid), optional tape on top, caption below in Kalam handwriting font.

**Lightbox approaches (3 options):**

| Option | Library | Size | Pros | Cons |
|--------|---------|------|------|------|
| A | **yet-another-react-lightbox** | ~15 KB gzip | Keyboard nav, swipe, zoom, thumbnails strip, good a11y, actively maintained | Another dependency |
| B | **Custom overlay** (no library) | 0 KB added | No dependency, full control over scrapbook styling | Must build keyboard nav, swipe, preloading, focus trap manually; accessibility is hard to get right |
| C | **react-photoswipe-gallery** (PhotoSwipe 5) | ~20 KB gzip | Best UX (pinch zoom, share, pan), battle-tested | Heavier, has its own CSS that may clash with scrapbook aesthetic |

**Recommendation:** Option A (`yet-another-react-lightbox`). It is lightweight, headless enough to style within the scrapbook system, handles keyboard/swipe/a11y, and the API is simple. Option B is tempting for zero-dependency purity but lightbox accessibility is surprisingly hard (focus trapping, escape key, scroll lock, preloading adjacent images). Option C is overkill for a club site.

**Thumbnail generation strategy (3 options):**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| 1 | **Firebase Extension: Resize Images** | Zero code -- install the extension, configure sizes (e.g., 400x400), it writes thumbs to `thumbs/` prefix in Storage automatically | Requires Blaze plan; extension runs a Cloud Function under the hood |
| 2 | **Custom Cloud Function on Storage trigger** | Full control over sizes, format (WebP), quality; write thumb URL back to the Firestore `gallery` doc | Must write and deploy the function; same Blaze plan requirement |
| 3 | **Client-side resize before upload** (in the Phase 4 admin upload form) | No Cloud Functions needed, works on Spark plan | Puts work on the browser; can't regenerate thumbs without re-uploading; quality varies by browser canvas implementation |

**Recommendation:** Option 1 for production (Resize Images extension). For the MVP/emulator development cycle, use Option 3 (client-side resize in the upload form) since emulators don't run extensions. The `gallery` doc stores both `imageUrl` and `thumbUrl` regardless of which approach generates them, so switching later is seamless.

### 4.2 Officers.jsx (Officer Bios)

**Purpose:** Display active officers with headshot, name, position, and short bio. Ordered by `sortOrder`, filtered to `active: true`.

**Data source:** Existing `officers` Firestore collection.

**Firestore query:**
`query(collection(db, 'officers'), where('active', '==', true), orderBy('sortOrder'))`

Note: This compound query (`where` + `orderBy` on different fields) requires a Firestore composite index. Add to `firestore.indexes.json`:
```json
{
  "collectionGroup": "officers",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "active", "order": "ASCENDING" },
    { "fieldPath": "sortOrder", "order": "ASCENDING" }
  ]
}
```

**Layout:** Reuse the polaroid card treatment from `Leaderboard.jsx`'s `Podium` component. Each officer gets:
- Polaroid-style card (white border, slight rotation, tape on top)
- Headshot area (or initials fallback like leaderboard does now, since seed data has no headshot URLs)
- Name in Alfa Slab One
- Position in JetBrains Mono (small caps label)
- Bio in Bricolage Grotesque body text
- Slight random rotation per card for the collage feel

**Grid:** 3 columns for 6 officers works well. On mobile (Phase 5), collapse to 1 or 2 columns.

**Seed data gap:** The `officers` collection has no `headshot` or `photoUrl` field. Need to add this field to the schema and seed script. For now, use the initials-in-colored-square fallback (already built in `Leaderboard.jsx`).

### 4.3 Sponsors.jsx (Sponsor Logo Wall)

**Purpose:** Display sponsor logos grouped by tier (gold, silver, bronze), each linking to the sponsor's URL.

**Data source:** Existing `sponsors` Firestore collection.

**Firestore query:**
`query(collection(db, 'sponsors'), orderBy('sortOrder'))`
Then group client-side by `tier`.

**Layout:** The CLAUDE.md says "quieter, uniform grid -- tape-and-sticker styling should NOT fight sponsor branding." This means:
- Clean white cards, minimal rotation (0 or near-0 degrees)
- Uniform card size within each tier
- Gold tier: larger cards, top row
- Silver tier: medium cards, middle row
- Bronze tier: smaller cards or a compact strip
- Each card is an `<a>` wrapping the logo, linking to `sponsor.url` with `target="_blank" rel="noopener"`
- Tier headings in JetBrains Mono small-caps label style
- Subtle tape at most -- no stamps, stickers, or scribbles competing with logos

**Seed data gap:** The `sponsors` collection has no `logoUrl` field. Need to add this. For development, use a text-only fallback showing the sponsor name in a clean card (similar to the initials fallback for officers).

---

## 5. Seed Data Gaps

| Collection | Missing field | Needed by | Default/fallback |
|-----------|--------------|-----------|-------------------|
| `officers` | `photoUrl` / `headshot` | Officers.jsx | Initials-in-colored-square (already built in Leaderboard) |
| `sponsors` | `logoUrl` | Sponsors.jsx | Text-only card with sponsor name |
| `gallery` | Entire collection missing | Gallery.jsx | Empty state: "no photos yet" message |
| `clubInfo` | No `heroImage` or `ctaButtons` config | Home.jsx | Use existing logo lockup; hardcode CTA structure (just text from Firestore) |
| `events` | No `description` field | Calendar day-detail view (optional) | Show title only in chip |
| `events` | No `location` field | Calendar (nice-to-have) | Omit for now |
| `events` | No `rsvpEnabled` flag | Calendar RSVP | Defer RSVP to Phase 3 |

### Recommended seed script additions

```
officers/{id}:  + photoUrl: '' (empty string, triggers initials fallback)
sponsors/{id}:  + logoUrl: '' (empty string, triggers text fallback)

New collection -- gallery:
  gallery/photo1: { imageUrl: '...placeholder...', thumbUrl: '...', caption: 'Spring mixer 2026', uploadedAt: Timestamp, sortOrder: 1, width: 1200, height: 800 }
  gallery/photo2-5: (4-5 more sample entries)
```

---

## 6. Shared Hooks and Utilities

### 6.1 Proposed hook: `src/hooks/useFirestoreDoc.js`

A thin wrapper around `onSnapshot` for a single document:
```
useFirestoreDoc('clubInfo', 'main') --> { data, loading, error }
```

### 6.2 Proposed hook: `src/hooks/useFirestoreQuery.js`

A thin wrapper around `onSnapshot` for a collection query:
```
useFirestoreQuery('events', [where('date','>=','2026-04-01')], [orderBy('date')]) --> { data, loading, error }
```

### 6.3 Why custom hooks instead of a state management library

The app has 4 public collections with simple read patterns. React Query or SWR would add a dependency for minimal gain. A pair of 20-line hooks using `onSnapshot` + `useState` + `useEffect` covers every Phase 1 need. If Phase 3/4 introduce mutations and optimistic updates, revisit.

---

## 7. Routing Decision: Separate Pages vs. Home Sections

**Option A: Separate routes** (`/gallery`, `/officers`, `/sponsors`)
- Cleaner URLs, bookmarkable, better for SEO (if SSR is ever added)
- Nav gets crowded: Home, Calendar, Slides, Points, Leaderboard, Gallery, Officers, Sponsors = 8 tabs

**Option B: Sections on the Home page** (scroll-to anchors)
- Home becomes a long-scroll landing page: hero, about, gallery preview, officers, sponsors, footer
- Fewer nav items; Gallery/Officers/Sponsors are "home page sections" not "app pages"
- Calendar, Slides, Points, Leaderboard remain separate routes

**Option C: Hybrid** -- Gallery gets its own route (it needs a full lightbox experience), Officers and Sponsors are Home page sections
- Best of both: Home tells the full club story in one scroll, Gallery is its own browsing experience

**Recommendation:** Option C. Officers (6 cards) and Sponsors (6 logos) are small enough to live on the Home page as sections below the feature cards. Gallery warrants its own page since you want a large grid with lightbox interaction. Add `/gallery` to the nav. This keeps the nav at 6 items (Home, Calendar, Slides, Gallery, Points, Leaderboard) which is manageable.

---

## 8. Component Hierarchy After Phase 1

```
App.jsx
  |-- Home.jsx              (refactored: Firestore-driven)
  |     |-- HeroSection     (about, tagline, CTA from clubInfo)
  |     |-- StatsStrip      (stats from clubInfo)
  |     |-- FeatureCards     (unchanged, navigation cards)
  |     |-- OfficersSection  (inline section, data from officers collection)
  |     |-- SponsorsSection  (inline section, data from sponsors collection)
  |     |-- Footer           (socials from clubInfo)
  |
  |-- Calendar.jsx           (refactored: Firestore-driven)
  |-- Gallery.jsx            (NEW: photo grid + lightbox)
  |-- Slides.jsx             (unchanged in Phase 1, Firestore in Phase 3)
  |-- Points.jsx             (unchanged, mock data until Phase 3)
  |-- Leaderboard.jsx        (unchanged, mock data until Phase 5)
```

---

## 9. Firestore Index Requirements

| Query | Index needed? |
|-------|--------------|
| `clubInfo/main` single doc read | No |
| `events` ordered by `date` | Auto-created (single-field) |
| `events` filtered by date range + ordered by `date` | Auto-created (single-field, same field in where and orderBy) |
| `officers` where `active==true` orderBy `sortOrder` | **Yes -- composite index required** |
| `sponsors` ordered by `sortOrder` | Auto-created (single-field) |
| `gallery` ordered by `sortOrder` | Auto-created (single-field) |

Add to `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "officers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "sortOrder", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 10. Migration Checklist (What to Do, In Order)

1. Create `src/hooks/useFirestoreDoc.js` and `src/hooks/useFirestoreQuery.js`
2. Refactor `Home.jsx` to pull from `clubInfo` and `events`
3. Add Officers section and Sponsors section to `Home.jsx`
4. Refactor `Calendar.jsx` to pull from `events` collection
5. Create `Gallery.jsx` with Firestore + Storage integration
6. Install `yet-another-react-lightbox` (or chosen lightbox library)
7. Add `/gallery` route to `App.jsx`
8. Update seed script with missing fields (`photoUrl`, `logoUrl`, `gallery` collection)
9. Add composite index to `firestore.indexes.json`
10. Test with emulators: add an event, officer, and sponsor in Firebase console and confirm all three appear on the site (the Phase 1 "done when" criteria)

---

## 11. Open Questions for Implementation

1. **Gallery on nav or just linked from Home?** Recommendation is nav tab, but confirm with stakeholder.
2. **How many gallery photos to show on Home page as a teaser?** Suggest 4-6 in a mini-strip, with a "see all" link to `/gallery`.
3. **Should the calendar support multi-day events?** Current seed data is all single-day. Defer unless needed.
4. **WebP for gallery images?** The Resize Images extension can output WebP. Worth doing for performance but adds complexity to the `<img>` tag (need `<picture>` with fallback). Suggest WebP from day one since all modern browsers support it.
5. **Firestore pricing on gallery reads?** Each page load reads the full gallery collection. With <100 photos and Firestore's generous free tier (50K reads/day), this is a non-issue. If the gallery grows past 200 photos, add pagination.
