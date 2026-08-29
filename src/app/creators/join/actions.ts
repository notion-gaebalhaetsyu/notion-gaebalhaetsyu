'use server'

import { getCurrentUser } from '@/utils/firebase/server-auth'
import { adminDb } from '@/utils/firebase/admin'
import { revalidatePath } from 'next/cache'

export async function verifyJoinCode(formData: FormData) {
  const code = (formData.get('code') as string)?.trim()
  const nickname = (formData.get('nickname') as string)?.trim()

  if (!code || !nickname) {
    return { error: '닉네임과 가입 해시코드를 모두 입력해 주세유!' }
  }

  // 1. 현재 구글 로그인된 유저 확인
  const user = await getCurrentUser()
  if (!user || !user.email) {
    return { error: '먼저 구글 로그인을 진행해 주세유!' }
  }

  if (!adminDb) {
    return { error: '데이터베이스 연결에 실패했슈. 관리자 설정을 확인해 주세유.' }
  }

  try {
    const userEmail = user.email.toLowerCase().trim()

    // 2. Firestore의 cohort_invites 컬렉션에서 해시코드로 조회
    const invitesRef = adminDb.collection('cohort_invites')
    const snapshot = await invitesRef.where('code', '==', code).get()

    if (snapshot.empty) {
      return { error: '유효하지 않은 가입 해시코드입니다. 코드를 다시 확인해 주세유!' }
    }

    const inviteDoc = snapshot.docs[0]
    const inviteData = inviteDoc.data()

    // 3. 중복 사용 여부 검증 (이미 다른 사용자가 인증한 코드인지 확인)
    if (inviteData.is_used && inviteData.used_by !== user.id) {
      return { error: '이미 다른 사용자가 인증에 사용 완료한 해시코드입니다.' }
    }

    // 4. 구글 이메일 일치 여부 검증 (대소문자 무시)
    if (inviteData.email?.toLowerCase().trim() !== userEmail) {
      return { 
        error: `로그인된 구글 계정(${user.email})과 사전 등록된 이메일이 일치하지 않습니다.` 
      }
    }

    // 5. 닉네임 일치 여부 검증 (공백 제거 후 비교)
    if (inviteData.nickname?.trim() !== nickname) {
      return { 
        error: `사전 등록된 닉네임(${inviteData.nickname})과 입력한 닉네임(${nickname})이 일치하지 않습니다.` 
      }
    }

    const now = new Date().toISOString()
    const cohortName = inviteData.cohort || '개발했슈 1기'

    // 6. 초대 코드 사용 처리 (중복 방지)
    await inviteDoc.ref.update({
      is_used: true,
      used_by: user.id,
      used_at: now,
    })

    // 7. creator_profiles 생성 및 기수 등록
    const creatorRef = adminDb.collection('creator_profiles').doc(user.id)
    const existingProfile = await creatorRef.get()

    await creatorRef.set({
      id: user.id,
      user_id: user.id,
      nickname: inviteData.nickname,
      cohort: cohortName,
      bio_short: existingProfile.exists && existingProfile.data()?.bio_short 
        ? existingProfile.data()?.bio_short 
        : `${cohortName} 제작자입니다 🍕`,
      created_at: existingProfile.exists && existingProfile.data()?.created_at 
        ? existingProfile.data()?.created_at 
        : now,
      updated_at: now,
    }, { merge: true })

    // 8. users 컬렉션 role을 'creator'로 승급
    await adminDb.collection('users').doc(user.id).set({
      role: 'creator',
      name: inviteData.nickname,
      updated_at: now,
    }, { merge: true })

    revalidatePath('/')
    revalidatePath('/mypage')
    revalidatePath('/creators')
    revalidatePath('/creators/join')
    return { success: true, message: `${cohortName} 제작자 인증이 성공적으로 완료되었슈! 🎉` }
  } catch (error: any) {
    console.error('Creator join error:', error)
    return { error: error.message || '인증 처리 중 오류가 발생했슈.' }
  }
}

