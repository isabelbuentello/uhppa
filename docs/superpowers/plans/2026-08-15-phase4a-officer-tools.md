# Phase 4A — Officer Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build event editor, points approval queue, and member roster so officers can manage the club from the app instead of the Firebase console.

**Architecture:** Three new admin pages at `/admin/events`, `/admin/points`, `/admin/members`, each behind `ProtectedRoute` with `requiredRole="officer"`. A shared `AdminNav` component links between admin pages. All pages use existing Firestore hooks and follow the scrapbook styling. Minor updates to Calendar (show time) and Points (denied badge).

**Tech Stack:** React 19, Firebase Firestore (onSnapshot, addDoc, updateDoc, deleteDoc), existing `useFirestoreQuery` hook, existing `AuthContext`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/components/AdminNav.jsx` | Create | Sub-nav linking between admin pages |
| `src/components/EventEditor.jsx` | Create | Event list + create/edit/delete form |
| `src/components/PointsQueue.jsx` | Create | Pending points approval queue with bulk approve |
| `src/components/MemberRoster.jsx` | Create | Member list with role management |
| `src/components/Calendar.jsx` | Modify | Show event time on chips |
| `src/components/Points.jsx` | Modify | Add "denied" badge |
| `src/components/ApprovalQueue.jsx` | Modify | Add AdminNav |
| `src/App.jsx` | Modify | Add new admin routes |
| `firestore.rules` | Modify | Allow officer write on events |
| `scripts/seed-emulator.mjs` | Modify | Add time field to seed events |

---

### Task 1: Admin Sub-Nav + Routes

**Files:**
- Create: `src/components/AdminNav.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/ApprovalQueue.jsx`

- [ ] **Step 1: Create AdminNav component**

```jsx
// src/components/AdminNav.jsx
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/admin/approvals', label: 'Approvals' },
  { path: '/admin/events',    label: 'Events' },
  { path: '/admin/points',    label: 'Points' },
  { path: '/admin/members',   label: 'Members' },
];

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap',
    }}>
      {tabs.map(t => {
        const active = location.pathname === t.path;
        return (
          <button key={t.path} onClick={() => navigate(t.path)} style={{
            padding: '8px 16px',
            border: '2px solid var(--ink)',
            background: active ? 'var(--ink)' : 'white',
            color: active ? 'var(--paper)' : 'var(--ink)',
            fontFamily: "'Archivo Black', sans-serif",
            letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
            cursor: 'pointer',
            boxShadow: active ? '3px 3px 0 var(--pink)' : '3px 3px 0 var(--ink)',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
};

export default AdminNav;
```

- [ ] **Step 2: Add AdminNav to ApprovalQueue**

In `src/components/ApprovalQueue.jsx`, add the import and render AdminNav at the top of the return, right after the opening `<div>`:

Add import at top:
```jsx
import AdminNav from './AdminNav';
```

Add `<AdminNav />` right after the opening div, before `<SectionHeading>`:
```jsx
<AdminNav />
```

- [ ] **Step 3: Add placeholder routes to App.jsx**

In `src/App.jsx`, add imports:
```jsx
import EventEditor from './components/EventEditor';
import PointsQueue from './components/PointsQueue';
import MemberRoster from './components/MemberRoster';
```

Add routes after the existing `/admin/approvals` route:
```jsx
<Route path="/admin/events" element={
  <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
    <EventEditor />
  </ProtectedRoute>
} />
<Route path="/admin/points" element={
  <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
    <PointsQueue />
  </ProtectedRoute>
} />
<Route path="/admin/members" element={
  <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
    <MemberRoster />
  </ProtectedRoute>
} />
```

- [ ] **Step 4: Create placeholder components**

Create `src/components/EventEditor.jsx`:
```jsx
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const EventEditor = () => (
  <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <AdminNav />
    <SectionHeading kicker="officer tools" title="Events" rotate={-1} />
    <p>Coming soon</p>
  </div>
);

export default EventEditor;
```

Create `src/components/PointsQueue.jsx`:
```jsx
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const PointsQueue = () => (
  <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <AdminNav />
    <SectionHeading kicker="officer tools" title="Points Queue" rotate={-1} />
    <p>Coming soon</p>
  </div>
);

export default PointsQueue;
```

Create `src/components/MemberRoster.jsx`:
```jsx
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const MemberRoster = () => (
  <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <AdminNav />
    <SectionHeading kicker="officer tools" title="Members" rotate={-1} />
    <p>Coming soon</p>
  </div>
);

export default MemberRoster;
```

- [ ] **Step 5: Verify**

Run `npm run dev`, log in as officer, click Admin. You should see the AdminNav with 4 tabs. Click each tab to verify routing works. All show placeholder "Coming soon" except Approvals which shows the existing queue.

- [ ] **Step 6: Commit**

```bash
git add src/components/AdminNav.jsx src/components/EventEditor.jsx src/components/PointsQueue.jsx src/components/MemberRoster.jsx src/components/ApprovalQueue.jsx src/App.jsx
git commit -m "feat: add admin sub-nav and placeholder routes for officer tools"
```

---

### Task 2: Firestore Rules + Seed Data Updates

**Files:**
- Modify: `firestore.rules`
- Modify: `scripts/seed-emulator.mjs`

- [ ] **Step 1: Update events write rule**

In `firestore.rules`, change the events rule from:
```
match /events/{doc} {
  allow read: if true;
  allow write: if false; // locked down until Phase 4
}
```
to:
```
match /events/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
```

- [ ] **Step 2: Add time field to seed events**

In `scripts/seed-emulator.mjs`, update the events array. Add a `time` field to each event. Replace the existing events array with:

```js
  const events = [
    { id: 'gm-apr02',     title: 'General Meeting',         date: '2026-04-02', time: '6:00 PM', category: 'meeting',   points: 10, color: 'pink' },
    { id: 'study-apr07',   title: 'Study Jam',               date: '2026-04-07', time: '5:30 PM', category: 'social',    points: 5,  color: 'green' },
    { id: 'vol-apr11',     title: 'Volunteer: Clinic',       date: '2026-04-11', time: '9:00 AM', category: 'volunteer', points: 15, color: 'blue' },
    { id: 'exec-apr14',    title: 'Exec Board',              date: '2026-04-14', time: '7:00 PM', category: 'board',     points: 8,  color: 'ink' },
    { id: 'gm-apr16',     title: 'General Meeting',         date: '2026-04-16', time: '6:00 PM', category: 'meeting',   points: 10, color: 'pink' },
    { id: 'panel-apr20',   title: 'Pharm School Panel',      date: '2026-04-20', time: '5:00 PM', category: 'special',   points: 12, color: 'tape' },
    { id: 'kaplan-apr23',  title: 'Kaplan MCAT Q&A',         date: '2026-04-23', time: '4:00 PM', category: 'social',    points: 8,  color: 'green' },
    { id: 'blood-apr25',   title: 'Blood Drive',             date: '2026-04-25', time: '10:00 AM', category: 'volunteer', points: 20, color: 'pink' },
    { id: 'movie-apr25',   title: 'Movie Night',             date: '2026-04-25', time: '7:30 PM', category: 'social',    points: 5,  color: 'blue' },
    { id: 'gm-apr30',     title: 'General Meeting',         date: '2026-04-30', time: '6:00 PM', category: 'meeting',   points: 10, color: 'pink' },
    { id: 'banquet-may03', title: 'End-of-yr Banquet',       date: '2026-05-03', time: '6:30 PM', category: 'special',   points: 25, color: 'pink' },
    { id: 'cords-may07',  title: 'Cords Ceremony',          date: '2026-05-07', time: '3:00 PM', category: 'special',   points: 0,  color: 'tape' },
    { id: 'kickoff-may10', title: 'Summer Kickoff',          date: '2026-05-10', time: '5:00 PM', category: 'social',    points: 5,  color: 'green' },
    { id: 'study-may15',  title: 'Study Jam',               date: '2026-05-15', time: '5:30 PM', category: 'social',    points: 5,  color: 'green' },
    { id: 'fair-may22',   title: 'Volunteer: Health Fair',   date: '2026-05-22', time: '8:00 AM', category: 'volunteer', points: 20, color: 'blue' },
  ];
```

- [ ] **Step 3: Deploy rules and re-seed**

```bash
npx firebase deploy --only firestore:rules
node scripts/seed-emulator.mjs
```

- [ ] **Step 4: Commit**

```bash
git add firestore.rules scripts/seed-emulator.mjs
git commit -m "feat: allow officer write on events, add time to seed data"
```

---

### Task 3: Event Editor

**Files:**
- Modify: `src/components/EventEditor.jsx`

- [ ] **Step 1: Implement the full EventEditor**

Replace the entire contents of `src/components/EventEditor.jsx` with:

```jsx
import { useState } from 'react';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

const CATEGORIES = [
  { value: 'meeting',   label: 'Meeting' },
  { value: 'social',    label: 'Social' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'board',     label: 'Board' },
  { value: 'special',   label: 'Special' },
];

const COLORS = [
  { value: 'pink',  label: 'Pink' },
  { value: 'green', label: 'Green' },
  { value: 'blue',  label: 'Blue' },
  { value: 'tape',  label: 'Yellow' },
  { value: 'ink',   label: 'Dark' },
];

const inputStyle = {
  padding: '10px 14px',
  border: '2px solid var(--ink)',
  background: 'var(--paper)',
  fontFamily: "'Bricolage Grotesque', sans-serif",
  fontSize: 15,
  boxSizing: 'border-box',
  width: '100%',
};

const labelStyle = {
  display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: '.15em',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  marginBottom: 6,
};

const btnStyle = {
  padding: '10px 18px',
  border: '2px solid var(--ink)',
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  fontSize: 11,
  cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const emptyForm = { title: '', date: '', time: '', category: 'meeting', points: 10, color: 'pink', checkinCode: '' };

const EventEditor = () => {
  const { data: events, loading } = useFirestoreQuery('events');
  const [editing, setEditing] = useState(null); // null = closed, 'new' = creating, docId = editing
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [codeVisible, setCodeVisible] = useState({});

  const sorted = [...events].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };

  const openEdit = (event) => {
    setForm({
      title: event.title || '',
      date: event.date || '',
      time: event.time || '',
      category: event.category || 'meeting',
      points: event.points || 0,
      color: event.color || 'pink',
      checkinCode: event.checkinCode || '',
    });
    setEditing(event.id);
  };

  const cancel = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    const data = {
      title: form.title.trim(),
      date: form.date,
      time: form.time.trim() || null,
      category: form.category,
      points: Number(form.points) || 0,
      color: form.color,
      checkinCode: form.checkinCode.trim().toUpperCase() || null,
    };
    try {
      if (editing === 'new') {
        await addDoc(collection(db, 'events'), data);
      } else {
        await updateDoc(doc(db, 'events', editing), data);
      }
      cancel();
    } catch (err) {
      alert('Error saving event: ' + err.message);
    }
    setSaving(false);
  };

  const remove = async (event) => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'events', event.id));
  };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Events" rotate={-1} />

      <button onClick={openNew} style={{ ...btnStyle, background: 'var(--green)', marginTop: 24 }}>
        + Create Event
      </button>

      {/* Create/Edit Form */}
      {editing && (
        <div style={{
          marginTop: 18, background: 'white', border: '2px solid var(--ink)',
          padding: '24px 28px', boxShadow: '6px 6px 0 var(--ink)',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, marginBottom: 18 }}>
            {editing === 'new' ? 'new event' : 'edit event'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label>
              <span style={labelStyle}>title *</span>
              <input value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} placeholder="e.g. General Meeting" />
            </label>
            <label>
              <span style={labelStyle}>date *</span>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
            </label>
            <label>
              <span style={labelStyle}>time</span>
              <input value={form.time} onChange={e => set('time', e.target.value)} style={inputStyle} placeholder="e.g. 6:00 PM" />
            </label>
            <label>
              <span style={labelStyle}>category *</span>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label>
              <span style={labelStyle}>points</span>
              <input type="number" value={form.points} onChange={e => set('points', e.target.value)} style={inputStyle} min="0" />
            </label>
            <label>
              <span style={labelStyle}>color</span>
              <select value={form.color} onChange={e => set('color', e.target.value)} style={inputStyle}>
                {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label>
              <span style={labelStyle}>check-in code (optional)</span>
              <input value={form.checkinCode} onChange={e => set('checkinCode', e.target.value)} style={{ ...inputStyle, textTransform: 'uppercase' }} placeholder="e.g. UHPPA0402" />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={saving} style={{ ...btnStyle, background: 'var(--green)' }}>
              {saving ? 'saving...' : 'save'}
            </button>
            <button onClick={cancel} style={{ ...btnStyle, background: 'white' }}>cancel</button>
          </div>
        </div>
      )}

      {/* Event Table */}
      <div style={{ marginTop: 28, border: '2px solid var(--ink)', background: 'white' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 110px 80px 80px 130px 100px',
          background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          <div style={{ padding: '10px 16px' }}>Event</div>
          <div style={{ padding: '10px 16px' }}>Date</div>
          <div style={{ padding: '10px 16px' }}>Time</div>
          <div style={{ padding: '10px 16px' }}>Pts</div>
          <div style={{ padding: '10px 16px' }}>Code</div>
          <div style={{ padding: '10px 16px' }}>Actions</div>
        </div>
        {sorted.map((event, i) => (
          <div key={event.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 110px 80px 80px 130px 100px',
            alignItems: 'center',
            borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
          }}>
            <div style={{ padding: '10px 16px', fontWeight: 600 }}>{event.title}</div>
            <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{event.date}</div>
            <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{event.time || '—'}</div>
            <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>+{event.points}</div>
            <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              {event.checkinCode ? (
                <button onClick={() => setCodeVisible(v => ({ ...v, [event.id]: !v[event.id] }))} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ink)',
                }}>{codeVisible[event.id] ? event.checkinCode : '••••••'}</button>
              ) : '—'}
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
              <button onClick={() => openEdit(event)} style={{
                background: 'none', border: '1.5px solid var(--ink)', padding: '4px 8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer',
              }}>edit</button>
              <button onClick={() => remove(event)} style={{
                background: 'none', border: '1.5px solid var(--pink)', padding: '4px 8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer', color: 'var(--pink)',
              }}>del</button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
            no events yet — create one above
          </div>
        )}
      </div>
    </div>
  );
};

