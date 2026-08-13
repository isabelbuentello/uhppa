// Sponsors section — logo wall grouped by tier, displayed on Home page

import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { orderBy } from 'firebase/firestore';

const tierOrder = ['gold', 'silver', 'bronze'];
const tierLabels = { gold: 'Gold Partners', silver: 'Silver Partners', bronze: 'Bronze Partners' };

const SponsorCard = ({ sponsor, size }) => (
  <a
    href={sponsor.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'white',
      border: '1.5px solid var(--ink)',
      padding: size === 'lg' ? '24px 28px' : size === 'md' ? '18px 22px' : '14px 18px',
      textDecoration: 'none',
      transition: 'box-shadow .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--ink)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
  >
    {sponsor.logoUrl ? (
      <img src={sponsor.logoUrl} alt={sponsor.name} style={{
        maxHeight: size === 'lg' ? 48 : size === 'md' ? 36 : 28,
        maxWidth: '100%', objectFit: 'contain',
      }} />
    ) : (
      <span style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 700,
        fontSize: size === 'lg' ? 18 : size === 'md' ? 15 : 13,
        color: 'var(--ink)',
      }}>{sponsor.name}</span>
    )}
  </a>
);

const Sponsors = () => {
  const { data: sponsors, loading } = useFirestoreQuery('sponsors', [orderBy('sortOrder')]);

  if (loading) return null;

  const grouped = {};
  for (const tier of tierOrder) {
    grouped[tier] = sponsors.filter(s => s.tier === tier);
  }

  const sizeMap = { gold: 'lg', silver: 'md', bronze: 'sm' };

  return (
    <div style={{ marginTop: 80 }}>
      <SectionHeading kicker="our partners" title="Sponsors." rotate={-1} />
      {sponsors.length > 0 ? (
        tierOrder.map(tier => (
          grouped[tier].length > 0 && (
            <div key={tier} style={{ marginTop: 28 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 12,
              }}>{tierLabels[tier]}</div>
              <div style={{
                display: 'grid', gap: 14,
                gridTemplateColumns: tier === 'gold' ? 'repeat(3, 1fr)' : tier === 'silver' ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)',
              }}>
                {grouped[tier].map(s => <SponsorCard key={s.id} sponsor={s} size={sizeMap[tier]} />)}
              </div>
            </div>
          )
        ))
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
