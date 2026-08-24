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
import EventEditor from './components/EventEditor';
import PointsQueue from './components/PointsQueue';
import MemberRoster from './components/MemberRoster';
import GalleryEditor from './components/GalleryEditor';
import OfficerEditor from './components/OfficerEditor';
import SponsorEditor from './components/SponsorEditor';
import SlidesEditor from './components/SlidesEditor';
import ClubInfoEditor from './components/ClubInfoEditor';
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
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="site-header-inner" style={{
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

          <nav className="nav-links" style={{ display: 'flex', gap: 10 }}>
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

          {/* Hamburger button — visible on mobile only */}
          <button className="hamburger-btn" onClick={() => setMenuOpen(true)} style={{
            background: 'none', border: '2px solid var(--ink)', padding: '6px 10px',
            fontFamily: "'Archivo Black', sans-serif", fontSize: 18, cursor: 'pointer',
            boxShadow: '2px 2px 0 var(--ink)',
          }}>&#9776;</button>

        </div>
      </header>

      {/* Mobile nav overlay — outside header to escape its stacking context */}
      {menuOpen && (
        <div className="mobile-nav-overlay" style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'var(--paper)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <button onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Alfa Slab One', serif", fontSize: 28, color: 'var(--ink)',
          }}>&times;</button>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { navigate(t.path); setMenuOpen(false); }} style={{
              padding: '12px 28px',
              border: '2px solid var(--ink)',
              background: isActive(t.path) ? 'var(--ink)' : 'white',
              color: isActive(t.path) ? 'var(--paper)' : 'var(--ink)',
              fontFamily: "'Archivo Black', sans-serif",
              letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
              cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
              width: 220,
            }}>{t.label}</button>
          ))}
          {!loading && user && role === 'officer' && (
            <button onClick={() => { navigate('/admin/approvals'); setMenuOpen(false); }} style={{
              padding: '12px 28px',
              border: '2px solid var(--ink)', background: 'var(--tape)',
              fontFamily: "'Archivo Black', sans-serif",
              letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
              cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
              width: 220,
            }}>Admin</button>
          )}
          {!loading && (user ? (
            <button onClick={() => { signOut(); setMenuOpen(false); }} style={{
              padding: '12px 28px',
              border: '2px solid var(--ink)', background: 'var(--pink)',
              fontFamily: "'Archivo Black', sans-serif",
              letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
              cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
              width: 220,
            }}>Log Out</button>
          ) : (
            <button onClick={() => { setLoginOpen(true); setMenuOpen(false); }} style={{
              padding: '12px 28px',
              border: '2px solid var(--ink)', background: 'var(--green)',
              fontFamily: "'Archivo Black', sans-serif",
              letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 14,
              cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
              width: 220,
            }}>&#10022; Login</button>
          ))}
        </div>
      )}

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
          <Route path="/admin/events" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <EventEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/points" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <PointsQueue />
            </ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <MemberRoster />
            </ProtectedRoute>
          } />
          <Route path="/admin/gallery" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <GalleryEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/officers" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <OfficerEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/sponsors" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <SponsorEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/slides" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <SlidesEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/club-info" element={
            <ProtectedRoute requiredRole="officer" onLoginClick={openLogin}>
              <ClubInfoEditor />
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