export default EventEditor;
```

- [ ] **Step 2: Verify**

Navigate to `/admin/events`. You should see:
- List of all seed events sorted by date
- "Create Event" button opens the form
- Fill out the form and save — new event appears in list and on the calendar
- Click "edit" on a row — form pre-fills, save updates the event
- Check-in codes are masked, click to reveal
- "del" button shows confirm dialog, deleting removes the event

- [ ] **Step 3: Commit**

```bash
git add src/components/EventEditor.jsx
git commit -m "feat: event editor with create, edit, delete, and check-in codes"
```

---

### Task 4: Points Approval Queue

**Files:**
- Modify: `src/components/PointsQueue.jsx`
- Modify: `src/components/Points.jsx`

- [ ] **Step 1: Implement PointsQueue**

Replace the entire contents of `src/components/PointsQueue.jsx` with:

```jsx
import { useState, useMemo } from 'react';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';

const btnStyle = {
  padding: '8px 14px',
  border: '2px solid var(--ink)',
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  fontSize: 11,
  cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const PointsQueue = () => {
  const { user } = useAuth();
  const { data: pending, loading } = useFirestoreQuery('pointsLedger', [
    where('status', '==', 'pending'),
  ], 'pending');
  const { data: members } = useFirestoreQuery('members');
  const [selected, setSelected] = useState(new Set());
  const [processing, setProcessing] = useState(false);

  const memberMap = useMemo(() => {
    const map = {};
    for (const m of members) map[m.id] = m.name || m.email?.split('@')[0] || 'Unknown';
    return map;
  }, [members]);

  const sorted = useMemo(() =>
    [...pending].sort((a, b) => {
      const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return db2 - da;
    }),
  [pending]);

  const approve = async (id) => {
    await updateDoc(doc(db, 'pointsLedger', id), {
      status: 'verified',
      reviewedBy: user.uid,
      reviewedAt: serverTimestamp(),
    });
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
  };

  const deny = async (id) => {
    await updateDoc(doc(db, 'pointsLedger', id), {
      status: 'denied',
      reviewedBy: user.uid,
      reviewedAt: serverTimestamp(),
    });
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
  };

  const bulkApprove = async () => {
    setProcessing(true);
    for (const id of selected) {
      await approve(id);
    }
    setSelected(new Set());
    setProcessing(false);
  };

  const toggleSelect = (id) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(e => e.id)));
  };

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Points Queue" rotate={-1} />

      {sorted.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)' }}>
          no pending requests — all caught up &#10003;
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
              {sorted.length} pending request{sorted.length !== 1 ? 's' : ''}
            </div>
            {selected.size > 0 && (
              <button onClick={bulkApprove} disabled={processing} style={{ ...btnStyle, background: 'var(--green)' }}>
                {processing ? 'approving...' : `approve selected (${selected.size})`}
              </button>
            )}
          </div>

          <div style={{ marginTop: 18, border: '2px solid var(--ink)', background: 'white' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 1fr 60px 1fr 100px 120px',
              background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
            }}>
              <div style={{ padding: '10px 12px', textAlign: 'center' }}>
                <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0} onChange={toggleAll} />
              </div>
              <div style={{ padding: '10px 16px' }}>Member</div>
              <div style={{ padding: '10px 16px' }}>Event</div>
              <div style={{ padding: '10px 16px' }}>Pts</div>
              <div style={{ padding: '10px 16px' }}>Note</div>
              <div style={{ padding: '10px 16px' }}>Date</div>
              <div style={{ padding: '10px 16px' }}>Actions</div>
            </div>
            {sorted.map((entry, i) => {
              const date = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt);
              return (
                <div key={entry.id} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 1fr 60px 1fr 100px 120px',
                  alignItems: 'center',
                  borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
                }}>
                  <div style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.has(entry.id)} onChange={() => toggleSelect(entry.id)} />
                  </div>
                  <div style={{ padding: '10px 16px', fontWeight: 600 }}>{memberMap[entry.memberId] || 'Unknown'}</div>
                  <div style={{ padding: '10px 16px' }}>{entry.eventTitle}</div>
                  <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>+{entry.points}</div>
                  <div style={{ padding: '10px 16px', fontFamily: "'Kalam', cursive", fontSize: 13, color: 'var(--ink-soft)' }}>
                    {entry.note || '—'}
                  </div>
                  <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                  </div>
                  <div style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
                    <button onClick={() => approve(entry.id)} style={{ ...btnStyle, background: 'var(--green)', padding: '4px 10px', boxShadow: 'none' }}>&#10003;</button>
                    <button onClick={() => deny(entry.id)} style={{ ...btnStyle, background: 'var(--pink)', padding: '4px 10px', boxShadow: 'none' }}>&times;</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PointsQueue;
