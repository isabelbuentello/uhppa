# Phase 3 — Member Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Points, Slides, and Leaderboard pages to real Firestore data, add check-in code and missing-points-request flows, and add a slides viewer with search/download.

**Architecture:** Each page reads from Firestore via existing `useFirestoreQuery` / `useFirestoreDoc` hooks. Points page writes to `pointsLedger` collection. A shared `getSemester()` utility derives semester strings from dates. Leaderboard aggregates verified `pointsLedger` entries client-side. All three pages are behind the existing `ProtectedRoute` member gate.

**Tech Stack:** React 19, Firebase Firestore (onSnapshot real-time), Firebase Storage (download URLs), existing `useFirestore.js` hooks, existing `AuthContext`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/lib/semester.js` | Create | `getSemester(date)` utility |
| `src/components/Points.jsx` | Modify | Replace hardcoded data with Firestore queries, add check-in and request forms |
| `src/components/Slides.jsx` | Modify | Replace hardcoded data with Firestore queries, wire download buttons |
| `src/components/Leaderboard.jsx` | Modify | Replace hardcoded data with Firestore aggregation |
| `firestore.rules` | Modify | Add `pointsLedger` and `slides` rules |
| `scripts/seed-emulator.mjs` | Modify | Add `pointsLedger`, `slides`, `checkinCode`, `pointsGuide` seed data |
| `firestore.indexes.json` | Modify | Add composite indexes for `pointsLedger` queries |

---

### Task 1: Semester Utility

**Files:**
- Create: `src/lib/semester.js`

- [ ] **Step 1: Create the semester utility**

```js
// src/lib/semester.js

/**
 * Derives a semester string from a date.
 * Aug 1 – Dec 31 → "Fall YYYY"
 * Jan 1 – May 31 → "Spring YYYY"
 * Jun 1 – Jul 31 → "Summer YYYY"
 */
