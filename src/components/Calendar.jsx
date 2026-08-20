// Calendar page — monthly event grid with Firestore events

import { useState, useMemo } from 'react';
import { Tape, SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';

const cmap = (c) => ({
  pink: 'var(--pink)', green: 'var(--green)', blue: 'var(--blue)',
  tape: 'var(--tape)', ink: 'var(--ink)',
}[c] || 'var(--ink)');

const categoryLabel = (c) => ({
  meeting: 'Meeting', social: 'Social', volunteer: 'Volunteer',
  board: 'Board', special: 'Special',
}[c] || c);

const EventModal = ({ event, onClose }) => {
  if (!event) return null;
  const color = cmap(event.color);
  const d = new Date(event.date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
      display: 'grid', placeItems: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--paper)', border: '2px solid var(--ink)',
        boxShadow: '8px 8px 0 var(--ink)', padding: '28px 32px',
        maxWidth: 420, width: '90%', position: 'relative',
      }}>
        <Tape r={-6} color={color} w={100} style={{ top: -10, left: 30 }} />

        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 14,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'Alfa Slab One', serif", fontSize: 22, color: 'var(--ink-soft)',
        }}>&times;</button>

        {/* Category badge */}
        <span style={{
          background: color, border: '1.5px solid var(--ink)',
          padding: '2px 10px', fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>{categoryLabel(event.category)}</span>

        {/* Title */}
        <div style={{
          fontFamily: "'Alfa Slab One', serif", fontSize: 28, lineHeight: 1.1,
          marginTop: 14,
        }}>{event.title}</div>

        {/* Date & time */}
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16,
          color: 'var(--ink-soft)', marginTop: 10,
        }}>
          {dateStr}{event.time ? ` · ${event.time}` : ''}
        </div>

        {/* Points */}
        {event.points > 0 && (
          <div style={{
            marginTop: 16, display: 'inline-block',
            background: 'white', border: '2px solid var(--ink)',
            padding: '8px 16px', boxShadow: '3px 3px 0 var(--ink)',
          }}>
            <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 32, lineHeight: 1 }}>+{event.points}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)', marginLeft: 6 }}>pts</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Cell = ({ d, events, isLast, isBottom, onEventClick }) => {
  if (!d) return <div className="cal-cell" style={{
    minHeight: 120, background: 'var(--paper-2)',
    borderRight: isLast ? 'none' : '2px solid var(--ink)',
    borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
    backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.86 0.03 85) 6px 7px)',
  }} />;
  return (
    <div className="cal-cell" style={{
      minHeight: 120, padding: 8, position: 'relative',
      borderRight: isLast ? 'none' : '2px solid var(--ink)',
      borderBottom: isBottom ? 'none' : '2px solid var(--ink)',
      background: 'white',
    }}>
      <div className="cal-day-num" style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, lineHeight: 1 }}>{d}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
        {events.map((e, i) => (
          <div key={e.id || i} className="cal-event-chip" onClick={() => onEventClick(e)} style={{
            background: cmap(e.color),
            color: e.color === 'ink' ? 'var(--paper)' : 'var(--ink)',
            padding: '3px 6px',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 11, fontWeight: 600, lineHeight: 1.2,
            border: '1.5px solid var(--ink)',
            transform: `rotate(${(i % 2 ? 1 : -1) * 0.5}deg)`,
            display: 'flex', justifyContent: 'space-between', gap: 4,
            cursor: 'pointer',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.title}{e.time ? ` · ${e.time}` : ''}
            </span>
            {e.points > 0 && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>+{e.points}</span>}
          </div>
        ))}
      </div>
      {/* Colored dots — shown on mobile by CSS */}
      {events.length > 0 && (
        <div className="cal-event-dot" onClick={() => onEventClick(events[0])} style={{
          display: 'none', gap: 2, marginTop: 4, flexWrap: 'wrap', cursor: 'pointer',
        }}>
          {events.map((e, i) => (
            <span key={e.id || i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: cmap(e.color), border: '1px solid var(--ink)',
            }} />
          ))}
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
  const [selectedEvent, setSelectedEvent] = useState(null);

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
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1300, margin: '0 auto' }}>
      <SectionHeading kicker="calendar" title={title} rotate={-1} />
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button className="calendar-nav-btn" onClick={prev} style={arrowBtn}>&larr; prev</button>
        <button className="calendar-nav-btn" onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }} style={arrowBtn}>today</button>
        <button className="calendar-nav-btn" onClick={next} style={arrowBtn}>next &rarr;</button>
        <span className="calendar-hint" style={{ marginLeft: 'auto', fontFamily: "'Kalam', cursive", fontSize: 20, color: 'var(--margin)' }}>
          click an event for details &#9998;
        </span>
      </div>

      {/* Day headers */}
      <div className="calendar-grid" style={{
        marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 0, border: '2px solid var(--ink)', background: 'white',
      }}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
          <div key={d} className="cal-day-header" style={{
            padding: '10px 12px',
            borderRight: i < 6 ? '2px solid var(--ink)' : 'none',
            borderBottom: '2px solid var(--ink)',
            background: 'var(--ink)', color: 'var(--paper)',
            fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.12em', fontSize: 12,
          }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <Cell key={i} d={d} events={d ? eventsByDay[d] || [] : []} isLast={(i + 1) % 7 === 0} isBottom={i >= cells.length - 7} onEventClick={setSelectedEvent} />
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

      {/* Event detail modal */}
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

export default Calendar;
