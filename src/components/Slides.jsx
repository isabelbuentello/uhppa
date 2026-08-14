import { useState, useMemo } from 'react';
import { Tape, SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';

const cmap = (c) => ({
  pink: 'var(--pink)', green: 'var(--green)', blue: 'var(--blue)',
  tape: 'var(--tape)', ink: 'var(--ink)',
}[c] || 'var(--tape)');

const tagColors = {
  'GM': 'pink', 'Panel': 'tape', 'Prep': 'green',
  'Workshop': 'blue', 'Research': 'green', 'Social': 'green',
};

const DeckCard = ({ deck, rot }) => {
  const [hover, setHover] = useState(false);
  const color = cmap(tagColors[deck.tag] || 'tape');
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', transform: `rotate(${rot}deg) ${hover ? 'translate(-2px,-3px)' : ''}`, transition: 'transform .15s' }}>
      <Tape r={-6} color={color} w={90} style={{ top: -10, left: 40 }} />
      <div style={{
        background: 'white', border: '2px solid var(--ink)',
        boxShadow: hover ? '8px 8px 0 var(--pink)' : '5px 5px 0 var(--ink)',
        transition: 'box-shadow .15s',
      }}>
        {/* mock pdf preview */}
        <div style={{
          height: 200, borderBottom: '2px solid var(--ink)',
          background: 'var(--paper)',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 18px, oklch(0.85 0.03 85) 18px 19px)',
          padding: 18, position: 'relative',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 18, lineHeight: 1.05, maxWidth: '80%' }}>
            {deck.title.split(' — ')[0]}
          </div>
          <div style={{ marginTop: 10, fontFamily: "'Kalam', cursive", fontSize: 14, color: 'var(--ink-soft)' }}>{deck.date}</div>
          <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', gap: 3, alignItems: 'flex-end' }}>
            {[12, 22, 18, 28, 16, 24].map((h, i) => (
              <span key={i} style={{ width: 8, height: h, background: i % 2 ? color : 'var(--ink)' }} />
            ))}
          </div>
          <div style={{
            position: 'absolute', left: 18, bottom: 14,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '.12em', color: 'var(--ink-soft)',
          }}>pg. 1 / {deck.pageCount}</div>
        </div>
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              background: color, border: '1.5px solid var(--ink)',
              padding: '2px 8px', fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
            }}>{deck.tag}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)' }}>
              {deck.pageCount} pp &middot; {deck.fileSize}
            </span>
          </div>
          <div style={{ marginTop: 10, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>
            {deck.title}
          </div>
          {deck.downloadUrl ? (
            <a href={deck.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{
                marginTop: 14, width: '100%',
                border: '2px solid var(--ink)', background: hover ? 'var(--ink)' : 'var(--paper)',
                color: hover ? 'var(--paper)' : 'var(--ink)',
                padding: '10px 12px',
                fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
                textTransform: 'uppercase', fontSize: 12, cursor: 'pointer',
              }}>&darr; Download PDF</button>
            </a>
          ) : (
            <button disabled style={{
              marginTop: 14, width: '100%',
              border: '2px solid var(--ink)', background: 'var(--paper-2)',
              color: 'var(--ink-soft)',
              padding: '10px 12px',
              fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em',
              textTransform: 'uppercase', fontSize: 12, cursor: 'not-allowed',
            }}>no file yet</button>
          )}
        </div>
      </div>
    </div>
  );
};

const arrowBtn = {
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
  border: '2px solid var(--ink)', background: 'white',
  padding: '10px 14px', cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const Slides = () => {
  const [q, setQ] = useState('');
  const [year, setYear] = useState('all');
  const { data: slides, loading } = useFirestoreQuery('slides');

  // Derive available years from data
  const years = useMemo(() => {
    const set = new Set(slides.map(s => s.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [slides]);

  const filtered = useMemo(() => {
    return slides
      .filter(d => {
        if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
        if (year !== 'all' && d.year !== Number(year)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [slides, q, year]);

  if (loading) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)' }}>
        loading slides...
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
      <SectionHeading kicker="archive" title="Slides & PDFs" rotate={-1} />
      <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, maxWidth: 620, marginTop: 16, color: 'var(--ink-soft)' }}>
        Every UHPPA deck, filed, stamped &amp; taped up. Click any card to download the PDF.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="search titles…"
            style={{
              border: '2px solid var(--ink)', background: 'white',
              padding: '10px 14px 10px 36px',
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
              width: 280, boxShadow: '3px 3px 0 var(--ink)', outline: 'none',
            }} />
          <span style={{ position: 'absolute', left: 12, top: 11, fontFamily: "'JetBrains Mono', monospace" }}>&#8981;</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setYear('all')} style={{
            ...arrowBtn,
            background: year === 'all' ? 'var(--ink)' : 'white',
            color: year === 'all' ? 'var(--paper)' : 'var(--ink)',
          }}>all</button>
          {years.map(y => (
            <button key={y} onClick={() => setYear(String(y))} style={{
              ...arrowBtn,
              background: year === String(y) ? 'var(--ink)' : 'white',
              color: year === String(y) ? 'var(--paper)' : 'var(--ink)',
            }}>{y}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
          {filtered.length} / {slides.length} decks
        </span>
      </div>

      {/* Grid */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
        {filtered.map((d, i) => <DeckCard key={d.id} deck={d} rot={(i % 3 - 1) * 1.3} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 28, color: 'var(--ink-soft)' }}>
          nothing filed under that. try another search &#9998;
        </div>
      )}
    </div>
  );
};

export default Slides;
