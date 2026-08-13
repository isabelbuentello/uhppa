import { useState } from 'react';
import { Tape } from './Primitives';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Field = ({ label, value, onChange, placeholder, type = 'text', children }) => (
  <label style={{ display: 'block', marginBottom: 14 }}>
    <span style={{
      display: 'block',
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
      color: 'var(--ink-soft)', marginBottom: 6,
    }}>{label}</span>
    {children || (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 14px',
          border: '2px solid var(--ink)', background: 'var(--paper)',
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, outline: 'none',
          boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.06)',
          boxSizing: 'border-box',
        }} />
    )}
  </label>
);

const selectStyle = {
  width: '100%', padding: '12px 14px',
  border: '2px solid var(--ink)', background: 'var(--paper)',
  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, outline: 'none',
  boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.06)',
  boxSizing: 'border-box',
  appearance: 'none',
};

const SignUp = ({ close, onSignInClick }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [classification, setClassification] = useState('');
  const [major, setMajor] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !classification || !major.trim()) {
      setError('Please fill out all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      await updateProfile(cred.user, { displayName: name.trim() });
      await sendEmailVerification(cred.user);
      await setDoc(doc(db, 'members', cred.user.uid), {
        name: name.trim(),
        email,
        major: major.trim(),
        classification,
        role: 'pending',
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'That email is already registered. Try signing in.'
        : err.code === 'auth/weak-password'
        ? 'Password must be at least 6 characters.'
        : 'Something went wrong. Try again.';
      setError(msg);
      setSubmitting(false);
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
        <Tape r={-10} color="var(--green)" w={130} style={{ top: -12, left: 80 }} />
        <Tape r={6} color="var(--tape)" w={110} style={{ top: -8, right: 60 }} />
        <form onSubmit={submit} style={{
          width: 460, background: 'white', border: '2px solid var(--ink)',
          boxShadow: '10px 10px 0 var(--ink)',
          padding: '34px 34px 28px',
          position: 'relative',
          maxHeight: '90vh', overflowY: 'auto',
        }}>
          <button type="button" onClick={close} style={{
            position: 'absolute', top: 10, right: 14, border: 'none', background: 'none',
            fontSize: 22, cursor: 'pointer', fontFamily: "'Alfa Slab One', serif",
          }}>&times;</button>

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--green)' }}>&#9998; new member</div>
          <h2 style={{
            fontFamily: "'Alfa Slab One', serif", fontSize: 42, lineHeight: .95,
            margin: '8px 0 6px',
          }}>sign up.</h2>

          {done ? (
            <div>
              <div style={{
                background: 'oklch(0.93 0.08 145)', border: '1.5px solid var(--green)',
                padding: '16px 18px', marginTop: 18,
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, color: 'var(--ink)',
                lineHeight: 1.5,
              }}>
                <b>Check your email!</b> We sent a verification link. After verifying, an officer will review your account. You'll get full access once approved.
              </div>
              <button type="button" onClick={close} style={{
                width: '100%', padding: '14px', marginTop: 18,
                border: '2px solid var(--ink)', background: 'var(--ink)', color: 'var(--paper)',
                fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 14,
                cursor: 'pointer', boxShadow: '4px 4px 0 var(--green)',
              }}>got it</button>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 22px', fontFamily: "'Kalam', cursive", fontSize: 18, color: 'var(--ink-soft)' }}>
                join the club &mdash; fill out the form below.
              </p>

              {error && (
                <div style={{
                  background: 'oklch(0.93 0.08 20)', border: '1.5px solid var(--pink)',
                  padding: '10px 14px', marginBottom: 14,
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, color: 'var(--ink)',
                }}>{error}</div>
              )}

              <Field label="full name" value={name} onChange={setName} placeholder="Jane Doe" />
              <Field label="email" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
              <div style={{ position: 'relative' }}>
                <Field label="password" value={pw} onChange={setPw} placeholder="at least 6 characters" type={showPw ? 'text' : 'password'} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 10, top: 28, border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: 14, color: 'var(--ink-soft)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{showPw ? 'hide' : 'show'}</button>
              </div>
              <Field label="classification">
                <select value={classification} onChange={e => setClassification(e.target.value)} style={selectStyle}>
                  <option value="">select one...</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </Field>
              <Field label="major" value={major} onChange={setMajor} placeholder="e.g. Biology" />

              <button type="submit" disabled={submitting} style={{
                width: '100%', padding: '14px', marginTop: 8,
                border: '2px solid var(--ink)', background: 'var(--green)', color: 'var(--ink)',
                fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 14,
                cursor: submitting ? 'wait' : 'pointer', boxShadow: '4px 4px 0 var(--ink)',
                opacity: submitting ? 0.7 : 1,
              }}>{submitting ? 'creating account...' : 'sign up →'}</button>

              <div style={{ marginTop: 18, textAlign: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, color: 'var(--ink-soft)' }}>
                already have an account?{' '}
                <button type="button" onClick={onSignInClick} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--pink)', fontWeight: 700, fontFamily: 'inherit', fontSize: 'inherit',
                }}>sign in</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
