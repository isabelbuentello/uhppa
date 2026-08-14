# Phase 2 — Auth & Membership Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Firebase Auth sign-up/sign-in, role-based route guards, and an officer approval queue so members can register and officers can approve them.

**Architecture:** Hybrid auth — profile data (name, major, classification) lives in Firestore `members/{uid}`, while the `role` field is synced to a Firebase Auth custom claim via a Cloud Function triggered on Firestore writes. An AuthContext provider exposes `{ user, role, loading }` to the entire app. A `ProtectedRoute` wrapper gates member-only and officer-only routes.

**Tech Stack:** Firebase Auth (email/password), Firestore, Cloud Functions (Node.js, 2nd gen), React Context

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/contexts/AuthContext.jsx` | Create | AuthProvider + useAuth hook — listens to onAuthStateChanged, reads custom claims |
| `src/components/Login.jsx` | Modify | Add sign-up mode, real Firebase Auth calls, password reset, error handling |
| `src/components/ProtectedRoute.jsx` | Create | Route guard — checks role, shows locked state or opens login |
| `src/components/PendingApproval.jsx` | Create | "Waiting for approval" screen with token refresh polling |
| `src/components/ApprovalQueue.jsx` | Create | Officer-facing pending member list with approve/deny |
| `src/App.jsx` | Modify | Wrap in AuthProvider, use ProtectedRoute on member routes, add /admin/approvals route, replace fake user state |
| `src/main.jsx` | Modify | Wrap BrowserRouter children in AuthProvider |
| `functions/package.json` | Create | Cloud Functions dependencies |
| `functions/index.js` | Create | onMemberRoleChange Cloud Function |
| `firestore.rules` | Modify | Add members collection security rules |
| `firebase.json` | Modify | Add functions emulator config |
| `scripts/seed-emulator.mjs` | Modify | Add test member + officer accounts to seed data |

---

### Task 1: AuthContext Provider

**Files:**
- Create: `src/contexts/AuthContext.jsx`

- [ ] **Step 1: Create AuthContext with provider and hook**

```jsx
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const tokenResult = await firebaseUser.getIdTokenResult();
        setRole(tokenResult.claims.role || 'pending');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshRole = async () => {
    if (!user) return null;
    const tokenResult = await user.getIdTokenResult(true);
    const newRole = tokenResult.claims.role || 'pending';
    setRole(newRole);
    return newRole;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, refreshRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Wrap app in AuthProvider**

Modify `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 3: Verify the app still loads**

Run: `npm run dev`
Expected: App loads without errors. Console may show Firebase Auth emulator connection message.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/AuthContext.jsx src/main.jsx
git commit -m "feat: add AuthContext provider with role from custom claims"
```

---

### Task 2: Update Login.jsx — Sign-In with Firebase Auth

**Files:**
- Modify: `src/components/Login.jsx`

- [ ] **Step 1: Replace fake auth with real Firebase Auth sign-in**

```jsx
// src/components/Login.jsx
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
          <Field label="password" value={pw} onChange={setPw} placeholder="••••••••" type="password" />

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
```

- [ ] **Step 2: Verify the modal renders**

Run: `npm run dev`
Click "Login" in nav. Expected: sign-in modal appears with updated copy and error state support.

- [ ] **Step 3: Commit**

```bash
git add src/components/Login.jsx
git commit -m "feat: wire Login.jsx to Firebase Auth sign-in with error handling and password reset"
```

---

### Task 3: Sign-Up Modal

**Files:**
- Create: `src/components/SignUp.jsx`

- [ ] **Step 1: Create SignUp component**

```jsx
// src/components/SignUp.jsx
import { useState } from 'react';
import { Tape } from './Primitives';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
              <Field label="password" value={pw} onChange={setPw} placeholder="at least 6 characters" type="password" />
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
```

- [ ] **Step 2: Verify it renders**

Run: `npm run dev`
This won't be reachable from the UI yet (wired up in Task 6). Just verify build succeeds: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/SignUp.jsx
git commit -m "feat: add SignUp modal with Firebase Auth, email verification, and Firestore profile"
```

---

### Task 4: PendingApproval Screen

**Files:**
- Create: `src/components/PendingApproval.jsx`

- [ ] **Step 1: Create PendingApproval component with token refresh polling**

```jsx
// src/components/PendingApproval.jsx
import { useEffect } from 'react';
import { Tape, SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';

const PendingApproval = () => {
  const { role, refreshRole } = useAuth();

  useEffect(() => {
    if (role !== 'pending') return;
    const interval = setInterval(() => { refreshRole(); }, 30000);
    return () => clearInterval(interval);
  }, [role, refreshRole]);

  if (role === 'denied') {
    return (
      <div style={{ padding: '80px 48px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <SectionHeading kicker="membership" title="Not approved." rotate={-1} />
        <p style={{
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18,
          color: 'var(--ink-soft)', marginTop: 20, lineHeight: 1.5,
        }}>
          Your membership request was not approved. If you think this is a mistake, reach out to an officer.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '80px 48px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <SectionHeading kicker="almost there" title="Hang tight!" rotate={-1} />
      <div style={{ position: 'relative', display: 'inline-block', marginTop: 30 }}>
        <Tape r={-10} color="var(--tape)" w={120} style={{ top: -12, left: 40 }} />
        <div style={{
          background: 'white', border: '2px solid var(--ink)',
          boxShadow: '6px 6px 0 var(--ink)', padding: '30px 36px',
          transform: 'rotate(-1deg)',
        }}>
          <div style={{
            fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink)', lineHeight: 1.4,
          }}>
            your account is waiting<br />for officer approval &#9203;
          </div>
          <p style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
            color: 'var(--ink-soft)', marginTop: 14, lineHeight: 1.5,
          }}>
            An officer will review your request soon. This page will update automatically once you're approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PendingApproval.jsx
git commit -m "feat: add PendingApproval screen with automatic token refresh polling"
```

---

### Task 5: ProtectedRoute Component

**Files:**
- Create: `src/components/ProtectedRoute.jsx`

- [ ] **Step 1: Create ProtectedRoute wrapper**

```jsx
// src/components/ProtectedRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import PendingApproval from './PendingApproval';

const ProtectedRoute = ({ children, requiredRole = 'member', onLoginClick }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ padding: '80px 48px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Alfa Slab One', serif", fontSize: 36, color: 'var(--ink)', lineHeight: 1,
        }}>members only.</div>
        <p style={{
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18,
          color: 'var(--ink-soft)', marginTop: 16, lineHeight: 1.5,
        }}>
          you need to be logged in to view this page.
        </p>
        <button onClick={onLoginClick} style={{
          marginTop: 20, padding: '12px 24px',
          border: '2px solid var(--ink)', background: 'var(--pink)', color: 'var(--ink)',
          fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 13,
          cursor: 'pointer', boxShadow: '4px 4px 0 var(--ink)',
        }}>log in →</button>
      </div>
    );
  }

  if (role === 'pending' || role === 'denied') {
    return <PendingApproval />;
  }

  if (requiredRole === 'officer' && role !== 'officer') {
    return (
      <div style={{ padding: '80px 48px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Alfa Slab One', serif", fontSize: 36, color: 'var(--ink)', lineHeight: 1,
        }}>officers only.</div>
        <p style={{
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18,
          color: 'var(--ink-soft)', marginTop: 16, lineHeight: 1.5,
        }}>
          this page is restricted to UHPPA officers.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProtectedRoute.jsx
git commit -m "feat: add ProtectedRoute component for role-based route guards"
```

---

### Task 6: Update App.jsx — Wire Auth Into the Shell

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace fake user state with real auth, add route guards and sign-up flow**

```jsx
// src/App.jsx
import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { NavBtn } from './components/Primitives';
import { useAuth } from './contexts/AuthContext';
import Home from './components/Home';
import Calendar from './components/Calendar';
import Slides from './components/Slides';
import Points from './components/Points';
import Leaderboard from './components/Leaderboard';
import Gallery from './components/Gallery';
import ApprovalQueue from './components/ApprovalQueue';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import Tweaks from './components/Tweaks';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, loading, signOut } = useAuth();
  const [tweaks, setTweaks] = useState({
    accent: 'tape',
    showAnnotations: true,
    paperTone: 'cream',
    tagline: 'pharmacy kids, assemble.',
  });
  const [tweakVisible, setTweakVisible] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  const go = (t) => {
    if (t === 'login') { setLoginOpen(true); return; }
    navigate(t === 'home' ? '/' : `/${t}`);
  };

  const openLogin = () => { setSignUpOpen(false); setLoginOpen(true); };
  const openSignUp = () => { setLoginOpen(false); setSignUpOpen(true); };
  const closeModals = () => { setLoginOpen(false); setSignUpOpen(false); };

  const tabs = [
    { id: 'home',        path: '/',            label: 'Home' },
    { id: 'gallery',     path: '/gallery',     label: 'Gallery' },
    { id: 'calendar',    path: '/calendar',    label: 'Calendar' },
    { id: 'slides',      path: '/slides',      label: 'Slides' },
    { id: 'points',      path: '/points',      label: 'Points' },
    { id: 'leaderboard', path: '/leaderboard', label: 'Leaderboard' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{
      background: tweaks.paperTone === 'kraft'
        ? 'oklch(0.82 0.06 70)'
        : tweaks.paperTone === 'white'
        ? 'oklch(0.99 0.003 85)'
        : 'var(--paper)',
      minHeight: '100vh',
    }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'oklch(0.96 0.018 85 / 0.88)',
        backdropFilter: 'blur(6px)',
        borderBottom: '2px solid var(--ink)',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 48px',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textDecoration: 'none' }}>
            <img src="/uhppa-logo.png" alt="" style={{ width: 44, height: 44, objectFit: 'cover', border: '2px solid var(--ink)', background: 'var(--ink)', padding: 2 }} />
            <div>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24, lineHeight: .9, letterSpacing: '.01em' }}>UHPPA</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                est. 1995
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', gap: 10 }}>
            {tabs.map((t, i) => (
              <NavBtn key={t.id} active={isActive(t.path)} onClick={() => navigate(t.path)} rotate={(i % 2 ? 0.5 : -0.5)}>
                {t.label}
              </NavBtn>
            ))}
            <span style={{ width: 10 }} />
            {!loading && (user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Kalam', cursive", fontSize: 16 }}>
                hi, <b>{user.displayName || user.email.split('@')[0]}</b> &#9825;
                {role === 'officer' && (
                  <NavBtn onClick={() => navigate('/admin/approvals')} rotate={0.5}>
                    Admin
                  </NavBtn>
                )}
                <button onClick={signOut} style={{
                  border: '2px solid var(--ink)', background: 'var(--pink)',
                  padding: '6px 12px', fontFamily: "'Archivo Black', sans-serif",
                  letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 11, cursor: 'pointer',
                }}>log out</button>
              </div>
            ) : (
              <NavBtn onClick={() => setLoginOpen(true)} rotate={-1}>
                &#10022; Login
              </NavBtn>
            ))}
          </nav>
        </div>
      </header>

      {/* Page body */}
      <main>
        <Routes>
          <Route path="/" element={<Home go={go} tweaks={tweaks} />} />
          <Route path="/calendar" element={<Calendar tweaks={tweaks} />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/slides" element={
            <ProtectedRoute onLoginClick={openLogin}>
              <Slides tweaks={tweaks} />
            </ProtectedRoute>
          } />
          <Route path="/points" element={
            <ProtectedRoute onLoginClick={openLogin}>
              <Points tweaks={tweaks} />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute onLoginClick={openLogin}>
              <Leaderboard tweaks={tweaks} />
            </ProtectedRoute>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <ApprovalQueue />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {loginOpen && (
        <Login
          close={closeModals}
          onLogin={closeModals}
          onSignUpClick={openSignUp}
        />
      )}

      {signUpOpen && (
        <SignUp
          close={closeModals}
          onSignInClick={openLogin}
        />
      )}

      <Tweaks tweaks={tweaks} setTweaks={setTweaks} visible={tweakVisible} />
    </div>
  );
};

