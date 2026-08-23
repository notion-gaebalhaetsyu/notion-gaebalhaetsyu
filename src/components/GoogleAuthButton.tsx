"use client";

import { useState } from 'react';
import { auth } from '@/utils/firebase/client';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function GoogleAuthButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create session');
      }

      window.location.href = '/mypage/edit';
    } catch (error: any) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup
        return;
      }
      alert('로그인 중 문제가 발생했습니다: ' + (error.message || '다시 시도해 주세요.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full py-3 rounded-xl bg-white border-2 border-forest-green text-forest-green font-bold flex items-center justify-center gap-2 hover:bg-forest-green/5 transition-colors disabled:opacity-50"
    >
      <span className="text-lg font-black">G</span>
      <span>{loading ? '로그인 중...' : '구글로 시작하기'}</span>
    </button>
  );
}
