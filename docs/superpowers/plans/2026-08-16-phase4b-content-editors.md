# Phase 4B — Content Editors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three officer-only content editors (gallery, officers, sponsors) with image upload and client-side resizing, plus drag-and-drop reordering for the gallery.

**Architecture:** A shared `uploadImage` utility handles client-side resize via Canvas and uploads to Firebase Storage. Three new admin components follow the same inline-form pattern as EventEditor. Gallery uses `@dnd-kit` for drag-and-drop reordering. AdminNav and routes are extended. Firestore and Storage rules updated for officer write access.

**Tech Stack:** React 19, Firebase Firestore + Storage, `@dnd-kit/core` + `@dnd-kit/sortable`, Canvas API for image resizing.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/lib/uploadImage.js` | Create | Shared image resize + upload utility |
| `src/components/GalleryEditor.jsx` | Create | Gallery photo management with drag-and-drop |
| `src/components/OfficerEditor.jsx` | Create | Officer bio CRUD with headshot upload |
| `src/components/SponsorEditor.jsx` | Create | Sponsor CRUD with logo upload and tiers |
| `src/components/AdminNav.jsx` | Modify | Add Gallery, Officers, Sponsors tabs |
| `src/App.jsx` | Modify | Add 3 new admin routes |
| `firestore.rules` | Modify | Enable officer write on officers, sponsors, gallery |
| `storage.rules` | Modify | Enable officer write on gallery/, officers/, sponsors/ |

---

### Task 1: Install Dependencies + Upload Helper + Rules

**Files:**
- Create: `src/lib/uploadImage.js`
- Modify: `firestore.rules`
- Modify: `storage.rules`

- [ ] **Step 1: Install @dnd-kit packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Create the uploadImage utility**

Create `src/lib/uploadImage.js`:

```js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Resize an image file client-side and upload to Firebase Storage.
 * @param {File} file - The image file to upload
 * @param {string} storagePath - Path in Storage (e.g. 'gallery/abc123.jpg')
 * @param {object} opts
 * @param {number} opts.maxWidth - Max width in px (default 1200)
 * @param {'jpeg'|'png'} opts.format - Output format (default 'jpeg')
 * @returns {Promise<string>} The download URL
 */
export async function uploadImage(file, storagePath, { maxWidth = 1200, format = 'jpeg' } = {}) {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxWidth) {
    height = Math.round((height / width) * maxWidth);
    width = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'png' ? undefined : 0.85;

  const blob = await new Promise(resolve =>
    canvas.toBlob(resolve, mimeType, quality)
  );

  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
```

- [ ] **Step 3: Update Firestore rules**

In `firestore.rules`, change these three collections from `allow write: if false` to officer write:

Replace:
```
match /officers/{doc} {
  allow read: if true;
  allow write: if false;
}
```
With:
```
match /officers/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
```

Replace:
```
match /sponsors/{doc} {
  allow read: if true;
  allow write: if false;
}
```
With:
```
match /sponsors/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
```

Replace:
```
match /gallery/{doc} {
  allow read: if true;
  allow write: if false;
}
```
With:
```
match /gallery/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'officer';
}
```

- [ ] **Step 4: Update Storage rules**

In `storage.rules`, change all three paths from `allow write: if false` to officer write:

Replace:
```
match /gallery/{file} {
  allow read: if true;
  allow write: if false;
}
match /officers/{file} {
  allow read: if true;
  allow write: if false;
}
match /sponsors/{file} {
  allow read: if true;
  allow write: if false;
}
```
With:
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

- [ ] **Step 5: Commit**

```bash
git add src/lib/uploadImage.js firestore.rules storage.rules package.json package-lock.json
git commit -m "feat: add uploadImage utility, enable officer write on content collections"
```

---

### Task 2: AdminNav + Routes

**Files:**
- Modify: `src/components/AdminNav.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add tabs to AdminNav**

In `src/components/AdminNav.jsx`, replace the `tabs` array:

