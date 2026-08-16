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
          display: 'grid', gridTemplateColumns: '1fr 100px 80px 60px 120px 120px',
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
            display: 'grid', gridTemplateColumns: '1fr 100px 80px 60px 120px 120px',
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
