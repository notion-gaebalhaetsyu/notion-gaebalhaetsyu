'use server'

import { getCurrentUser } from '@/utils/firebase/server-auth'
import { adminDb } from '@/utils/firebase/admin'
import { db } from '@/utils/firebase/client'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'

export async function verifyJoinCode(formData: FormData) {
  const cohort = formData.get('cohort') as string
  const code = formData.get('code') as string

  if (!cohort || !code) {
    return { error: '기수와 코드를 모두 입력해 주세유!' }
  }

  // 1. 로그인된 유저 확인
  const user = await getCurrentUser()
  if (!user) return { error: '먼저 구글 로그인을 해주세유!' }

  // 2. 가입 코드 임시 확인
  if (code !== 'dev1234') {
    return { error: '코드가 일치하지 않슈. 다시 확인해보슈!' }
  }

  try {
    const now = new Date().toISOString()
    const nickname = user.name || (user.email ? user.email.split('@')[0] : `baker_${user.id.substring(0, 5)}`)

    // 3. 제빵사 프로필 생성 / 업데이트
    if (adminDb) {
      // Check existing profile or create one
      const creatorRef = adminDb.collection('creator_profiles').doc(user.id)
      await creatorRef.set({
        id: user.id,
        user_id: user.id,
        nickname: nickname,
        bio_short: '방금 가입한 초보 제빵사입니다.',
        created_at: now,
        updated_at: now,
      }, { merge: true })

      // 4. 유저 권한(role)을 creator로 승급
      await adminDb.collection('users').doc(user.id).set({
        role: 'creator',
        updated_at: now,
      }, { merge: true })
    } else {
      await setDoc(doc(db, 'creator_profiles', user.id), {
        id: user.id,
        user_id: user.id,
        nickname: nickname,
        bio_short: '방금 가입한 초보 제빵사입니다.',
        created_at: now,
        updated_at: now,
      }, { merge: true })

      await updateDoc(doc(db, 'users', user.id), {
        role: 'creator',
        updated_at: now,
      })
    }

    revalidatePath('/')
    revalidatePath('/mypage')
    return { success: true, message: '제빵사 인증 완료! 환영해유!' }
  } catch (error: any) {
    console.error('Creator join error:', error)
    return { error: error.message || '인증 처리 중 오류가 발생했슈.' }
  }
}
