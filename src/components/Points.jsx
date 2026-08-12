import { Tape, Highlight, Scribble, Sticky, Stamp, SectionHeading } from './Primitives';

const Points = ({ tweaks }) => {
  const user = {
    name: 'Alex Tran',
    year: 'Junior · Bio',
    total: 142,
    goal: 200,
    rank: 4,
    joined: 'Sep 2024',
  };
  const breakdown = [
    { cat: 'General Meetings', v: 60, max: 80, c: 'pink' },
    { cat: 'Volunteering',     v: 45, max: 60, c: 'blue' },
    { cat: 'Study Jams',       v: 20, max: 30, c: 'green' },
    { cat: 'Socials / Other',  v: 17, max: 30, c: 'tape' },
  ];
  const log = [
    { d:'04/20', e:'Pharm School Panel', pts:12 },
    { d:'04/16', e:'General Meeting',    pts:10 },
    { d:'04/11', e:'Volunteer: Clinic',  pts:15 },
    { d:'04/07', e:'Study Jam',          pts:5 },
    { d:'04/02', e:'General Meeting',    pts:10 },
    { d:'03/28', e:'Ethics Workshop',    pts:8 },
    { d:'03/22', e:'Blood Drive',        pts:20 },
    { d:'03/14', e:'Research Mixer',     pts:10 },
  ];
  const pct = Math.min(100, (user.total / user.goal) * 100);
  const cmap3 = (c) => ({ pink:'var(--pink)', green:'var(--green)', blue:'var(--blue)', tape:'var(--tape)', ink:'var(--ink)' }[c]);

  return (
    <div style={{ padding:'28px 48px 80px', maxWidth: 1300, margin:'0 auto' }}>
      <SectionHeading kicker="your file" title="Points tracker" rotate={-1}/>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 40, marginTop: 32 }}>
        {/* Left: big stat card */}
        <div style={{ position:'relative' }}>
          <Tape r={-8} color="var(--pink)" w={110} style={{ top:-12, left: 40 }}/>
          <div style={{
            background:'white', border:'2px solid var(--ink)',
            boxShadow:'6px 6px 0 var(--ink)', padding: '28px 28px 24px',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--ink-soft)' }}>member file &middot; active</div>
                <div style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 42, lineHeight: 1, marginTop: 6 }}>{user.name}</div>
                <div style={{ fontFamily:"'Kalam', cursive", fontSize: 20, color:'var(--ink-soft)' }}>{user.year} &middot; joined {user.joined}</div>
              </div>
              <Stamp color="var(--green)" rotate={6}>Rank #{user.rank}</Stamp>
            </div>

            {/* Big number */}
            <div style={{ display:'flex', alignItems:'baseline', gap: 14, marginTop: 28 }}>
              <span style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 130, lineHeight:.85 }}>{user.total}</span>
              <span style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 22, color:'var(--ink-soft)' }}>/ {user.goal} pts</span>
            </div>

            {/* Ruler-style progress */}
            <div style={{ marginTop: 14, position:'relative', height: 28, border:'2px solid var(--ink)', background:'white' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(90deg, transparent 0 24px, var(--ink) 24px 25px)' }}/>
              <div style={{
                position:'absolute', top:0, bottom:0, left:0, width:`${pct}%`,
                background:'var(--pink)',
                borderRight:'2px solid var(--ink)',
              }}/>
              <span style={{
                position:'absolute', left:`${pct}%`, top:-22, transform:'translateX(-50%)',
                fontFamily:"'Kalam', cursive", fontSize: 16, color:'var(--pink)',
              }}>you! &darr;</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6, fontFamily:"'JetBrains Mono', monospace", fontSize: 10, color:'var(--ink-soft)', letterSpacing:'.1em' }}>
              <span>0</span><span>GOAL {user.goal}</span>
            </div>

            {/* Cords reward */}
            <div style={{ marginTop: 20, padding: 14, background:'var(--paper-2)', border:'1.5px dashed var(--ink)' }}>
              <b style={{ fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.1em', fontSize: 12, textTransform:'uppercase' }}>Next reward</b>
              <div style={{ fontSize: 15, marginTop: 4 }}>
                <b>{user.goal - user.total}</b> pts until <Highlight color="var(--tape)">honors cords</Highlight> at graduation.
              </div>
            </div>
          </div>
        </div>

        {/* Right: category bars */}
        <div style={{ position:'relative' }}>
          <Sticky color="var(--tape)" rotate={3} style={{ position:'absolute', top:-20, right:-10, width: 150, zIndex:2 }}>
            <b>How it&apos;s<br/>counted &darr;</b>
          </Sticky>
          <div style={{ background:'white', border:'2px solid var(--ink)', padding: '22px 22px 18px', boxShadow:'5px 5px 0 var(--ink)' }}>
            <div style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 26 }}>by category</div>
            <div style={{ marginTop: 16, display:'flex', flexDirection:'column', gap: 16 }}>
              {breakdown.map(b => (
                <div key={b.cat}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight:600 }}>
                    <span>{b.cat}</span>
                    <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 13 }}>{b.v}<span style={{ color:'var(--ink-soft)' }}>/{b.max}</span></span>
                  </div>
                  <div style={{ marginTop: 6, height: 18, border:'1.5px solid var(--ink)', background:'white', position:'relative' }}>
                    <div style={{ position:'absolute', inset:0, left:0, width:`${(b.v/b.max)*100}%`, background: cmap3(b.c), backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 6px, rgba(0,0,0,.08) 6px 7px)' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log table — notebook ruled */}
      <div style={{ marginTop: 52 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 14 }}>
          <h3 style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 32, margin: 0 }}>recent activity</h3>
          <Scribble color="var(--pink)" width={140} height={10}/>
        </div>

        <div style={{ marginTop: 18, border:'2px solid var(--ink)', background:'white' }}>
          <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 120px 120px', background:'var(--ink)', color:'var(--paper)', fontFamily:"'Archivo Black', sans-serif", fontSize: 11, letterSpacing:'.1em', textTransform:'uppercase' }}>
            <div style={{ padding:'10px 16px' }}>Date</div>
            <div style={{ padding:'10px 16px' }}>Event</div>
            <div style={{ padding:'10px 16px' }}>Points</div>
            <div style={{ padding:'10px 16px' }}>Verified</div>
          </div>
          {log.map((r,i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'120px 1fr 120px 120px',
              borderTop: i===0 ? 'none' : '1.5px dashed oklch(0.8 0.03 240)',
              fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 15,
            }}>
              <div style={{ padding:'12px 16px', fontFamily:"'JetBrains Mono', monospace" }}>{r.d}</div>
              <div style={{ padding:'12px 16px' }}>{r.e}</div>
              <div style={{ padding:'12px 16px', fontFamily:"'JetBrains Mono', monospace", fontWeight:700 }}>+{r.pts}</div>
              <div style={{ padding:'12px 16px', color:'var(--green)', fontFamily:"'Kalam', cursive", fontSize: 18 }}>&#10003; signed</div>
            </div>
          ))}
        </div>
      </div>

      {/* Request points CTA */}
      <div style={{ marginTop: 36, display:'flex', gap: 14, alignItems:'center' }}>
        <button style={{
          border:'2px solid var(--ink)', background:'var(--pink)',
          padding:'14px 22px', fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.1em',
          textTransform:'uppercase', fontSize: 13, cursor:'pointer', boxShadow:'4px 4px 0 var(--ink)',
        }}>&#65291; Submit missing points</button>
        <span style={{ fontFamily:"'Kalam', cursive", fontSize: 18, color:'var(--ink-soft)' }}>
          forgot to sign in? no stress &mdash; submit here and exec will approve.
        </span>
      </div>
    </div>
  );
};

export default Points;
