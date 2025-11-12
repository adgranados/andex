import * as admin from 'firebase-admin';

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.warn('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is not set. Admin SDK calls will fail.');
}

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

export const adminAuth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
export const db = admin.apps.length ? admin.firestore() : ({} as admin.firestore.Firestore);
