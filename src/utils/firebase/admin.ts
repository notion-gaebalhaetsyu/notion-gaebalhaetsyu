import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    // Only initialize Admin SDK if full service account credentials (email and private key) are provided
    if (clientEmail && privateKey && projectId) {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      // In development or when service account key is not set, adminApp will be null and fallback to client SDK
      if (!privateKey && process.env.NODE_ENV !== 'production') {
        console.info('[Firebase Admin] Service account private key is not configured. Falling back to Client SDK for database operations.');
      }
    }
  } catch (error) {
    console.warn('Firebase Admin SDK initialization warning:', error);
  }

  return null;
}

const adminApp = getAdminApp();
const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || 'gaebalhatsyu-members';

export const adminAuth = adminApp ? admin.auth(adminApp) : null;
export const adminDb = adminApp
  ? (databaseId && databaseId !== '(default)' ? getFirestore(adminApp, databaseId) : admin.firestore(adminApp))
  : null;

