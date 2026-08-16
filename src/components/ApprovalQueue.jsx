import { SectionHeading } from './Primitives';
import AdminNav from './AdminNav';
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
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
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
