import { useState } from 'react';
import { Tape } from './Primitives';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <label style={{ display: 'block', marginBottom: 14 }}>
    <span style={{
      display: 'block',
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
      color: 'var(--ink-soft)', marginBottom: 6,
    }}>{label}</span>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 14px',
        border: '2px solid var(--ink)', background: 'var(--paper)',
        fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, outline: 'none',
        boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.06)',
        boxSizing: 'border-box',
      }} />
  </label>
);

const Login = ({ close, onLogin, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pw);
      if (!cred.user.emailVerified) {
        setError('Please verify your email first. Check your inbox.');
        setSubmitting(false);
        return;
      }
      onLogin();
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : 'Something went wrong. Try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!email) { setError('Enter your email first.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch {
      setError('Could not send reset email. Check the address.');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'oklch(0.22 0.03 260 / 0.55)',
      display: 'grid', placeItems: 'center',
      backdropFilter: 'blur(2px)',
    }} onClick={close}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', transform: 'rotate(-1.2deg)' }}>
        <Tape r={-10} color="var(--pink)" w={130} style={{ top: -12, left: 80 }} />
        <Tape r={6} color="var(--tape)" w={110} style={{ top: -8, right: 60 }} />
        <form onSubmit={submit} style={{
          width: 460, background: 'white', border: '2px solid var(--ink)',
          boxShadow: '10px 10px 0 var(--ink)',
          padding: '34px 34px 28px',
          position: 'relative',
        }}>
          <button type="button" onClick={close} style={{
            position: 'absolute', top: 10, right: 14, border: 'none', background: 'none',
            fontSize: 22, cursor: 'pointer', fontFamily: "'Alfa Slab One', serif",
          }}>&times;</button>

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--pink)' }}>&sect; members only</div>
          <h2 style={{
            fontFamily: "'Alfa Slab One', serif", fontSize: 42, lineHeight: .95,
            margin: '8px 0 6px',
          }}>sign in.</h2>
          <p style={{ margin: '0 0 22px', fontFamily: "'Kalam', cursive", fontSize: 18, color: 'var(--ink-soft)' }}>
            welcome back &mdash; enter your credentials below.
          </p>

          {error && (
            <div style={{
              background: 'oklch(0.93 0.08 20)', border: '1.5px solid var(--pink)',
              padding: '10px 14px', marginBottom: 14,
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, color: 'var(--ink)',
            }}>{error}</div>
          )}

          {resetSent && (
            <div style={{
              background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)',
              padding: '10px 14px', marginBottom: 14,
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, color: 'var(--ink)',
            }}>Reset email sent! Check your inbox.</div>
          )}

          <Field label="email" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
          <div style={{ position: 'relative' }}>
            <Field label="password" value={pw} onChange={setPw} placeholder="••••••••" type={showPw ? 'text' : 'password'} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: 10, top: 28, border: 'none', background: 'none',
              cursor: 'pointer', fontSize: 14, color: 'var(--ink-soft)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{showPw ? 'hide' : 'show'}</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 14, marginBottom: 22 }}>
            <button type="button" onClick={handleReset} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Kalam', cursive", color: 'var(--blue)', fontSize: 16,
            }}>forgot password?</button>
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '14px',
            border: '2px solid var(--ink)', background: 'var(--ink)', color: 'var(--paper)',
            fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 14,
            cursor: submitting ? 'wait' : 'pointer', boxShadow: '4px 4px 0 var(--pink)',
            opacity: submitting ? 0.7 : 1,
          }}>{submitting ? 'signing in...' : 'log in →'}</button>

          <div style={{ marginTop: 18, textAlign: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, color: 'var(--ink-soft)' }}>
            don't have an account?{' '}
            <button type="button" onClick={onSignUpClick} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--pink)', fontWeight: 700, fontFamily: 'inherit', fontSize: 'inherit',
            }}>sign up &#9998;</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
