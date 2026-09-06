import { useState } from 'react';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
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
  const { data: rawCodes } = useFirestoreQuery('qrCodes');
  const codes = [...rawCodes].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

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
      const msg = editing === 'new' ? `"${form.label.trim()}" added!` : `"${form.label.trim()}" updated!`;
      cancel();
      setFlash(msg);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      alert('Error saving: ' + err.message);
    }
    setSaving(false);
  };

  const remove = async (code) => {
    if (!confirm(`Delete "${code.label}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'qrCodes', code.id));
    setFlash(`"${code.label}" deleted.`);
    setTimeout(() => setFlash(null), 2500);
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

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Membership" rotate={-1} />

      {flash && (
        <div style={{
          marginTop: 18, padding: '10px 16px',
          background: 'var(--green)', border: '2px solid var(--ink)',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 12,
          letterSpacing: '.08em', textTransform: 'uppercase',
        }}>{flash}</div>
      )}

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
