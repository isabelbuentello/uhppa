import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, collection, query, onSnapshot } from 'firebase/firestore';

/**
 * Live-updating single document read.
 */
export function useFirestoreDoc(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, collectionName, docId), (snap) => {
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [collectionName, docId]);

  return { data, loading };
}

/**
 * Live-updating collection query.
 * Pass Firestore query constraints (where, orderBy, limit, etc.) as the second arg.
 */
export function useFirestoreQuery(collectionName, constraints = [], key = '') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [collectionName, key]);

  return { data, loading };
}
