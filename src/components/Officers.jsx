// Officers section — polaroid-style cards, displayed on Home page

import { Tape, SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

const colors = ['var(--pink)', 'var(--blue)', 'var(--green)', 'var(--tape)', 'var(--pink)', 'var(--green)'];

const OfficerCard = ({ officer, index }) => {
  const initials = officer.name.split(' ').map(s => s[0]).slice(0, 2).join('');
  const color = colors[index % colors.length];
  const rot = (index % 3 - 1) * 2.5;

  return (
    <div style={{
      position: 'relative',
      transform: `rotate(${rot}deg)`,
    }}>
      <Tape r={-8 + index * 3} color={color} w={80} style={{ top: -10, left: 40 }} />
      <div style={{
        background: 'white',
        border: '2px solid var(--ink)',
        boxShadow: '4px 4px 0 var(--ink)',
        padding: 10,
      }}>
        {officer.photoUrl ? (
          <img src={officer.photoUrl} alt={officer.name} style={{
            width: '100%', height: 140, objectFit: 'cover',
          }} />
        ) : (
          <div style={{
            width: '100%', height: 140, background: color,
            display: 'grid', placeItems: 'center',
            fontFamily: "'Alfa Slab One', serif", fontSize: 48, color: 'var(--ink)',
          }}>{initials}</div>
        )}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, lineHeight: 1 }}>{officer.name}</div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 4,
          }}>{officer.position}</div>
          <p style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 13,
            lineHeight: 1.4, color: 'var(--ink-soft)', marginTop: 8, margin: '8px 0 0',
          }}>{officer.bio}</p>
        </div>
      </div>
    </div>
  );
};

const Officers = () => {
  const { data: officers, loading } = useFirestoreQuery('officers', [
    where('active', '==', true),
    orderBy('sortOrder'),
  ]);

  if (loading) return null;

  return (
    <div style={{ marginTop: 80 }}>
      <SectionHeading kicker="the board" title="Meet the officers." rotate={-1} />
      {officers.length > 0 ? (
        <div style={{
          marginTop: 36, display: 'grid', gap: 28,
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}>
          {officers.map((o, i) => <OfficerCard key={o.id} officer={o} index={i} />)}
        </div>
      ) : (
        <div style={{
          padding: 60, textAlign: 'center',
          fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)',
        }}>officer bios coming soon &#9998;</div>
      )}
    </div>
  );
};

export default Officers;
