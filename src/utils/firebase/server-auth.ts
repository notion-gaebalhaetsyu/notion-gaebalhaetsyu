import { cookies } from 'next/headers';
import { adminAuth, adminDb } from './admin';
import { DbUser, UserRole } from './types';

export interface ServerUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
}

function checkIsAdminEmail(email?: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const envAdminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim().toLowerCase();

  return envAdminEmails.includes(normalized) || (!!clientEmail && clientEmail === normalized);
}

export async function getCurrentUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase_session')?.value;

    if (!sessionCookie) {
      return null;
    }

    // 세션 쿠키 파싱
    let parsedSession: { uid: string; email: string; name?: string; avatar_url?: string; role?: UserRole } | null = null;
    try {
      parsedSession = JSON.parse(sessionCookie);
    } catch {
      // If it's a raw JWT token, attempt to verify with adminAuth
      if (adminAuth) {
        try {
          const decoded = await adminAuth.verifyIdToken(sessionCookie);
          parsedSession = {
            uid: decoded.uid,
            email: decoded.email || '',
            name: decoded.name,
            avatar_url: decoded.picture,
          };
        } catch (e) {
          console.error('Error verifying Firebase token:', e);
          return null;
        }
      }
    }

    if (!parsedSession || !parsedSession.uid) {
      return null;
    }

    // Firestore에서 유저의 최신 역할(role) 조회
    let role: UserRole = 'visitor';

    if (checkIsAdminEmail(parsedSession.email)) {
      role = 'admin';
    } else if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(parsedSession.uid).get();
        if (userDoc.exists) {
          const data = userDoc.data() as DbUser;
          role = data.role || parsedSession.role || 'visitor';
        } else if (parsedSession.role) {
          role = parsedSession.role;
        }
      } catch (e) {
        console.warn('Could not fetch user role from adminDb, defaulting to session or visitor:', e);
        role = parsedSession.role || 'visitor';
      }
    } else {
      try {
        const { db } = await import('./client');
        const { doc, getDoc } = await import('firebase/firestore');
        const userSnap = await getDoc(doc(db, 'users', parsedSession.uid));
        if (userSnap.exists()) {
          const data = userSnap.data() as DbUser;
          role = data.role || parsedSession.role || 'visitor';
        } else if (parsedSession.role) {
          role = parsedSession.role;
        }
      } catch (e) {
        console.warn('Could not fetch user role from client db:', e);
        role = parsedSession.role || 'visitor';
      }
    }

    return {
      id: parsedSession.uid,
      email: parsedSession.email,
      name: parsedSession.name,
      avatar_url: parsedSession.avatar_url,
      role,
    };
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('getCurrentUser error:', error);
    return null;
  }
}