```jsx
const tabs = [
  { path: '/admin/approvals', label: 'Approvals' },
  { path: '/admin/events',    label: 'Events' },
  { path: '/admin/points',    label: 'Points' },
  { path: '/admin/members',   label: 'Members' },
  { path: '/admin/gallery',   label: 'Gallery' },
  { path: '/admin/officers',  label: 'Officers' },
  { path: '/admin/sponsors',  label: 'Sponsors' },
];
```

- [ ] **Step 2: Add imports and routes to App.jsx**

Add imports after the existing MemberRoster import:
```jsx
import GalleryEditor from './components/GalleryEditor';
import OfficerEditor from './components/OfficerEditor';
import SponsorEditor from './components/SponsorEditor';
```

Add routes after the existing `/admin/members` route:
```jsx
<Route path="/admin/gallery" element={
  <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
    <GalleryEditor />
  </ProtectedRoute>
} />
<Route path="/admin/officers" element={
  <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
    <OfficerEditor />
  </ProtectedRoute>
} />
<Route path="/admin/sponsors" element={
  <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
    <SponsorEditor />
  </ProtectedRoute>
} />
```

- [ ] **Step 3: Create placeholder components**

Create `src/components/GalleryEditor.jsx`:
```jsx
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const GalleryEditor = () => (
  <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <AdminNav />
    <SectionHeading kicker="officer tools" title="Gallery" rotate={-1} />
    <p>Coming soon</p>
  </div>
);

export default GalleryEditor;
```

Create `src/components/OfficerEditor.jsx`:
```jsx
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const OfficerEditor = () => (
  <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <AdminNav />
    <SectionHeading kicker="officer tools" title="Officers" rotate={-1} />
    <p>Coming soon</p>
  </div>
);

export default OfficerEditor;
```

Create `src/components/SponsorEditor.jsx`:
```jsx
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const SponsorEditor = () => (
  <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <AdminNav />
    <SectionHeading kicker="officer tools" title="Sponsors" rotate={-1} />
    <p>Coming soon</p>
  </div>
);

export default SponsorEditor;
```

- [ ] **Step 4: Verify**

Run `npm run dev`, log in as officer, click Admin. Verify 7 tabs show in AdminNav. Click Gallery, Officers, Sponsors — each shows placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/components/AdminNav.jsx src/components/GalleryEditor.jsx src/components/OfficerEditor.jsx src/components/SponsorEditor.jsx src/App.jsx
git commit -m "feat: add admin routes and nav tabs for gallery, officers, sponsors"
```

---

### Task 3: Gallery Editor

**Files:**
- Modify: `src/components/GalleryEditor.jsx`

- [ ] **Step 1: Implement GalleryEditor**

Replace the entire contents of `src/components/GalleryEditor.jsx`:

```jsx
import { useState, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, addDoc, deleteDoc, updateDoc, collection } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';
import { uploadImage } from '../lib/uploadImage';

const btnStyle = {
  padding: '10px 18px',
  border: '2px solid var(--ink)',
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
  cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
};

const SortablePhoto = ({ photo, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{
        background: 'white', border: '2px solid var(--ink)',
        boxShadow: '4px 4px 0 var(--ink)', padding: 8, cursor: 'grab',
      }}>
        {photo.thumbUrl ? (
          <img src={photo.thumbUrl} alt={photo.caption} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: 150, background: 'var(--paper-2)',
            display: 'grid', placeItems: 'center',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)',
          }}>[ no image ]</div>
        )}
        <div style={{
          fontFamily: "'Kalam', cursive", fontSize: 13, marginTop: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{photo.caption}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(photo); }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 4, right: 4,
          background: 'var(--pink)', border: '1.5px solid var(--ink)',
          width: 24, height: 24, display: 'grid', placeItems: 'center',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 14,
          cursor: 'pointer', lineHeight: 1, padding: 0,
        }}>&times;</button>
    </div>
  );
};

