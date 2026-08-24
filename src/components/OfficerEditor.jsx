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

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= officers.length) return;
    const a = officers[index];
    const b = officers[target];
    await Promise.all([
      updateDoc(doc(db, 'officers', a.id), { sortOrder: b.sortOrder }),
      updateDoc(doc(db, 'officers', b.id), { sortOrder: a.sortOrder }),
    ]);
  };

  if (loading) return null;

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
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
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
        <div className="admin-table-header" style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 60px 120px',
          background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          <div style={{ padding: '10px 12px' }}></div>
          <div style={{ padding: '10px 16px' }}>Name</div>
          <div style={{ padding: '10px 16px' }}>Position</div>
          <div style={{ padding: '10px 16px' }}>Bio</div>
          <div style={{ padding: '10px 16px' }}>Order</div>
          <div style={{ padding: '10px 16px' }}>Actions</div>
        </div>
        {officers.map((officer, i) => (
          <div key={officer.id} className="admin-table-row" style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 60px 120px',
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
            <div style={{ padding: '10px 12px', display: 'flex', gap: 4 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{
                background: 'none', border: '1.5px solid var(--ink)', padding: '4px 6px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: i === 0 ? 'default' : 'pointer',
                opacity: i === 0 ? 0.3 : 1,
              }}>&uarr;</button>
              <button onClick={() => move(i, 1)} disabled={i === officers.length - 1} style={{
                background: 'none', border: '1.5px solid var(--ink)', padding: '4px 6px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: i === officers.length - 1 ? 'default' : 'pointer',
                opacity: i === officers.length - 1 ? 0.3 : 1,
              }}>&darr;</button>
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
