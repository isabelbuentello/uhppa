import { useState } from 'react';
import { SectionHeading } from './Primitives';

const cmap = (c) => ({
  pink: 'var(--pink)', green: 'var(--green)', blue: 'var(--blue)',
  tape: 'var(--tape)', ink: 'var(--ink)',
}[c]);

const Cell = ({ d, events, isLast, isBottom }) => {
  const [rsvp, setRsvp] = useState(false);
  if (!d) return <div style={{
    minHeight: 120, background:'var(--paper-2)',
    borderRight: isLast ? 'none' : '2px solid var(--ink)',
    borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
    backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.86 0.03 85) 6px 7px)',
  }}/>;
  return (
    <div onClick={() => events.length && setRsvp(!rsvp)} style={{
      minHeight: 120, padding: 8, position: 'relative', cursor: events.length ? 'pointer' : 'default',
      borderRight: isLast ? 'none' : '2px solid var(--ink)',
      borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
      background: rsvp ? 'oklch(0.94 0.08 95)' : 'white',
      transition: 'background .15s',
    }}>
      <div style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 20, lineHeight:1 }}>{d}</div>
      <div style={{ display:'flex', flexDirection:'column', gap: 4, marginTop: 6 }}>
        {events.map((e,i)=>(
          <div key={i} style={{
            background: cmap(e.c),
            color: e.c === 'ink' ? 'var(--paper)' : 'var(--ink)',
            padding: '3px 6px',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 11, fontWeight: 600, lineHeight: 1.2,
            border: '1.5px solid var(--ink)',
            transform: `rotate(${(i%2?1:-1)*0.5}deg)`,
            display:'flex', justifyContent:'space-between', gap: 4,
          }}>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.t}</span>
            {e.pts>0 && <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 10 }}>+{e.pts}</span>}
          </div>
        ))}
      </div>
      {rsvp && (
        <div style={{ position:'absolute', top: 4, right: 4, fontFamily:"'Kalam', cursive", color:'var(--pink)', fontSize: 18, transform:'rotate(-10deg)' }}>
          going! &#10003;
        </div>
      )}
    </div>
  );
};

const arrowBtn = {
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing:'.1em', textTransform:'uppercase', fontSize: 12,
  border: '2px solid var(--ink)', background:'white',
  padding: '8px 14px', cursor:'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const Calendar = ({ tweaks }) => {
  const [month, setMonth] = useState(0);
  const months = [
    { name: 'April 2026', start: 3, days: 30, events: {
      2:  [{ t:'Gen Meeting', c:'pink', pts:10 }],
      7:  [{ t:'Study Jam', c:'green', pts:5 }],
      11: [{ t:'Volunteer: Clinic', c:'blue', pts:15 }],
      14: [{ t:'Exec Board', c:'ink', pts:8 }],
      16: [{ t:'Gen Meeting', c:'pink', pts:10 }],
      20: [{ t:'Pharm School Panel', c:'tape', pts:12 }],
      23: [{ t:'Kaplan MCAT Q&A', c:'green', pts:8 }],
      25: [{ t:'Blood Drive', c:'pink', pts:20 }, { t:'Movie Night', c:'blue', pts:5 }],
      30: [{ t:'Gen Meeting', c:'pink', pts:10 }],
    }},
    { name: 'May 2026', start: 5, days: 31, events: {
      3:  [{ t:'End-of-yr Banquet', c:'pink', pts:25 }],
      7:  [{ t:'Cords Ceremony', c:'tape', pts:0 }],
      10: [{ t:'Summer kickoff', c:'green', pts:5 }],
      15: [{ t:'Study Jam', c:'green', pts:5 }],
      22: [{ t:'Volunteer: Health Fair', c:'blue', pts:20 }],
    }},
  ];
  const m = months[month];
  const cells = [];
  for (let i=0;i<m.start;i++) cells.push(null);
  for (let d=1; d<=m.days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ padding:'28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
      <SectionHeading kicker="calendar" title={m.name} rotate={-1}/>
      <div style={{ display:'flex', gap: 10, marginTop: 18 }}>
        <button onClick={()=>setMonth(Math.max(0,month-1))} style={arrowBtn}>&larr; prev</button>
        <button onClick={()=>setMonth(Math.min(months.length-1,month+1))} style={arrowBtn}>next &rarr;</button>
        <span style={{ marginLeft:'auto', fontFamily:"'Kalam', cursive", fontSize: 20, color:'var(--margin)' }}>
          psst &mdash; click a day to rsvp &#9998;
        </span>
      </div>

      {/* Day headers */}
      <div style={{
        marginTop: 24, display:'grid', gridTemplateColumns:'repeat(7, 1fr)',
        gap: 0, border: '2px solid var(--ink)', background: 'white',
      }}>
        {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((d,i)=>(
          <div key={d} style={{
            padding: '10px 12px',
            borderRight: i<6 ? '2px solid var(--ink)' : 'none',
            borderBottom: '2px solid var(--ink)',
            background: 'var(--ink)', color: 'var(--paper)',
            fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.12em', fontSize: 12,
          }}>{d}</div>
        ))}
        {cells.map((d, i)=>(
          <Cell key={i} d={d} events={d ? m.events[d] || [] : []} isLast={(i+1)%7===0} isBottom={i >= cells.length-7}/>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 32, display:'flex', gap: 18, flexWrap:'wrap', fontFamily:"'JetBrains Mono', monospace", fontSize: 12, letterSpacing:'.1em', textTransform:'uppercase' }}>
        {[
          ['pink','Gen Meeting'], ['green','Study/social'],
          ['blue','Volunteer'], ['tape','Special'], ['ink','Board only'],
        ].map(([c,l])=> (
          <span key={c} style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ width:14, height:14, background: cmap(c), border:'1.5px solid var(--ink)' }}/>{l}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
