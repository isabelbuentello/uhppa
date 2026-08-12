const Row = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'.1em', textTransform:'uppercase', marginBottom: 6, color:'var(--ink-soft)' }}>{label}</div>
    {children}
  </div>
);

const toggleBtn = (on) => ({
  border:'1.5px solid var(--ink)',
  background: on ? 'var(--pink)' : 'white',
  padding:'5px 12px', fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.1em', fontSize: 10, cursor:'pointer',
});

const chipBtn = {
  border:'1.5px solid var(--ink)', padding:'5px 10px',
  fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.08em', textTransform:'uppercase', fontSize: 10, cursor:'pointer',
};

const Tweaks = ({ tweaks, setTweaks, visible }) => {
  if (!visible) return null;
  const update = (patch) => {
    setTweaks({ ...tweaks, ...patch });
  };

  return (
    <div style={{
      position:'fixed', right: 20, bottom: 20, zIndex: 40,
      width: 260, background:'white', border:'2px solid var(--ink)',
      boxShadow:'6px 6px 0 var(--ink)', padding: 18,
      fontFamily:"'Bricolage Grotesque', sans-serif",
    }}>
      <div style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 22, marginBottom: 4 }}>Tweaks</div>
      <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--ink-soft)', marginBottom: 14 }}>
        scrapbook controls
      </div>

      <Row label="Accent">
        <div style={{ display:'flex', gap: 6 }}>
          {[
            ['pink','var(--pink)'],
            ['green','var(--green)'],
            ['blue','var(--blue)'],
            ['tape','var(--tape)'],
          ].map(([k,c]) => (
            <button key={k} onClick={()=>update({ accent:k })} style={{
              width: 28, height: 28, border: tweaks.accent===k ? '2.5px solid var(--ink)' : '1.5px solid var(--ink-soft)',
              background:c, cursor:'pointer',
            }}/>
          ))}
        </div>
      </Row>

      <Row label="Annotations">
        <button onClick={()=>update({ showAnnotations: !tweaks.showAnnotations })} style={toggleBtn(tweaks.showAnnotations)}>
          {tweaks.showAnnotations ? 'ON' : 'OFF'}
        </button>
      </Row>

      <Row label="Paper">
        <div style={{ display:'flex', gap: 6 }}>
          {['cream','white','kraft'].map(t => (
            <button key={t} onClick={()=>update({ paperTone: t })} style={{
              ...chipBtn,
              background: tweaks.paperTone===t ? 'var(--ink)' : 'white',
              color: tweaks.paperTone===t ? 'var(--paper)' : 'var(--ink)',
            }}>{t}</button>
          ))}
        </div>
      </Row>

      <Row label="Tagline">
        <input value={tweaks.tagline} onChange={e=>update({ tagline:e.target.value })}
          style={{
            width:'100%', border:'1.5px solid var(--ink)', padding:'6px 8px',
            fontFamily:"'Kalam', cursive", fontSize: 14, background:'var(--paper)', outline:'none',
            boxSizing: 'border-box',
          }}/>
      </Row>
    </div>
  );
};

export default Tweaks;
