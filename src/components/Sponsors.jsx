// Sponsors section — logo wall displayed on Home page

import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { orderBy } from 'firebase/firestore';

const SponsorCard = ({ sponsor }) => (
  <a
    href={sponsor.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'white',
      border: '1.5px solid var(--ink)',
      padding: '18px 22px',
      textDecoration: 'none',
      transition: 'box-shadow .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--ink)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
  >
    {sponsor.logoUrl ? (
      <img src={sponsor.logoUrl} alt={sponsor.name} style={{
        maxHeight: 40, maxWidth: '100%', objectFit: 'contain',
      }} />
    ) : (
      <span style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 700, fontSize: 15, color: 'var(--ink)',
      }}>{sponsor.name}</span>
    )}
  </a>
);

const Sponsors = () => {
  const { data: sponsors, loading } = useFirestoreQuery('sponsors', [orderBy('sortOrder')]);

  if (loading) return null;

  return (
    <div style={{ marginTop: 80 }}>
      <SectionHeading kicker="our partners" title="Sponsors." rotate={-1} />
      {sponsors.length > 0 ? (
        <div className="sponsors-grid" style={{
          marginTop: 28, display: 'grid', gap: 14,
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}>
          {sponsors.map(s => <SponsorCard key={s.id} sponsor={s} />)}
        </div>
      ) : (
        <div style={{
          padding: 60, textAlign: 'center',
          fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)',
        }}>sponsor logos coming soon &#9998;</div>
      )}
    </div>
  );
};

export default Sponsors;
