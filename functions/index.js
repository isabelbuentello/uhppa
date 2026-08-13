import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp();

export const onMemberRoleChange = onDocumentUpdated('members/{uid}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.role === after.role) return;

  const uid = event.params.uid;
  await getAuth().setCustomUserClaims(uid, { role: after.role });
  console.log(`Set role=${after.role} for user ${uid}`);
});
