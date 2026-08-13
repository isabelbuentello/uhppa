// Seed the Firestore emulator with sample data using Admin SDK (bypasses security rules)
// Run: node scripts/seed-emulator.mjs
// Requires: emulators running (npm run emulators)

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const app = initializeApp({ projectId: 'uhppa-10bcb' });
const db = getFirestore(app);

async function seed() {
  // --- Club Info ---
  await db.doc('clubInfo/main').set({
    about: 'The University of Houston Pre-Pharmacy Association supports students pursuing careers in pharmacy — through networking, volunteer opportunities, and pharmacy school application guidance. Since 1995.',
    socials: {
      instagram: 'https://instagram.com/uhppa',
      email: 'uhppa@uh.edu',
      linktree: 'https://linktr.ee/uhppa',
    },
    tagline: 'pharmacy kids, assemble.',
    established: 1995,
    stats: {
      activeMembers: 127,
      yearsRunning: 31,
      eventsPerYear: 52,
      volunteerHours: 2340,
    },
  });
  console.log('✓ clubInfo');

  // --- Events ---
  const events = [
    { id: 'gm-apr02',     title: 'General Meeting',         date: '2026-04-02', category: 'meeting',   points: 10, color: 'pink' },
    { id: 'study-apr07',   title: 'Study Jam',               date: '2026-04-07', category: 'social',    points: 5,  color: 'green' },
    { id: 'vol-apr11',     title: 'Volunteer: Clinic',       date: '2026-04-11', category: 'volunteer', points: 15, color: 'blue' },
    { id: 'exec-apr14',    title: 'Exec Board',              date: '2026-04-14', category: 'board',     points: 8,  color: 'ink' },
    { id: 'gm-apr16',     title: 'General Meeting',         date: '2026-04-16', category: 'meeting',   points: 10, color: 'pink' },
    { id: 'panel-apr20',   title: 'Pharm School Panel',      date: '2026-04-20', category: 'special',   points: 12, color: 'tape' },
    { id: 'kaplan-apr23',  title: 'Kaplan MCAT Q&A',         date: '2026-04-23', category: 'social',    points: 8,  color: 'green' },
    { id: 'blood-apr25',   title: 'Blood Drive',             date: '2026-04-25', category: 'volunteer', points: 20, color: 'pink' },
    { id: 'movie-apr25',   title: 'Movie Night',             date: '2026-04-25', category: 'social',    points: 5,  color: 'blue' },
    { id: 'gm-apr30',     title: 'General Meeting',         date: '2026-04-30', category: 'meeting',   points: 10, color: 'pink' },
    { id: 'banquet-may03', title: 'End-of-yr Banquet',       date: '2026-05-03', category: 'special',   points: 25, color: 'pink' },
    { id: 'cords-may07',  title: 'Cords Ceremony',          date: '2026-05-07', category: 'special',   points: 0,  color: 'tape' },
    { id: 'kickoff-may10', title: 'Summer Kickoff',          date: '2026-05-10', category: 'social',    points: 5,  color: 'green' },
    { id: 'study-may15',  title: 'Study Jam',               date: '2026-05-15', category: 'social',    points: 5,  color: 'green' },
    { id: 'fair-may22',   title: 'Volunteer: Health Fair',   date: '2026-05-22', category: 'volunteer', points: 20, color: 'blue' },
  ];
  for (const e of events) {
    const { id, ...data } = e;
    await db.doc(`events/${id}`).set(data);
  }
  console.log(`✓ events (${events.length})`);

  // --- Officers ---
  const officers = [
    { id: 'pres',   name: 'Priya Sharma',  position: 'President',      bio: 'Senior Chemistry major. Passionate about community pharmacy and mentoring underclassmen.', photoUrl: '', sortOrder: 1, active: true, termYear: '2025-2026' },
    { id: 'vp',     name: 'Marcus Obi',    position: 'Vice President', bio: 'Junior Biology major. Organizes all volunteer events and pharmacy school panels.',         photoUrl: '', sortOrder: 2, active: true, termYear: '2025-2026' },
    { id: 'sec',    name: 'Jamie Lin',     position: 'Secretary',      bio: 'Senior Biology major. Keeps the meeting minutes and manages communications.',              photoUrl: '', sortOrder: 3, active: true, termYear: '2025-2026' },
    { id: 'treas',  name: 'Sam Khoury',    position: 'Treasurer',      bio: 'Sophomore Chemistry major. Manages the budget, sponsors, and fundraising.',                photoUrl: '', sortOrder: 4, active: true, termYear: '2025-2026' },
    { id: 'social', name: 'Destiny R.',    position: 'Social Chair',   bio: 'Junior Neuroscience major. Plans mixers, movie nights, and end-of-year banquet.',           photoUrl: '', sortOrder: 5, active: true, termYear: '2025-2026' },
    { id: 'points', name: 'Alex Tran',     position: 'Points Manager', bio: 'Junior Biology major. Tracks attendance, manages the points system and leaderboard.',      photoUrl: '', sortOrder: 6, active: true, termYear: '2025-2026' },
  ];
  for (const o of officers) {
    const { id, ...data } = o;
    await db.doc(`officers/${id}`).set(data);
  }
  console.log(`✓ officers (${officers.length})`);

  // --- Sponsors ---
  const sponsors = [
    { id: 'cvs',       name: 'CVS Health',              tier: 'gold',   url: 'https://www.cvshealth.com',     logoUrl: '', sortOrder: 1 },
    { id: 'walgreens', name: 'Walgreens',               tier: 'gold',   url: 'https://www.walgreens.com',     logoUrl: '', sortOrder: 2 },
    { id: 'heb',       name: 'H-E-B Pharmacy',          tier: 'silver', url: 'https://www.heb.com/pharmacy',  logoUrl: '', sortOrder: 3 },
    { id: 'kaplan',    name: 'Kaplan Test Prep',         tier: 'silver', url: 'https://www.kaplan.com',        logoUrl: '', sortOrder: 4 },
    { id: 'uhcop',     name: 'UH College of Pharmacy',  tier: 'gold',   url: 'https://www.uh.edu/pharmacy/',  logoUrl: '', sortOrder: 5 },
    { id: 'tsu',       name: 'TSU College of Pharmacy', tier: 'bronze', url: 'https://www.tsu.edu/pharmacy/', logoUrl: '', sortOrder: 6 },
  ];
  for (const s of sponsors) {
    const { id, ...data } = s;
    await db.doc(`sponsors/${id}`).set(data);
  }
  console.log(`✓ sponsors (${sponsors.length})`);

  // --- Gallery ---
  const gallery = [
    { id: 'photo1', caption: 'Spring mixer 2026',         thumbUrl: '', fullUrl: '', sortOrder: 1 },
    { id: 'photo2', caption: 'General meeting — Apr 16',  thumbUrl: '', fullUrl: '', sortOrder: 2 },
    { id: 'photo3', caption: 'Blood drive volunteers',    thumbUrl: '', fullUrl: '', sortOrder: 3 },
    { id: 'photo4', caption: 'Pharm school panel Q&A',    thumbUrl: '', fullUrl: '', sortOrder: 4 },
    { id: 'photo5', caption: 'Study jam crew',            thumbUrl: '', fullUrl: '', sortOrder: 5 },
    { id: 'photo6', caption: 'End-of-year banquet 2025',  thumbUrl: '', fullUrl: '', sortOrder: 6 },
  ];
  for (const g of gallery) {
    const { id, ...data } = g;
    await db.doc(`gallery/${id}`).set(data);
  }
  console.log(`✓ gallery (${gallery.length})`);

  // --- Test Members ---
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

  console.log('\n🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