export function getSemester(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();
  if (month >= 7) return `Fall ${year}`;       // Aug (7) – Dec (11)
  if (month <= 4) return `Spring ${year}`;     // Jan (0) – May (4)
  return `Summer ${year}`;                      // Jun (5) – Jul (6)
}
```

- [ ] **Step 2: Verify it works**

Open a browser console or Node REPL and test:
```
getSemester(new Date('2026-08-14')) → "Fall 2026"
getSemester(new Date('2026-03-15')) → "Spring 2026"
getSemester(new Date('2026-06-20')) → "Summer 2026"
getSemester(new Date('2026-12-31')) → "Fall 2026"
getSemester(new Date('2026-01-01')) → "Spring 2026"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/semester.js
git commit -m "feat: add getSemester utility for auto-deriving semester strings"
```

---

### Task 2: Seed Data

**Files:**
- Modify: `scripts/seed-emulator.mjs`
- Modify: `firestore.indexes.json`

- [ ] **Step 1: Add pointsLedger, slides, checkinCode, and pointsGuide to seed script**

Add the following sections to `scripts/seed-emulator.mjs`, after the existing `testMembers` section and before the `console.log('\n🎉 Seed complete!')` line:

```js
  // --- Points Guide ---
  await db.doc('clubInfo/main').update({
    pointsGuide: 'Earn points by attending meetings, volunteering, and participating in socials. General Meetings are worth 10 pts, volunteer events 15–20 pts, socials 5 pts, and special events vary. Reach 200 pts by end of semester for honors cords at graduation!',
    semesterGoal: 200,
  });
  console.log('✓ pointsGuide + semesterGoal added to clubInfo');

  // --- Check-in Codes on some events ---
  await db.doc('events/gm-apr02').update({ checkinCode: 'UHPPA0402' });
  await db.doc('events/gm-apr16').update({ checkinCode: 'UHPPA0416' });
  await db.doc('events/gm-apr30').update({ checkinCode: 'UHPPA0430' });
  console.log('✓ checkinCodes added to 3 events');

  // --- Points Ledger ---
  const ledgerEntries = [
    { memberId: 'test-member-1', eventId: 'gm-apr02',    eventTitle: 'General Meeting',    points: 10, category: 'meeting',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-02'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-member-1', eventId: 'study-apr07',  eventTitle: 'Study Jam',           points: 5,  category: 'social',    semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-07'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-member-1', eventId: 'vol-apr11',    eventTitle: 'Volunteer: Clinic',   points: 15, category: 'volunteer', semester: 'Fall 2026', method: 'request', status: 'verified', note: 'Was there but forgot code', createdAt: new Date('2026-04-11'), reviewedBy: 'test-officer-1', reviewedAt: new Date('2026-04-12') },
    { memberId: 'test-member-1', eventId: 'gm-apr16',    eventTitle: 'General Meeting',    points: 10, category: 'meeting',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-16'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-member-1', eventId: 'panel-apr20',  eventTitle: 'Pharm School Panel',  points: 12, category: 'special',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-20'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-member-1', eventId: 'blood-apr25',  eventTitle: 'Blood Drive',         points: 20, category: 'volunteer', semester: 'Fall 2026', method: 'request', status: 'pending',  note: 'Helped set up tables', createdAt: new Date('2026-04-25'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-member-1', eventId: 'movie-apr25',  eventTitle: 'Movie Night',         points: 5,  category: 'social',    semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-25'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-pending-1', eventId: 'gm-apr02',   eventTitle: 'General Meeting',    points: 10, category: 'meeting',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-02'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-pending-1', eventId: 'gm-apr16',   eventTitle: 'General Meeting',    points: 10, category: 'meeting',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-16'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-pending-1', eventId: 'vol-apr11',   eventTitle: 'Volunteer: Clinic',   points: 15, category: 'volunteer', semester: 'Fall 2026', method: 'request', status: 'verified', note: '', createdAt: new Date('2026-04-11'), reviewedBy: 'test-officer-1', reviewedAt: new Date('2026-04-12') },
    { memberId: 'test-pending-2', eventId: 'gm-apr02',   eventTitle: 'General Meeting',    points: 10, category: 'meeting',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-02'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-pending-2', eventId: 'study-apr07', eventTitle: 'Study Jam',           points: 5,  category: 'social',    semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-07'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-officer-1', eventId: 'gm-apr02',   eventTitle: 'General Meeting',    points: 10, category: 'meeting',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-02'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-officer-1', eventId: 'gm-apr16',   eventTitle: 'General Meeting',    points: 10, category: 'meeting',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-16'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-officer-1', eventId: 'vol-apr11',   eventTitle: 'Volunteer: Clinic',   points: 15, category: 'volunteer', semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-11'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-officer-1', eventId: 'panel-apr20', eventTitle: 'Pharm School Panel',  points: 12, category: 'special',   semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-20'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-officer-1', eventId: 'blood-apr25', eventTitle: 'Blood Drive',         points: 20, category: 'volunteer', semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-25'), reviewedBy: null, reviewedAt: null },
    { memberId: 'test-officer-1', eventId: 'kaplan-apr23',eventTitle: 'Kaplan MCAT Q&A',     points: 8,  category: 'social',    semester: 'Fall 2026', method: 'checkin', status: 'verified', note: '', createdAt: new Date('2026-04-23'), reviewedBy: null, reviewedAt: null },
  ];
  for (let i = 0; i < ledgerEntries.length; i++) {
    await db.doc(`pointsLedger/ledger-${i + 1}`).set(ledgerEntries[i]);
  }
  console.log(`✓ pointsLedger (${ledgerEntries.length})`);

  // --- Slides ---
  const slides = [
    { id: 'slide-gm-apr16',  title: 'General Meeting — Apr 16',    date: '2026-04-16', tag: 'GM',       year: 2026, pageCount: 18, fileSize: '2.4 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2026-04-16'), sortOrder: 1 },
    { id: 'slide-panel',     title: 'Pharm School Panel Q&A',      date: '2026-04-20', tag: 'Panel',    year: 2026, pageCount: 24, fileSize: '3.1 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2026-04-20'), sortOrder: 2 },
    { id: 'slide-gm-apr02',  title: 'General Meeting — Apr 02',    date: '2026-04-02', tag: 'GM',       year: 2026, pageCount: 16, fileSize: '2.1 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2026-04-02'), sortOrder: 3 },
    { id: 'slide-kaplan',    title: 'Kaplan MCAT — Prep Overview',  date: '2026-04-23', tag: 'Prep',     year: 2026, pageCount: 32, fileSize: '4.8 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2026-04-23'), sortOrder: 4 },
    { id: 'slide-ethics',    title: 'Pharmacy Ethics Workshop',     date: '2026-03-28', tag: 'Workshop', year: 2026, pageCount: 22, fileSize: '2.9 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2026-03-28'), sortOrder: 5 },
    { id: 'slide-research',  title: 'Intro to Research: Finding a Lab', date: '2026-03-14', tag: 'Research', year: 2026, pageCount: 20, fileSize: '2.5 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2026-03-14'), sortOrder: 6 },
    { id: 'slide-fall-close',title: 'Fall Semester Closer',         date: '2025-12-04', tag: 'GM',       year: 2025, pageCount: 20, fileSize: '2.7 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2025-12-04'), sortOrder: 7 },
    { id: 'slide-ochem',     title: 'Surviving OChem I',            date: '2025-11-13', tag: 'Workshop', year: 2025, pageCount: 26, fileSize: '3.4 MB', storageUrl: '', downloadUrl: '', uploadedBy: 'test-officer-1', createdAt: new Date('2025-11-13'), sortOrder: 8 },
  ];
  for (const s of slides) {
    const { id, ...data } = s;
    await db.doc(`slides/${id}`).set(data);
  }
  console.log(`✓ slides (${slides.length})`);
```

- [ ] **Step 2: Add composite indexes for pointsLedger queries**

Replace the contents of `firestore.indexes.json` with:

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
    },
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "pointsLedger",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "memberId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "pointsLedger",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "semester", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 3: Run seed to verify**

```bash
npm run emulators
# In another terminal:
node scripts/seed-emulator.mjs
```

Expected: all `✓` lines print without errors, including `✓ pointsLedger (18)` and `✓ slides (8)`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-emulator.mjs firestore.indexes.json
git commit -m "feat: add pointsLedger, slides seed data and Firestore indexes"
```

