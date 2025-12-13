import * as admin from 'firebase-admin';
import { serverEnv } from '@/src/env/server';

// Check if we have credentials; if so, initialize
if (serverEnv.FIREBASE_SERVICE_ACCOUNT_JSON && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serverEnv.FIREBASE_SERVICE_ACCOUNT_JSON))
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Failed:', error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);

// Mock Firestore to prevent build crashes if credentials are missing/invalid during build
const mockFirestore = {
  collection: () => mockFirestore,
  doc: () => mockFirestore,
  get: () => Promise.resolve({ docs: [], exists: false, data: () => ({}) }),
  set: () => Promise.resolve(),
  update: () => Promise.resolve(),
  onSnapshot: () => () => { },
  where: () => mockFirestore,
  orderBy: () => mockFirestore,
  limit: () => mockFirestore,
} as unknown as admin.firestore.Firestore;

export const db = admin.apps.length ? admin.firestore() : mockFirestore;
