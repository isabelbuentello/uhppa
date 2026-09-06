# Membership QR Codes Page

## Goal

Add a public "Membership" page where visitors can scan QR codes for payment methods and membership forms. Officers manage QR codes dynamically through an admin editor.

## Architecture

A new public route `/membership` displays QR code entries as vertical list cards. QR codes are auto-generated from URLs using `qrcode.react`, with an optional image upload override for branded QR codes. Officers manage entries via `/admin/membership` with full CRUD and reordering.

## Public Page — `/membership`

- New nav tab "Membership" between Calendar and Slides — **public**, no login required
- `SectionHeading` with kicker "join us" and title "Membership."
- Vertical stack of list cards, each containing:
  - **Left:** QR code (auto-generated via `qrcode.react` from the stored URL, or uploaded image if provided)
  - **Right:** Label (bold title), description (body text), category tag (small mono badge)
- Cards styled with `2px solid var(--ink)` border, `box-shadow: 4px 4px 0 var(--ink)`, white background
- QR code area: 140x140px on desktop, centered above text on mobile
- Empty state if no QR codes: "coming soon" in Kalam cursive
- Responsive: on mobile (<768px), cards stack QR above text instead of side-by-side

## Admin Editor — `/admin/membership`

- Officer-only route, added to AdminNav tabs
- Same CRUD pattern as OfficerEditor/SlidesEditor
- Form fields per entry:
  - **Label** — required (e.g. "Venmo", "Membership Form")
  - **URL** — required (the link the QR code encodes)
  - **Description** — optional (e.g. "Scan to pay $25 semester dues. Include your name in the note.")
  - **Category tag** — optional, free text (e.g. "Payment", "Form", "Link")
  - **Image override** — optional file upload. If provided, displays uploaded image instead of auto-generated QR
- Table view: Label, Tag, URL (truncated), Actions (edit/del)
- Reorder with up/down arrow buttons (same pattern as OfficerEditor), swaps `sortOrder` values
- Add/edit form in a collapsible panel above the table

## Firestore Collection — `qrCodes`

Each document:
```
{
  label: string,        // "Venmo" — required
  url: string,          // "https://venmo.com/..." — required
  description: string,  // "Scan to pay $25 dues" — optional
  tag: string,          // "Payment" — optional
  imageUrl: string,     // uploaded image URL — optional, overrides auto-generated QR
  sortOrder: number     // for ordering
}
```

Queried with `orderBy('sortOrder')`.

## Nav Changes

**App.jsx tabs array:**
```
{ id: 'membership', path: '/membership', label: 'Membership' }
```
Inserted after Calendar, before Slides.

**App.jsx routes:**
- `/membership` — public, no ProtectedRoute wrapper
- `/admin/membership` — officer-only ProtectedRoute

**AdminNav:** Add `{ path: '/admin/membership', label: 'Membership' }` to tabs.

## New Files

- `src/components/Membership.jsx` — public page
- `src/components/MembershipEditor.jsx` — admin editor

## Dependencies

- `qrcode.react` — lightweight QR code generation (~5KB)

## Mobile Responsive

- List cards switch from horizontal (QR left, text right) to vertical (QR centered above text) at 768px
- Add `className="membership-cards"` for CSS targeting
- QR code scales to 180px centered on mobile
