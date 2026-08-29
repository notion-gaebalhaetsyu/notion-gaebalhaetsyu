'use server'

import { getCurrentUser } from '@/utils/firebase/server-auth'
import { adminDb } from '@/utils/firebase/admin'
import { db } from '@/utils/firebase/client'
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@/utils/firebase/types'

export interface UpdateProfilePayload {
  nickname: string
  bio_short?: string
  bio_long?: string
  character_image_url?: string
  skills?: string[]
  cohort_code?: string
}

export async function updateProfileAction(payload: UpdateProfilePayload) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.id || !user.email) {
      return { error: '로그인이 필요합니다. 먼저 로그인해 주세요.' }
    }

    const nickname = payload.nickname.trim()
    if (!nickname) {
      return { error: '닉네임은 필수 입력 항목입니다.' }
    }

    const now = new Date().toISOString()
    const userEmail = user.email.toLowerCase().trim()
    let shouldGrantCohort = false
    let grantedCohort = ''
    let grantedRole: UserRole | null = null

    // 1. 가입/초대 코드 검증 (코드가 입력된 경우)
    const code = payload.cohort_code?.trim()
    if (code && code !== '개발했슈 1기 인증됨') {
      let inviteData: any = null
      let inviteAdminDoc: any = null
      let inviteClientDoc: any = null

      if (adminDb) {
        try {
          const snapshot = await adminDb.collection('cohort_invites')
            .where('code', '==', code)
            .limit(1)
            .get()
          if (!snapshot.empty) {
            inviteAdminDoc = snapshot.docs[0].ref
            inviteData = snapshot.docs[0].data()
          } else {
            // 대소문자 무시 전체 탐색
            const allSnap = await adminDb.collection('cohort_invites').get()
            for (const d of allSnap.docs) {
              const dData = d.data()
              if (dData.code?.trim().toLowerCase() === code.toLowerCase()) {
                inviteAdminDoc = d.ref
                inviteData = dData
                break
              }
            }
          }
        } catch (e) {
          console.warn('adminDb cohort_invites query error:', e)
        }
      }

      if (!inviteData) {
        try {
          const invitesRef = collection(db, 'cohort_invites')
          const q = query(invitesRef, where('code', '==', code))
          const snapshot = await getDocs(q)
          if (!snapshot.empty) {
            inviteClientDoc = doc(db, 'cohort_invites', snapshot.docs[0].id)
            inviteData = snapshot.docs[0].data()
          } else {
            const allSnap = await getDocs(invitesRef)
            for (const d of allSnap.docs) {
              const dData = d.data()
              if (dData.code?.trim().toLowerCase() === code.toLowerCase()) {
                inviteClientDoc = doc(db, 'cohort_invites', d.id)
                inviteData = dData
                break
              }
            }
          }
        } catch (e) {
          console.warn('client db cohort_invites query error:', e)
        }
      }

      if (!inviteData) {
        return { error: '유효하지 않은 가입 해시코드입니다. 코드를 다시 확인해 주세요.' }
      }

      // 중복 사용 검증
      if (inviteData.is_used && inviteData.used_by && inviteData.used_by !== user.id) {
        return { error: '이미 다른 사용자가 인증에 사용 완료한 해시코드입니다.' }
      }

      // 이메일 검증
      if (inviteData.email?.toLowerCase().trim() !== userEmail) {
        return {
          error: '코드가 일치하지 않으니 관리자에게 문의해주세요.'
        }
      }

      shouldGrantCohort = true
      grantedCohort = inviteData.cohort || '개발했슈 1기'
      grantedRole = (inviteData.role as UserRole) || 'provider'

      // 초대 코드 사용 처리
      if (adminDb && inviteAdminDoc) {
        await inviteAdminDoc.update({
          is_used: true,
          used_by: user.id,
          used_at: now,
        })
      } else if (inviteClientDoc) {
        await updateDoc(inviteClientDoc, {
          is_used: true,
          used_by: user.id,
          used_at: now,
        })
      }
    }

    // 2. creator_profiles 생성 / 업데이트
    const profileData: any = {
      id: user.id,
      user_id: user.id,
      nickname,
      bio_short: payload.bio_short?.trim() || '',
      bio_long: payload.bio_long?.trim() || '',
      character_image_url: payload.character_image_url || '',
      skills: payload.skills || [],
      updated_at: now,
    }

    if (shouldGrantCohort && grantedCohort) {
      profileData.cohort = grantedCohort
    }

    if (adminDb) {
      const creatorRef = adminDb.collection('creator_profiles').doc(user.id)
      const existingCreator = await creatorRef.get()
      if (!existingCreator.exists) {
        profileData.created_at = now
      }
      await creatorRef.set(profileData, { merge: true })

      // users 컬렉션 동기화 (문서 ID: 이메일)
      const userRef = adminDb.collection('users').doc(userEmail)
      const userUpdatePayload: any = {
        name: nickname,
        avatar_url: payload.character_image_url || user.avatar_url || '',
        updated_at: now,
      }
      if (user.role !== 'admin' && grantedRole) {
        userUpdatePayload.role = grantedRole
      }
      await userRef.set(userUpdatePayload, { merge: true })
    } else {
      const creatorRef = doc(db, 'creator_profiles', user.id)
      const existingCreator = await getDoc(creatorRef)
      if (!existingCreator.exists()) {
        profileData.created_at = now
      }
      await setDoc(creatorRef, profileData, { merge: true })

      const userRef = doc(db, 'users', userEmail)
      const userUpdatePayload: any = {
        name: nickname,
        avatar_url: payload.character_image_url || user.avatar_url || '',
        updated_at: now,
      }
      if (user.role !== 'admin' && grantedRole) {
        userUpdatePayload.role = grantedRole
      }
      await setDoc(userRef, userUpdatePayload, { merge: true })
    }

    revalidatePath('/')
    revalidatePath('/mypage')
    revalidatePath('/mypage/edit')
    revalidatePath('/creators')
    revalidatePath('/admin')

    const message = shouldGrantCohort 
      ? `[${grantedCohort}] 제작자 인증 및 프로필 저장이 완료되었슈! 🎉`
      : '프로필이 성공적으로 저장되었슈! 🍕'

    return { success: true, message }
  } catch (error: any) {
    console.error('updateProfileAction error:', error)
    return { error: error.message || '프로필 저장 중 오류가 발생했습니다.' }
  }
}
