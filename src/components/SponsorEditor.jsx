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

const emptyForm = { name: '', url: '' };

const SponsorEditor = () => {
  const { data: sponsors, loading } = useFirestoreQuery('sponsors', [orderBy('sortOrder')], 'sponsors');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(emptyForm); setFile(null); setEditing('new'); };

  const openEdit = (sponsor) => {
    setForm({ name: sponsor.name || '', url: sponsor.url || '' });
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
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
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
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label>
              <span style={labelStyle}>name *</span>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="e.g. CVS Health" />
            </label>
            <label>
              <span style={labelStyle}>website url *</span>
              <input value={form.url} onChange={e => set('url', e.target.value)} style={inputStyle} placeholder="https://..." />
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
        <div style={{ marginTop: 28, border: '2px solid var(--ink)', background: 'white' }}>
          <div className="admin-table-header" style={{
            display: 'grid', gridTemplateColumns: '50px 1fr 1fr 120px',
            background: 'var(--ink)', color: 'var(--paper)',
            fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
          }}>
            <div style={{ padding: '10px 12px' }}></div>
            <div style={{ padding: '10px 16px' }}>Name</div>
            <div style={{ padding: '10px 16px' }}>URL</div>
            <div style={{ padding: '10px 16px' }}>Actions</div>
          </div>
          {sponsors.map((sponsor, i) => (
            <div key={sponsor.id} className="admin-table-row" style={{
              display: 'grid', gridTemplateColumns: '50px 1fr 1fr 120px',
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
      )}
    </div>
  );
};

export default SponsorEditor;