```

- [ ] **Step 2: Add denied badge to Points.jsx**

In `src/components/Points.jsx`, find the status display in the activity log (the `{r.status === 'verified' ? ...}` block) and replace it with:

```jsx
                  <div style={{ padding: '12px 16px' }}>
                    {r.status === 'verified' ? (
                      <span style={{ color: 'var(--green)', fontFamily: "'Kalam', cursive", fontSize: 18 }}>&#10003; verified</span>
                    ) : r.status === 'denied' ? (
                      <span style={{ color: 'var(--pink)', fontFamily: "'Kalam', cursive", fontSize: 18 }}>&times; denied</span>
                    ) : (
                      <span style={{ color: 'var(--tape)', fontFamily: "'Kalam', cursive", fontSize: 18 }}>&#9203; pending</span>
                    )}
                  </div>
```

- [ ] **Step 3: Verify**

1. Go to `/points`, submit a missing points request (creates a pending entry)
2. Go to `/admin/points` — should see the pending request with member name, event, note
3. Click approve (✓) — entry disappears from queue
4. Go back to `/points` — entry should show "verified"
5. Submit another request, go to `/admin/points`, click deny (×)
6. Go to `/points` — entry should show "× denied" in red
7. Test bulk approve: create multiple pending entries, select checkboxes, click "Approve selected"

- [ ] **Step 4: Commit**

```bash
git add src/components/PointsQueue.jsx src/components/Points.jsx
git commit -m "feat: points approval queue with approve, deny, and bulk approve"
```

---

### Task 5: Member Roster

**Files:**
- Modify: `src/components/MemberRoster.jsx`

- [ ] **Step 1: Implement MemberRoster**

Replace the entire contents of `src/components/MemberRoster.jsx` with:

```jsx
import { useState, useMemo } from 'react';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ROLES = ['pending', 'member', 'officer', 'denied'];

