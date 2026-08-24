import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirestoreQuery } from '../hooks/useFirestore';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '2px solid var(--ink)', background: 'white',
  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase',
  color: 'var(--ink-soft)', display: 'block', marginBottom: 4,
};

const gridCols = '1fr 100px 80px 80px 80px 120px';

const tagOptions = ['GM', 'Panel', 'Prep', 'Workshop', 'Research', 'Social', 'Other'];

const empty = { title: '', date: '', year: '', tag: 'GM', pageCount: '', fileSize: '', downloadUrl: '' };

const SlidesEditor = () => {
  const { data: slides, loading } = useFirestoreQuery('slides');
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const sorted = [...slides].sort((a, b) => new Date(b.date) - new Date(a.date));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim() || !form.downloadUrl.trim()) return;
    const data = {
      title: form.title.trim(),
      date: form.date.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      tag: form.tag,
      pageCount: Number(form.pageCount) || 0,
      fileSize: form.fileSize.trim() || '—',
      downloadUrl: form.downloadUrl.trim(),
    };
    if (editId) {
      await updateDoc(doc(db, 'slides', editId), data);
    } else {
      await addDoc(collection(db, 'slides'), data);
    }
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (slide) => {
    setForm({
      title: slide.title || '',
      date: slide.date || '',
      year: slide.year?.toString() || '',
      tag: slide.tag || 'GM',
      pageCount: slide.pageCount?.toString() || '',
      fileSize: slide.fileSize || '',
      downloadUrl: slide.downloadUrl || '',
    });
    setEditId(slide.id);
    setShowForm(true);
  };

  const del = async (id) => {
    if (!confirm('Delete this slide?')) return;
    await deleteDoc(doc(db, 'slides', id));
  };

  const cancel = () => { setForm(empty); setEditId(null); setShowForm(false); };

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Slides" rotate={-1} />

      <button onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }} style={{
        marginTop: 18, padding: '10px 20px',
        border: '2px solid var(--ink)', background: 'var(--green)',
        fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
        textTransform: 'uppercase', fontSize: 12, cursor: 'pointer',
        boxShadow: '3px 3px 0 var(--ink)',
      }}>+ Add Slide</button>

      {showForm && (
        <div style={{ marginTop: 18, background: 'white', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', padding: '20px 24px' }}>
          <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, margin: '0 0 16px' }}>
            {editId ? 'Edit Slide' : 'Add Slide'}
          </h3>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Kaplan MCAT — Prep Overview" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Link URL (Google Drive, etc.)</label>
              <input value={form.downloadUrl} onChange={e => set('downloadUrl', e.target.value)} placeholder="https://drive.google.com/..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input value={form.date} onChange={e => set('date', e.target.value)} type="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <input value={form.year} onChange={e => set('year', e.target.value)} type="number" placeholder={new Date().getFullYear().toString()} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tag</label>
              <select value={form.tag} onChange={e => set('tag', e.target.value)} style={inputStyle}>
                {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Page Count</label>
              <input value={form.pageCount} onChange={e => set('pageCount', e.target.value)} type="number" placeholder="31" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>File Size (e.g. "571 MB")</label>
              <input value={form.fileSize} onChange={e => set('fileSize', e.target.value)} placeholder="571 MB" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={save} style={{
              padding: '10px 20px', border: '2px solid var(--ink)', background: 'var(--tape)',
              fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12,
              cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
            }}>{editId ? 'Update' : 'Add'}</button>
            <button onClick={cancel} style={{
              padding: '10px 20px', border: '2px solid var(--ink)', background: 'white',
              fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12,
              cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Slides table */}
      <div style={{ marginTop: 28, border: '2px solid var(--ink)', background: 'white' }}>
        <div className="admin-table-header" style={{
          display: 'grid', gridTemplateColumns: gridCols,
          background: 'var(--ink)', color: 'var(--paper)',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          <div style={{ padding: '10px 16px' }}>Title</div>
          <div style={{ padding: '10px 16px' }}>Date</div>
          <div style={{ padding: '10px 16px' }}>Tag</div>
          <div style={{ padding: '10px 16px' }}>Pages</div>
          <div style={{ padding: '10px 16px' }}>Size</div>
          <div style={{ padding: '10px 16px' }}>Actions</div>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 20, color: 'var(--ink-soft)' }}>loading...</div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 20, color: 'var(--ink-soft)' }}>no slides yet</div>
        ) : sorted.map((slide, i) => (
          <div key={slide.id} className="admin-table-row" style={{
            display: 'grid', gridTemplateColumns: gridCols,
            alignItems: 'center',
            borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
          }}>
            <div style={{ padding: '10px 16px', fontWeight: 600 }}>
              {slide.title}
              {slide.downloadUrl && (
                <a href={slide.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, fontSize: 11, color: 'var(--blue)' }}>&#8599;</a>
              )}
            </div>
            <div style={{ padding: '10px 16px', color: 'var(--ink-soft)', fontSize: 12 }}>{slide.date}</div>
            <div style={{ padding: '10px 16px' }}>
              <span style={{
                padding: '2px 6px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '.1em', textTransform: 'uppercase',
                border: '1px solid var(--ink)', background: 'var(--paper-2)',
              }}>{slide.tag}</span>
            </div>
            <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--ink-soft)' }}>{slide.pageCount || '—'}</div>
            <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--ink-soft)' }}>{slide.fileSize || '—'}</div>
            <div style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
              <button onClick={() => startEdit(slide)} style={{
                padding: '4px 10px', border: '1.5px solid var(--ink)', background: 'white',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer',
              }}>edit</button>
              <button onClick={() => del(slide.id)} style={{
                padding: '4px 10px', border: '1.5px solid var(--pink)', background: 'white',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer', color: 'var(--pink)',
              }}>del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidesEditor;
