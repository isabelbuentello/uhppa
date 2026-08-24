import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirestoreDoc } from '../hooks/useFirestore';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const labelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase',
  color: 'var(--ink-soft)', display: 'block', marginBottom: 4,
};

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '2px solid var(--ink)', background: 'white',
  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};

const ClubInfoEditor = () => {
  const { data: clubInfo, loading } = useFirestoreDoc('clubInfo', 'main');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [linktree, setLinktree] = useState('');
  const [discord, setDiscord] = useState('');
  const [activeMembers, setActiveMembers] = useState('');
  const [yearsRunning, setYearsRunning] = useState('');
  const [eventsPerYear, setEventsPerYear] = useState('');
  const [volunteerHours, setVolunteerHours] = useState('');
  const [semesterGoal, setSemesterGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!clubInfo) return;
    const s = clubInfo.socials || {};
    setInstagram(s.instagram || '');
    setEmail(s.email || '');
    setLinktree(s.linktree || '');
    setDiscord(s.discord || '');
    const st = clubInfo.stats || {};
    setActiveMembers(st.activeMembers?.toString() || '');
    setYearsRunning(st.yearsRunning?.toString() || '');
    setEventsPerYear(st.eventsPerYear?.toString() || '');
    setVolunteerHours(st.volunteerHours?.toString() || '');
    setSemesterGoal(clubInfo.semesterGoal?.toString() || '200');
  }, [clubInfo]);

  const save = async () => {
    setSaving(true);
    await setDoc(doc(db, 'clubInfo', 'main'), {
      socials: {
        instagram: instagram.trim() || null,
        email: email.trim() || null,
        linktree: linktree.trim() || null,
        discord: discord.trim() || null,
      },
      stats: {
        activeMembers: Number(activeMembers) || 0,
        yearsRunning: Number(yearsRunning) || 0,
        eventsPerYear: Number(eventsPerYear) || 0,
        volunteerHours: Number(volunteerHours) || 0,
      },
      semesterGoal: Number(semesterGoal) || 200,
      pointsGuide: clubInfo?.pointsGuide || null,
    }, { merge: true });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <AdminNav />
        <div style={{ textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 24, color: 'var(--ink-soft)', padding: 60 }}>
          loading...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="club settings" title="Club Info" rotate={-1} />

      {/* Social Links */}
      <div style={{ marginTop: 28, background: 'white', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', padding: '24px 28px' }}>
        <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, margin: '0 0 18px' }}>Social Links</h3>
        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Instagram URL</label>
            <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/uhppa" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="uhppa@uh.edu" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Linktree URL</label>
            <input value={linktree} onChange={e => setLinktree(e.target.value)} placeholder="https://linktr.ee/uhppa" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Discord URL</label>
            <input value={discord} onChange={e => setDiscord(e.target.value)} placeholder="https://discord.gg/..." style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Homepage Stats */}
      <div style={{ marginTop: 28, background: 'white', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', padding: '24px 28px' }}>
        <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, margin: '0 0 18px' }}>Homepage Stats</h3>
        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Active Members</label>
            <input value={activeMembers} onChange={e => setActiveMembers(e.target.value)} type="number" placeholder="127" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Years Running</label>
            <input value={yearsRunning} onChange={e => setYearsRunning(e.target.value)} type="number" placeholder="31" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Events Per Year</label>
            <input value={eventsPerYear} onChange={e => setEventsPerYear(e.target.value)} type="number" placeholder="52" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Volunteer Hours</label>
            <input value={volunteerHours} onChange={e => setVolunteerHours(e.target.value)} type="number" placeholder="2340" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Semester Goal */}
      <div style={{ marginTop: 28, background: 'white', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', padding: '24px 28px' }}>
        <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, margin: '0 0 18px' }}>Points Settings</h3>
        <div style={{ maxWidth: 300 }}>
          <label style={labelStyle}>Semester Points Goal</label>
          <input value={semesterGoal} onChange={e => setSemesterGoal(e.target.value)} type="number" placeholder="200" style={inputStyle} />
          <div style={{ marginTop: 6, fontFamily: "'Kalam', cursive", fontSize: 13, color: 'var(--ink-soft)' }}>
            shown on each member's points page as their target
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving} style={{
        marginTop: 28, padding: '12px 28px',
        border: '2px solid var(--ink)',
        background: saved ? 'var(--green)' : 'var(--tape)',
        fontFamily: "'Archivo Black', sans-serif",
        letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 13,
        cursor: saving ? 'wait' : 'pointer',
        boxShadow: '4px 4px 0 var(--ink)',
      }}>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</button>
    </div>
  );
};

export default ClubInfoEditor;