---

### Task 3: Firestore Security Rules

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Update firestore.rules**

Replace the entire contents of `firestore.rules` with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public collections — anyone can read
    match /events/{doc} {
      allow read: if true;
      allow write: if false; // locked down until Phase 4
    }
    match /officers/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /sponsors/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /clubInfo/{doc} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'officer';
    }
    match /gallery/{doc} {
      allow read: if true;
      allow write: if false;
    }
    // Members collection
    match /members/{uid} {
      allow create: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null && request.auth.token.role == 'officer';
      allow update: if request.auth != null && request.auth.token.role == 'officer';
    }
    // Points ledger
    match /pointsLedger/{doc} {
      // Members can create their own entries
      allow create: if request.auth != null
        && request.resource.data.memberId == request.auth.uid
        && request.auth.token.role in ['member', 'officer'];
      // Members can read their own entries
      allow read: if request.auth != null
        && resource.data.memberId == request.auth.uid;
      // Any member/officer can read verified entries (needed for leaderboard)
      allow read: if request.auth != null
        && request.auth.token.role in ['member', 'officer']
        && resource.data.status == 'verified';
      // Officers can read and update all entries (approval queue in Phase 4)
      allow read, update: if request.auth != null
        && request.auth.token.role == 'officer';
    }
    // Slides collection
    match /slides/{doc} {
      allow read: if request.auth != null
        && request.auth.token.role in ['member', 'officer'];
      allow write: if request.auth != null
        && request.auth.token.role == 'officer';
    }
  }
}
```

- [ ] **Step 2: Deploy rules**

```bash
npx firebase deploy --only firestore:rules
```

Expected: `✔ firestore: released rules firestore.rules to cloud.firestore`

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat: add security rules for pointsLedger and slides"
```

---

### Task 4: Points Tracker Page

**Files:**
- Modify: `src/components/Points.jsx`

- [ ] **Step 1: Rewrite Points.jsx with Firestore data**

Replace the entire contents of `src/components/Points.jsx` with:

