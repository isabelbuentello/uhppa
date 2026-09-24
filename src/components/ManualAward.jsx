import { useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getSemester } from '../lib/semester';

const CATEGORIES = [
  { key: 'meeting',   label: 'General Meetings' },
  { key: 'volunteer', label: 'Volunteering' },
  { key: 'social',    label: 'Socials' },
  { key: 'special',   label: 'Specials' },
  { key: 'board',     label: 'Board' },
  { key: 'other',     label: 'Other' },
];

const labelStyle = {
  display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: '.15em',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  marginBottom: 5,
};

const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  border: '2px solid var(--ink)',
  background: 'white',
  fontFamily: "'Bricolage Grotesque', sans-serif",
  fontSize: 14,
  boxSizing: 'border-box',
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

const ManualAward = ({ members }) => {
  const { user } = useAuth();
  const searchRef = useRef(null);

  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('meeting');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [awarded, setAwarded] = useState([]);

  // A negative amount is a deduction — the button restyles so the sign can't slip by unnoticed.
  const isDeduction = Number(points) < 0;

  // Only real members/officers can be awarded — pending and denied accounts can't.
  const eligible = useMemo(
    () => members.filter(m => m.role === 'member' || m.role === 'officer'),
    [members],
  );

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || picked) return [];
    return eligible
      .filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [eligible, search, picked]);

  const pick = (m) => {
    setPicked(m);
    setSearch(m.name || m.email);
    setErr('');
  };

  const clearMember = () => {
    setPicked(null);
    setSearch('');
    searchRef.current?.focus();
  };

  const submit = async () => {
    setErr('');
    if (!picked) { setErr('Pick a member from the list.'); return; }
    const amount = Number(points);
    if (!points || !Number.isFinite(amount) || amount === 0) {
      setErr('Enter a point amount — positive to award, negative to take away.');
      return;
    }
    if (!reason.trim()) { setErr('Enter a reason — it shows on the member\'s activity list.'); return; }

    setSaving(true);
    try {
      await addDoc(collection(db, 'pointsLedger'), {
        memberId: picked.id,
        eventId: null,
        eventTitle: reason.trim(),
        points: amount,
        category,
        semester: getSemester(),
        method: 'manual',
        status: 'verified',
        note: '',
        createdAt: serverTimestamp(),
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
      });
      setAwarded(a => [
        { id: `${picked.id}-${Date.now()}`, name: picked.name || picked.email, points: amount },
        ...a,
      ]);
      // Keep reason + category so the officer can run down a roster.
      setPicked(null);
      setSearch('');
      setPoints('');
      searchRef.current?.focus();
    } catch (e) {
      setErr(`Could not save: ${e.message}`);
    }
    setSaving(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !saving) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div style={{
      border: '2px solid var(--ink)',
      background: 'var(--paper-2)',
      boxShadow: '5px 5px 0 var(--ink)',
      padding: '20px 22px',
      marginTop: 24,
    }}>
      <h3 style={{
        margin: '0 0 16px',
        fontFamily: "'Alfa Slab One', serif",
        fontSize: 22,
        transform: 'rotate(-0.6deg)',
      }}>
        award points manually
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 90px 1.4fr 1fr', gap: 12, alignItems: 'start' }}>
        {/* Member lookup */}
        <div style={{ position: 'relative' }}>
          <span style={labelStyle}>member *</span>
          <input
            ref={searchRef}
            value={search}
            placeholder="search name or email"
            onChange={e => { setSearch(e.target.value); setPicked(null); }}
            onKeyDown={onKeyDown}
            style={{
              ...inputStyle,
              paddingRight: picked ? 30 : 11,
              background: picked ? 'var(--green)' : 'white',
            }}
          />
          {picked && (
            <button
              onClick={clearMember}
              title="clear"
              style={{
                position: 'absolute', right: 6, top: 25,
                border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4,
              }}
            >&times;</button>
          )}
          {matches.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
              border: '2px solid var(--ink)', borderTop: 'none', background: 'white',
              maxHeight: 210, overflowY: 'auto',
            }}>
              {matches.map(m => (
                <button
                  key={m.id}
                  onClick={() => pick(m)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 11px', border: 'none',
                    borderBottom: '1.5px dashed var(--rule)',
                    background: 'transparent', cursor: 'pointer',
                    fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{m.name || '—'}</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    color: 'var(--ink-soft)', marginLeft: 8,
                  }}>{m.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Points */}
        <div>
          <span style={labelStyle}>points *</span>
          <input
            type="number"
            step="1"
            value={points}
            placeholder="10"
            onChange={e => setPoints(e.target.value)}
            onKeyDown={onKeyDown}
            style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        {/* Reason */}
        <div>
          <span style={labelStyle}>reason *</span>
          <input
            value={reason}
            placeholder="e.g. Health fair volunteer"
            onChange={e => setReason(e.target.value)}
            onKeyDown={onKeyDown}
            style={inputStyle}
          />
        </div>

        {/* Category */}
        <div>
          <span style={labelStyle}>category</span>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={inputStyle}
          >
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        <button
          onClick={submit}
          disabled={saving}
          style={{
            ...btnStyle,
            background: isDeduction ? 'var(--pink)' : 'var(--green)',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving
            ? (isDeduction ? 'taking away...' : 'awarding...')
            : (isDeduction ? '− take points away' : 'award points')}
        </button>
        <span style={{ fontFamily: "'Kalam', cursive", fontSize: 14, color: 'var(--ink-soft)' }}>
          {isDeduction
            ? 'negative amount — this will subtract from their total'
            : 'reason & category stick around — award one member after another'}
        </span>
      </div>

      {err && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          border: '2px solid var(--ink)', background: 'var(--pink)',
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
        }}>{err}</div>
      )}

      {awarded.length > 0 && (
        <div style={{ marginTop: 18, borderTop: '1.5px dashed var(--rule)', paddingTop: 12 }}>
          <div style={{ ...labelStyle, marginBottom: 8 }}>
            awarded this session ({awarded.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {awarded.map(a => (
              <span key={a.id} style={{
                border: '1.5px solid var(--ink)', background: 'white',
                padding: '3px 9px',
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 13,
              }}>
                {a.name}
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  marginLeft: 7,
                  color: a.points < 0 ? 'var(--margin)' : 'var(--ink-soft)',
                  fontWeight: a.points < 0 ? 700 : 400,
                }}>{a.points < 0 ? '' : '+'}{a.points}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualAward;
