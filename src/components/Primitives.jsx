// Shared collage primitives: tape, stickers, sticky notes, polaroids.

export const Tape = ({ color = 'var(--tape)', w = 90, r = -4, style = {} }) => (
  <div style={{
    position: 'absolute',
    width: w, height: 22,
    background: color,
    opacity: 0.82,
    transform: `rotate(${r}deg)`,
    boxShadow: '0 2px 4px rgba(0,0,0,.08)',
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.25) 0 4px, transparent 4px 8px)',
    backgroundSize: '8px 100%',
    ...style,
  }} />
);

export const Paper = ({ children, rotate = 0, shadow = true, style = {}, bg = 'white', tapes = [], className = '' }) => (
  <div className={className} style={{
    position: 'relative',
    background: bg,
    transform: `rotate(${rotate}deg)`,
    boxShadow: shadow ? '0 1px 2px rgba(0,0,0,.06), 0 12px 28px rgba(30,20,10,.14)' : 'none',
    ...style,
  }}>
    {tapes.map((t,i) => <Tape key={i} {...t} />)}
    {children}
  </div>
);

// Sticky-note style
export const Sticky = ({ children, color = 'var(--tape)', rotate = -2, style = {} }) => (
  <div style={{
    position: 'relative',
    background: color,
    padding: '18px 16px 16px',
    fontFamily: "'Kalam', cursive",
    fontSize: 18,
    lineHeight: 1.25,
    color: 'var(--ink)',
    transform: `rotate(${rotate}deg)`,
    boxShadow: '0 6px 16px rgba(0,0,0,.14)',
    backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,.06), transparent 20%)',
    ...style,
  }}>
    {children}
  </div>
);

// Hand-drawn underline (SVG — simple wavy path only)
export const Scribble = ({ color = 'var(--pink)', width = 180, height = 14, style = {} }) => (
  <svg viewBox="0 0 200 14" width={width} height={height} style={{ display:'block', ...style }}>
    <path d="M2 9 Q 20 2, 42 8 T 90 7 T 140 9 T 198 6"
      fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// Marker highlight
export const Highlight = ({ children, color = 'var(--tape)', style = {} }) => (
  <span style={{
    background: `linear-gradient(100deg, transparent 2%, ${color} 4%, ${color} 96%, transparent 98%)`,
    padding: '0 .15em',
    boxDecorationBreak: 'clone',
    ...style,
  }}>{children}</span>
);

// Ruled notebook paper
export const RuledPaper = ({ children, style = {}, marginLine = true }) => (
  <div style={{
    background: 'white',
    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 31px, var(--rule) 31px 32px)${marginLine ? ', linear-gradient(to right, transparent 52px, var(--margin) 52px 54px, transparent 54px)' : ''}`,
    backgroundPosition: '0 8px',
    padding: '40px 28px 28px 72px',
    boxShadow: '0 12px 28px rgba(0,0,0,.12)',
    position: 'relative',
    ...style,
  }}>
    {/* hole-punches */}
    <div style={{ position:'absolute', left:14, top:30, bottom:30, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      {[0,1,2,3].map(i => <span key={i} style={{ width:14, height:14, borderRadius:'50%', background:'var(--paper)', boxShadow:'inset 0 1px 2px rgba(0,0,0,.25)' }} />)}
    </div>
    {children}
  </div>
);

// Stamp sticker
export const Stamp = ({ children, color = 'var(--pink)', rotate = -8, style = {} }) => (
  <div style={{
    display: 'inline-flex', alignItems:'center', justifyContent:'center',
    border: `2px dashed ${color}`,
    color, padding: '8px 14px',
    fontFamily: "'Archivo Black', sans-serif",
    letterSpacing: '.12em', textTransform: 'uppercase',
    fontSize: 12,
    borderRadius: 6,
    transform: `rotate(${rotate}deg)`,
    background: 'rgba(255,255,255,.6)',
    ...style,
  }}>{children}</div>
);

// Image placeholder (subtle stripes, monospace label)
export const Placeholder = ({ label = 'photo', w = 260, h = 180, rotate = 0, style = {} }) => (
  <div style={{
    width: w, height: h,
    transform: `rotate(${rotate}deg)`,
    background: 'oklch(0.88 0.03 85)',
    backgroundImage: 'repeating-linear-gradient(45deg, oklch(0.82 0.04 85) 0 2px, transparent 2px 14px)',
    display: 'grid', placeItems: 'center',
    color: 'var(--ink-soft)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    letterSpacing: '.1em',
    border: '1px solid oklch(0.75 0.03 85)',
    ...style,
  }}>[ {label} ]</div>
);

// Nav pill button
export const NavBtn = ({ active, children, onClick, rotate = 0 }) => (
  <button onClick={onClick} style={{
    position: 'relative',
    border: '2px solid var(--ink)',
    background: active ? 'var(--ink)' : 'white',
    color: active ? 'var(--paper)' : 'var(--ink)',
    padding: '8px 16px',
    fontFamily: "'Archivo Black', sans-serif",
    textTransform: 'uppercase', letterSpacing: '.08em',
    fontSize: 13,
    cursor: 'pointer',
    transform: `rotate(${rotate}deg)`,
    boxShadow: active ? '3px 3px 0 var(--pink)' : '3px 3px 0 var(--ink)',
    transition: 'transform .12s ease, box-shadow .12s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = `rotate(${rotate}deg) translate(-1px,-1px)`; e.currentTarget.style.boxShadow = '4px 4px 0 var(--pink)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rotate}deg)`; e.currentTarget.style.boxShadow = active ? '3px 3px 0 var(--pink)' : '3px 3px 0 var(--ink)'; }}
  >{children}</button>
);

// Marquee strip
export const Marquee = ({ items, bg = 'var(--ink)', color = 'var(--paper)' }) => (
  <div style={{
    background: bg, color,
    borderTop: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)',
    overflow: 'hidden', whiteSpace: 'nowrap',
    fontFamily: "'Archivo Black', sans-serif",
    textTransform: 'uppercase', letterSpacing: '.12em',
    fontSize: 22, padding: '10px 0',
  }}>
    <div style={{ display:'inline-block', animation: 'uhppa-marquee 32s linear infinite', paddingLeft:'100%' }}>
      {Array(3).fill(0).map((_,i) => (
        <span key={i}>{items.map((t,j)=>(<span key={j} style={{ marginRight: 48 }}>&#10022; {t}</span>))}</span>
      ))}
    </div>
  </div>
);

// Section heading used across pages
export const SectionHeading = ({ kicker, title, rotate = 0 }) => (
  <div style={{ display:'flex', alignItems:'baseline', gap: 18, transform:`rotate(${rotate}deg)` }}>
    <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 12, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--pink)' }}>&sect; {kicker}</span>
    <h2 style={{
      fontFamily:"'Alfa Slab One', serif",
      fontSize: 52, margin: 0, lineHeight: 1,
    }}>{title}</h2>
  </div>
);
