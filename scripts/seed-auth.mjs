// Create Auth emulator accounts matching the seeded Firestore member docs.
// seed-emulator.mjs only writes Firestore docs — this gives you logins to test with.
// Run: node scripts/seed-auth.mjs
// Requires: emulators running (npm run emulators)

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const app = initializeApp({ projectId: 'uhppa-10bcb' });
const auth = getAuth(app);

const users = [
  { uid: 'test-officer-1', email: 'officer@test.com', role: 'officer' },
  { uid: 'test-member-1',  email: 'casey@test.com',   role: 'member'  },
];

for (const { uid, email, role } of users) {
  try {
    await auth.createUser({ uid, email, password: 'test1234', emailVerified: true });
  } catch (e) {
    if (e.code !== 'auth/uid-already-exists') throw e;
  }
  await auth.setCustomUserClaims(uid, { role });
  console.log(`✓ ${email} (${role}) / test1234`);
}
process.exit(0);
