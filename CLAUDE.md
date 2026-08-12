# UHPPA — University of Houston Pre-Pharmacy Association

## Project Overview
A member-facing web app for UHPPA: public site, member points system, leaderboard, event calendar, slides archive, and officer admin tools. Built with Vite + React, Firebase backend (Firestore, Auth, Storage, Hosting).

## Tech Stack
- **Frontend:** Vite, React 19, React Router v7
- **Backend:** Firebase (Firestore, Auth, Storage, Hosting, Cloud Functions)
- **Styling:** Inline styles with CSS custom properties (scrapbook/collage aesthetic)
- **Fonts:** Bricolage Grotesque (body), Alfa Slab One (display headings), Archivo Black (buttons/labels), JetBrains Mono (mono labels), Kalam (handwriting accent)

## Design Tokens
```
--paper:    oklch(0.96 0.018 85)     /* cream background */
--paper-2:  oklch(0.93 0.025 85)     /* darker cream */
--ink:      oklch(0.22 0.03 260)     /* navy ink */
--ink-soft: oklch(0.35 0.025 260)    /* muted ink */
--tape:     oklch(0.90 0.14 95)      /* yellow tape */
--pink:     oklch(0.80 0.16 20)      /* coral/pink accent */
--green:    oklch(0.68 0.14 145)     /* green accent */
--blue:     oklch(0.65 0.13 240)     /* blue accent */
--rule:     oklch(0.72 0.05 240 / 0.55)  /* notebook rule lines */
--margin:   oklch(0.68 0.18 20 / 0.8)    /* margin annotations */
```

## Project Structure
```
src/
  main.jsx              # Entry point
  App.jsx               # App shell: sticky nav + tab routing
  index.css             # Global styles, CSS vars, paper texture
  components/
    Primitives.jsx      # Shared UI: Tape, Sticky, Scribble, Highlight, Stamp, NavBtn, Marquee, SectionHeading
    Home.jsx            # Hero collage, feature cards, stats strip, footer
    Calendar.jsx        # Monthly event grid with RSVP
    Slides.jsx          # Searchable PDF archive cards
    Points.jsx          # Member points dashboard
    Leaderboard.jsx     # Podium + ranked list
    Login.jsx           # Login modal
    Tweaks.jsx          # Design controls panel
public/
  uhppa-logo.png        # Club crest logo
```


## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint

---

## Implementation Roadmap

### Phase 0 — Foundation (~1 week)
- [x] Vite + React project scaffolded
- [x] Design tokens extracted from mockups into CSS custom properties
- [x] Shared layout: header nav, offset-shadow cards, tape/sticker components
- [x] Routed pages for all six nav items
- [x] React Router for proper URL routing (currently tab-based state)
- [x] Firebase project setup: Firestore, Auth, Storage, Hosting all enabled
- [ ] Firebase emulator suite running locally
- **Done when:** you can navigate every route and the header looks like the mockup.

### Phase 1 — Public Site (~1 week)
- [ ] Home: hero lockup, about paragraph, socials row, CTA buttons
- [ ] Photo gallery with lightbox, images from Storage, thumbnails generated on upload
- [ ] Officer bios: headshot, name, position, short bio, ordered by `sortOrder`, filtered to `active`
  - Reuse polaroid treatment from leaderboard mockup
- [ ] Sponsors: logo wall grouped by tier, each logo linking out
  - Quieter, uniform grid — tape-and-sticker styling should NOT fight sponsor branding
- [ ] Calendar month grid, prev/next navigation, event chips colored by category
- [ ] All content pulled from Firestore, nothing hardcoded
- **Done when:** you can add an event, an officer, and a sponsor in the Firebase console and all three appear on the site.

### Phase 2 — Auth & Membership (~1.5 weeks)
- [ ] Sign-up and sign-in modal matching the mockup
- [ ] Any email domain accepted — officer approval is the only membership gate
- [ ] Email verification required before account activates
- [ ] New accounts land at `role: pending`
- [ ] Password reset flow
- [ ] Route guards: public, member-only, officer-only
- [ ] Officer approval queue: pending list, approve/deny, Cloud Function sets the claim
- [ ] Collect name, classification, and major at sign-up (so officers can identify members in approval queue)
- [ ] Enable Firebase App Check and email enumeration protection (open sign-up will attract bots)
- **Done when:** a new sign-up sees a "waiting for approval" state, and an officer approving them unlocks member pages on next token refresh.

