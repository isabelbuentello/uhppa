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
