import { useState } from 'react';
import { Tape, SectionHeading } from './Primitives';

const Podium = ({ rank, user, h, color, rot, crown }) => (
  <div style={{ position:'relative', textAlign:'center' }}>
    {crown && (
      <div style={{
        position:'absolute', top:-52, left:'50%', transform:'translateX(-50%) rotate(-4deg)',
        fontSize: 56, lineHeight: 1,
      }}>&#9819;</div>
    )}
    {/* avatar polaroid */}
    <div style={{
      width: 160, height: 170, margin:'0 auto 14px', padding: 10,
      background:'white', border:'2px solid var(--ink)',
      boxShadow:'4px 4px 0 var(--ink)', transform:`rotate(${rot}deg)`,
      position:'relative',
    }}>
      <Tape r={-8} color={color} w={80} style={{ top:-10, left: 40 }}/>
      <div style={{
        width:'100%', height: 120, background: color,
        display:'grid', placeItems:'center',
        fontFamily:"'Alfa Slab One', serif", fontSize: 48, color:'var(--ink)',
      }}>{user.n.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
      <div style={{ fontFamily:"'Kalam', cursive", fontSize: 15, marginTop: 4 }}>{user.n.split(' ')[0]}</div>
    </div>

    <div style={{
      background: color, border:'2px solid var(--ink)',
      boxShadow:'5px 5px 0 var(--ink)',
      padding:'18px 10px',
      height: h,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start',
    }}>
      <span style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 72, lineHeight:1 }}>#{rank}</span>
      <span style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:700, fontSize: 18, marginTop: 6 }}>{user.n}</span>
      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color:'var(--ink-soft)' }}>{user.y}</span>
      <span style={{ marginTop:'auto', fontFamily:"'Alfa Slab One', serif", fontSize: 36 }}>{user.pts} pts</span>
    </div>
  </div>
);

const Leaderboard = ({ tweaks }) => {
  const [scope, setScope] = useState('semester');
  const rows = [
    { r:1, n:'Priya Sharma',    y:'Sr · Chem',   pts:228, streak:12, emoji:'♛' },
    { r:2, n:'Marcus Obi',      y:'Jr · Bio',    pts:198, streak:9,  emoji:'♚' },
    { r:3, n:'Jamie Lin',       y:'Sr · Bio',    pts:175, streak:7,  emoji:'✦' },
    { r:4, n:'Alex Tran (you)', y:'Jr · Bio',    pts:142, streak:5,  emoji:'✷', you:true },
    { r:5, n:'Sam Khoury',      y:'So · Chem',   pts:128, streak:4,  emoji:'✸' },
    { r:6, n:'Destiny R.',      y:'Jr · Neuro',  pts:121, streak:6,  emoji:'✶' },
    { r:7, n:'Mateo Vega',      y:'Sr · Bio',    pts:116, streak:3,  emoji:'✱' },
    { r:8, n:'Lina Park',       y:'So · Bio',    pts:104, streak:5,  emoji:'✳' },
    { r:9, n:'Jordan W.',       y:'Fr · Chem',   pts: 92, streak:4,  emoji:'✴' },
    { r:10,n:'Ari Mendes',      y:'Jr · Bio',    pts: 88, streak:2,  emoji:'✵' },
  ];

  return (
    <div style={{ padding:'28px 48px 80px', maxWidth: 1300, margin:'0 auto' }}>
      <SectionHeading kicker="hall of fame" title="Leaderboard" rotate={-1}/>
      <div style={{ display:'flex', gap: 10, marginTop: 18, alignItems:'center' }}>
        {['semester','all-time','monthly'].map(s => (
          <button key={s} onClick={()=>setScope(s)} style={{
            fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.1em',
            textTransform:'uppercase', fontSize: 11, padding:'8px 14px',
            border:'2px solid var(--ink)',
            background: scope===s ? 'var(--ink)' : 'white',
            color: scope===s ? 'var(--paper)' : 'var(--ink)',
            cursor:'pointer', boxShadow:'3px 3px 0 var(--ink)',
          }}>{s}</button>
        ))}
        <span style={{ marginLeft:'auto', fontFamily:"'Kalam', cursive", fontSize: 20, color:'var(--margin)' }}>
          friendly stakes only, promise &#9825;
        </span>
      </div>

      {/* Podium */}
      <div style={{ marginTop: 52, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 24, alignItems:'end' }}>
        <Podium rank={2} user={rows[1]} h={200} color="var(--blue)" rot={-3}/>
        <Podium rank={1} user={rows[0]} h={270} color="var(--pink)" rot={0} crown/>
        <Podium rank={3} user={rows[2]} h={170} color="var(--green)" rot={3}/>
      </div>

      {/* Ranked list as notebook */}
      <div style={{ marginTop: 64 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 14 }}>
          <h3 style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 30, margin: 0 }}>the rest of the pack</h3>
          <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink-soft)' }}>
            as of 04/19/2026
          </span>
        </div>
        <div style={{ marginTop: 18, background:'white', border:'2px solid var(--ink)', boxShadow:'6px 6px 0 var(--ink)' }}>
          {rows.slice(3).map((r,i)=> (
            <div key={r.r} style={{
              display:'grid',
              gridTemplateColumns:'80px 40px 1fr 120px 120px',
              alignItems:'center',
              padding:'14px 18px',
              borderTop: i===0 ? 'none' : '1.5px dashed var(--rule)',
              background: r.you ? 'oklch(0.94 0.09 95)' : 'transparent',
              position:'relative',
            }}>
              <span style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 32, color: r.you ? 'var(--pink)' : 'var(--ink)' }}>#{r.r}</span>
              <span style={{ fontSize: 22 }}>{r.emoji}</span>
              <div>
                <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:700, fontSize: 18 }}>{r.n}</div>
                <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'.08em', color:'var(--ink-soft)' }}>{r.y}</div>
              </div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 13 }}>
                <span style={{ color:'var(--green)' }}>&#9679;</span> {r.streak}-wk streak
              </div>
              <div style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 28, textAlign:'right' }}>
                {r.pts}
                <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color:'var(--ink-soft)', marginLeft: 4 }}>pts</span>
              </div>
              {r.you && (
                <span style={{ position:'absolute', right:-14, top:-14, transform:'rotate(8deg)', fontFamily:"'Kalam', cursive", color:'var(--pink)', fontSize: 22 }}>you! &larr;</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