export default App;
```

- [ ] **Step 2: Verify the app loads and nav works**

Run: `npm run dev`
Expected: App loads. Login button shows when logged out. Public pages (Home, Calendar, Gallery) render. Member pages (Points, Slides, Leaderboard) show "members only" message.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire real auth into App shell with route guards and sign-up flow"
```

---

### Task 7: Approval Queue Page

**Files:**
- Create: `src/components/ApprovalQueue.jsx`

- [ ] **Step 1: Create ApprovalQueue component**

```jsx
// src/components/ApprovalQueue.jsx
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { where, orderBy } from 'firebase/firestore';

const ApprovalQueue = () => {
  const { data: pending, loading } = useFirestoreQuery('members', [
    where('role', '==', 'pending'),
    orderBy('createdAt'),
  ]);

  const approve = async (uid) => {
    await updateDoc(doc(db, 'members', uid), { role: 'member' });
  };

  const deny = async (uid) => {
    await updateDoc(doc(db, 'members', uid), { role: 'denied' });
  };

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 900, margin: '0 auto' }}>
      <SectionHeading kicker="officer tools" title="Approval Queue" rotate={-1} />

      {pending.length === 0 ? (
        <div style={{
          padding: 60, textAlign: 'center',
          fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)',
        }}>no pending requests — all caught up &#10003;</div>
      ) : (
        <div style={{ marginTop: 28 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 16,
          }}>{pending.length} pending request{pending.length !== 1 ? 's' : ''}</div>

          {pending.map(member => (
            <div key={member.id} style={{
              background: 'white', border: '2px solid var(--ink)',
              boxShadow: '4px 4px 0 var(--ink)', padding: '18px 22px',
              marginBottom: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              gap: 20,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20, lineHeight: 1 }}>
                  {member.name}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: '.1em', color: 'var(--ink-soft)', marginTop: 4,
                }}>
                  {member.email}
                </div>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
                  color: 'var(--ink-soft)', marginTop: 6,
                }}>
                  {member.classification} &middot; {member.major}
                </div>
                <div style={{
                  fontFamily: "'Kalam', cursive", fontSize: 13,
                  color: 'var(--ink-soft)', marginTop: 4,
                }}>
                  signed up {member.createdAt?.toDate?.()
                    ? member.createdAt.toDate().toLocaleDateString()
                    : 'recently'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => approve(member.id)} style={{
                  padding: '10px 18px',
                  border: '2px solid var(--ink)', background: 'var(--green)', color: 'var(--ink)',
                  fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
                  cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
                }}>approve</button>
                <button onClick={() => deny(member.id)} style={{
                  padding: '10px 18px',
                  border: '2px solid var(--ink)', background: 'var(--pink)', color: 'var(--ink)',
                  fontFamily: "'Archivo Black', sans-serif", letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
                  cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
                }}>deny</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: builds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ApprovalQueue.jsx
git commit -m "feat: add officer approval queue page with approve/deny actions"
```

