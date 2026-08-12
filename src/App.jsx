import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { NavBtn } from './components/Primitives';
import Home from './components/Home';
import Calendar from './components/Calendar';
import Slides from './components/Slides';
import Points from './components/Points';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import Tweaks from './components/Tweaks';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tweaks, setTweaks] = useState({
    accent: 'tape',
    showAnnotations: true,
    paperTone: 'cream',
    tagline: 'pharmacy kids, assemble.',
  });
  const [tweakVisible, setTweakVisible] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  const go = (t) => {
    if (t === 'login') { setLoginOpen(true); return; }
    navigate(t === 'home' ? '/' : `/${t}`);
  };

  const tabs = [
    { id:'home',        path:'/',            label:'Home' },
    { id:'calendar',    path:'/calendar',    label:'Calendar' },
    { id:'slides',      path:'/slides',      label:'Slides' },
    { id:'points',      path:'/points',      label:'Points' },
    { id:'leaderboard', path:'/leaderboard', label:'Leaderboard' },
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
      minHeight:'100vh',
    }}>
      {/* Top nav — taped up */}
      <header style={{
        position:'sticky', top:0, zIndex: 20,
        background: 'oklch(0.96 0.018 85 / 0.88)',
        backdropFilter:'blur(6px)',
        borderBottom:'2px solid var(--ink)',
      }}>
        <div style={{
          maxWidth: 1400, margin:'0 auto',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 48px',
        }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap: 14, cursor:'pointer', textDecoration:'none' }}>
            <img src="/uhppa-logo.png" alt="" style={{ width: 44, height: 44, objectFit:'cover', border:'2px solid var(--ink)', background:'var(--ink)', padding: 2 }}/>
            <div>
              <div style={{ fontFamily:"'Alfa Slab One', serif", fontSize: 24, lineHeight: .9, letterSpacing:'.01em' }}>UHPPA</div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 9, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--ink-soft)' }}>
                est. 1995
              </div>
            </div>
          </Link>

          <nav style={{ display:'flex', gap: 10 }}>
            {tabs.map((t,i) => (
              <NavBtn key={t.id} active={isActive(t.path)} onClick={()=>navigate(t.path)} rotate={(i%2?0.5:-0.5)}>
                {t.label}
              </NavBtn>
            ))}
            <span style={{ width: 10 }}/>
            {user ? (
              <div style={{ display:'flex', alignItems:'center', gap: 10, fontFamily:"'Kalam', cursive", fontSize: 16 }}>
                hi, <b>{user.split('@')[0]}</b> &#9825;
                <button onClick={()=>setUser(null)} style={{
                  border:'2px solid var(--ink)', background:'var(--pink)',
                  padding:'6px 12px', fontFamily:"'Archivo Black', sans-serif",
                  letterSpacing:'.08em', textTransform:'uppercase', fontSize: 11, cursor:'pointer',
                }}>log out</button>
              </div>
            ) : (
              <NavBtn onClick={()=>setLoginOpen(true)} rotate={-1}>
                &#10022; Login
              </NavBtn>
            )}
          </nav>
        </div>
      </header>

      {/* Page body */}
      <main>
        <Routes>
          <Route path="/" element={<Home go={go} tweaks={tweaks}/>}/>
          <Route path="/calendar" element={<Calendar tweaks={tweaks}/>}/>
          <Route path="/slides" element={<Slides tweaks={tweaks}/>}/>
          <Route path="/points" element={<Points tweaks={tweaks}/>}/>
          <Route path="/leaderboard" element={<Leaderboard tweaks={tweaks}/>}/>
        </Routes>
      </main>

      {loginOpen && (
        <Login close={()=>setLoginOpen(false)} onLogin={(email)=>{ setUser(email); setLoginOpen(false); navigate('/points'); }}/>
      )}

      <Tweaks tweaks={tweaks} setTweaks={setTweaks} visible={tweakVisible}/>
    </div>
  );
};

export default App;
