import { QRCodeSVG } from 'qrcode.react';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';

const Membership = () => {
  const { data: rawCodes } = useFirestoreQuery('qrCodes');
  const codes = [...rawCodes].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 900, margin: '0 auto' }}>
      <SectionHeading kicker="join us" title="Membership." rotate={-1} />
      <p style={{
        fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18,
        maxWidth: 620, marginTop: 16, color: 'var(--ink-soft)',
      }}>
        Fill out our membership form and pay dues here!
      </p>

      {codes.length > 0 ? (
        <div className="membership-cards" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {codes.map((code) => (
            <div key={code.id} className="membership-card" style={{
              background: 'white', border: '2px solid var(--ink)',
              boxShadow: '4px 4px 0 var(--ink)',
              display: 'flex', alignItems: 'center', gap: 24, padding: 20,
            }}>
              <div style={{ flexShrink: 0 }}>
                {code.imageUrl ? (
                  <img src={code.imageUrl} alt={code.label} style={{
                    width: 140, height: 140, objectFit: 'contain',
                    border: '1px solid var(--rule)',
                  }} />
                ) : (
                  <QRCodeSVG value={code.url} size={140} level="M" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{
                    fontFamily: "'Alfa Slab One', serif", fontSize: 22,
                    margin: 0, lineHeight: 1.1,
                  }}>{code.label}</h3>
                  {code.tag && (
                    <span style={{
                      background: 'var(--paper-2)', border: '1.5px solid var(--ink)',
                      padding: '2px 8px', fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                    }}>{code.tag}</span>
                  )}
                </div>
                {code.description && (
                  <p style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
                    color: 'var(--ink-soft)', marginTop: 8, margin: '8px 0 0',
                    lineHeight: 1.4,
                  }}>{code.description}</p>
                )}
                <a href={code.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block', marginTop: 10,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: '.08em', color: 'var(--blue)',
                  textDecoration: 'none', borderBottom: '1.5px solid var(--blue)',
                }}>open link &rarr;</a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          marginTop: 36, padding: 60, textAlign: 'center',
          fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)',
          border: '2px dashed var(--rule)', background: 'white',
        }}>coming soon &#9998;</div>
      )}
    </div>
  );
};

export default Membership;
