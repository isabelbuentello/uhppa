import { useState, useMemo } from 'react';
import { Tape, SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { where } from 'firebase/firestore';
import { getSemester } from '../lib/semester';

const Podium = ({ rank, name, points, h, color, rot, crown }) => (
  <div style={{ position: 'relative', textAlign: 'center' }}>
    {crown && (
      <div style={{
        position: 'absolute', top: -52, left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
        fontSize: 56, lineHeight: 1,
      }}>&#9819;</div>
    )}
    <div style={{
      width: 160, height: 170, margin: '0 auto 14px', padding: 10,
      background: 'white', border: '2px solid var(--ink)',
      boxShadow: '4px 4px 0 var(--ink)', transform: `rotate(${rot}deg)`,
      position: 'relative',
    }}>
      <Tape r={-8} color={color} w={80} style={{ top: -10, left: 40 }} />
      <div style={{
        width: '100%', height: 120, background: color,
        display: 'grid', placeItems: 'center',
        fontFamily: "'Alfa Slab One', serif", fontSize: 48, color: 'var(--ink)',
      }}>{name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
      <div style={{ fontFamily: "'Kalam', cursive", fontSize: 15, marginTop: 4 }}>{name.split(' ')[0]}</div>
    </div>

    <div style={{
      background: color, border: '2px solid var(--ink)',
      boxShadow: '5px 5px 0 var(--ink)',
      padding: '18px 10px',
      height: h,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
    }}>
      <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 72, lineHeight: 1 }}>#{rank}</span>
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, marginTop: 6 }}>{name}</span>
      <span style={{ marginTop: 'auto', fontFamily: "'Alfa Slab One', serif", fontSize: 36 }}>{points} pts</span>
    </div>
  </div>
);

const Leaderboard = ({ tweaks }) => {
  const { user } = useAuth();
  const [scope, setScope] = useState('semester');
  const currentSemester = getSemester();

  // Fetch all verified ledger entries
  const { data: allLedger, loading: ledgerLoading } = useFirestoreQuery('pointsLedger', [
    where('status', '==', 'verified'),
  ], 'verified');

  // Fetch members for display names
  const { data: members, loading: membersLoading } = useFirestoreQuery('members');

  const loading = ledgerLoading || membersLoading;

  // Filter by scope, aggregate, rank
  const rankings = useMemo(() => {
    if (!allLedger.length) return [];

    const now = new Date();
    const filtered = allLedger.filter(entry => {
      if (scope === 'semester') return entry.semester === currentSemester;
      if (scope === 'monthly') {
        const d = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true; // all-time
    });

    // Group by memberId, sum points
    const map = {};
    for (const entry of filtered) {
      if (!map[entry.memberId]) map[entry.memberId] = 0;
      map[entry.memberId] += entry.points;
    }

    // Join with members for names
    const memberMap = {};
    for (const m of members) memberMap[m.id] = m.name || m.email?.split('@')[0] || 'Unknown';

    // Sort and rank
    return Object.entries(map)
      .map(([id, pts]) => ({ id, name: memberMap[id] || 'Member', points: pts }))
      .sort((a, b) => b.points - a.points)
      .map((entry, i) => ({ ...entry, rank: i + 1, isYou: entry.id === user?.uid }));
  }, [allLedger, members, scope, currentSemester, user]);

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  if (loading) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)' }}>
        loading leaderboard...
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
      <SectionHeading kicker="hall of fame" title="Leaderboard" rotate={-1} />
      <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
        {['semester', 'all-time', 'monthly'].map(s => (
          <button key={s} onClick={() => setScope(s)} style={{
            fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
            textTransform: 'uppercase', fontSize: 11, padding: '8px 14px',
            border: '2px solid var(--ink)',
            background: scope === s ? 'var(--ink)' : 'white',
            color: scope === s ? 'var(--paper)' : 'var(--ink)',
            cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
          }}>{s}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: "'Kalam', cursive", fontSize: 20, color: 'var(--margin)' }}>
          friendly stakes only, promise &#9825;
        </span>
      </div>

      {rankings.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 28, color: 'var(--ink-soft)' }}>
          no points recorded yet for this period.
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div style={{ marginTop: 52, display: 'grid', gridTemplateColumns: `repeat(${Math.min(top3.length, 3)}, 1fr)`, gap: 24, alignItems: 'end' }}>
              {top3.length > 1 && <Podium rank={2} name={top3[1].name} points={top3[1].points} h={200} color="var(--blue)" rot={-3} />}
              {top3.length > 0 && <Podium rank={1} name={top3[0].name} points={top3[0].points} h={270} color="var(--pink)" rot={0} crown />}
              {top3.length > 2 && <Podium rank={3} name={top3[2].name} points={top3[2].points} h={170} color="var(--green)" rot={3} />}
            </div>
          )}

          {/* Ranked list */}
          {rest.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 30, margin: 0 }}>the rest of the pack</h3>
              </div>
              <div style={{ marginTop: 18, background: 'white', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)' }}>
                {rest.map((r, i) => (
                  <div key={r.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px',
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
                    background: r.isYou ? 'oklch(0.94 0.09 95)' : 'transparent',
                    position: 'relative',
                  }}>
                    <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 32, color: r.isYou ? 'var(--pink)' : 'var(--ink)' }}>#{r.rank}</span>
                    <div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18 }}>
                        {r.name}{r.isYou ? ' (you)' : ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, textAlign: 'right' }}>
                      {r.points}
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)', marginLeft: 4 }}>pts</span>
                    </div>
                    {r.isYou && (
                      <span style={{ position: 'absolute', right: -14, top: -14, transform: 'rotate(8deg)', fontFamily: "'Kalam', cursive", color: 'var(--pink)', fontSize: 22 }}>you! &larr;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
