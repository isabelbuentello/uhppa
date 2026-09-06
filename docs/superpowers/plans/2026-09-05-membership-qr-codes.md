# Membership QR Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public "Membership" page with officer-managed QR codes for payments and forms, plus an admin editor for CRUD and reordering.

**Architecture:** New Firestore collection `qrCodes` stores entries with label, url, description, tag, optional image override, and sortOrder. Public page auto-generates QR codes from URLs using `qrcode.react`, falling back to uploaded images. Admin editor follows the same CRUD + reorder pattern as OfficerEditor.

**Tech Stack:** React, Firebase Firestore, `qrcode.react`, existing `uploadImage` utility

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/components/Membership.jsx` | **Create** — Public page showing QR code list cards |
| `src/components/MembershipEditor.jsx` | **Create** — Admin CRUD editor with reordering |
| `src/App.jsx` | **Modify** — Add imports, nav tab, routes |
| `src/components/AdminNav.jsx` | **Modify** — Add Membership tab |
| `src/index.css` | **Modify** — Add mobile responsive rule for membership cards |

---

### Task 1: Install qrcode.react

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

```bash
npm install qrcode.react
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require.resolve('qrcode.react') && console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add qrcode.react dependency"
```

---

### Task 2: Create Membership public page

**Files:**
- Create: `src/components/Membership.jsx`

- [ ] **Step 1: Create `src/components/Membership.jsx`**

```jsx
import { QRCodeSVG } from 'qrcode.react';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { orderBy } from 'firebase/firestore';

const Membership = () => {
  const { data: codes, loading } = useFirestoreQuery('qrCodes', [orderBy('sortOrder')], 'qrCodes');

  if (loading) return null;

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 900, margin: '0 auto' }}>
      <SectionHeading kicker="join us" title="Membership." rotate={-1} />
      <p style={{
        fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18,
        maxWidth: 620, marginTop: 16, color: 'var(--ink-soft)',
      }}>
        Scan a QR code to pay dues, fill out forms, or access resources.
      </p>

      {codes.length > 0 ? (
        <div className="membership-cards" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {codes.map((code) => (
            <div key={code.id} className="membership-card" style={{
              background: 'white', border: '2px solid var(--ink)',
              boxShadow: '4px 4px 0 var(--ink)',
              display: 'flex', alignItems: 'center', gap: 24, padding: 20,
            }}>
              <div style={{ flexShrink: 0 }}>
                {code.imageUrl ? (
                  <img src={code.imageUrl} alt={code.label} style={{
                    width: 140, height: 140, objectFit: 'contain',
                    border: '1px solid var(--rule)',
                  }} />
                ) : (
                  <QRCodeSVG value={code.url} size={140} level="M" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{
                    fontFamily: "'Alfa Slab One', serif", fontSize: 22,
                    margin: 0, lineHeight: 1.1,
                  }}>{code.label}</h3>
                  {code.tag && (
                    <span style={{
                      background: 'var(--paper-2)', border: '1.5px solid var(--ink)',
                      padding: '2px 8px', fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                    }}>{code.tag}</span>
                  )}
                </div>
                {code.description && (
                  <p style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
                    color: 'var(--ink-soft)', marginTop: 8, margin: '8px 0 0',
                    lineHeight: 1.4,
                  }}>{code.description}</p>
                )}
                <a href={code.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block', marginTop: 10,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: '.08em', color: 'var(--blue)',
                  textDecoration: 'none', borderBottom: '1.5px solid var(--blue)',
                }}>open link &rarr;</a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          marginTop: 36, padding: 60, textAlign: 'center',
          fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)',
          border: '2px dashed var(--rule)', background: 'white',
        }}>coming soon &#9998;</div>
      )}
    </div>
  );
};

