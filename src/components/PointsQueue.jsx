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
