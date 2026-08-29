import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummyKeyForBuildEnv123456789012';
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-project.firebaseapp.com';
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project';
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-project.appspot.com';
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012';
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456';

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function initAuth() {
  try {
    return getAuth(app);
  } catch {
    return {} as any;
  }
}

const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;

function initFirestore() {
  try {
    return databaseId && databaseId !== '(default)'
      ? getFirestore(app, databaseId)
      : getFirestore(app);
  } catch {
    return {} as any;
  }
}

function initStorage() {
  try {
    return getStorage(app);
  } catch {
    return {} as any;
  }
}

export const auth = initAuth();
export const db = initFirestore();
export const storage = initStorage();
