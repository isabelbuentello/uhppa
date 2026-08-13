// Calendar page — monthly event grid with Firestore events

import { useState, useMemo } from 'react';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';

const cmap = (c) => ({
  pink: 'var(--pink)', green: 'var(--green)', blue: 'var(--blue)',
  tape: 'var(--tape)', ink: 'var(--ink)',
}[c] || 'var(--ink)');

const Cell = ({ d, events, isLast, isBottom }) => {
  const [rsvp, setRsvp] = useState(false);
  if (!d) return <div style={{
    minHeight: 120, background: 'var(--paper-2)',
    borderRight: isLast ? 'none' : '2px solid var(--ink)',
    borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
    backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.86 0.03 85) 6px 7px)',
  }} />;
  return (
    <div onClick={() => events.length && setRsvp(!rsvp)} style={{
      minHeight: 120, padding: 8, position: 'relative', cursor: events.length ? 'pointer' : 'default',
      borderRight: isLast ? 'none' : '2px solid var(--ink)',
      borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
      background: rsvp ? 'oklch(0.94 0.08 95)' : 'white',
      transition: 'background .15s',
    }}>
      <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, lineHeight: 1 }}>{d}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
        {events.map((e, i) => (
          <div key={e.id || i} style={{
            background: cmap(e.color),
            color: e.color === 'ink' ? 'var(--paper)' : 'var(--ink)',
            padding: '3px 6px',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 11, fontWeight: 600, lineHeight: 1.2,
            border: '1.5px solid var(--ink)',
            transform: `rotate(${(i % 2 ? 1 : -1) * 0.5}deg)`,
            display: 'flex', justifyContent: 'space-between', gap: 4,
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
            {e.points > 0 && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>+{e.points}</span>}
          </div>
        ))}
      </div>
      {rsvp && (
        <div style={{ position: 'absolute', top: 4, right: 4, fontFamily: "'Kalam', cursive", color: 'var(--pink)', fontSize: 18, transform: 'rotate(-10deg)' }}>
          going! &#10003;
        </div>
      )}
    </div>
  );
};

const arrowBtn = {
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 12,
  border: '2px solid var(--ink)', background: 'white',
  padding: '8px 14px', cursor: 'pointer',
  boxShadow: '3px 3px 0 var(--ink)',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Calendar = ({ tweaks }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const { data: events } = useFirestoreQuery('events');

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Group events by day-of-month for the current month
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const e of events) {
      const d = new Date(e.date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    }
    return map;
  }, [events, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0=Sun

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const title = `${MONTH_NAMES[month]} ${year}`;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
      <SectionHeading kicker="calendar" title={title} rotate={-1} />
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button onClick={prev} style={arrowBtn}>&larr; prev</button>
        <button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }} style={arrowBtn}>today</button>
        <button onClick={next} style={arrowBtn}>next &rarr;</button>
        <span style={{ marginLeft: 'auto', fontFamily: "'Kalam', cursive", fontSize: 20, color: 'var(--margin)' }}>
          psst &mdash; click a day to rsvp &#9998;
        </span>
      </div>

      {/* Day headers */}
      <div style={{
        marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 0, border: '2px solid var(--ink)', background: 'white',
      }}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
          <div key={d} style={{
            padding: '10px 12px',
            borderRight: i < 6 ? '2px solid var(--ink)' : 'none',
            borderBottom: '2px solid var(--ink)',
            background: 'var(--ink)', color: 'var(--paper)',
            fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.12em', fontSize: 12,
          }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <Cell key={i} d={d} events={d ? eventsByDay[d] || [] : []} isLast={(i + 1) % 7 === 0} isBottom={i >= cells.length - 7} />
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 32, display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>
        {[
          ['pink', 'Gen Meeting'], ['green', 'Study/social'],
          ['blue', 'Volunteer'], ['tape', 'Special'], ['ink', 'Board only'],
        ].map(([c, l]) => (
          <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 14, background: cmap(c), border: '1.5px solid var(--ink)' }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
