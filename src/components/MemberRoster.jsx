import { useState, useMemo } from 'react';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ROLES = ['pending', 'member', 'officer', 'denied'];

const roleBadge = (role) => {
  const colors = {
    officer: 'var(--green)',
    member: 'var(--blue)',
    pending: 'var(--tape)',
    denied: 'var(--pink)',
  };
  return {
    background: colors[role] || 'var(--paper-2)',
    border: '1.5px solid var(--ink)',
    padding: '2px 8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
  };
};

const gridCols = '1fr 1fr 100px 1fr 120px 110px';

const headerStyle = {
  display: 'grid', gridTemplateColumns: gridCols,
  background: 'var(--ink)', color: 'var(--paper)',
  fontFamily: "'Archivo Black', sans-serif", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
};

const MemberRow = ({ member, isYou, user, changeRole, i }) => {
  const joined = member.createdAt?.toDate
    ? member.createdAt.toDate().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    : '—';
  return (
    <div className="admin-table-row" style={{
      display: 'grid', gridTemplateColumns: gridCols,
      alignItems: 'center',
      borderTop: i === 0 ? 'none' : '1.5px dashed var(--rule)',
      fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
      background: isYou ? 'oklch(0.94 0.09 95)' : 'transparent',
    }}>
      <div style={{ padding: '10px 16px', fontWeight: 600 }}>
        {member.name}{isYou ? ' (you)' : ''}
      </div>
      <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{member.email}</div>
      <div style={{ padding: '10px 16px', fontSize: 13 }}>{member.classification || '—'}</div>
      <div style={{ padding: '10px 16px', fontSize: 13 }}>{member.major || '—'}</div>
      <div style={{ padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{joined}</div>
      <div style={{ padding: '10px 16px' }}>
        {isYou ? (
          <span style={roleBadge(member.role)}>{member.role}</span>
        ) : (
          <select value={member.role} onChange={e => changeRole(member, e.target.value)} style={{
            padding: '4px 8px',
            border: '1.5px solid var(--ink)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            background: 'white',
            cursor: 'pointer',
          }}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </div>
    </div>
  );
};

const TableHeader = () => (
  <div className="admin-table-header" style={headerStyle}>
    <div style={{ padding: '10px 16px' }}>Name</div>
    <div style={{ padding: '10px 16px' }}>Email</div>
    <div style={{ padding: '10px 16px' }}>Class</div>
    <div style={{ padding: '10px 16px' }}>Major</div>
    <div style={{ padding: '10px 16px' }}>Joined</div>
    <div style={{ padding: '10px 16px' }}>Role</div>
  </div>
);

const MemberRoster = () => {
  const { user } = useAuth();
  const { data: members, loading } = useFirestoreQuery('members');
  const [search, setSearch] = useState('');

  const applySearch = (list) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(m =>
      (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q)
    );
  };

  const sortAlpha = (list) => [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const pendingMembers = useMemo(() =>
    sortAlpha(applySearch(members.filter(m => m.role === 'pending'))),
  [members, search]);

  const activeMembers = useMemo(() =>
    sortAlpha(applySearch(members.filter(m => m.role === 'member' || m.role === 'officer'))),
  [members, search]);

  const changeRole = async (member, newRole) => {
    if (member.id === user.uid) {
      alert("You can't change your own role.");
      return;
    }

    const oldRole = member.role;

    if (newRole === 'officer' && oldRole !== 'officer') {
      if (!confirm(`Make ${member.name} an officer?`)) return;
    }
    if (oldRole === 'officer' && newRole !== 'officer') {
      if (!confirm(`Remove officer access for ${member.name}?`)) return;
    }

    await updateDoc(doc(db, 'members', member.id), { role: newRole });
  };

  if (loading) return null;

  return (
    <div className="page-container" style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Members" rotate={-1} />

      <div style={{ display: 'flex', gap: 14, marginTop: 24, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search by name or email…"
            style={{
              border: '2px solid var(--ink)', background: 'white',
              padding: '10px 14px 10px 36px',
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15,
              width: 320, boxShadow: '3px 3px 0 var(--ink)', outline: 'none',
            }} />
          <span style={{ position: 'absolute', left: 12, top: 11, fontFamily: "'JetBrains Mono', monospace" }}>&#8981;</span>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
          {members.length} total members
        </span>
      </div>

      {/* Pending members table */}
      {pendingMembers.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, margin: 0 }}>pending approval</h3>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
              {pendingMembers.length} request{pendingMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ border: '2px solid var(--ink)', background: 'white', boxShadow: '4px 4px 0 var(--tape)' }}>
            <TableHeader />
            {pendingMembers.map((member, i) => (
              <MemberRow key={member.id} member={member} isYou={member.id === user?.uid} user={user} changeRole={changeRole} i={i} />
            ))}
          </div>
        </div>
      )}

      {/* Active members & officers table */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, margin: 0 }}>members &amp; officers</h3>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
            {activeMembers.length} active
          </span>
        </div>
        <div style={{ border: '2px solid var(--ink)', background: 'white', boxShadow: '6px 6px 0 var(--ink)' }}>
          <TableHeader />
          {activeMembers.map((member, i) => (
            <MemberRow key={member.id} member={member} isYou={member.id === user?.uid} user={user} changeRole={changeRole} i={i} />
          ))}
          {activeMembers.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
              no members found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberRoster;
