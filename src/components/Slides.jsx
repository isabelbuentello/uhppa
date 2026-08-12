import { useState } from 'react';
import { Tape, SectionHeading } from './Primitives';

const cmap2 = (c) => ({
  pink: 'var(--pink)', green: 'var(--green)', blue: 'var(--blue)',
  tape: 'var(--tape)', ink: 'var(--ink)',
}[c] || 'var(--tape)');

const DeckCard = ({ deck, rot }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ position:'relative', transform:`rotate(${rot}deg) ${hover?'translate(-2px,-3px)':''}`, transition:'transform .15s' }}>
      <Tape r={-6} color={cmap2(deck.c)} w={90} style={{ top:-10, left: 40 }}/>
      <div style={{
        background:'white', border:'2px solid var(--ink)',
        boxShadow: hover ? '8px 8px 0 var(--pink)' : '5px 5px 0 var(--ink)',
        transition:'box-shadow .15s',
      }}>
        {/* mock pdf preview */}
        <div style={{
          height: 200, borderBottom:'2px solid var(--ink)',
          background:'var(--paper)',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 18px, oklch(0.85 0.03 85) 18px 19px)',
          padding: 18, position:'relative',
        }}>
          <div style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 18, lineHeight:1.05, maxWidth: '80%' }}>
            {deck.title.split(' — ')[0]}
          </div>
          <div style={{ marginTop: 10, fontFamily:"'Kalam', cursive", fontSize: 14, color:'var(--ink-soft)' }}>{deck.date}</div>
          {/* fake bar chart */}
          <div style={{ position:'absolute', right: 14, bottom: 14, display:'flex', gap: 3, alignItems:'flex-end' }}>
            {[12,22,18,28,16,24].map((h,i)=>(
              <span key={i} style={{ width: 8, height: h, background: i%2 ? cmap2(deck.c) : 'var(--ink)' }}/>
            ))}
          </div>
          <div style={{
            position:'absolute', left: 18, bottom: 14,
            fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'.12em', color:'var(--ink-soft)',
          }}>pg. 1 / {deck.pages}</div>
        </div>
        <div style={{ padding:'14px 16px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{
              background: cmap2(deck.c), border:'1.5px solid var(--ink)',
              padding:'2px 8px', fontFamily:"'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing:'.1em', textTransform:'uppercase',
            }}>{deck.tag}</span>
            <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--ink-soft)' }}>
              {deck.pages} pp &middot; {deck.size}
            </span>
          </div>
          <div style={{ marginTop: 10, fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>
            {deck.title}
          </div>
          <button style={{
            marginTop: 14, width: '100%',
            border:'2px solid var(--ink)', background: hover ? 'var(--ink)' : 'var(--paper)',
            color: hover ? 'var(--paper)' : 'var(--ink)',
            padding:'10px 12px',
            fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.1em',
            textTransform:'uppercase', fontSize: 12, cursor:'pointer',
          }}>&darr; Download PDF</button>
        </div>
      </div>
    </div>
  );
};

const arrowBtn2 = {
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing:'.1em', textTransform:'uppercase', fontSize: 11,
  border: '2px solid var(--ink)', background:'white',
  padding: '10px 14px', cursor:'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const Slides = () => {
  const [q, setQ] = useState('');
  const [year, setYear] = useState('all');
  const decks = [
    { id:'gm-apr16', title:'General Meeting — Apr 16', date:'04/16/2026', pages:18, size:'2.4 MB', tag:'GM', c:'pink' },
    { id:'panel-apr20', title:'Pharm School Panel Q&A', date:'04/20/2026', pages:24, size:'3.1 MB', tag:'Panel', c:'tape' },
    { id:'gm-apr02', title:'General Meeting — Apr 02', date:'04/02/2026', pages:16, size:'2.1 MB', tag:'GM', c:'pink' },
    { id:'kaplan', title:'Kaplan MCAT — Prep Overview', date:'04/23/2026', pages:32, size:'4.8 MB', tag:'Prep', c:'green' },
    { id:'ethics', title:'Pharmacy Ethics Workshop', date:'03/28/2026', pages:22, size:'2.9 MB', tag:'Workshop', c:'blue' },
    { id:'res-intro', title:'Intro to Research: Finding a Lab', date:'03/14/2026', pages:20, size:'2.5 MB', tag:'Research', c:'green' },
    { id:'gm-mar05', title:'General Meeting — Mar 05', date:'03/05/2026', pages:17, size:'2.2 MB', tag:'GM', c:'pink' },
    { id:'rotations', title:'Hospital vs. Retail Rotations', date:'02/18/2026', pages:28, size:'3.6 MB', tag:'Workshop', c:'blue' },
    { id:'pcat-tips', title:'PCAT Study Strategies', date:'02/04/2026', pages:15, size:'1.9 MB', tag:'Prep', c:'green' },
    { id:'welcome', title:'Welcome Back — Spring Kickoff', date:'01/22/2026', pages:12, size:'1.6 MB', tag:'GM', c:'pink' },
    { id:'fall-closer', title:'Fall Semester Closer', date:'12/04/2025', pages:20, size:'2.7 MB', tag:'GM', c:'pink' },
    { id:'ochem', title:'Surviving OChem I', date:'11/13/2025', pages:26, size:'3.4 MB', tag:'Workshop', c:'blue' },
  ];
  const filtered = decks.filter(d => {
    if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (year !== 'all' && !d.date.includes(year)) return false;
    return true;
  });

  return (
    <div style={{ padding:'28px 48px 80px', maxWidth: 1400, margin:'0 auto' }}>
      <SectionHeading kicker="archive" title="Slides & PDFs" rotate={-1}/>
      <p style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 18, maxWidth: 620, marginTop: 16, color:'var(--ink-soft)' }}>
        Every UHPPA deck, filed, stamped &amp; taped up. Click any card to download the PDF.
      </p>

      {/* Controls */}
      <div style={{ display:'flex', gap: 12, marginTop: 28, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative' }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="search titles…"
            style={{
              border:'2px solid var(--ink)', background:'white',
              padding:'10px 14px 10px 36px',
              fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 15,
              width: 280, boxShadow:'3px 3px 0 var(--ink)', outline:'none',
            }}/>
          <span style={{ position:'absolute', left: 12, top: 11, fontFamily:"'JetBrains Mono', monospace" }}>&#8981;</span>
        </div>
        <div style={{ display:'flex', gap: 6 }}>
          {['all','2026','2025'].map(y => (
            <button key={y} onClick={()=>setYear(y)} style={{
              ...arrowBtn2,
              background: year===y ? 'var(--ink)' : 'white',
              color: year===y ? 'var(--paper)' : 'var(--ink)',
            }}>{y}</button>
          ))}
        </div>
        <span style={{ marginLeft:'auto', fontFamily:"'JetBrains Mono', monospace", fontSize: 12, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink-soft)' }}>
          {filtered.length} / {decks.length} decks
        </span>
      </div>

      {/* Grid */}
      <div style={{ marginTop: 36, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 32 }}>
        {filtered.map((d,i) => <DeckCard key={d.id} deck={d} rot={(i%3-1)*1.3}/>)}
      </div>

      {filtered.length===0 && (
        <div style={{ padding: 60, textAlign:'center', fontFamily:"'Kalam', cursive", fontSize: 28, color:'var(--ink-soft)' }}>
          nothing filed under that. try another search &#9998;
        </div>
      )}
    </div>
  );
};

export default Slides;