export default Membership;
```

- [ ] **Step 2: Verify the file was created**

```bash
head -5 src/components/Membership.jsx
```

Expected: First 5 lines of the component.

- [ ] **Step 3: Commit**

```bash
git add src/components/Membership.jsx
git commit -m "feat: add Membership public page with QR code list cards"
```

---

### Task 3: Create MembershipEditor admin page

**Files:**
- Create: `src/components/MembershipEditor.jsx`

- [ ] **Step 1: Create `src/components/MembershipEditor.jsx`**

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

const gridCols = '1fr 100px 1fr 60px 120px';

const emptyForm = { label: '', url: '', description: '', tag: '' };

const MembershipEditor = () => {
  const { data: codes, loading } = useFirestoreQuery('qrCodes', [orderBy('sortOrder')], 'qrCodes');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(emptyForm); setFile(null); setEditing('new'); };

  const openEdit = (code) => {
    setForm({
      label: code.label || '',
      url: code.url || '',
      description: code.description || '',
      tag: code.tag || '',
    });
    setFile(null);
    setEditing(code.id);
  };

  const cancel = () => { setEditing(null); setForm(emptyForm); setFile(null); };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.label.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      let imageUrl = null;
      if (file) {
        const id = editing === 'new' ? crypto.randomUUID() : editing;
        imageUrl = await uploadImage(file, `qrcodes/${id}.jpg`, { maxWidth: 400 });
      }

      const data = {
        label: form.label.trim(),
        url: form.url.trim(),
        description: form.description.trim(),
        tag: form.tag.trim(),
      };
      if (imageUrl) data.imageUrl = imageUrl;

      if (editing === 'new') {
        data.sortOrder = codes.length + 1;
        if (!imageUrl) data.imageUrl = '';
        await addDoc(collection(db, 'qrCodes'), data);
      } else {
        await updateDoc(doc(db, 'qrCodes', editing), data);
      }
      cancel();
    } catch (err) {
      alert('Error saving: ' + err.message);
    }
    setSaving(false);
  };

  const remove = async (code) => {
    if (!confirm(`Delete "${code.label}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'qrCodes', code.id));
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= codes.length) return;
    const a = codes[index];
    const b = codes[target];
    await Promise.all([
      updateDoc(doc(db, 'qrCodes', a.id), { sortOrder: b.sortOrder }),
      updateDoc(doc(db, 'qrCodes', b.id), { sortOrder: a.sortOrder }),
    ]);
  };

  if (loading) return null;

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Membership" rotate={-1} />

      <button onClick={openNew} style={{ ...btnStyle, background: 'var(--green)', marginTop: 24 }}>
        + Add QR Code
      </button>

      {editing && (
        <div style={{
          marginTop: 18, background: 'white', border: '2px solid var(--ink)',
          padding: '24px 28px', boxShadow: '6px 6px 0 var(--ink)',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, marginBottom: 18 }}>
            {editing === 'new' ? 'new qr code' : 'edit qr code'}
          </div>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label>
              <span style={labelStyle}>label *</span>
              <input value={form.label} onChange={e => set('label', e.target.value)} style={inputStyle} placeholder="e.g. Venmo" />
            </label>
            <label>
              <span style={labelStyle}>url *</span>
              <input value={form.url} onChange={e => set('url', e.target.value)} style={inputStyle} placeholder="https://venmo.com/..." />
            </label>
            <label>
              <span style={labelStyle}>category tag</span>
              <input value={form.tag} onChange={e => set('tag', e.target.value)} style={inputStyle} placeholder="e.g. Payment, Form" />
            </label>
            <label>
              <span style={labelStyle}>image override {editing === 'new' ? '(optional)' : '(leave empty to keep current)'}</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0] || null)} style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
              }} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span style={labelStyle}>description</span>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="e.g. Scan to pay $25 semester dues" />
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

      {/* QR codes table */}
      <div style={{ marginTop: 28, border: '2px solid var(--ink)', background: 'white' }}>
        <div className="admin-table-header" style={{
          display: 'grid', gridTemplateColumns: gridCols,
          background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          <div style={{ padding: '10px 16px' }}>Label</div>
          <div style={{ padding: '10px 16px' }}>Tag</div>
          <div style={{ padding: '10px 16px' }}>URL</div>
          <div style={{ padding: '10px 16px' }}>Order</div>
          <div style={{ padding: '10px 16px' }}>Actions</div>
        </div>
        {codes.map((code, i) => (
          <div key={code.id} className="admin-table-row" style={{
            display: 'grid', gridTemplateColumns: gridCols,
            alignItems: 'center',
            borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
          }}>
            <div style={{ padding: '10px 16px', fontWeight: 600 }}>{code.label}</div>
            <div style={{ padding: '10px 16px' }}>
              {code.tag ? (
                <span style={{
                  padding: '2px 6px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  border: '1px solid var(--ink)', background: 'var(--paper-2)',
                }}>{code.tag}</span>
              ) : '—'}
            </div>
            <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <a href={code.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>{code.url}</a>
            </div>
            <div style={{ padding: '10px 12px', display: 'flex', gap: 4 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{
                background: 'none', border: '1.5px solid var(--ink)', padding: '4px 6px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: i === 0 ? 'default' : 'pointer',
                opacity: i === 0 ? 0.3 : 1,
              }}>&uarr;</button>
              <button onClick={() => move(i, 1)} disabled={i === codes.length - 1} style={{
                background: 'none', border: '1.5px solid var(--ink)', padding: '4px 6px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: i === codes.length - 1 ? 'default' : 'pointer',
                opacity: i === codes.length - 1 ? 0.3 : 1,
              }}>&darr;</button>
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
              <button onClick={() => openEdit(code)} style={{
                background: 'none', border: '1.5px solid var(--ink)', padding: '4px 8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer',
              }}>edit</button>
              <button onClick={() => remove(code)} style={{
                background: 'none', border: '1.5px solid var(--pink)', padding: '4px 8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer', color: 'var(--pink)',
              }}>del</button>
            </div>
          </div>
        ))}
        {codes.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
            no qr codes yet — add one above
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipEditor;
```

- [ ] **Step 2: Verify the file was created**

```bash
head -5 src/components/MembershipEditor.jsx
```

Expected: First 5 lines of the component.

- [ ] **Step 3: Commit**

```bash
git add src/components/MembershipEditor.jsx
git commit -m "feat: add MembershipEditor admin page with CRUD and reordering"
```

---

### Task 4: Wire up routes, nav tab, and admin tab

**Files:**
- Modify: `src/App.jsx:1-23` (imports)
- Modify: `src/App.jsx:49-56` (tabs array)
- Modify: `src/App.jsx:190-255` (routes)
- Modify: `src/components/AdminNav.jsx:3-12` (tabs array)

- [ ] **Step 1: Add imports to `src/App.jsx`**

After the existing `import ClubInfoEditor` line (line 19), add:

```jsx
import Membership from './components/Membership';
import MembershipEditor from './components/MembershipEditor';
```

- [ ] **Step 2: Add the Membership tab to the `tabs` array in `src/App.jsx`**

In the `tabs` array (around line 49-56), add the Membership entry after `calendar` and before `slides`:

```jsx
  const tabs = [
    { id: 'home',        path: '/',            label: 'Home' },
    { id: 'gallery',     path: '/gallery',     label: 'Gallery' },
    { id: 'calendar',    path: '/calendar',    label: 'Calendar' },
    { id: 'membership',  path: '/membership',  label: 'Membership' },
    { id: 'slides',      path: '/slides',      label: 'Slides' },
    { id: 'points',      path: '/points',      label: 'Points' },
    { id: 'leaderboard', path: '/leaderboard', label: 'Leaderboard' },
  ];
```

- [ ] **Step 3: Add routes in `src/App.jsx`**

In the `<Routes>` block, after the `/gallery` route (line 194) and before the `/slides` route, add:

```jsx
          <Route path="/membership" element={<Membership />} />
```

After the `/admin/club-info` route (around line 253), add:

```jsx
          <Route path="/admin/membership" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <MembershipEditor />
            </ProtectedRoute>
          } />
```

- [ ] **Step 4: Add Membership tab to `src/components/AdminNav.jsx`**

In the `tabs` array, add after the `club-info` entry:

```jsx
  { path: '/admin/membership', label: 'Membership' },
```

- [ ] **Step 5: Verify the app builds**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/AdminNav.jsx
git commit -m "feat: wire up Membership nav tab and admin route"
```

---

### Task 5: Add mobile responsive CSS

**Files:**
- Modify: `src/index.css` (add rules inside existing `@media (max-width: 768px)` block)

- [ ] **Step 1: Add responsive CSS for membership cards**

Inside the existing `@media (max-width: 768px)` block in `src/index.css`, add:

```css
  .membership-card {
    flex-direction: column !important;
    text-align: center !important;
  }
```

- [ ] **Step 2: Verify the build still succeeds**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add mobile responsive styles for membership cards"
```

---

### Task 6: Verify end-to-end

**Files:** None (manual verification)

- [ ] **Step 1: Start the dev server and emulators**

```bash
npm run dev
```

In a separate terminal:

```bash
npm run emulators
```

- [ ] **Step 2: Verify public Membership page**

Navigate to `http://localhost:5173/membership`. Confirm:
- Page loads with "Membership." heading and "coming soon" empty state
- No login required
- Nav bar shows "Membership" tab between Calendar and Slides

- [ ] **Step 3: Verify admin editor**

Log in as an officer. Navigate to `/admin/membership`. Confirm:
- AdminNav shows "Membership" tab
- "Add QR Code" button works
- Fill out label ("Venmo"), URL ("https://venmo.com/test"), tag ("Payment"), description ("Pay dues here")
- Save — entry appears in table with label, tag, truncated URL, order arrows, edit/del buttons

- [ ] **Step 4: Verify QR code renders on public page**

Navigate back to `/membership`. Confirm:
- The entry shows with an auto-generated QR code on the left
- Label, description, tag badge, and "open link" anchor on the right

- [ ] **Step 5: Verify reordering**

Add a second QR code in the editor. Use up/down arrows to swap order. Confirm the public page reflects the new order.

- [ ] **Step 6: Verify mobile layout**

Resize browser to mobile width (<768px). Confirm membership cards stack vertically (QR above text, centered).
