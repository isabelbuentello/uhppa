import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';

const SlidesEditor = () => (
  <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <AdminNav />
    <SectionHeading kicker="officer tools" title="Slides" rotate={-1} />
    <div style={{
      marginTop: 28, padding: '40px 28px', textAlign: 'center',
      background: 'white', border: '2px solid var(--ink)',
      boxShadow: '6px 6px 0 var(--ink)',
    }}>
      <div style={{ fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)' }}>
        slides upload coming soon
      </div>
      <div style={{
        marginTop: 12, fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
        color: 'var(--ink-soft)',
      }}>
        waiting on example slide decks from officers
      </div>
    </div>
  </div>
);

export default SlidesEditor;
