import { useState } from 'react';
import { Tape } from './Primitives';

const Field = ({ label, value, onChange, placeholder, type='text' }) => (
  <label style={{ display:'block', marginBottom: 14 }}>
    <span style={{
      display:'block',
      fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'.15em', textTransform:'uppercase',
      color:'var(--ink-soft)', marginBottom: 6,
    }}>{label}</span>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{
        width:'100%', padding:'12px 14px',
        border:'2px solid var(--ink)', background:'var(--paper)',
        fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 16, outline:'none',
        boxShadow:'inset 2px 2px 0 rgba(0,0,0,.06)',
        boxSizing: 'border-box',
      }}/>
  </label>
);

const Login = ({ close, onLogin }) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(true);

  const submit = (e) => { e.preventDefault(); onLogin(email || 'alex.tran@uhills.edu'); };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      background:'oklch(0.22 0.03 260 / 0.55)',
      display:'grid', placeItems:'center',
      backdropFilter:'blur(2px)',
    }} onClick={close}>
      <div onClick={e=>e.stopPropagation()} style={{ position:'relative', transform:'rotate(-1.2deg)' }}>
        <Tape r={-10} color="var(--pink)" w={130} style={{ top:-12, left: 80 }}/>
        <Tape r={6} color="var(--tape)" w={110} style={{ top:-8, right: 60 }}/>
        <form onSubmit={submit} style={{
          width: 460, background:'white', border:'2px solid var(--ink)',
          boxShadow:'10px 10px 0 var(--ink)',
          padding: '34px 34px 28px',
          position:'relative',
        }}>
          <button type="button" onClick={close} style={{
            position:'absolute', top: 10, right: 14, border:'none', background:'none',
            fontSize: 22, cursor:'pointer', fontFamily:"'Alfa Slab One', serif",
          }}>&times;</button>

          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--pink)' }}>&sect; members only</div>
          <h2 style={{
            fontFamily:"'Alfa Slab One', serif", fontSize: 42, lineHeight: .95,
            margin:'8px 0 6px',
          }}>sign in.</h2>
          <p style={{ margin: '0 0 22px', fontFamily:"'Kalam', cursive", fontSize: 18, color:'var(--ink-soft)' }}>
            use your <u>university email</u> &mdash; same one you signed up with.
          </p>

          <Field label="email" value={email} onChange={setEmail} placeholder="you@uhills.edu" type="email"/>
          <Field label="password" value={pw} onChange={setPw} placeholder="••••••••" type="password"/>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 14, marginBottom: 22 }}>
            <label style={{ display:'flex', alignItems:'center', gap: 8, fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 14, cursor:'pointer' }}>
              <span onClick={()=>setRemember(!remember)} style={{
                width: 20, height: 20, border:'2px solid var(--ink)', background: remember ? 'var(--pink)' : 'white',
                display:'inline-grid', placeItems:'center', fontFamily:"'Alfa Slab One', serif", fontSize: 16,
              }}>{remember ? '✓' : ''}</span>
              remember me
            </label>
            <a href="#" style={{ fontFamily:"'Kalam', cursive", color:'var(--blue)', fontSize: 16 }}>forgot password?</a>
          </div>

          <button type="submit" style={{
            width:'100%', padding:'14px',
            border:'2px solid var(--ink)', background:'var(--ink)', color:'var(--paper)',
            fontFamily:"'Archivo Black', sans-serif", letterSpacing:'.12em', textTransform:'uppercase', fontSize: 14,
            cursor:'pointer', boxShadow:'4px 4px 0 var(--pink)',
          }}>log in &rarr;</button>

          <div style={{ marginTop: 18, textAlign:'center', fontFamily:"'Bricolage Grotesque', sans-serif", fontSize: 14, color:'var(--ink-soft)' }}>
            not a member yet? <a href="#" style={{ color:'var(--pink)', fontWeight:700 }}>sign up at the next meeting &#9998;</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