```jsx
import { useState, useMemo } from 'react';
import { Tape, Highlight, Scribble, Sticky, Stamp, SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreQuery, useFirestoreDoc } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { getSemester } from '../lib/semester';

const CATEGORIES = [
  { key: 'meeting',   label: 'General Meetings', color: 'pink' },
  { key: 'volunteer', label: 'Volunteering',     color: 'blue' },
  { key: 'social',    label: 'Socials',           color: 'green' },
  { key: 'special',   label: 'Specials',          color: 'tape' },
  { key: 'board',     label: 'Board',             color: 'ink' },
];

const cmap = (c) => `var(--${c})`;

const Points = ({ tweaks }) => {
  const { user } = useAuth();
  const currentSemester = getSemester();
  const { data: clubInfo } = useFirestoreDoc('clubInfo', 'main');
  const semesterGoal = clubInfo?.semesterGoal || 200;

  // Fetch this user's ledger entries for current semester
  const { data: ledger, loading } = useFirestoreQuery('pointsLedger', [
    where('memberId', '==', user?.uid || ''),
    orderBy('createdAt', 'desc'),
  ]);

  // Filter to current semester
  const semesterEntries = useMemo(() =>
    ledger.filter(e => e.semester === currentSemester),
  [ledger, currentSemester]);

  // Total (verified only)
  const total = useMemo(() =>
    semesterEntries.filter(e => e.status === 'verified').reduce((s, e) => s + e.points, 0),
  [semesterEntries]);

  // Category breakdown (verified only)
  const breakdown = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      value: semesterEntries.filter(e => e.status === 'verified' && e.category === cat.key).reduce((s, e) => s + e.points, 0),
    })),
  [semesterEntries]);

  const pct = Math.min(100, (total / semesterGoal) * 100);

  // --- Check-in code form ---
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [codeSubmitting, setCodeSubmitting] = useState(false);

  const submitCode = async () => {
    setCodeErr('');
    setCodeMsg('');
    if (!code.trim()) { setCodeErr('Enter a code.'); return; }
    setCodeSubmitting(true);
    try {
      // Find event with matching checkinCode
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('checkinCode', '==', code.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        // Try case-insensitive by also checking lowercase
        const q2 = query(eventsRef, where('checkinCode', '==', code.trim()));
        const snap2 = await getDocs(q2);
        if (snap2.empty) {
          setCodeErr('Invalid code. Double-check and try again.');
          setCodeSubmitting(false);
          return;
        }
        snap.docs.push(...snap2.docs);
      }
      const eventDoc = snap.docs[0];
      const eventData = eventDoc.data();

      // Check for duplicate
      const dupQ = query(collection(db, 'pointsLedger'),
        where('memberId', '==', user.uid),
        where('eventId', '==', eventDoc.id));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setCodeErr("You've already checked in for this event.");
        setCodeSubmitting(false);
        return;
      }

      // Create verified entry
      await addDoc(collection(db, 'pointsLedger'), {
        memberId: user.uid,
        eventId: eventDoc.id,
        eventTitle: eventData.title,
        points: eventData.points || 0,
        category: eventData.category || 'meeting',
        semester: getSemester(eventData.date ? new Date(eventData.date) : new Date()),
        method: 'checkin',
        status: 'verified',
        note: '',
        createdAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
      });
      setCodeMsg(`Checked in for "${eventData.title}" — +${eventData.points} pts!`);
      setCode('');
    } catch (err) {
      setCodeErr('Something went wrong. Try again.');
    }
    setCodeSubmitting(false);
  };

  // --- Missing points request form ---
  const [reqOpen, setReqOpen] = useState(false);
  const [reqEventId, setReqEventId] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [reqMsg, setReqMsg] = useState('');
  const [reqErr, setReqErr] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const { data: events } = useFirestoreQuery('events');

  const submitRequest = async () => {
    setReqErr('');
    setReqMsg('');
    if (!reqEventId) { setReqErr('Select an event.'); return; }
    setReqSubmitting(true);
    try {
      // Check for duplicate
      const dupQ = query(collection(db, 'pointsLedger'),
        where('memberId', '==', user.uid),
        where('eventId', '==', reqEventId));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setReqErr("You've already submitted points for this event.");
        setReqSubmitting(false);
        return;
      }

      const event = events.find(e => e.id === reqEventId);
      await addDoc(collection(db, 'pointsLedger'), {
        memberId: user.uid,
        eventId: reqEventId,
        eventTitle: event?.title || 'Unknown Event',
        points: event?.points || 0,
        category: event?.category || 'meeting',
        semester: getSemester(event?.date ? new Date(event.date) : new Date()),
        method: 'request',
        status: 'pending',
        note: reqNote.trim(),
        createdAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
      });
      setReqMsg('Request submitted! An officer will review it.');
      setReqEventId('');
      setReqNote('');
    } catch (err) {
      setReqErr('Something went wrong. Try again.');
    }
    setReqSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)' }}>
        loading your points...
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
      <SectionHeading kicker="your file" title="Points tracker" rotate={-1} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, marginTop: 32 }}>
        {/* Left: big stat card */}
        <div style={{ position: 'relative' }}>
          <Tape r={-8} color="var(--pink)" w={110} style={{ top: -12, left: 40 }} />
          <div style={{
            background: 'white', border: '2px solid var(--ink)',
            boxShadow: '6px 6px 0 var(--ink)', padding: '28px 28px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{currentSemester} &middot; active</div>
                <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, lineHeight: 1, marginTop: 6 }}>{user?.displayName || 'Member'}</div>
              </div>
            </div>

            {/* Big number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 28 }}>
              <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 130, lineHeight: .85 }}>{total}</span>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, color: 'var(--ink-soft)' }}>/ {semesterGoal} pts</span>
            </div>

            {/* Ruler-style progress */}
            <div style={{ marginTop: 14, position: 'relative', height: 28, border: '2px solid var(--ink)', background: 'white' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 24px, var(--ink) 24px 25px)' }} />
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`,
                background: 'var(--pink)',
                borderRight: pct > 0 ? '2px solid var(--ink)' : 'none',
              }} />
              {pct > 0 && (
                <span style={{
                  position: 'absolute', left: `${pct}%`, top: -22, transform: 'translateX(-50%)',
                  fontFamily: "'Kalam', cursive", fontSize: 16, color: 'var(--pink)',
                }}>you! &darr;</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '.1em' }}>
              <span>0</span><span>GOAL {semesterGoal}</span>
            </div>

            {/* Cords reward */}
            {total < semesterGoal && (
              <div style={{ marginTop: 20, padding: 14, background: 'var(--paper-2)', border: '1.5px dashed var(--ink)' }}>
                <b style={{ fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', fontSize: 12, textTransform: 'uppercase' }}>Next reward</b>
                <div style={{ fontSize: 15, marginTop: 4 }}>
                  <b>{semesterGoal - total}</b> pts until <Highlight color="var(--tape)">honors cords</Highlight> at graduation.
                </div>
              </div>
            )}
            {total >= semesterGoal && (
              <div style={{ marginTop: 20, padding: 14, background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)' }}>
                <b style={{ fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', fontSize: 12, textTransform: 'uppercase' }}>Goal reached!</b>
                <div style={{ fontSize: 15, marginTop: 4 }}>
                  You've hit your semester goal. <Highlight color="var(--tape)">Honors cords earned!</Highlight>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: category bars */}
        <div style={{ position: 'relative' }}>
          <Sticky color="var(--tape)" rotate={3} style={{ position: 'absolute', top: -20, right: -10, width: 150, zIndex: 2 }}>
            <b>How it&apos;s<br />counted &darr;</b>
          </Sticky>
          <div style={{ background: 'white', border: '2px solid var(--ink)', padding: '22px 22px 18px', boxShadow: '5px 5px 0 var(--ink)' }}>
            <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26 }}>by category</div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {breakdown.map(b => (
                <div key={b.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 600 }}>
                    <span>{b.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{b.value} pts</span>
                  </div>
                  <div style={{ marginTop: 6, height: 18, border: '1.5px solid var(--ink)', background: 'white', position: 'relative' }}>
                    {b.value > 0 && (
                      <div style={{
                        position: 'absolute', inset: 0, left: 0,
                        width: `${Math.min(100, (b.value / semesterGoal) * 100 * CATEGORIES.length)}%`,
                        background: cmap(b.color),
                        backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(0,0,0,.08) 6px 7px)',
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* How points work */}
            {clubInfo?.pointsGuide && (
              <details style={{ marginTop: 20 }}>
                <summary style={{
                  fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', fontSize: 12,
                  textTransform: 'uppercase', cursor: 'pointer', color: 'var(--ink-soft)',
                }}>How points work</summary>
                <p style={{ marginTop: 8, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
                  {clubInfo.pointsGuide}
                </p>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <button onClick={() => { setCodeOpen(!codeOpen); setReqOpen(false); }} style={{
          border: '2px solid var(--ink)', background: codeOpen ? 'var(--ink)' : 'var(--green)',
          color: codeOpen ? 'var(--paper)' : 'var(--ink)',
          padding: '14px 22px', fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
          textTransform: 'uppercase', fontSize: 13, cursor: 'pointer', boxShadow: '4px 4px 0 var(--ink)',
        }}>&#10003; Enter check-in code</button>
        <button onClick={() => { setReqOpen(!reqOpen); setCodeOpen(false); }} style={{
          border: '2px solid var(--ink)', background: reqOpen ? 'var(--ink)' : 'var(--pink)',
          color: reqOpen ? 'var(--paper)' : 'var(--ink)',
          padding: '14px 22px', fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
          textTransform: 'uppercase', fontSize: 13, cursor: 'pointer', boxShadow: '4px 4px 0 var(--ink)',
        }}>&#65291; Submit missing points</button>
      </div>

      {/* Check-in code form */}
      {codeOpen && (
        <div style={{ marginTop: 18, background: 'white', border: '2px solid var(--ink)', padding: '20px 24px', boxShadow: '5px 5px 0 var(--ink)', maxWidth: 500 }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, marginBottom: 14 }}>enter check-in code</div>
          {codeErr && <div style={{ background: 'oklch(0.93 0.08 20)', border: '1.5px solid var(--pink)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{codeErr}</div>}
          {codeMsg && <div style={{ background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{codeMsg}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. UHPPA0402"
              style={{ flex: 1, padding: '10px 14px', border: '2px solid var(--ink)', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, textTransform: 'uppercase', boxSizing: 'border-box' }} />
            <button onClick={submitCode} disabled={codeSubmitting} style={{
              border: '2px solid var(--ink)', background: 'var(--green)', padding: '10px 18px',
              fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12, cursor: codeSubmitting ? 'wait' : 'pointer',
            }}>{codeSubmitting ? '...' : 'submit'}</button>
          </div>
        </div>
      )}

      {/* Missing points request form */}
      {reqOpen && (
        <div style={{ marginTop: 18, background: 'white', border: '2px solid var(--ink)', padding: '20px 24px', boxShadow: '5px 5px 0 var(--ink)', maxWidth: 500 }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, marginBottom: 14 }}>submit missing points</div>
          {reqErr && <div style={{ background: 'oklch(0.93 0.08 20)', border: '1.5px solid var(--pink)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{reqErr}</div>}
          {reqMsg && <div style={{ background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{reqMsg}</div>}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>event</span>
            <select value={reqEventId} onChange={e => setReqEventId(e.target.value)} style={{
              width: '100%', padding: '10px 14px', border: '2px solid var(--ink)', background: 'var(--paper)',
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, boxSizing: 'border-box',
            }}>
              <option value="">select an event...</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title} — {ev.date}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>note (optional)</span>
            <input value={reqNote} onChange={e => setReqNote(e.target.value)} placeholder="e.g. I forgot to check in"
              style={{ width: '100%', padding: '10px 14px', border: '2px solid var(--ink)', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, boxSizing: 'border-box' }} />
          </label>
          <button onClick={submitRequest} disabled={reqSubmitting} style={{
            border: '2px solid var(--ink)', background: 'var(--pink)', padding: '10px 18px',
            fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12, cursor: reqSubmitting ? 'wait' : 'pointer',
          }}>{reqSubmitting ? 'submitting...' : 'submit request'}</button>
        </div>
      )}

      {/* Log table */}
      <div style={{ marginTop: 52 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 32, margin: 0 }}>recent activity</h3>
          <Scribble color="var(--pink)" width={140} height={10} />
        </div>

        {semesterEntries.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
            no points yet this semester — check in at your next event!
          </div>
        ) : (
          <div style={{ marginTop: 18, border: '2px solid var(--ink)', background: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px', background: 'var(--ink)', color: 'var(--paper)', fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              <div style={{ padding: '10px 16px' }}>Date</div>
              <div style={{ padding: '10px 16px' }}>Event</div>
              <div style={{ padding: '10px 16px' }}>Points</div>
              <div style={{ padding: '10px 16px' }}>Status</div>
            </div>
            {semesterEntries.map((r, i) => {
              const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
              return (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px',
                  borderTop: i === 0 ? 'none' : '1.5px dashed oklch(0.8 0.03 240)',
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
                }}>
                  <div style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace" }}>
                    {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                  </div>
                  <div style={{ padding: '12px 16px' }}>{r.eventTitle}</div>
                  <div style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>+{r.points}</div>
                  <div style={{ padding: '12px 16px' }}>
                    {r.status === 'verified' ? (
                      <span style={{ color: 'var(--green)', fontFamily: "'Kalam', cursive", fontSize: 18 }}>&#10003; verified</span>
                    ) : (
                      <span style={{ color: 'var(--tape)', fontFamily: "'Kalam', cursive", fontSize: 18 }}>&#9203; pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Points;
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, navigate to `/points` while logged in. You should see:
- Your name and semester displayed
- "0 / 200 pts" (or whatever your actual points are)
- Empty activity log or seed data if using emulator
- Both action buttons open their forms
- Check-in code form accepts a code and shows success/error
- Missing points form shows event dropdown and submits

- [ ] **Step 3: Commit**

```bash
git add src/components/Points.jsx
git commit -m "feat: wire Points page to Firestore with check-in and request forms"
```

---

### Task 5: Slides Archive Page

**Files:**
- Modify: `src/components/Slides.jsx`

- [ ] **Step 1: Rewrite Slides.jsx with Firestore data**

Replace the entire contents of `src/components/Slides.jsx` with:

```jsx
import { useState, useMemo } from 'react';
import { Tape, SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';

const cmap = (c) => ({
  pink: 'var(--pink)', green: 'var(--green)', blue: 'var(--blue)',
  tape: 'var(--tape)', ink: 'var(--ink)',
}[c] || 'var(--tape)');

const tagColors = {
  'GM': 'pink', 'Panel': 'tape', 'Prep': 'green',
  'Workshop': 'blue', 'Research': 'green', 'Social': 'green',
};

const DeckCard = ({ deck, rot }) => {
  const [hover, setHover] = useState(false);
  const color = cmap(tagColors[deck.tag] || 'tape');
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', transform: `rotate(${rot}deg) ${hover ? 'translate(-2px,-3px)' : ''}`, transition: 'transform .15s' }}>
      <Tape r={-6} color={color} w={90} style={{ top: -10, left: 40 }} />
      <div style={{
        background: 'white', border: '2px solid var(--ink)',
        boxShadow: hover ? '8px 8px 0 var(--pink)' : '5px 5px 0 var(--ink)',
        transition: 'box-shadow .15s',
      }}>
        {/* mock pdf preview */}
        <div style={{
          height: 200, borderBottom: '2px solid var(--ink)',
          background: 'var(--paper)',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 18px, oklch(0.85 0.03 85) 18px 19px)',
          padding: 18, position: 'relative',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 18, lineHeight: 1.05, maxWidth: '80%' }}>
            {deck.title.split(' — ')[0]}
          </div>
          <div style={{ marginTop: 10, fontFamily: "'Kalam', cursive", fontSize: 14, color: 'var(--ink-soft)' }}>{deck.date}</div>
          <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', gap: 3, alignItems: 'flex-end' }}>
            {[12, 22, 18, 28, 16, 24].map((h, i) => (
              <span key={i} style={{ width: 8, height: h, background: i % 2 ? color : 'var(--ink)' }} />
            ))}
          </div>
          <div style={{
            position: 'absolute', left: 18, bottom: 14,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.12em', color: 'var(--ink-soft)',
          }}>pg. 1 / {deck.pageCount}</div>
        </div>
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              background: color, border: '1.5px solid var(--ink)',
              padding: '2px 8px', fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
            }}>{deck.tag}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)' }}>
              {deck.pageCount} pp &middot; {deck.fileSize}
            </span>
          </div>
          <div style={{ marginTop: 10, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>
            {deck.title}
          </div>
          {deck.downloadUrl ? (
            <a href={deck.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{
                marginTop: 14, width: '100%',
                border: '2px solid var(--ink)', background: hover ? 'var(--ink)' : 'var(--paper)',
                color: hover ? 'var(--paper)' : 'var(--ink)',
                padding: '10px 12px',
                fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
                textTransform: 'uppercase', fontSize: 12, cursor: 'pointer',
              }}>&darr; Download PDF</button>
            </a>
          ) : (
            <button disabled style={{
              marginTop: 14, width: '100%',
              border: '2px solid var(--ink)', background: 'var(--paper-2)',
              color: 'var(--ink-soft)',
              padding: '10px 12px',
              fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
              textTransform: 'uppercase', fontSize: 12, cursor: 'not-allowed',
            }}>no file yet</button>
          )}
        </div>
      </div>
    </div>
  );
};

const arrowBtn = {
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
  border: '2px solid var(--ink)', background: 'white',
  padding: '10px 14px', cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const Slides = () => {
  const [q, setQ] = useState('');
  const [year, setYear] = useState('all');
  const { data: slides, loading } = useFirestoreQuery('slides');

  // Derive available years from data
  const years = useMemo(() => {
    const set = new Set(slides.map(s => s.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [slides]);

  const filtered = useMemo(() => {
    return slides
      .filter(d => {
        if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
        if (year !== 'all' && d.year !== Number(year)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [slides, q, year]);

  if (loading) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)' }}>
        loading slides...
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
      <SectionHeading kicker="archive" title="Slides & PDFs" rotate={-1} />
      <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, maxWidth: 620, marginTop: 16, color: 'var(--ink-soft)' }}>
        Every UHPPA deck, filed, stamped &amp; taped up. Click any card to download the PDF.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="search titles…"
            style={{
              border: '2px solid var(--ink)', background: 'white',
              padding: '10px 14px 10px 36px',
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
              width: 280, boxShadow: '3px 3px 0 var(--ink)', outline: 'none',
            }} />
          <span style={{ position: 'absolute', left: 12, top: 11, fontFamily: "'JetBrains Mono', monospace" }}>&#8981;</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setYear('all')} style={{
            ...arrowBtn,
            background: year === 'all' ? 'var(--ink)' : 'white',
            color: year === 'all' ? 'var(--paper)' : 'var(--ink)',
          }}>all</button>
          {years.map(y => (
            <button key={y} onClick={() => setYear(String(y))} style={{
              ...arrowBtn,
              background: year === String(y) ? 'var(--ink)' : 'white',
              color: year === String(y) ? 'var(--paper)' : 'var(--ink)',
            }}>{y}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
          {filtered.length} / {slides.length} decks
        </span>
      </div>

      {/* Grid */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
        {filtered.map((d, i) => <DeckCard key={d.id} deck={d} rot={(i % 3 - 1) * 1.3} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 28, color: 'var(--ink-soft)' }}>
          nothing filed under that. try another search &#9998;
        </div>
      )}
    </div>
  );
};

export default Slides;
```

- [ ] **Step 2: Verify in browser**

Navigate to `/slides` while logged in. You should see:
- Slide cards populated from Firestore (or seed data on emulator)
- Search filters by title
- Year filter buttons derived from data
- "no file yet" button on cards without a `downloadUrl`
- Empty state when search returns nothing

- [ ] **Step 3: Commit**

```bash
git add src/components/Slides.jsx
git commit -m "feat: wire Slides page to Firestore with search and year filter"
```

---

### Task 6: Leaderboard Page

**Files:**
- Modify: `src/components/Leaderboard.jsx`

- [ ] **Step 1: Rewrite Leaderboard.jsx with Firestore aggregation**

Replace the entire contents of `src/components/Leaderboard.jsx` with:

```jsx
import { useState, useMemo } from 'react';
import { Tape, SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { where } from 'firebase/firestore';
import { getSemester } from '../lib/semester';

const Podium = ({ rank, name, points, h, color, rot, crown }) => (
  <div style={{ position: 'relative', textAlign: 'center' }}>
    {crown && (
      <div style={{
        position: 'absolute', top: -52, left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
        fontSize: 56, lineHeight: 1,
      }}>&#9819;</div>
    )}
    <div style={{
      width: 160, height: 170, margin: '0 auto 14px', padding: 10,
      background: 'white', border: '2px solid var(--ink)',
      boxShadow: '4px 4px 0 var(--ink)', transform: `rotate(${rot}deg)`,
      position: 'relative',
    }}>
      <Tape r={-8} color={color} w={80} style={{ top: -10, left: 40 }} />
      <div style={{
        width: '100%', height: 120, background: color,
        display: 'grid', placeItems: 'center',
        fontFamily: "'Alfa Slab One', serif", fontSize: 48, color: 'var(--ink)',
      }}>{name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
      <div style={{ fontFamily: "'Kalam', cursive", fontSize: 15, marginTop: 4 }}>{name.split(' ')[0]}</div>
    </div>

    <div style={{
      background: color, border: '2px solid var(--ink)',
      boxShadow: '5px 5px 0 var(--ink)',
      padding: '18px 10px',
      height: h,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
    }}>
      <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 72, lineHeight: 1 }}>#{rank}</span>
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, marginTop: 6 }}>{name}</span>
      <span style={{ marginTop: 'auto', fontFamily: "'Alfa Slab One', serif", fontSize: 36 }}>{points} pts</span>
    </div>
  </div>
);

const Leaderboard = ({ tweaks }) => {
  const { user } = useAuth();
  const [scope, setScope] = useState('semester');
  const currentSemester = getSemester();

  // Fetch all verified ledger entries
  const { data: allLedger, loading: ledgerLoading } = useFirestoreQuery('pointsLedger', [
    where('status', '==', 'verified'),
  ]);

  // Fetch members for display names
  const { data: members, loading: membersLoading } = useFirestoreQuery('members');

  const loading = ledgerLoading || membersLoading;

  // Filter by scope, aggregate, rank
  const rankings = useMemo(() => {
    if (!allLedger.length) return [];

    const now = new Date();
    const filtered = allLedger.filter(entry => {
      if (scope === 'semester') return entry.semester === currentSemester;
      if (scope === 'monthly') {
        const d = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true; // all-time
    });

    // Group by memberId, sum points
    const map = {};
    for (const entry of filtered) {
      if (!map[entry.memberId]) map[entry.memberId] = 0;
      map[entry.memberId] += entry.points;
    }

    // Join with members for names
    const memberMap = {};
    for (const m of members) memberMap[m.id] = m.name || m.email?.split('@')[0] || 'Unknown';

    // Sort and rank
    return Object.entries(map)
      .map(([id, pts]) => ({ id, name: memberMap[id] || 'Member', points: pts }))
      .sort((a, b) => b.points - a.points)
      .map((entry, i) => ({ ...entry, rank: i + 1, isYou: entry.id === user?.uid }));
  }, [allLedger, members, scope, currentSemester, user]);

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  if (loading) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)' }}>
        loading leaderboard...
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
      <SectionHeading kicker="hall of fame" title="Leaderboard" rotate={-1} />
      <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
        {['semester', 'all-time', 'monthly'].map(s => (
          <button key={s} onClick={() => setScope(s)} style={{
            fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
            textTransform: 'uppercase', fontSize: 11, padding: '8px 14px',
            border: '2px solid var(--ink)',
            background: scope === s ? 'var(--ink)' : 'white',
            color: scope === s ? 'var(--paper)' : 'var(--ink)',
            cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
          }}>{s}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: "'Kalam', cursive", fontSize: 20, color: 'var(--margin)' }}>
          friendly stakes only, promise &#9825;
        </span>
      </div>

      {rankings.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 28, color: 'var(--ink-soft)' }}>
          no points recorded yet for this period.
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div style={{ marginTop: 52, display: 'grid', gridTemplateColumns: `repeat(${Math.min(top3.length, 3)}, 1fr)`, gap: 24, alignItems: 'end' }}>
              {top3.length > 1 && <Podium rank={2} name={top3[1].name} points={top3[1].points} h={200} color="var(--blue)" rot={-3} />}
              {top3.length > 0 && <Podium rank={1} name={top3[0].name} points={top3[0].points} h={270} color="var(--pink)" rot={0} crown />}
              {top3.length > 2 && <Podium rank={3} name={top3[2].name} points={top3[2].points} h={170} color="var(--green)" rot={3} />}
            </div>
          )}

          {/* Ranked list */}
          {rest.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 30, margin: 0 }}>the rest of the pack</h3>
              </div>
              <div style={{ marginTop: 18, background: 'white', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)' }}>
                {rest.map((r, i) => (
                  <div key={r.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px',
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
                    background: r.isYou ? 'oklch(0.94 0.09 95)' : 'transparent',
                    position: 'relative',
                  }}>
                    <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 32, color: r.isYou ? 'var(--pink)' : 'var(--ink)' }}>#{r.rank}</span>
                    <div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18 }}>
                        {r.name}{r.isYou ? ' (you)' : ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, textAlign: 'right' }}>
                      {r.points}
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)', marginLeft: 4 }}>pts</span>
                    </div>
                    {r.isYou && (
                      <span style={{ position: 'absolute', right: -14, top: -14, transform: 'rotate(8deg)', fontFamily: "'Kalam', cursive", color: 'var(--pink)', fontSize: 22 }}>you! &larr;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
```

- [ ] **Step 2: Verify in browser**

Navigate to `/leaderboard` while logged in. You should see:
- Scope filter buttons (semester/all-time/monthly)
- Podium with top 3 members from seed data
- Ranked table below with remaining members
- Your own row highlighted (if you have points)
- Switching scopes changes the rankings
- Empty state if no points exist for a scope

- [ ] **Step 3: Commit**

```bash
git add src/components/Leaderboard.jsx
git commit -m "feat: wire Leaderboard to Firestore with scope filters and client-side aggregation"
```

---

### Task 7: Deploy and Verify

**Files:** None (deployment only)

- [ ] **Step 1: Deploy Firestore rules and indexes**

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

Expected: both rules and indexes deploy successfully.

- [ ] **Step 2: Deploy to Vercel**

```bash
git push
```

Or if auto-deploy isn't set up:
```bash
npx vercel --prod
```

- [ ] **Step 3: Verify on production**

1. Go to uhppa.vercel.app, log in
2. Navigate to `/points` — should show your points (likely 0 on production)
3. Navigate to `/slides` — should show slide cards (empty until officers upload in Phase 4)
4. Navigate to `/leaderboard` — should show rankings (empty until members earn points)
5. Test check-in code flow on emulator with seed data code "UHPPA0402"

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "fix: Phase 3 deployment fixes"
```
