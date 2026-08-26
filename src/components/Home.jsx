import { useState, useMemo } from 'react';
import { Tape, Highlight, Scribble, Sticky, Stamp, Marquee, SectionHeading } from './Primitives';
import Officers from './Officers';
import Sponsors from './Sponsors';
import { useFirestoreDoc, useFirestoreQuery } from '../hooks/useFirestore';

const socialLink = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase',
  color: 'var(--ink)', textDecoration: 'none',
  borderBottom: '2px solid var(--pink)',
  paddingBottom: 2,
};

const ctaStyle = (bg) => ({
  border:'2px solid var(--ink)',
  background: bg,
  padding:'14px 22px',
  fontFamily:"'Archivo Black', sans-serif",
  textTransform:'uppercase', letterSpacing:'.08em',
  fontSize: 14,
  cursor:'pointer',
  boxShadow:'4px 4px 0 var(--ink)',
  transition:'transform .1s ease, box-shadow .1s ease',
});

const categoryColors = {
  meeting: 'var(--tape)', social: 'var(--pink)', volunteer: 'var(--green)',
  board: 'var(--blue)', special: 'var(--pink)',
};

const categoryLabel = (c) => ({
  meeting: 'Meeting', social: 'Social', volunteer: 'Volunteer',
  board: 'Board', special: 'Special',
}[c] || c);

