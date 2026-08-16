import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/admin/approvals', label: 'Approvals' },
  { path: '/admin/events',    label: 'Events' },
  { path: '/admin/points',    label: 'Points' },
  { path: '/admin/members',   label: 'Members' },
];

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap',
    }}>
      {tabs.map(t => {
        const active = location.pathname === t.path;
        return (
          <button key={t.path} onClick={() => navigate(t.path)} style={{
            padding: '8px 16px',
            border: '2px solid var(--ink)',
            background: active ? 'var(--ink)' : 'white',
            color: active ? 'var(--paper)' : 'var(--ink)',
            fontFamily: "'Archivo Black', sans-serif",
            letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
            cursor: 'pointer',
            boxShadow: active ? '3px 3px 0 var(--pink)' : '3px 3px 0 var(--ink)',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
};

export default AdminNav;