const GalleryEditor = () => {
  const { data: photos, loading } = useFirestoreQuery('gallery', [orderBy('sortOrder')], 'gallery');
  const [adding, setAdding] = useState(false);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const photoIds = useMemo(() => photos.map(p => p.id), [photos]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex(p => p.id === active.id);
    const newIndex = photos.findIndex(p => p.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);

    // Update sortOrder for all affected items
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sortOrder !== i + 1) {
        await updateDoc(doc(db, 'gallery', reordered[i].id), { sortOrder: i + 1 });
      }
    }
  };

  const handleAdd = async () => {
    if (!file || !caption.trim()) return;
    setSaving(true);
    try {
      const id = crypto.randomUUID();
      const url = await uploadImage(file, `gallery/${id}.jpg`, { maxWidth: 1200 });
      await addDoc(collection(db, 'gallery'), {
        caption: caption.trim(),
        thumbUrl: url,
        fullUrl: url,
        sortOrder: photos.length + 1,
      });
      setCaption('');
      setFile(null);
      setAdding(false);
    } catch (err) {
      alert('Error uploading photo: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (photo) => {
    if (!confirm(`Delete "${photo.caption}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'gallery', photo.id));
  };

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Gallery" rotate={-1} />

      <button onClick={() => setAdding(!adding)} style={{ ...btnStyle, background: 'var(--green)', marginTop: 24 }}>
        + Add Photo
      </button>

      {adding && (
        <div style={{
          marginTop: 18, background: 'white', border: '2px solid var(--ink)',
          padding: '24px 28px', boxShadow: '6px 6px 0 var(--ink)',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, marginBottom: 18 }}>add photo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
            <label>
              <span style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
                color: 'var(--ink-soft)', marginBottom: 6,
              }}>photo *</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0] || null)} style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
              }} />
            </label>
            <label>
              <span style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
                color: 'var(--ink-soft)', marginBottom: 6,
              }}>caption *</span>
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Spring mixer 2026" style={{
                width: '100%', padding: '10px 14px', border: '2px solid var(--ink)',
                background: 'var(--paper)', fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 15, boxSizing: 'border-box',
              }} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleAdd} disabled={saving} style={{ ...btnStyle, background: 'var(--green)' }}>
              {saving ? 'uploading...' : 'save'}
            </button>
            <button onClick={() => { setAdding(false); setFile(null); setCaption(''); }} style={{ ...btnStyle, background: 'white' }}>cancel</button>
          </div>
        </div>
      )}

      {photos.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)', marginTop: 28 }}>
          no photos yet — add one above
        </div>
      ) : (
        <>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em',
            textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 24,
          }}>drag to reorder &middot; {photos.length} photo{photos.length !== 1 ? 's' : ''}</div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photoIds} strategy={rectSortingStrategy}>
              <div style={{
                marginTop: 14, display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', gap: 18,
              }}>
                {photos.map(p => (
                  <SortablePhoto key={p.id} photo={p} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
};

export default GalleryEditor;
```

- [ ] **Step 2: Verify**

Navigate to `/admin/gallery`. You should see:
- "Add Photo" button opens inline form with file picker and caption input
- Upload a photo — it appears in the grid after saving
- Drag photos to reorder — order persists after refresh
- X button on each photo deletes after confirm dialog
- Public gallery at `/gallery` reflects changes in real time

- [ ] **Step 3: Commit**

```bash
git add src/components/GalleryEditor.jsx
git commit -m "feat: gallery editor with upload, drag-and-drop reorder, and delete"
```

---

### Task 4: Officer Editor

**Files:**
- Modify: `src/components/OfficerEditor.jsx`

- [ ] **Step 1: Implement OfficerEditor**

Replace the entire contents of `src/components/OfficerEditor.jsx`:

```jsx
import { useState } from 'react';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection, orderBy } from 'firebase/firestore';
import { uploadImage } from '../lib/uploadImage';

const inputStyle = {
  padding: '10px 14px', border: '2px solid var(--ink)', background: 'var(--paper)',
  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
  boxSizing: 'border-box', width: '100%',
};

const labelStyle = {
  display: 'block', fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
  color: 'var(--ink-soft)', marginBottom: 6,
};

const btnStyle = {
  padding: '10px 18px', border: '2px solid var(--ink)',
  fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
  textTransform: 'uppercase', fontSize: 11, cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const emptyForm = { name: '', position: '', bio: '' };

const OfficerEditor = () => {
  const { data: officers, loading } = useFirestoreQuery('officers', [orderBy('sortOrder')], 'officers');
  const [editing, setEditing] = useState(null); // null | 'new' | docId
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(emptyForm); setFile(null); setEditing('new'); };

  const openEdit = (officer) => {
    setForm({ name: officer.name || '', position: officer.position || '', bio: officer.bio || '' });
    setFile(null);
    setEditing(officer.id);
  };

  const cancel = () => { setEditing(null); setForm(emptyForm); setFile(null); };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim() || !form.position.trim()) return;
    setSaving(true);
    try {
      let photoUrl = null;
      if (file) {
        const id = editing === 'new' ? crypto.randomUUID() : editing;
        photoUrl = await uploadImage(file, `officers/${id}.jpg`, { maxWidth: 400 });
      }

      const data = {
        name: form.name.trim(),
        position: form.position.trim(),
        bio: form.bio.trim(),
      };
      if (photoUrl) data.photoUrl = photoUrl;

      if (editing === 'new') {
        data.sortOrder = officers.length + 1;
        if (!photoUrl) data.photoUrl = '';
        await addDoc(collection(db, 'officers'), data);
      } else {
        await updateDoc(doc(db, 'officers', editing), data);
      }
      cancel();
    } catch (err) {
      alert('Error saving officer: ' + err.message);
    }
    setSaving(false);
  };

  const remove = async (officer) => {
    if (!confirm(`Delete ${officer.name}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'officers', officer.id));
  };

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Officers" rotate={-1} />

      <button onClick={openNew} style={{ ...btnStyle, background: 'var(--green)', marginTop: 24 }}>
        + Add Officer
      </button>

      {editing && (
        <div style={{
          marginTop: 18, background: 'white', border: '2px solid var(--ink)',
          padding: '24px 28px', boxShadow: '6px 6px 0 var(--ink)',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, marginBottom: 18 }}>
            {editing === 'new' ? 'new officer' : 'edit officer'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label>
              <span style={labelStyle}>name *</span>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="e.g. Priya Sharma" />
            </label>
            <label>
              <span style={labelStyle}>position *</span>
              <input value={form.position} onChange={e => set('position', e.target.value)} style={inputStyle} placeholder="e.g. President" />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span style={labelStyle}>bio</span>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Short bio..." />
            </label>
            <label>
              <span style={labelStyle}>headshot {editing === 'new' ? '' : '(leave empty to keep current)'}</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0] || null)} style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
              }} />
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

      {/* Officer list */}
      <div style={{ marginTop: 28, border: '2px solid var(--ink)', background: 'white' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 100px',
          background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          <div style={{ padding: '10px 12px' }}></div>
          <div style={{ padding: '10px 16px' }}>Name</div>
          <div style={{ padding: '10px 16px' }}>Position</div>
          <div style={{ padding: '10px 16px' }}>Bio</div>
          <div style={{ padding: '10px 16px' }}>Actions</div>
        </div>
        {officers.map((officer, i) => (
          <div key={officer.id} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 100px',
            alignItems: 'center',
            borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
          }}>
            <div style={{ padding: '8px 12px' }}>
              {officer.photoUrl ? (
                <img src={officer.photoUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%', border: '1.5px solid var(--ink)' }} />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--ink)',
                  background: 'var(--paper-2)', display: 'grid', placeItems: 'center',
                  fontFamily: "'Alfa Slab One', serif", fontSize: 16,
                }}>{(officer.name || '?')[0]}</div>
              )}
            </div>
            <div style={{ padding: '10px 16px', fontWeight: 600 }}>{officer.name}</div>
            <div style={{ padding: '10px 16px', color: 'var(--ink-soft)' }}>{officer.position}</div>
            <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {officer.bio || '—'}
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
              <button onClick={() => openEdit(officer)} style={{
                background: 'none', border: '1.5px solid var(--ink)', padding: '4px 8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer',
              }}>edit</button>
              <button onClick={() => remove(officer)} style={{
                background: 'none', border: '1.5px solid var(--pink)', padding: '4px 8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer', color: 'var(--pink)',
              }}>del</button>
            </div>
          </div>
        ))}
        {officers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
            no officers yet — add one above
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerEditor;
```

- [ ] **Step 2: Verify**

Navigate to `/admin/officers`. You should see:
- List of seed officers with initials avatar (no photos uploaded yet)
- "Add Officer" opens inline form with name, position, bio, headshot picker
- Upload a headshot — it resizes and appears as the avatar
- Edit pre-fills form, can change headshot
- Delete removes after confirm
- Public officers section on Home page reflects changes

- [ ] **Step 3: Commit**

```bash
git add src/components/OfficerEditor.jsx
git commit -m "feat: officer bio editor with headshot upload"
```

---

### Task 5: Sponsor Editor

**Files:**
- Modify: `src/components/SponsorEditor.jsx`

- [ ] **Step 1: Implement SponsorEditor**

Replace the entire contents of `src/components/SponsorEditor.jsx`:

```jsx
import { useState, useMemo } from 'react';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection, orderBy } from 'firebase/firestore';
import { uploadImage } from '../lib/uploadImage';

