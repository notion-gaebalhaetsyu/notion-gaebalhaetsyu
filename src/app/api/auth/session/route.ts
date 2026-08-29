import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/utils/firebase/admin';
import { db } from '@/utils/firebase/client';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserRole } from '@/utils/firebase/types';

export const dynamic = 'force-dynamic';

function checkIsAdminEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const envAdminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim().toLowerCase();

  return envAdminEmails.includes(normalized) || (!!clientEmail && clientEmail === normalized);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;

    if (!uid || !email) {
      return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = checkIsAdminEmail(normalizedEmail);
    const now = new Date().toISOString();
    let assignedRole: UserRole = isAdmin ? 'admin' : 'visitor';

    // 1. users 컬렉션 및 cohort_invites 확인하여 역할 결정 및 동기화
    if (adminDb) {
      try {
        const userRef = adminDb.collection('users').doc(uid);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
          const existingData = userSnap.data();
          if (isAdmin) {
            assignedRole = 'admin';
          } else if (existingData?.role) {
            assignedRole = existingData.role as UserRole;
          }

          await userRef.update({
            name: displayName || existingData?.name || email.split('@')[0],
            avatar_url: photoURL || existingData?.avatar_url || '',
            role: assignedRole,
            updated_at: now,
          });
        } else {
          // 신규 유저인 경우 초대 목록에 admin/provider가 있는지 확인
          if (!isAdmin) {
            try {
              const inviteSnap = await adminDb.collection('cohort_invites')
                .where('email', '==', normalizedEmail)
                .limit(1)
                .get();
              if (!inviteSnap.empty) {
                const inviteData = inviteSnap.docs[0].data();
                if (inviteData.role) {
                  assignedRole = inviteData.role as UserRole;
                }
              }
            } catch (e) {
              console.warn('Could not query cohort_invites in adminDb:', e);
            }
          }

          await userRef.set({
            id: uid,
            email: normalizedEmail,
            name: displayName || email.split('@')[0],
            avatar_url: photoURL || '',
            role: assignedRole,
            created_at: now,
            updated_at: now,
          });
        }
      } catch (e) {
        console.warn('adminDb user update failed, falling back to client db:', e);
      }
    } else {
      // Client Firestore fallback
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const existingData = userSnap.data();
          if (isAdmin) {
            assignedRole = 'admin';
          } else if (existingData?.role) {
            assignedRole = existingData.role as UserRole;
          }

          await updateDoc(userRef, {
            name: displayName || existingData?.name || email.split('@')[0],
            avatar_url: photoURL || existingData?.avatar_url || '',
            role: assignedRole,
            updated_at: now,
          });
        } else {
          if (!isAdmin) {
            try {
              const inviteQ = query(collection(db, 'cohort_invites'), where('email', '==', normalizedEmail));
              const inviteSnap = await getDocs(inviteQ);
              if (!inviteSnap.empty) {
                const inviteData = inviteSnap.docs[0].data();
                if (inviteData.role) {
                  assignedRole = inviteData.role as UserRole;
                }
              }
            } catch (e) {
              console.warn('Could not query cohort_invites in client db:', e);
            }
          }

          await setDoc(userRef, {
            id: uid,
            email: normalizedEmail,
            name: displayName || email.split('@')[0],
            avatar_url: photoURL || '',
            role: assignedRole,
            created_at: now,
            updated_at: now,
          });
        }
      } catch (e) {
        console.warn('client db user update failed:', e);
      }
    }

    // 2. 세션 쿠키 설정
    const sessionData = JSON.stringify({
      uid,
      email: normalizedEmail,
      name: displayName,
      avatar_url: photoURL,
      role: assignedRole,
    });

    const cookieStore = await cookies();
    cookieStore.set('firebase_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });

    const redirectUrl = assignedRole === 'admin' ? '/admin' : '/mypage';

    return NextResponse.json({ 
      success: true, 
      role: assignedRole, 
      redirectUrl 
    });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