---

### Task 8: Cloud Function — Sync Role to Custom Claims

**Files:**
- Create: `functions/package.json`
- Create: `functions/index.js`
- Modify: `firebase.json`

- [ ] **Step 1: Initialize the functions directory**

Run:
```bash
mkdir -p functions
```

- [ ] **Step 2: Create functions/package.json**

```json
{
  "name": "uhppa-functions",
  "type": "module",
  "engines": { "node": "20" },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^14.2.0",
    "firebase-functions": "^6.3.2"
  }
}
```

- [ ] **Step 3: Create functions/index.js**

```js
// functions/index.js
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp();

export const onMemberRoleChange = onDocumentUpdated('members/{uid}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.role === after.role) return;

  const uid = event.params.uid;
  await getAuth().setCustomUserClaims(uid, { role: after.role });
  console.log(`Set role=${after.role} for user ${uid}`);
});
```

- [ ] **Step 4: Install function dependencies**

Run:
```bash
cd functions && npm install && cd ..
```

- [ ] **Step 5: Add functions emulator to firebase.json**

Update `firebase.json` to include the functions emulator. The full file should be:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "functions": { "port": 5001 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

- [ ] **Step 6: Verify emulators start with functions**

Run: `npx firebase emulators:start`
Expected: All emulators start including Functions emulator on port 5001.

- [ ] **Step 7: Commit**

```bash
git add functions/package.json functions/index.js firebase.json
git commit -m "feat: add Cloud Function to sync Firestore role to Auth custom claims"
```

---

### Task 9: Firestore Security Rules for Members

**Files:**
- Modify: `firestore.rules`
- Modify: `firestore.indexes.json`

- [ ] **Step 1: Update firestore.rules to add members collection**

The full `firestore.rules` file:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public collections — anyone can read
    match /events/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /officers/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /sponsors/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /clubInfo/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /gallery/{doc} {
      allow read: if true;
      allow write: if false;
    }
    // Members collection
    match /members/{uid} {
      // Anyone can create their own doc (sign-up)
      allow create: if request.auth != null && request.auth.uid == uid;
      // Owner can read their own doc
      allow read: if request.auth != null && request.auth.uid == uid;
      // Officers can read all members and update role
      allow read: if request.auth != null && request.auth.token.role == 'officer';
      allow update: if request.auth != null && request.auth.token.role == 'officer';
    }
    // Member-only collections — locked down until Phase 3
    match /pointsLedger/{doc} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Add composite index for approval queue query**

Update `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "officers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "sortOrder", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 3: Verify rules deploy to emulator**

Run: `npx firebase emulators:start`
Expected: Emulators start with updated rules. No rule compilation errors.

- [ ] **Step 4: Commit**

```bash
git add firestore.rules firestore.indexes.json
git commit -m "feat: add Firestore security rules and indexes for members collection"
```

---

### Task 10: Seed Script — Add Test Accounts

**Files:**
- Modify: `scripts/seed-emulator.mjs`

- [ ] **Step 1: Add test member and officer Auth accounts + Firestore docs to seed script**

Add the following block at the end of the `seed()` function, before the "Seed complete" log:

```js
  // --- Test Auth accounts ---
  // Note: Auth emulator auto-creates accounts; we create Firestore member docs to match
  // To test sign-in, create these accounts via the Auth emulator UI at localhost:4000
  // or sign up through the app. These Firestore docs ensure the approval queue has data.
  const testMembers = [
    { uid: 'test-pending-1', name: 'Taylor Swift', email: 'taylor@test.com', major: 'Biology', classification: 'Junior', role: 'pending' },
    { uid: 'test-pending-2', name: 'Jordan Lee', email: 'jordan@test.com', major: 'Chemistry', classification: 'Sophomore', role: 'pending' },
    { uid: 'test-member-1', name: 'Casey Kim', email: 'casey@test.com', major: 'Neuroscience', classification: 'Senior', role: 'member' },
    { uid: 'test-officer-1', name: 'Officer Admin', email: 'officer@test.com', major: 'Chemistry', classification: 'Senior', role: 'officer' },
  ];
  for (const m of testMembers) {
    const { uid, ...data } = m;
    await db.doc(`members/${uid}`).set({ ...data, createdAt: new Date() });
  }
  console.log(`✓ test members (${testMembers.length})`);
```

- [ ] **Step 2: Run the seed script to verify**

Start emulators: `npx firebase emulators:start`
In another terminal: `node scripts/seed-emulator.mjs`
Expected: Output includes `✓ test members (4)`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-emulator.mjs
git commit -m "feat: add test member accounts to emulator seed script"
```

---

### Task 11: End-to-End Verification

- [ ] **Step 1: Start emulators and seed**

```bash
npx firebase emulators:start
# In another terminal:
node scripts/seed-emulator.mjs
npm run dev
```

- [ ] **Step 2: Test sign-up flow**

1. Click "Login" in nav → sign-in modal appears
2. Click "sign up" link → sign-up modal appears
3. Fill out form: name, email, password, classification, major
4. Submit → "check your email" message appears
5. In emulator UI (localhost:4000), go to Auth tab → verify the user was created
6. Go to Firestore tab → verify `members/{uid}` doc exists with `role: pending`

- [ ] **Step 3: Test sign-in and pending state**

1. In Auth emulator UI, mark the test user's email as verified
2. Sign in with the test credentials
3. Navigate to `/points` → should show "waiting for approval" screen
4. Navigate to `/calendar` → should work (public page)

- [ ] **Step 4: Test approval flow**

1. In Firestore emulator UI, find the officer test account (`test-officer-1`) and set its Auth custom claim to `{ "role": "officer" }` via the Auth emulator UI
2. Sign in as the officer account
3. Navigate to `/admin/approvals` → should show pending members
4. Click "approve" on a pending member
5. Verify the member's Firestore doc now shows `role: member`
6. The Cloud Function should fire and set the custom claim

- [ ] **Step 5: Test route guards**

1. Sign out → visit `/points` → should show "members only" with login button
2. Sign in as approved member → `/points` loads normally
3. Visit `/admin/approvals` as member → should show "officers only"

- [ ] **Step 6: Verify production build**

Run: `npm run build`
Expected: builds without errors.
