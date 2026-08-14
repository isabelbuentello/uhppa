# Phase 2 — Auth & Membership Design

## Overview

Add Firebase Auth with email/password sign-up and sign-in, role-based access control, and an officer approval queue. Any email domain is accepted — officer approval is the only membership gate.

## Decisions

- Any email domain allowed (no `.edu` restriction)
- Classification options: Freshman, Sophomore, Junior, Senior
- Pending users can browse public pages but member pages show a locked state
- Any officer can approve new members
- Password reset uses Firebase's built-in `sendPasswordResetEmail`
- Hybrid approach: profile data in Firestore, role synced to custom claims via Cloud Function

## Auth Flow

### Sign-Up
1. User fills out modal: email, password, name, classification, major
2. `createUserWithEmailAndPassword` creates the Firebase Auth account
3. `sendEmailVerification` sends the verification email
4. Firestore doc created at `members/{uid}`:
   ```json
   {
     "name": "string",
     "email": "string",
     "major": "string",
     "classification": "Freshman | Sophomore | Junior | Senior",
     "role": "pending",
     "createdAt": "timestamp"
   }
   ```
5. User sees "check your email" message, then "waiting for approval" on next login

### Sign-In
1. `signInWithEmailAndPassword`
2. If email not verified: show "verify your email first" message
3. If verified, read custom claim for role:
   - `pending`: "waiting for officer approval" screen
   - `member`: full access to member pages
   - `officer`: full access + admin tools

### Password Reset
Firebase's built-in `sendPasswordResetEmail` triggered from "forgot password?" link on the login modal. Shows a confirmation message after sending.

## Data Model

### Auth Token Custom Claim
```json
{ "role": "pending | member | officer" }
```

### Firestore `members/{uid}`
```json
{
  "name": "string",
  "email": "string",
  "major": "string",
  "classification": "Freshman | Sophomore | Junior | Senior",
  "role": "pending | member | officer",
  "createdAt": "timestamp"
}
```

## Route Guards

### Access Levels

| Level | Routes | Who can access |
|-------|--------|---------------|
| Public | `/`, `/gallery`, `/calendar` | Everyone, including logged-out |
| Member | `/points`, `/leaderboard`, `/slides` | `member` and `officer` roles |
| Officer | `/admin/*` (Phase 4) | `officer` role only |

### ProtectedRoute Component
Wraps member-only and officer-only routes. Checks user role from AuthContext:
- **Not logged in**: opens the login modal
- **Pending**: shows "waiting for approval" message inline
- **Wrong role**: shows "members only" message

### Nav Behavior
- Public tabs always visible
- Member tabs (Points, Leaderboard, Slides) always visible in nav but guarded on click
- Users can see what's available and know they need to sign in

## Auth Context

### AuthProvider
Wraps the entire app. Provides `{ user, role, loading }` via `useAuth()` hook.

- Listens to `onAuthStateChanged` for login/logout
- On auth state change, calls `getIdTokenResult()` to read the role claim
- Exposes state to all components

### Token Refresh After Approval
Custom claims don't update until the ID token refreshes:
- **Passive**: token auto-refreshes every ~60 minutes
- **Active**: on the "waiting for approval" screen, poll `getIdTokenResult(true)` every 30 seconds
- Once role changes from `pending`, UI updates automatically
- Polling only runs on the waiting screen — no cost elsewhere

### Logout
`signOut(auth)` clears everything. AuthContext resets to `{ user: null, role: null }`.

## Cloud Function

### `onMemberRoleChange`
- Trigger: Firestore `onDocumentUpdated` on `members/{uid}`
- When `role` field changes: calls `auth.setCustomUserClaims(uid, { role: newRole })`
- ~15 lines of code

## Approval Queue

### Officer-Facing Page (`/admin/approvals`)
- Queries `members` where `role == 'pending'`, ordered by `createdAt`
- Shows each pending member: name, email, major, classification, sign-up date
- Two buttons per row: Approve (sets `role` to `member`) and Deny (sets `role` to `denied`)
- Denied users see a "your request was not approved" message if they try to log in
- Only accessible to users with `officer` role

## Firestore Security Rules

```
members/{uid}:
  - Read own doc: request.auth.uid == uid
  - Read all: request.auth.token.role == 'officer'
  - Create own doc: request.auth.uid == uid (sign-up)
  - Update role field: request.auth.token.role == 'officer'
```

## Sign-Up Modal UI

Extend existing Login.jsx with a toggle between sign-in and sign-up modes.

### Sign-In Mode
- Email, password fields
- "Forgot password?" link: calls `sendPasswordResetEmail`, shows confirmation
- "Don't have an account? Sign up" link: toggles to sign-up mode

### Sign-Up Mode
- Fields: name, email, password, classification (dropdown), major
- "Already have an account? Sign in" link: toggles back
- Submit: creates account, sends verification email, creates Firestore doc, shows "check your email"

### Error Handling
- Email already in use: inline error
- Weak password: inline error (Firebase enforces 6+ chars)
- Network error: inline error

Same scrapbook styling throughout — Tape, offset shadows, handwriting font accents.

## New Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.jsx` | AuthProvider + useAuth hook |
| `src/components/ProtectedRoute.jsx` | Route guard wrapper |
| `src/components/PendingApproval.jsx` | "Waiting for approval" screen |
| `src/components/ApprovalQueue.jsx` | Officer approval queue page |
| `functions/index.js` | Cloud Function: onMemberRoleChange |

## Modified Files

| File | Changes |
|------|---------|
| `src/components/Login.jsx` | Add sign-up mode, real Firebase Auth calls, error handling, password reset |
| `src/App.jsx` | Wrap in AuthProvider, add ProtectedRoute to member routes, add /admin/approvals route, replace fake user state with useAuth |
| `firestore.rules` | Add members collection rules |

## Done When
A new sign-up sees a "waiting for approval" state, and an officer approving them unlocks member pages on next token refresh.
