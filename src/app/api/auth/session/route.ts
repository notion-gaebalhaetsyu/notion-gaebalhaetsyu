import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/utils/firebase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;

    if (!uid || !email) {
      return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 });
    }

    // 1. users 컬렉션에 사용자 등록 또는 업데이트 (기존 role 보존)
    if (adminDb) {
      const userRef = adminDb.collection('users').doc(uid);
      const userSnap = await userRef.get();

      const now = new Date().toISOString();

      if (!userSnap.exists) {
        await userRef.set({
          id: uid,
          email,
          name: displayName || email.split('@')[0],
          avatar_url: photoURL || '',
          role: 'general',
          created_at: now,
          updated_at: now,
        });
      } else {
        await userRef.update({
          name: displayName || email.split('@')[0],
          avatar_url: photoURL || '',
          updated_at: now,
        });
      }
    }

    // 2. 세션 쿠키 설정
    const sessionData = JSON.stringify({
      uid,
      email,
      name: displayName,
      avatar_url: photoURL,
    });

    const cookieStore = await cookies();
    cookieStore.set('firebase_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
