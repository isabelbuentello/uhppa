import { useState, useMemo } from 'react';
import { Tape, Highlight, Scribble, Sticky, Stamp, SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreQuery, useFirestoreDoc } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { getSemester } from '../lib/semester';

const CATEGORIES = [
  { key: 'meeting',   label: 'General Meetings', color: 'pink' },
  { key: 'volunteer', label: 'Volunteering',     color: 'blue' },
  { key: 'social',    label: 'Socials',           color: 'green' },
  { key: 'special',   label: 'Specials',          color: 'tape' },
  { key: 'board',     label: 'Board',             color: 'ink' },
];

const cmap = (c) => `var(--${c})`;

const Points = ({ tweaks }) => {
  const { user } = useAuth();
  const currentSemester = getSemester();
  const { data: clubInfo } = useFirestoreDoc('clubInfo', 'main');
  const semesterGoal = clubInfo?.semesterGoal || 200;

  // Fetch this user's ledger entries
  const { data: ledger, loading } = useFirestoreQuery('pointsLedger', [
    where('memberId', '==', user?.uid || ''),
    orderBy('createdAt', 'desc'),
  ], user?.uid || '');

  // Filter to current semester
  const semesterEntries = useMemo(() =>
    ledger.filter(e => e.semester === currentSemester),
  [ledger, currentSemester]);

  // Total (verified only)
  const total = useMemo(() =>
    semesterEntries.filter(e => e.status === 'verified').reduce((s, e) => s + e.points, 0),
  [semesterEntries]);

  // Category breakdown (verified only)
  const breakdown = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      value: semesterEntries.filter(e => e.status === 'verified' && e.category === cat.key).reduce((s, e) => s + e.points, 0),
    })),
  [semesterEntries]);

  const pct = Math.min(100, (total / semesterGoal) * 100);

  // --- Check-in code form ---
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [codeSubmitting, setCodeSubmitting] = useState(false);

  const submitCode = async () => {
    setCodeErr('');
    setCodeMsg('');
    if (!code.trim()) { setCodeErr('Enter a code.'); return; }
    setCodeSubmitting(true);
    try {
      // Find event with matching checkinCode
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('checkinCode', '==', code.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setCodeErr('Invalid code. Double-check and try again.');
        setCodeSubmitting(false);
        return;
      }
      const eventDoc = snap.docs[0];
      const eventData = eventDoc.data();

      // Check for duplicate
      const dupQ = query(collection(db, 'pointsLedger'),
        where('memberId', '==', user.uid),
        where('eventId', '==', eventDoc.id));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setCodeErr("You've already checked in for this event.");
        setCodeSubmitting(false);
        return;
      }

      // Create verified entry
      await addDoc(collection(db, 'pointsLedger'), {
        memberId: user.uid,
        eventId: eventDoc.id,
        eventTitle: eventData.title,
        points: eventData.points || 0,
        category: eventData.category || 'meeting',
        semester: getSemester(),
        method: 'checkin',
        status: 'verified',
        note: '',
        createdAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
      });
      setCodeMsg(`Checked in for "${eventData.title}" — +${eventData.points} pts!`);
      setCode('');
    } catch (err) {
      setCodeErr('Something went wrong. Try again.');
    }
    setCodeSubmitting(false);
  };

  // --- Missing points request form ---
  const [reqOpen, setReqOpen] = useState(false);
  const [reqEventId, setReqEventId] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [reqMsg, setReqMsg] = useState('');
  const [reqErr, setReqErr] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const { data: events } = useFirestoreQuery('events');

  const submitRequest = async () => {
    setReqErr('');
    setReqMsg('');
    if (!reqEventId) { setReqErr('Select an event.'); return; }
    setReqSubmitting(true);
    try {
      // Check for duplicate
      const dupQ = query(collection(db, 'pointsLedger'),
        where('memberId', '==', user.uid),
        where('eventId', '==', reqEventId));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setReqErr("You've already submitted points for this event.");
        setReqSubmitting(false);
        return;
      }

      const event = events.find(e => e.id === reqEventId);
      await addDoc(collection(db, 'pointsLedger'), {
        memberId: user.uid,
        eventId: reqEventId,
        eventTitle: event?.title || 'Unknown Event',
        points: event?.points || 0,
        category: event?.category || 'meeting',
        semester: getSemester(),
        method: 'request',
        status: 'pending',
        note: reqNote.trim(),
        createdAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
      });
      setReqMsg('Request submitted! An officer will review it.');
      setReqEventId('');
      setReqNote('');
    } catch (err) {
      setReqErr('Something went wrong. Try again.');
    }
    setReqSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)' }}>
        loading your points...
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
      <SectionHeading kicker="your file" title="Points tracker" rotate={-1} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, marginTop: 32 }}>
        {/* Left: big stat card */}
        <div style={{ position: 'relative' }}>
          <Tape r={-8} color="var(--pink)" w={110} style={{ top: -12, left: 40 }} />
          <div style={{
            background: 'white', border: '2px solid var(--ink)',
            boxShadow: '6px 6px 0 var(--ink)', padding: '28px 28px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{currentSemester} &middot; active</div>
                <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, lineHeight: 1, marginTop: 6 }}>{user?.displayName || 'Member'}</div>
              </div>
            </div>

            {/* Big number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 28 }}>
              <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 130, lineHeight: .85 }}>{total}</span>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, color: 'var(--ink-soft)' }}>/ {semesterGoal} pts</span>
            </div>

            {/* Ruler-style progress */}
            <div style={{ marginTop: 14, position: 'relative', height: 28, border: '2px solid var(--ink)', background: 'white' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 24px, var(--ink) 24px 25px)' }} />
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`,
                background: 'var(--pink)',
                borderRight: pct > 0 ? '2px solid var(--ink)' : 'none',
              }} />
              {pct > 0 && (
                <span style={{
                  position: 'absolute', left: `${pct}%`, top: -22, transform: 'translateX(-50%)',
                  fontFamily: "'Kalam', cursive", fontSize: 16, color: 'var(--pink)',
                }}>you! &darr;</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '.1em' }}>
              <span>0</span><span>GOAL {semesterGoal}</span>
            </div>

            {/* Cords reward */}
            {total < semesterGoal && (
              <div style={{ marginTop: 20, padding: 14, background: 'var(--paper-2)', border: '1.5px dashed var(--ink)' }}>
                <b style={{ fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', fontSize: 12, textTransform: 'uppercase' }}>Next reward</b>
                <div style={{ fontSize: 15, marginTop: 4 }}>
                  <b>{semesterGoal - total}</b> pts until <Highlight color="var(--tape)">honors cords</Highlight> at graduation.
                </div>
              </div>
            )}
            {total >= semesterGoal && (
              <div style={{ marginTop: 20, padding: 14, background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)' }}>
                <b style={{ fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', fontSize: 12, textTransform: 'uppercase' }}>Goal reached!</b>
                <div style={{ fontSize: 15, marginTop: 4 }}>
                  You've hit your semester goal. <Highlight color="var(--tape)">Honors cords earned!</Highlight>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: category bars */}
        <div style={{ position: 'relative' }}>
          <Sticky color="var(--tape)" rotate={3} style={{ position: 'absolute', top: -20, right: -10, width: 150, zIndex: 2 }}>
            <b>How it&apos;s<br />counted &darr;</b>
          </Sticky>
          <div style={{ background: 'white', border: '2px solid var(--ink)', padding: '22px 22px 18px', boxShadow: '5px 5px 0 var(--ink)' }}>
            <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26 }}>by category</div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {breakdown.map(b => (
                <div key={b.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 600 }}>
                    <span>{b.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{b.value} pts</span>
                  </div>
                  <div style={{ marginTop: 6, height: 18, border: '1.5px solid var(--ink)', background: 'white', position: 'relative' }}>
                    {b.value > 0 && (
                      <div style={{
                        position: 'absolute', inset: 0, left: 0,
                        width: `${Math.min(100, (b.value / semesterGoal) * 100 * CATEGORIES.length)}%`,
                        background: cmap(b.color),
                        backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(0,0,0,.08) 6px 7px)',
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* How points work */}
            {clubInfo?.pointsGuide && (
              <details style={{ marginTop: 20 }}>
                <summary style={{
                  fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', fontSize: 12,
                  textTransform: 'uppercase', cursor: 'pointer', color: 'var(--ink-soft)',
                }}>How points work</summary>
                <p style={{ marginTop: 8, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
                  {clubInfo.pointsGuide}
                </p>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <button onClick={() => { setCodeOpen(!codeOpen); setReqOpen(false); }} style={{
          border: '2px solid var(--ink)', background: codeOpen ? 'var(--ink)' : 'var(--green)',
          color: codeOpen ? 'var(--paper)' : 'var(--ink)',
          padding: '14px 22px', fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
          textTransform: 'uppercase', fontSize: 13, cursor: 'pointer', boxShadow: '4px 4px 0 var(--ink)',
        }}>&#10003; Enter check-in code</button>
        <button onClick={() => { setReqOpen(!reqOpen); setCodeOpen(false); }} style={{
          border: '2px solid var(--ink)', background: reqOpen ? 'var(--ink)' : 'var(--pink)',
          color: reqOpen ? 'var(--paper)' : 'var(--ink)',
          padding: '14px 22px', fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
          textTransform: 'uppercase', fontSize: 13, cursor: 'pointer', boxShadow: '4px 4px 0 var(--ink)',
        }}>&#65291; Submit missing points</button>
      </div>

      {/* Check-in code form */}
      {codeOpen && (
        <div style={{ marginTop: 18, background: 'white', border: '2px solid var(--ink)', padding: '20px 24px', boxShadow: '5px 5px 0 var(--ink)', maxWidth: 500 }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, marginBottom: 14 }}>enter check-in code</div>
          {codeErr && <div style={{ background: 'oklch(0.93 0.08 20)', border: '1.5px solid var(--pink)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{codeErr}</div>}
          {codeMsg && <div style={{ background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{codeMsg}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. UHPPA0402"
              style={{ flex: 1, padding: '10px 14px', border: '2px solid var(--ink)', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, textTransform: 'uppercase', boxSizing: 'border-box' }} />
            <button onClick={submitCode} disabled={codeSubmitting} style={{
              border: '2px solid var(--ink)', background: 'var(--green)', padding: '10px 18px',
              fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12, cursor: codeSubmitting ? 'wait' : 'pointer',
            }}>{codeSubmitting ? '...' : 'submit'}</button>
          </div>
        </div>
      )}

      {/* Missing points request form */}
      {reqOpen && (
        <div style={{ marginTop: 18, background: 'white', border: '2px solid var(--ink)', padding: '20px 24px', boxShadow: '5px 5px 0 var(--ink)', maxWidth: 500 }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, marginBottom: 14 }}>submit missing points</div>
          {reqErr && <div style={{ background: 'oklch(0.93 0.08 20)', border: '1.5px solid var(--pink)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{reqErr}</div>}
          {reqMsg && <div style={{ background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)', padding: '8px 12px', marginBottom: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14 }}>{reqMsg}</div>}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>event</span>
            <select value={reqEventId} onChange={e => setReqEventId(e.target.value)} style={{
              width: '100%', padding: '10px 14px', border: '2px solid var(--ink)', background: 'var(--paper)',
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, boxSizing: 'border-box',
            }}>
              <option value="">select an event...</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title} — {ev.date}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>note (optional)</span>
            <input value={reqNote} onChange={e => setReqNote(e.target.value)} placeholder="e.g. I forgot to check in"
              style={{ width: '100%', padding: '10px 14px', border: '2px solid var(--ink)', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, boxSizing: 'border-box' }} />
          </label>
          <button onClick={submitRequest} disabled={reqSubmitting} style={{
            border: '2px solid var(--ink)', background: 'var(--pink)', padding: '10px 18px',
            fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12, cursor: reqSubmitting ? 'wait' : 'pointer',
          }}>{reqSubmitting ? 'submitting...' : 'submit request'}</button>
        </div>
      )}

      {/* Log table */}
      <div style={{ marginTop: 52 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 32, margin: 0 }}>recent activity</h3>
          <Scribble color="var(--pink)" width={140} height={10} />
        </div>

        {semesterEntries.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
            no points yet this semester — check in at your next event!
          </div>
        ) : (
          <div style={{ marginTop: 18, border: '2px solid var(--ink)', background: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px', background: 'var(--ink)', color: 'var(--paper)', fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              <div style={{ padding: '10px 16px' }}>Date</div>
              <div style={{ padding: '10px 16px' }}>Event</div>
              <div style={{ padding: '10px 16px' }}>Points</div>
              <div style={{ padding: '10px 16px' }}>Status</div>
            </div>
            {semesterEntries.map((r, i) => {
              const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
              return (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px',
                  borderTop: i === 0 ? 'none' : '1.5px dashed oklch(0.8 0.03 240)',
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
                }}>
                  <div style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace" }}>
                    {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                  </div>
                  <div style={{ padding: '12px 16px' }}>{r.eventTitle}</div>
                  <div style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>+{r.points}</div>
                  <div style={{ padding: '12px 16px' }}>
                    {r.status === 'verified' ? (
                      <span style={{ color: 'var(--green)', fontFamily: "'Kalam', cursive", fontSize: 18 }}>&#10003; verified</span>
                    ) : (
                      <span style={{ color: 'var(--tape)', fontFamily: "'Kalam', cursive", fontSize: 18 }}>&#9203; pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Points;
