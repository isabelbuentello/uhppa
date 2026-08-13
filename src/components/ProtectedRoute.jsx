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
