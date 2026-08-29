'use server'

import { getCurrentUser } from '@/utils/firebase/server-auth'
import { adminDb } from '@/utils/firebase/admin'
import { db } from '@/utils/firebase/client'
import { collection, addDoc, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore'
import { UserRole } from '@/utils/firebase/types'
import { revalidatePath } from 'next/cache'

// 랜덤 고유 해시코드 생성 헬퍼 (예: dev1_8f9c2a)
function generateRandomCode(prefix: string = 'dev1'): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let randomStr = ''
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}_${randomStr}`
}

// 1. 단일 초대 코드 생성 액션
export async function addInviteAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  const nickname = (formData.get('nickname') as string)?.trim()
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const cohort = (formData.get('cohort') as string)?.trim() || '개발했슈 1기'
  const role = ((formData.get('role') as string) || 'provider') as UserRole
  let code = (formData.get('code') as string)?.trim()

  if (!nickname || !email) {
    return { error: '닉네임과 이메일은 필수 입력 항목입니다.' }
  }

  if (!code) {
    code = generateRandomCode(cohort.includes('1') ? 'dev1' : 'dev')
  }

  const now = new Date().toISOString()
  const payload = {
    nickname,
    email,
    code,
    cohort,
    role,
    is_used: false,
    used_by: null,
    used_at: null,
    created_at: now,
  }

  try {
    if (adminDb) {
      await adminDb.collection('cohort_invites').doc(email).set(payload, { merge: true })
    } else {
      await setDoc(doc(db, 'cohort_invites', email), payload, { merge: true })
    }

    revalidatePath('/admin')
    return { success: true, message: `[${nickname}] 님의 초대 코드(${code})가 성공적으로 발급되었습니다!` }
  } catch (e: any) {
    console.error('addInviteAction error:', e)
    return { error: e.message || '초대 코드 생성 중 오류가 발생했습니다.' }
  }
}

// 2. 다중/일괄 초대 코드 등록 액션 (텍스트 붙여넣기 방식)
export async function bulkAddInvitesAction(
  rawText: string, 
  cohort: string = '개발했슈 1기', 
  role: UserRole = 'provider'
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  if (!rawText.trim()) {
    return { error: '등록할 사용자 목록 텍스트를 입력해 주세요.' }
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
  const results: string[] = []
  const now = new Date().toISOString()

  let successCount = 0

  for (const line of lines) {
    // 지원 포맷: "닉네임, 이메일" 또는 "닉네임 이메일" 또는 "닉네임/이메일"
    const parts = line.split(/[,/\t]+/).map(p => p.trim()).filter(Boolean)
    if (parts.length < 2) continue

    const nickname = parts[0]
    const email = parts[1].toLowerCase()
    const code = generateRandomCode(cohort.includes('1') ? 'dev1' : 'dev')

    const payload = {
      nickname,
      email,
      code,
      cohort,
      role,
      is_used: false,
      used_by: null,
      used_at: null,
      created_at: now,
    }

    try {
      if (adminDb) {
        await adminDb.collection('cohort_invites').doc(email).set(payload, { merge: true })
      } else {
        await setDoc(doc(db, 'cohort_invites', email), payload, { merge: true })
      }
      successCount++
      results.push(`${nickname} (${email}): ${code}`)
    } catch (e) {
      console.error(`Failed to add invite for ${nickname}`, e)
    }
  }

  revalidatePath('/admin')
  return { 
    success: true, 
    count: successCount, 
    message: `총 ${successCount}건의 초대 코드가 일괄 생성되었습니다!`,
    results 
  }
}

// 3. 초대 코드 삭제 액션
export async function deleteInviteAction(inviteId: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  try {
    if (adminDb) {
      await adminDb.collection('cohort_invites').doc(inviteId).delete()
    } else {
      await deleteDoc(doc(db, 'cohort_invites', inviteId))
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (e: any) {
    console.error('deleteInviteAction error:', e)
    return { error: e.message || '초대 코드 삭제 중 오류가 발생했습니다.' }
  }
}

// 4. 회원 권한 변경 액션
export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다.' }
  }

  try {
    const now = new Date().toISOString()
    if (adminDb) {
      await adminDb.collection('users').doc(userId).update({
        role: newRole,
        updated_at: now,
      })
    } else {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updated_at: now,
      })
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (e: any) {
    console.error('updateUserRoleAction error:', e)
    return { error: e.message || '회원 권한 변경 중 오류가 발생했습니다.' }
  }
}