const TIERS = [
  { value: 'gold',   label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
];

const tierColor = { gold: 'var(--tape)', silver: 'var(--blue)', bronze: 'var(--pink)' };

const inputStyle = {
  padding: '10px 14px', border: '2px solid var(--ink)', background: 'var(--paper)',
  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
  boxSizing: 'border-box', width: '100%',
};

const labelStyle = {
  display: 'block', fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
  color: 'var(--ink-soft)', marginBottom: 6,
};

const btnStyle = {
  padding: '10px 18px', border: '2px solid var(--ink)',
  fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
  textTransform: 'uppercase', fontSize: 11, cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const emptyForm = { name: '', url: '', tier: 'gold' };

const SponsorEditor = () => {
  const { data: sponsors, loading } = useFirestoreQuery('sponsors', [orderBy('sortOrder')], 'sponsors');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => {
    const map = { gold: [], silver: [], bronze: [] };
    for (const s of sponsors) {
      if (map[s.tier]) map[s.tier].push(s);
      else map.bronze.push(s);
    }
    return map;
  }, [sponsors]);

  const openNew = () => { setForm(emptyForm); setFile(null); setEditing('new'); };

  const openEdit = (sponsor) => {
    setForm({ name: sponsor.name || '', url: sponsor.url || '', tier: sponsor.tier || 'gold' });
    setFile(null);
    setEditing(sponsor.id);
  };

  const cancel = () => { setEditing(null); setForm(emptyForm); setFile(null); };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      let logoUrl = null;
      if (file) {
        const id = editing === 'new' ? crypto.randomUUID() : editing;
        logoUrl = await uploadImage(file, `sponsors/${id}.png`, { maxWidth: 400, format: 'png' });
      }

      const data = {
        name: form.name.trim(),
        url: form.url.trim(),
        tier: form.tier,
      };
      if (logoUrl) data.logoUrl = logoUrl;

      if (editing === 'new') {
        data.sortOrder = sponsors.length + 1;
        if (!logoUrl) data.logoUrl = '';
        await addDoc(collection(db, 'sponsors'), data);
      } else {
        await updateDoc(doc(db, 'sponsors', editing), data);
      }
      cancel();
    } catch (err) {
      alert('Error saving sponsor: ' + err.message);
    }
    setSaving(false);
  };

  const remove = async (sponsor) => {
    if (!confirm(`Delete ${sponsor.name}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'sponsors', sponsor.id));
  };

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Sponsors" rotate={-1} />

      <button onClick={openNew} style={{ ...btnStyle, background: 'var(--green)', marginTop: 24 }}>
        + Add Sponsor
      </button>

      {editing && (
        <div style={{
          marginTop: 18, background: 'white', border: '2px solid var(--ink)',
          padding: '24px 28px', boxShadow: '6px 6px 0 var(--ink)',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, marginBottom: 18 }}>
            {editing === 'new' ? 'new sponsor' : 'edit sponsor'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label>
              <span style={labelStyle}>name *</span>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="e.g. CVS Health" />
            </label>
            <label>
              <span style={labelStyle}>website url *</span>
              <input value={form.url} onChange={e => set('url', e.target.value)} style={inputStyle} placeholder="https://..." />
            </label>
            <label>
              <span style={labelStyle}>tier *</span>
              <select value={form.tier} onChange={e => set('tier', e.target.value)} style={inputStyle}>
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label>
              <span style={labelStyle}>logo {editing === 'new' ? '' : '(leave empty to keep current)'}</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0] || null)} style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
              }} />
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

      {sponsors.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)', marginTop: 28 }}>
          no sponsors yet — add one above
        </div>
      ) : (
        <>
          {TIERS.map(tier => {
            const items = grouped[tier.value];
            if (items.length === 0) return null;
            return (
              <div key={tier.value} style={{ marginTop: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{
                    background: tierColor[tier.value], border: '1.5px solid var(--ink)',
                    padding: '2px 10px', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                  }}>{tier.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)' }}>
                    {items.length} sponsor{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ border: '2px solid var(--ink)', background: 'white' }}>
                  {items.map((sponsor, i) => (
                    <div key={sponsor.id} style={{
                      display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px',
                      alignItems: 'center',
                      borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
                      fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
                    }}>
                      <div style={{ padding: '8px 12px' }}>
                        {sponsor.logoUrl ? (
                          <img src={sponsor.logoUrl} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        ) : (
                          <div style={{
                            width: 36, height: 36, background: 'var(--paper-2)',
                            border: '1px solid var(--rule)', display: 'grid', placeItems: 'center',
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--ink-soft)',
                          }}>logo</div>
                        )}
                      </div>
                      <div style={{ padding: '10px 16px', fontWeight: 600 }}>{sponsor.name}</div>
                      <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sponsor.url}
                      </div>
                      <div style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(sponsor)} style={{
                          background: 'none', border: '1.5px solid var(--ink)', padding: '4px 8px',
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer',
                        }}>edit</button>
                        <button onClick={() => remove(sponsor)} style={{
                          background: 'none', border: '1.5px solid var(--pink)', padding: '4px 8px',
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer', color: 'var(--pink)',
                        }}>del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default SponsorEditor;
```

- [ ] **Step 2: Verify**

Navigate to `/admin/sponsors`. You should see:
- Sponsors grouped by tier (gold, silver, bronze) with colored badges
- "Add Sponsor" opens inline form with name, URL, tier dropdown, logo file picker
- Upload a logo — it resizes as PNG and appears as the thumbnail
- Edit pre-fills form, can change logo
- Delete removes after confirm
- Public sponsors section on Home page reflects changes

- [ ] **Step 3: Commit**

```bash
git add src/components/SponsorEditor.jsx
git commit -m "feat: sponsor editor with logo upload and tier management"
```

---

### Task 6: Deploy and Verify

- [ ] **Step 1: Deploy rules**

```bash
npx firebase deploy --only firestore:rules,storage
```

- [ ] **Step 2: Push to Vercel**

```bash
git push
```

- [ ] **Step 3: Verify on production**

1. Log in as officer
2. Admin → verify 7 tabs show
3. Gallery → upload a photo, reorder, delete
4. Officers → add an officer with headshot, edit, delete
5. Sponsors → add a sponsor with logo and tier, edit, delete
6. Check public pages reflect changes (Home for officers/sponsors, Gallery for photos)
