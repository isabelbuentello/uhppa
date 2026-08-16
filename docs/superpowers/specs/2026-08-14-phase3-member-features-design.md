# Phase 3 — Member Features Design

## Overview

Wire the three member-gated pages (Points, Slides, Leaderboard) to real Firestore data, replacing all hardcoded mockup content. Add a points claiming flow (check-in code + manual request) and a slides viewer with search and download.

RSVP is deferred to a future phase.

## Firestore Data Model

### New: `pointsLedger/{id}`

One document per points entry — either auto-verified via check-in code or pending officer review.

| Field | Type | Description |
|---|---|---|
| `memberId` | string | Auth UID of the member |
| `eventId` | string | ID of the event in `events` collection |
| `eventTitle` | string | Denormalized event title for display |
| `points` | number | Point value |
| `category` | string | Event category: `meeting`, `volunteer`, `social`, `special`, `board` |
| `semester` | string | Auto-derived: `"Fall 2026"`, `"Spring 2027"`, etc. |
| `method` | string | `"checkin"` (code entry) or `"request"` (manual submission) |
| `status` | string | `"verified"` or `"pending"` |
| `note` | string | Optional note from member (manual requests only) |
| `createdAt` | timestamp | When the entry was created |
| `reviewedBy` | string \| null | Officer UID who approved (null for check-in) |
| `reviewedAt` | timestamp \| null | When reviewed (null for check-in) |

### New: `slides/{id}`

Metadata for each slide deck. Upload functionality is Phase 4; Phase 3 builds the viewer.

| Field | Type | Description |
|---|---|---|
| `title` | string | Slide deck title |
| `date` | string | Date of the presentation (YYYY-MM-DD) |
| `tag` | string | Category label (e.g. "General Meeting") |
| `year` | number | Year for filtering (e.g. 2026) |
| `pageCount` | number | Number of pages |
| `fileSize` | string | Human-readable size (e.g. "2.4 MB") |
| `storageUrl` | string | Firebase Storage path |
| `downloadUrl` | string | Public or signed download URL |
| `uploadedBy` | string | UID of the officer who uploaded |
| `createdAt` | timestamp | Upload timestamp |
| `sortOrder` | number | Display order |

### Modified: `events/{id}`

Add one optional field to the existing event schema:

| Field | Type | Description |
|---|---|---|
| `checkinCode` | string \| null | Code members enter to claim points. Set by officers (Phase 4 UI), but the check-in flow reads it now. |

### Modified: `clubInfo/main`

Add one field:

| Field | Type | Description |
|---|---|---|
| `pointsGuide` | string | Plain text explaining how points work, categories, thresholds. Editable by officers (Phase 4 UI). |

## Semester Derivation

Semesters are auto-derived from the date, not manually configured:

- **Fall:** August 1 – December 31 → `"Fall YYYY"`
- **Spring:** January 1 – May 31 → `"Spring YYYY"`
- **Summer:** June 1 – July 31 → `"Summer YYYY"`

A utility function `getSemester(date)` returns the semester string. Every `pointsLedger` entry is tagged with the semester at creation time.

## Points Tracker Page (`/points`)

Members-only page showing the logged-in user's points.

### Layout

1. **Semester header** — current semester name (e.g. "Fall 2026"), total points, progress bar toward semester goal. The semester goal is a static value (e.g. 200) stored in `clubInfo/main` or hardcoded initially.

2. **"How points work" section** — collapsible panel reading `clubInfo/main.pointsGuide`. Shows a default message if the field is empty.

3. **Category breakdown** — row of cards, one per category. Each shows category name and total points in that category for the current semester. Categories: Meetings, Volunteering, Socials, Specials, Board.

4. **Activity log** — table of all `pointsLedger` entries for the current user, current semester. Columns: event name, date, points, status (verified badge or pending badge). Sorted newest first.

5. **Action buttons** (always visible):
   - **"Enter check-in code"** — opens inline form
   - **"Submit missing points"** — opens inline form

### Check-in Code Flow

1. Member enters a code string.
2. App queries `events` collection for a doc where `checkinCode == input` (case-insensitive).
3. If no match → error: "Invalid code."
4. If match → check `pointsLedger` for existing entry with same `memberId` + `eventId`.
5. If already claimed → error: "You've already checked in for this event."
6. If new → create `pointsLedger` entry with `method: "checkin"`, `status: "verified"`. Show success message.

### Missing Points Request Flow

1. Member selects an event from a dropdown (populated from `events` collection, showing recent events).
2. Member optionally adds a note.
3. App checks for duplicate (same `memberId` + `eventId`).
4. If duplicate → error: "You've already submitted points for this event."
5. If new → create `pointsLedger` entry with `method: "request"`, `status: "pending"`. Show success message.

## Slides Archive Page (`/slides`)

Members-only page showing downloadable slide decks.

### Layout

1. **Search bar** — filters slides by title (client-side filter on the fetched collection).
2. **Year filter** — toggle buttons: All, then each distinct year from the data (e.g. 2026, 2025). Defaults to All.
3. **Card grid** — each card shows: title, tag label, date, page count, file size, download button.
4. **Download** — links to `downloadUrl`. Opens in new tab or triggers browser download.
5. **Empty state** — "No slides found" message when search/filter returns nothing.

Data is read from the `slides` Firestore collection, sorted by date descending.

## Leaderboard Page (`/leaderboard`)

Members-only page showing ranked points totals.

### Layout

1. **Scope filter** — three buttons: Semester (default), Monthly, All-Time.
   - Semester: filters `pointsLedger` by current semester string.
   - Monthly: filters by current calendar month.
   - All-Time: no date filter.
2. **Podium** — top 3 members with rank, name, points. Scrapbook/polaroid styling.
3. **Ranked table** — positions 4+. Columns: rank, name, points. Current user's row highlighted.

### Aggregation (client-side)

1. Query `pointsLedger` where `status == "verified"`, filtered by scope.
2. Group by `memberId`, sum `points`.
3. Join with `members` collection to get display names.
4. Sort descending by total, assign ranks.

## Firestore Security Rules

### `pointsLedger`

- **Create:** authenticated user can create if `memberId == request.auth.uid` and role is `member` or `officer`.
- **Read own:** authenticated user can read where `memberId == request.auth.uid`.
- **Read all:** officers can read all (for approval queue in Phase 4, and leaderboard aggregation).
- **Read all verified:** any authenticated user with role `member` or `officer` can read any doc where `status == "verified"` (needed for leaderboard — members must read other members' verified entries to build rankings).
- **Update:** officers only (for approving/denying in Phase 4).

### `slides`

- **Read:** any authenticated member or officer.
- **Write:** officers only (Phase 4).

### `clubInfo`

- **Read:** public (already set).
- **Write:** officers only (Phase 4, for editing pointsGuide).

## Seed Data Updates

Add to `seed-emulator.mjs`:

- `pointsLedger` entries: ~15-20 entries across test members, mix of verified/pending, multiple categories, tagged with current semester.
- `slides` entries: 6-8 slide decks across 2025 and 2026 with placeholder Storage URLs.
- `checkinCode` field on 2-3 existing events.
- `pointsGuide` field on `clubInfo/main`.

## Deferred

- **RSVP:** Calendar RSVP persistence deferred to a future phase.
- **Points approval queue UI:** Officers approve/deny pending requests — Phase 4.
- **Slides upload UI:** Officers upload PDFs — Phase 4.
- **"How points work" editor:** Officers edit the guide text — Phase 4.
- **Event check-in code editor:** Officers set codes per event — Phase 4.