const roleBadge = (role) => {
  const colors = {
    officer: 'var(--green)',
    member: 'var(--blue)',
    pending: 'var(--tape)',
    denied: 'var(--pink)',
  };
  return {
    background: colors[role] || 'var(--paper-2)',
    border: '1.5px solid var(--ink)',
    padding: '2px 8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
  };
};

const MemberRoster = () => {
  const { user } = useAuth();
  const { data: members, loading } = useFirestoreQuery('members');
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    const filtered = members.filter(m => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
    });
    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [members, search]);

  const changeRole = async (member, newRole) => {
    if (member.id === user.uid) {
      alert("You can't change your own role.");
      return;
    }

    const oldRole = member.role;

    // Confirmation for officer promotions/demotions
    if (newRole === 'officer' && oldRole !== 'officer') {
      if (!confirm(`Make ${member.name} an officer?`)) return;
    }
    if (oldRole === 'officer' && newRole !== 'officer') {
      if (!confirm(`Remove officer access for ${member.name}?`)) return;
    }

    await updateDoc(doc(db, 'members', member.id), { role: newRole });
  };

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Members" rotate={-1} />

      <div style={{ display: 'flex', gap: 14, marginTop: 24, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search by name or email…"
            style={{
              border: '2px solid var(--ink)', background: 'white',
              padding: '10px 14px 10px 36px',
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
              width: 320, boxShadow: '3px 3px 0 var(--ink)', outline: 'none',
            }} />
          <span style={{ position: 'absolute', left: 12, top: 11, fontFamily: "'JetBrains Mono', monospace" }}>&#8981;</span>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
          {sorted.length} / {members.length} members
        </span>
      </div>

      <div style={{ marginTop: 18, border: '2px solid var(--ink)', background: 'white' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr 120px 110px',
          background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          <div style={{ padding: '10px 16px' }}>Name</div>
          <div style={{ padding: '10px 16px' }}>Email</div>
          <div style={{ padding: '10px 16px' }}>Class</div>
          <div style={{ padding: '10px 16px' }}>Major</div>
          <div style={{ padding: '10px 16px' }}>Joined</div>
          <div style={{ padding: '10px 16px' }}>Role</div>
        </div>
        {sorted.map((member, i) => {
          const joined = member.createdAt?.toDate
            ? member.createdAt.toDate().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
            : '—';
          const isYou = member.id === user?.uid;
          return (
            <div key={member.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr 120px 110px',
              alignItems: 'center',
              borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
              background: isYou ? 'oklch(0.94 0.09 95)' : 'transparent',
            }}>
              <div style={{ padding: '10px 16px', fontWeight: 600 }}>
                {member.name}{isYou ? ' (you)' : ''}
              </div>
              <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{member.email}</div>
              <div style={{ padding: '10px 16px', fontSize: 13 }}>{member.classification || '—'}</div>
              <div style={{ padding: '10px 16px', fontSize: 13 }}>{member.major || '—'}</div>
              <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{joined}</div>
              <div style={{ padding: '10px 16px' }}>
                {isYou ? (
                  <span style={roleBadge(member.role)}>{member.role}</span>
                ) : (
                  <select value={member.role} onChange={e => changeRole(member, e.target.value)} style={{
                    padding: '4px 8px',
                    border: '1.5px solid var(--ink)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    background: 'white',
                    cursor: 'pointer',
                  }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
            no members found
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberRoster;
```

- [ ] **Step 2: Verify**

Navigate to `/admin/members`. You should see:
- All members listed with name, email, classification, major, joined date, role
- Your own row highlighted, role shown as a badge (not a dropdown — can't change own role)
- Other members have a role dropdown — change a test member's role
- Search filters by name or email
- Promote someone to officer → confirm dialog appears
- Demote an officer → confirm dialog appears
- Change pending → member → no confirmation needed

- [ ] **Step 3: Commit**

```bash
git add src/components/MemberRoster.jsx
git commit -m "feat: member roster with role management and search"
```

---

### Task 6: Calendar Time Display

**Files:**
- Modify: `src/components/Calendar.jsx`

- [ ] **Step 1: Show time on calendar event chips**

In `src/components/Calendar.jsx`, find the event chip rendering inside the `Cell` component (the `{events.map((e, i) => ...)}` block). Update the chip's text span to include time:

Replace:
```jsx
<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
```

With:
```jsx
<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
  {e.title}{e.time ? ` · ${e.time}` : ''}
</span>
```

- [ ] **Step 2: Verify**

Navigate to `/calendar`, go to April 2026. Event chips should show time (e.g. "General Meeting · 6:00 PM"). Events without a time field show title only.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar.jsx
git commit -m "feat: show event time on calendar chips"
```

---

### Task 7: Deploy and Verify

- [ ] **Step 1: Deploy rules**

```bash
npx firebase deploy --only firestore:rules
```

- [ ] **Step 2: Push to Vercel**

```bash
git push
```

- [ ] **Step 3: Verify on production**

1. Log in as officer on uhppa.vercel.app
2. Click Admin → verify sub-nav shows all 4 tabs
3. Events → create a test event, edit it, delete it
4. Points → approve/deny pending requests (if any)
5. Members → verify roster loads, test role changes
6. Calendar → verify event times display
