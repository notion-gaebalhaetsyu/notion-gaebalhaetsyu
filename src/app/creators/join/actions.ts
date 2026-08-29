'use server'

import { getCurrentUser } from '@/utils/firebase/server-auth'
import { adminDb } from '@/utils/firebase/admin'
import { db } from '@/utils/firebase/client'
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore'
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

  try {
    const userEmail = user.email.toLowerCase().trim()
    let inviteData: any = null
    let inviteAdminRef: any = null
    let inviteClientRef: any = null

    if (adminDb) {
      try {
        const invitesRef = adminDb.collection('cohort_invites')
        const snapshot = await invitesRef.where('code', '==', code).get()
        if (!snapshot.empty) {
          inviteAdminRef = snapshot.docs[0].ref
          inviteData = snapshot.docs[0].data()
        }
      } catch (e) {
        console.warn('adminDb query failed, falling back to client db:', e)
      }
    }

    if (!inviteData) {
      try {
        const invitesRef = collection(db, 'cohort_invites')
        const q = query(invitesRef, where('code', '==', code))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          inviteClientRef = doc(db, 'cohort_invites', snapshot.docs[0].id)
          inviteData = snapshot.docs[0].data()
        } else {
          // Fallback: 전체 문서를 조회하여 공백 무시 비교
          const allSnap = await getDocs(invitesRef)
          for (const docSnap of allSnap.docs) {
            const data = docSnap.data()
            if (data.code?.trim() === code) {
              inviteClientRef = doc(db, 'cohort_invites', docSnap.id)
              inviteData = data
              break
            }
          }
        }
      } catch (e) {
        console.warn('client db query failed:', e)
      }
    }

    if (!inviteData) {
      return { error: '유효하지 않은 가입 해시코드입니다. 코드를 다시 확인해 주세유!' }
    }

    // 3. 중복 사용 여부 검증 (이미 다른 사용자가 인증한 코드인지 확인)
    if (inviteData.is_used && inviteData.used_by !== user.id) {
      return { error: '이미 다른 사용자가 인증에 사용 완료한 해시코드입니다.' }
    }

    // 4. 구글 이메일 일치 여부 검증 (대소문자 무시)
    if (inviteData.email?.toLowerCase().trim() !== userEmail) {
      return { 
        error: `로그인된 구글 계정(${user.email})과 사전 등록된 이메일(${inviteData.email})이 일치하지 않습니다.` 
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
    const grantedRole = inviteData.role || 'provider'

    if (adminDb && inviteAdminRef) {
      // 6. 초대 코드 사용 처리 (중복 방지)
      await inviteAdminRef.update({
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

      // 8. users 컬렉션 role을 부여된 역할로 승급
      await adminDb.collection('users').doc(user.id).set({
        role: grantedRole,
        name: inviteData.nickname,
        updated_at: now,
      }, { merge: true })
    } else if (inviteClientRef) {
      // Client Firestore fallback
      await updateDoc(inviteClientRef, {
        is_used: true,
        used_by: user.id,
        used_at: now,
      })

      const creatorRef = doc(db, 'creator_profiles', user.id)
      const existingProfile = await getDoc(creatorRef)

      await setDoc(creatorRef, {
        id: user.id,
        user_id: user.id,
        nickname: inviteData.nickname,
        cohort: cohortName,
        bio_short: existingProfile.exists() && existingProfile.data()?.bio_short 
          ? existingProfile.data()?.bio_short 
          : `${cohortName} 제작자입니다 🍕`,
        created_at: existingProfile.exists() && existingProfile.data()?.created_at 
          ? existingProfile.data()?.created_at 
          : now,
        updated_at: now,
      }, { merge: true })

      const userRef = doc(db, 'users', user.id)
      await setDoc(userRef, {
        role: grantedRole,
        name: inviteData.nickname,
        updated_at: now,
      }, { merge: true })
    }

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


