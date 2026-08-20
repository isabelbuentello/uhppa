// Gallery page — photo grid with lightbox

import { useState } from 'react';
import { Tape, SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { orderBy } from 'firebase/firestore';

const colors = ['var(--pink)', 'var(--blue)', 'var(--green)', 'var(--tape)', 'var(--pink)', 'var(--green)'];

const PhotoCard = ({ photo, index, onClick }) => {
  const rot = (index % 3 - 1) * 2;
  const color = colors[index % colors.length];

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        transform: `rotate(${rot}deg)`,
        transition: 'transform .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = `rotate(${rot}deg) translate(-2px,-2px)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rot}deg)`; }}
    >
      <Tape r={-6 + index * 4} color={color} w={80} style={{ top: -10, left: 30 }} />
      <div style={{
        background: 'white',
        border: '2px solid var(--ink)',
        boxShadow: '4px 4px 0 var(--ink)',
        padding: 10,
      }}>
        {photo.thumbUrl ? (
          <img src={photo.thumbUrl} alt={photo.caption} style={{
            width: '100%', height: 200, objectFit: 'cover',
          }} />
        ) : (
          <div style={{
            width: '100%', height: 200,
            background: color,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,.15) 8px 9px)',
            display: 'grid', placeItems: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, color: 'var(--ink)', letterSpacing: '.1em',
          }}>[ photo ]</div>
        )}
        <div style={{
          fontFamily: "'Kalam', cursive", fontSize: 15,
          color: 'var(--ink)', marginTop: 8, textAlign: 'center',
        }}>{photo.caption}</div>
      </div>
    </div>
  );
};

const Gallery = () => {
  const [selected, setSelected] = useState(null);
  const { data: photos, loading } = useFirestoreQuery('gallery', [orderBy('sortOrder')]);

  if (loading) return null;

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
      <SectionHeading kicker="memories" title="Photo Gallery" rotate={-1} />
      <p style={{
        fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18,
        maxWidth: 620, marginTop: 16, color: 'var(--ink-soft)',
      }}>
        Snapshots from meetings, mixers, volunteering &amp; more. Click to enlarge.
      </p>

      {photos.length > 0 ? (
        <div className="gallery-grid" style={{
          marginTop: 36, display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', gap: 32,
        }}>
          {photos.map((p, i) => (
            <PhotoCard key={p.id} photo={p} index={i} onClick={() => setSelected(i)} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: 60, textAlign: 'center',
          fontFamily: "'Kalam', cursive", fontSize: 28, color: 'var(--ink-soft)',
        }}>
          no photos yet — check back soon &#9998;
        </div>
      )}

      {/* Lightbox overlay */}
      {selected !== null && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'oklch(0.22 0.03 260 / 0.7)',
            display: 'grid', placeItems: 'center',
            backdropFilter: 'blur(4px)', cursor: 'pointer',
          }}
        >
          <div className="lightbox-inner" onClick={e => e.stopPropagation()} style={{
            background: 'white', border: '2px solid var(--ink)',
            boxShadow: '10px 10px 0 var(--ink)', padding: 16, maxWidth: 700,
            transform: 'rotate(-1deg)',
          }}>
            {photos[selected].fullUrl ? (
              <img src={photos[selected].fullUrl} alt={photos[selected].caption} style={{
                width: '100%', maxHeight: 500, objectFit: 'contain',
              }} />
            ) : (
              <div style={{
                width: '100%', height: 400,
                background: colors[selected % colors.length],
                backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.1) 12px 13px)',
                display: 'grid', placeItems: 'center',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: 'var(--ink)',
              }}>[ full-size photo ]</div>
            )}
            <div style={{
              fontFamily: "'Kalam', cursive", fontSize: 20,
              textAlign: 'center', marginTop: 12,
            }}>{photos[selected].caption}</div>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14,
            }}>
              <button onClick={(e) => { e.stopPropagation(); setSelected(Math.max(0, selected - 1)); }} style={navBtn}>&larr; prev</button>
              <button onClick={(e) => { e.stopPropagation(); setSelected(null); }} style={navBtn}>close</button>
              <button onClick={(e) => { e.stopPropagation(); setSelected(Math.min(photos.length - 1, selected + 1)); }} style={navBtn}>next &rarr;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const navBtn = {
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
  border: '2px solid var(--ink)', background: 'white',
  padding: '8px 14px', cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

export default Gallery;
