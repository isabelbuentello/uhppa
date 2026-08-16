# Phase 4A — Officer Tools Design

## Overview

Build the core officer admin tools: event editor, points approval queue, and member roster with role management. These unblock the points system by giving officers the ability to create events with check-in codes, approve/deny points requests, and manage member roles — all from within the app instead of the Firebase console.

Phase 4B (content editors for slides, gallery, officers, sponsors, club info) is a separate spec.

## Admin Routes

All officer tools live under `/admin/*`, behind `ProtectedRoute` with `requiredRole="officer"`. The existing nav "Admin" button links to these pages.

| Route | Page | Status |
|---|---|---|
| `/admin/approvals` | Member approval queue | Already exists (Phase 2) |
| `/admin/events` | Event editor | New |
| `/admin/points` | Points approval queue | New |
| `/admin/members` | Member roster | New |

An admin sub-nav at the top of each admin page links between these four pages.

## Event Editor (`/admin/events`)

### Event Schema Update

Add `time` field to the existing `events` collection:

| Field | Type | Description |
|---|---|---|
| `time` | string \| null | Display time, e.g. "6:00 PM". Optional. |

All existing fields remain: `title`, `date`, `category`, `points`, `color`, `checkinCode`.

### List View

Table of all events, sorted by date descending. Columns: title, date, time, category, points, check-in code (masked by default, click to reveal), edit button, delete button.

"Create event" button at the top.

### Create/Edit Form

Inline form that appears above the table (not a modal — matches the scrapbook aesthetic better). Fields:

- **Title** — text input, required
- **Date** — date input, required
- **Time** — text input, optional, placeholder "e.g. 6:00 PM"
- **Category** — dropdown: meeting, social, volunteer, board, special. Required.
- **Points** — number input, required, default 0
- **Color** — dropdown: pink, green, blue, tape, ink. Required, default "pink".
- **Check-in code** — text input, optional, auto-uppercased on save

Save and Cancel buttons. Save creates or updates the Firestore doc. Cancel closes the form.

When editing, the form is pre-filled with existing values.

### Delete

Delete button on each row. Shows a browser `confirm()` dialog: "Delete [event title]? This cannot be undone." On confirm, deletes the Firestore doc. Existing pointsLedger entries referencing this event are unaffected (they store denormalized eventTitle and points).

### Calendar Update

The Calendar component should display the `time` field on event chips if present (e.g. "General Meeting · 6:00 PM").

## Points Approval Queue (`/admin/points`)

### List View

All `pointsLedger` entries where `status == "pending"`, sorted by `createdAt` descending (newest first). Each row shows:

- Member name (joined from `members` collection by `memberId`)
- Event title
- Points value
- Member's note (if any)
- Submitted date
- Approve button
- Deny button

### Actions

**Approve:** Updates the doc: `status: "verified"`, `reviewedBy: officer.uid`, `reviewedAt: serverTimestamp()`. No reason required.

**Deny:** Updates the doc: `status: "denied"`, `reviewedBy: officer.uid`, `reviewedAt: serverTimestamp()`. No reason required.

### Bulk Approve

Checkbox on each row. "Approve selected" button at the top, enabled when at least one row is checked. Approves all selected entries in a batch.

### Empty State

"No pending requests" message when the queue is empty.

### Member-Facing Update

Update Points.jsx activity log to handle `status: "denied"` with a red badge, in addition to existing "verified" (green) and "pending" (yellow) badges.

## Member Roster (`/admin/members`)

### List View

All docs from `members` collection, sorted alphabetically by name. Columns: name, email, classification, major, role, joined date.

### Search

Text input at the top, filters by name or email (client-side).

### Role Management

Dropdown on each row with options: `pending`, `member`, `officer`, `denied`.

**Confirmation required for:**
- Promoting to officer: confirm dialog "Make [name] an officer?"
- Demoting from officer: confirm dialog "Remove officer access for [name]?"
- No confirmation for other role changes (pending → member is the normal approval flow)

**Constraints:**
- Officers cannot change their own role

Changing the role updates the `members/{uid}` Firestore doc. The existing `onMemberRoleChange` Cloud Function automatically syncs the role to Auth custom claims.

## Firestore Rules Updates

### `events`

Change from `allow write: if false` to:
- **Create, update, delete:** officers only (`request.auth.token.role == 'officer'`)

### `pointsLedger`

Already has officer update rule from Phase 3. No changes needed.

### `members`

Already has officer read and update rules from Phase 2. No changes needed.

## Seed Data Updates

Add `time` field to a few existing seed events (e.g. "6:00 PM" for General Meetings, "5:30 PM" for Study Jam).

## Navigation Updates

Add an admin sub-nav component that appears at the top of every `/admin/*` page, linking between: Approvals, Events, Points, Members. Highlight the active page.
