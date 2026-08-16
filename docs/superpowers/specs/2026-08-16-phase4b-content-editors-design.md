# Phase 4B — Content Editors Design

## Overview

Build three officer-only content editors: gallery, officer bios, and sponsors. Each follows the same pattern as Phase 4A (inline forms, officer-gated routes, AdminNav). A shared image upload helper handles client-side resizing before uploading to Firebase Storage.

Slides upload is deferred until example PDFs are available from officers. Club info editor is not needed — all club info fields are hardcoded.

## Shared Upload Helper

`src/lib/uploadImage.js` — a reusable utility used by all three editors.

**Function signature:** `uploadImage(file, storagePath, { maxWidth = 1200, format = 'jpeg' } = {})`

**Behavior:**
1. Load the File into an Image
2. If wider than `maxWidth`, resize proportionally using a canvas
3. Export as JPEG (quality 0.85) when `format === 'jpeg'`, or PNG when `format === 'png'`
4. Upload the blob to Firebase Storage at `storagePath`
5. Return the download URL

**Usage by editor:**
- Gallery: `uploadImage(file, 'gallery/xxx.jpg', { maxWidth: 1200 })`
- Officers: `uploadImage(file, 'officers/xxx.jpg', { maxWidth: 400 })`
- Sponsors: `uploadImage(file, 'sponsors/xxx.png', { maxWidth: 400, format: 'png' })`

**Max widths by use case:**
- Gallery photos: 1200px
- Officer headshots: 400px
- Sponsor logos: 400px (PNG format to preserve transparency)

## Admin Routes

Three new routes, all behind `ProtectedRoute` with `requiredRole="officer"`.

| Route | Component | AdminNav Label |
|---|---|---|
| `/admin/gallery` | `GalleryEditor.jsx` | Gallery |
| `/admin/officers` | `OfficerEditor.jsx` | Officers |
| `/admin/sponsors` | `SponsorEditor.jsx` | Sponsors |

AdminNav grows from 4 tabs to 7: Approvals, Events, Points, Members, Gallery, Officers, Sponsors.

## Gallery Editor (`/admin/gallery`)

### Data

Uses the existing `gallery` Firestore collection. Schema per doc:

| Field | Type | Description |
|---|---|---|
| `caption` | string | Photo caption |
| `thumbUrl` | string | Storage download URL (resized) |
| `fullUrl` | string | Same as thumbUrl for now |
| `sortOrder` | number | Display order |

### UI

- Grid of photo thumbnails showing the current gallery
- Drag-and-drop reordering via `@dnd-kit/core` + `@dnd-kit/sortable`. Dragging updates `sortOrder` on all affected docs.
- "Add Photo" button opens inline form above the grid:
  - File picker (accept images only)
  - Caption text input
  - Save uploads the image (resized to 1200px), creates a Firestore doc
- Delete button on each photo. Confirm dialog: "Delete this photo? This cannot be undone." Deletes the Firestore doc.
- No edit for existing photos — add, reorder, delete only.

### Upload Flow

1. Officer selects an image file
2. `uploadImage(file, 'gallery/{generatedId}.jpg', 1200)` resizes and uploads
3. Firestore doc created with the returned URL in both `thumbUrl` and `fullUrl`
4. `sortOrder` set to `gallery.length + 1` (appended to end)

## Officer Bio Editor (`/admin/officers`)

### Data

Uses the existing `officers` Firestore collection. Schema per doc:

| Field | Type | Description |
|---|---|---|
| `name` | string | Officer name |
| `position` | string | Title/role (e.g. "President") |
| `bio` | string | Short bio paragraph |
| `photoUrl` | string | Storage download URL for headshot |
| `sortOrder` | number | Display order |

The existing `active` and `termYear` fields are ignored — not used by the editor. Officers are a flat list.

### UI

- List of all officers showing name, position, and headshot thumbnail
- "Add Officer" button opens inline form:
  - Name (text, required)
  - Position (text, required)
  - Bio (textarea)
  - Headshot file picker
  - Save uploads headshot (resized to 400px), creates Firestore doc
- Edit button on each row opens the form pre-filled. Changing the headshot uploads a new one.
- Delete button with confirm dialog: "Delete [name]? This cannot be undone." Deletes the Firestore doc.
- Sorted by `sortOrder`.

## Sponsor Editor (`/admin/sponsors`)

### Data

Uses the existing `sponsors` Firestore collection. Schema per doc:

| Field | Type | Description |
|---|---|---|
| `name` | string | Sponsor name |
| `tier` | string | "gold", "silver", or "bronze" |
| `url` | string | Sponsor website URL |
| `logoUrl` | string | Storage download URL for logo |
| `sortOrder` | number | Display order |

### UI

- Sponsors displayed grouped by tier (gold, silver, bronze sections)
- "Add Sponsor" button opens inline form:
  - Name (text, required)
  - URL (text, required)
  - Tier dropdown (gold / silver / bronze, required)
  - Logo file picker
  - Save uploads logo as PNG (resized to 400px), creates Firestore doc
- Edit button on each row to update name/URL/tier/logo
- Delete button with confirm dialog: "Delete [name]? This cannot be undone." Deletes the Firestore doc.
- Sorted by `sortOrder` within each tier.

## Firestore Rules Updates

Enable officer write on three collections currently locked with `allow write: if false`:

```
match /officers/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
match /sponsors/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
match /gallery/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
```

## Storage Rules Updates

Enable officer write on upload paths:

```
match /gallery/{file} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
match /officers/{file} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
match /sponsors/{file} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
```

## Dependencies

- `@dnd-kit/core` — drag-and-drop engine
- `@dnd-kit/sortable` — sortable preset for reordering
- No other new dependencies. Image resizing uses the browser's native Canvas API.

## Seed Data

No seed data changes needed. Existing seed data for officers, sponsors, and gallery already has the right schema — just empty URLs for photos/logos (which is the expected state before any uploads).