### Phase 3 — Member Features (~2 weeks)
- [ ] Points tracker page: total, progress toward semester goal, breakdown by category, recent activity table with verified status
- [ ] "How points work" content, editable by officers
- [ ] Points request form tied to a specific event
- [ ] Event check-in code entry as the fast path
- [ ] Slides archive: grid, search, year filter, PDF download from Storage
- [ ] RSVP from the calendar day view
- **Done when:** you can request points, see it pending, and see it move to verified after approval.

### Phase 4 — Officer Tools (~2 weeks)
- [ ] Event create/edit/delete form with category, point value, check-in code
- [ ] Points approval queue: pending requests, member and event context, approve/deny with reason, bulk approve
- [ ] Slides upload: PDF only, size capped, page count auto-read
- [ ] Gallery upload and reorder
- [ ] Officer bio editor: add, edit, reorder, archive by term year, headshot upload
- [ ] Sponsor editor: add, edit, reorder, tier assignment, logo upload
- [ ] Club info editor for about paragraph and socials
- [ ] Member roster with role management (admin-only)
- **Done when:** you can run a full event cycle without ever opening the Firebase console.

### Phase 5 — Leaderboard & Polish (~1 week)
- [ ] Podium for top three, table for everyone else, behind member gate
- [ ] Move leaderboard link out of public nav (or show greyed with "members only" tag)
- [ ] Semester, monthly, and all-time filters
- [ ] Tag every ledger entry with a `semester` field from day one (so reset is a query, not a migration)
- [ ] Mobile layouts across every page (calendar grid and leaderboard podium will fight you)
- [ ] Loading skeletons, empty states, error states
- [ ] Accessibility pass: focus rings, alt text, contrast on coral over cream, keyboard nav on modals
- **Done when:** it works on a phone, since that is where members will actually use it.

### Phase 6 — Launch (~1 week)
- [ ] Firebase Hosting, custom domain if the club has one
- [ ] Seed real data: this semester's events, past slide decks, real photos
- [ ] Onboard officers with a short written guide (one page, screenshots)
- [ ] Analytics if the club wants attendance numbers
- [ ] Backup plan: scheduled Firestore export

---

## Decisions

### Settled
| Question | Decision | Build Impact |
|---|---|---|
| Leaderboard visibility | Members only | Gate reads on `member` role, move nav link behind auth |
| Sign-up email domain | Any domain | No domain check; officer approval is the only gate — tighten approval queue |
| Slides visibility | Members only | Storage rules + signed URLs, not just a Firestore check |
| Officers and sponsors | Both needed | Two new public collections, two new editors in Phase 4 |

### Still Open
- **Semester resets:** What resets each semester, and what does a reset do to ranks and all-time totals? Fine to defer. Tag every `pointsLedger` entry with a `semester` field as you write it — costs nothing now, means any reset rule later is a filter, not a backfill. Revisit before Phase 5.
- **Project ownership:** Adding officers as editors/owners in Firebase IAM solves day-to-day access. But the project still sits under your Google account and billing. A club-owned Google account as project owner is the cleaner end state. Do this before you graduate.

---

## Risks

1. **Security rules are the whole ballgame.** A points system with a leaderboard is a system people will poke at. Test rules in the emulator with a real test suite.
2. **Officer turnover.** Build in-app role management in Phase 4, not as a stretch goal. Promoting next year's board should happen in the admin UI, not by handing out console logins.
3. **Open sign-up.** With no domain restriction, the approval queue is the only barrier. App Check + rate limit on account creation, and officers who actually recognize the names they approve.
4. **Storage costs.** Full-resolution photos and 5MB PDFs add up. Resize images on upload with a Cloud Function.
5. **Token refresh after approval.** Custom claims don't appear until the ID token refreshes. Force a refresh or the newly approved member sees a locked page and thinks it's broken.
6. **Scope.** The mockups cover six pages. Phase 1 and 2 alone are a usable site. Ship those, get members on it, then build the rest.

---

## Conventions
- Components go in `src/components/`
- Scrapbook aesthetic: use `Tape`, `Sticky`, `Stamp`, `Highlight` primitives from `Primitives.jsx` for visual consistency
- Inline styles with CSS custom properties (not Tailwind classes) — this matches the design system
- All Firestore content should be dynamic, never hardcoded
- `.env` files are never committed