const Home = ({ go, tweaks }) => {
  const { data: clubInfo } = useFirestoreDoc('clubInfo', 'main');
  const { data: allEvents } = useFirestoreQuery('events');
  const stats = clubInfo?.stats;
  const socials = clubInfo?.socials;

  const today = new Date().toISOString().split('T')[0];
  const upcoming = useMemo(() => {
    return allEvents
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allEvents, today]);

  const [eventIdx, setEventIdx] = useState(0);
  const visibleCount = 3;
  const canPrev = eventIdx > 0;
  const canNext = eventIdx + visibleCount < upcoming.length;
  const visibleEvents = upcoming.slice(eventIdx, eventIdx + visibleCount);

  return (
    <div className="page-container" style={{ position: 'relative', padding: '28px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Top meta row */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        fontFamily:"'JetBrains Mono', monospace", fontSize: 12, letterSpacing:'.12em',
        textTransform: 'uppercase', color:'var(--ink-soft)', paddingBottom: 18,
        borderBottom: '1.5px dashed var(--ink-soft)',
      }}>
        <span>Est. 1995 &middot; Issue No. 31</span>
        <span>University of Houston Pre-Pharmacy Association</span>
        <span>Spring Semester &middot; 2026</span>
      </div>

      {/* Hero */}
      <div style={{ position:'relative', marginTop: 28, minHeight: 520 }}>

        {/* Big UHPPA wordmark — collage */}
        <div className="hero-letters" style={{ position:'relative', display:'flex', alignItems:'flex-start', gap: 0, flexWrap:'wrap' }}>

          {/* U on cream tag */}
          <div style={{ position:'relative', marginRight: -6 }}>
            <Tape r={-14} style={{ top:-10, left: 30 }}/>
            <div style={{
              fontFamily:"'Alfa Slab One', serif",
              fontSize: 240, lineHeight: .85,
              color: 'var(--ink)',
              background: 'white',
              padding: '20px 28px 8px',
              boxShadow:'0 10px 24px rgba(0,0,0,.12)',
              transform:'rotate(-3deg)',
            }}>U</div>
          </div>

          {/* H with slash through, cut-out magazine style */}
          <div style={{ position:'relative', marginTop: 12, marginRight: -4 }}>
            <div style={{
              fontFamily:"'Archivo Black', sans-serif",
              fontSize: 240, lineHeight: .85,
              color: 'var(--paper)',
              background: 'var(--ink)',
              padding: '20px 22px 8px',
              transform:'rotate(2deg)',
              position:'relative',
            }}>H
              <span style={{
                position:'absolute', left: -4, right: -4, top:'48%',
                height: 10, background: 'var(--pink)', transform:'rotate(-4deg)',
              }}/>
            </div>
          </div>

          {/* P — polaroid style with the logo behind */}
          <div style={{ position:'relative', marginTop: -4 }}>
            <Tape r={8} color="var(--pink)" w={72} style={{ top:-6, left: 52 }}/>
            <div style={{
              fontFamily:"'Rubik Mono One', sans-serif",
              fontSize: 220, lineHeight: .85,
              color: 'var(--green)',
              background: 'var(--paper-2)',
              padding: '22px 20px 10px',
              border: '2px solid var(--ink)',
              boxShadow:'6px 6px 0 var(--ink)',
              transform:'rotate(-2deg)',
            }}>P</div>
          </div>

          {/* P — handwritten marker style */}
          <div style={{ position:'relative', marginTop: 30, marginLeft: -8 }}>
            <div style={{
              fontFamily:"'Alfa Slab One', serif",
              fontSize: 230, lineHeight: .85,
              color: 'transparent',
              transform:'rotate(4deg)',
              WebkitTextStroke: '2px var(--ink)',
              textShadow: '6px 6px 0 var(--pink)',
            }}>P</div>
          </div>

          {/* A — giant cream block */}
          <div style={{ position:'relative', marginTop: -6, marginLeft: -2 }}>
            <Tape r={-20} color="var(--green)" w={88} style={{ top:-10, left: 26 }}/>
            <div style={{
              fontFamily:"'Archivo Black', sans-serif",
              fontSize: 240, lineHeight: .85,
              color: 'var(--ink)',
              background: 'var(--tape)',
              padding: '20px 30px 8px',
              transform:'rotate(-1deg)',
              boxShadow:'0 10px 24px rgba(0,0,0,.12)',
            }}>A</div>
          </div>

        </div>

        {/* Subtitle paragraph */}
        <div className="hero-subtitle-grid" style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 40, marginTop: 48, alignItems:'start' }}>
          <div style={{ position:'relative' }}>
            <p style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 26, lineHeight: 1.35, margin: 0, maxWidth: 620,
            }}>
              Established in 1995, the <Highlight color="var(--tape)">University of Houston Pre-Pharmacy Association</Highlight> is a student organization dedicated to help students explore and prepare for careers in pharmacy. We provide members with opportunities to learn more about pharmacy through <b>guest speakers</b>, <b>community services</b> and collaborations with <b>UH Pharmacy School</b>. We encourage members to build meaningful connections with fellow pre-pharmacy students and also current pharmacy students, while gaining experience that can help them succeed both academically and professionally. We strive to support our future pharmacists through <b>leadership</b>, <b>service</b> and <b>professional growth</b>!
            </p>
            {tweaks.showAnnotations && (
              <div style={{ position:'absolute', top: -30, right: -10, fontFamily:"'Kalam', cursive", color:'var(--margin)', fontSize: 20, transform:'rotate(-6deg)' }}>
                &larr; future pharmacists!
                <Scribble color="var(--margin)" width={100} height={10} style={{ marginTop: -2 }}/>
              </div>
            )}

            <div style={{ display:'flex', gap: 14, marginTop: 28, flexWrap:'wrap' }}>
              <button onClick={()=>go('login')} style={ctaStyle('var(--pink)')}>Member Login &rarr;</button>
              <button onClick={()=>go('calendar')} style={ctaStyle('white')}>See the calendar</button>
            </div>

            {socials && (
              <div style={{ display: 'flex', gap: 16, marginTop: 20, alignItems: 'center' }}>
                {socials.instagram && (
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={socialLink}>
                    &#9741; Instagram
                  </a>
                )}
                {socials.email && (
                  <a href={`mailto:${socials.email}`} style={socialLink}>
                    &#9993; Email
                  </a>
                )}
                {socials.linktree && (
                  <a href={socials.linktree} target="_blank" rel="noopener noreferrer" style={socialLink}>
                    &#9741; Linktree
                  </a>
                )}
                {socials.discord && (
                  <a href={socials.discord} target="_blank" rel="noopener noreferrer" style={socialLink}>
                    &#9670; Discord
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: taped logo + sticky note */}
          <div style={{ position:'relative', minHeight: 360 }}>
            <Tape r={10} color="var(--pink)" w={110} style={{ top:-4, left: 120 }}/>
            <Tape r={-12} color="var(--green)" w={90} style={{ top:-8, right: 40 }}/>
            <div style={{
              width: 280, height: 280, margin:'14px auto 0', padding: 10,
              background: 'white', transform:'rotate(-4deg)',
              boxShadow:'0 12px 28px rgba(0,0,0,.18)',
            }}>
              <img src="/uhppa-logo.png" alt="UHPPA crest"
                style={{ width:'100%', height:'100%', objectFit:'cover', filter:'contrast(1.1)' }}/>
              <div style={{
                textAlign:'center', fontFamily:"'Kalam', cursive", color:'var(--ink)',
                marginTop: 10, fontSize: 18,
              }}>the crest &#9825; est. 1995</div>
            </div>

            <div style={{ position:'absolute', right: -10, bottom: 0 }}>
              <Sticky color="var(--green)" rotate={6} style={{ width: 180 }}>
                <b style={{ fontSize: 22 }}>New!</b><br/>
                Spring points reset<br/>
                <u>Jan 22</u>.
              </Sticky>
            </div>

            <div style={{ position:'absolute', left: -20, bottom: 40 }}>
              <Stamp color="var(--pink)" rotate={-14}>Members only &middot;&#9733;&middot;</Stamp>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div style={{ marginTop: 60 }}>
        <Marquee items={[
          'General Meeting — Thursdays 7pm', 'PharmCAS workshop Apr 25',
          'Points reset January 22', 'Health fair volunteers needed',
          tweaks.tagline,
        ]} bg="var(--ink)" color="var(--paper)"/>
      </div>

      {/* Upcoming Events carousel */}
      <div style={{ marginTop: 64 }}>
        <SectionHeading kicker="coming up" title="Upcoming events." rotate={-1}/>
        {upcoming.length > 0 ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setEventIdx(i => Math.max(0, i - 1))} disabled={!canPrev} style={{
                border: '2px solid var(--ink)', background: canPrev ? 'white' : 'var(--paper-2)',
                color: canPrev ? 'var(--ink)' : 'var(--ink-soft)',
                padding: '8px 14px', fontFamily: "'Archivo Black', sans-serif",
                fontSize: 14, cursor: canPrev ? 'pointer' : 'default',
                boxShadow: canPrev ? '3px 3px 0 var(--ink)' : 'none',
              }}>&larr;</button>
              <button onClick={() => setEventIdx(i => Math.min(upcoming.length - visibleCount, i + 1))} disabled={!canNext} style={{
                border: '2px solid var(--ink)', background: canNext ? 'white' : 'var(--paper-2)',
                color: canNext ? 'var(--ink)' : 'var(--ink-soft)',
                padding: '8px 14px', fontFamily: "'Archivo Black', sans-serif",
                fontSize: 14, cursor: canNext ? 'pointer' : 'default',
                boxShadow: canNext ? '3px 3px 0 var(--ink)' : 'none',
              }}>&rarr;</button>
            </div>
            <div className="feature-grid" style={{
              marginTop: 16, display: 'grid', gap: 28,
              gridTemplateColumns: `repeat(${Math.min(visibleCount, upcoming.length)}, 1fr)`,
            }}>
              {visibleEvents.map((event, i) => {
                const color = categoryColors[event.category] || 'var(--tape)';
                const d = new Date(event.date + 'T00:00:00');
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                const dayNum = d.getDate();
                const rot = (i % 3 - 1) * 2;
                return (
                  <div key={event.id} onClick={() => go('calendar')} style={{
                    cursor: 'pointer',
                    background: 'white',
                    border: '2px solid var(--ink)',
                    padding: 0,
                    transform: `rotate(${rot}deg)`,
                    position: 'relative',
                    boxShadow: '5px 5px 0 var(--ink)',
                    transition: 'transform .15s ease, box-shadow .15s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = `rotate(${rot}deg) translate(-2px,-2px)`; e.currentTarget.style.boxShadow = '8px 8px 0 var(--pink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rot}deg)`; e.currentTarget.style.boxShadow = '5px 5px 0 var(--ink)'; }}
                  >
                    <Tape r={-8 + i * 5} color={color} w={80} style={{ top: -10, left: 40 }} />
                    {/* Date strip */}
                    <div style={{
                      background: color, borderBottom: '2px solid var(--ink)',
                      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{
                        fontFamily: "'Alfa Slab One', serif", fontSize: 42, lineHeight: 1,
                      }}>{dayNum}</div>
                      <div>
                        <div style={{
                          fontFamily: "'Archivo Black', sans-serif", fontSize: 14,
                          textTransform: 'uppercase', letterSpacing: '.08em',
                        }}>{monthName}</div>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                          letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)',
                        }}>{dayName}</div>
                      </div>
                    </div>
                    {/* Content */}
                    <div style={{ padding: '18px 20px 20px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 10,
                      }}>
                        <span style={{
                          background: 'var(--paper-2)', border: '1.5px solid var(--ink)',
                          padding: '2px 8px', fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                        }}>{categoryLabel(event.category)}</span>
                        {event.time && (
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                            color: 'var(--ink-soft)',
                          }}>{event.time}</span>
                        )}
                      </div>
                      <h3 style={{
                        fontFamily: "'Alfa Slab One', serif",
                        fontSize: 22, margin: '0 0 8px', lineHeight: 1.1,
                      }}>{event.title}</h3>
                      {event.location && (
                        <div style={{
                          fontFamily: "'Kalam', cursive", fontSize: 15,
                          color: 'var(--ink-soft)', marginBottom: 6,
                        }}>&#9741; {event.location}</div>
                      )}
                      {event.description && (
                        <p style={{
                          margin: 0, fontSize: 14, lineHeight: 1.4,
                          color: 'var(--ink-soft)',
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{event.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: 14, textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)',
            }}>
              {eventIdx + 1}–{Math.min(eventIdx + visibleCount, upcoming.length)} of {upcoming.length} upcoming
            </div>
          </>
        ) : (
          <div style={{
            marginTop: 36, padding: 60, textAlign: 'center',
            fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)',
            border: '2px dashed var(--rule)', background: 'white',
          }}>no upcoming events yet — check back soon &#9998;</div>
        )}
      </div>

      {/* Strip: numbers */}
      <div className="stats-strip" style={{
        marginTop: 80,
        display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        border:'2px solid var(--ink)', background:'white',
      }}>
        {[
          [stats?.activeMembers?.toLocaleString() ?? '127','active members'],
          [stats?.yearsRunning?.toLocaleString() ?? '31','years running'],
          [stats?.eventsPerYear?.toLocaleString() ?? '52','events per year'],
          [stats?.volunteerHours?.toLocaleString() ?? '2,340','volunteer hrs logged'],
        ].map(([n,l],i)=>(
          <div key={i} style={{
            padding: '26px 20px', borderRight: i<3 ? '2px solid var(--ink)' : 'none',
            textAlign:'center',
          }}>
            <div className="stat-number" style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 56, lineHeight:1, color:'var(--ink)' }}>{n}</div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'.15em', textTransform:'uppercase', marginTop: 6, color:'var(--ink-soft)' }}>{l}</div>
          </div>
        ))}
      </div>

      <Officers />
      <Sponsors />

      {/* Footer scraps */}
      <div style={{ marginTop: 80, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap: 20 }}>
        <div style={{ fontFamily:"'Kalam', cursive", fontSize: 22, color:'var(--ink-soft)' }}>
          &mdash; with love, from the UHPPA exec board
          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, marginTop: 8, letterSpacing:'.12em', textTransform:'uppercase' }}>
            pre-pharm @ university of houston &middot; cougars for pharmacy
          </div>
        </div>
        <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--ink-soft)' }}>
          &copy; 2026 uhppa &middot; made by students, for students
        </div>
      </div>
    </div>
  );
};

export default Home;
