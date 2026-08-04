'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function verifyJoinCode(formData: FormData) {
  const cohort = formData.get('cohort') as string
  const code = formData.get('code') as string

  if (!cohort || !code) {
    return { error: '기수와 코드를 모두 입력해 주세유!' }
  }

  const supabase = await createClient()
  
  // 1. 로그인된 유저 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '먼저 구글 로그인을 해주세유!' }

  // 2. 가입 코드 임시 확인 (실제 운영 시 DB 조회로 변경)
  if (code !== 'dev1234') {
    return { error: '코드가 일치하지 않슈. 다시 확인해보슈!' }
  }

  // 3. 제빵사 프로필 생성 (이미 있으면 무시)
  // 닉네임은 구글 이메일의 앞부분으로 임시 생성
  const nickname = user.email ? user.email.split('@')[0] : `baker_${user.id.substring(0,5)}`
  
  const { error: profileError } = await supabase
    .from('creator_profiles')
    .insert({
      user_id: user.id,
      nickname: nickname,
      bio_short: '방금 가입한 초보 제빵사입니다.',
    })

  if (profileError) {
    // 중복 닉네임 에러나 이미 가입된 경우 처리
    console.error('Profile creation error:', profileError)
    if (profileError.code !== '23505') { // 23505 is unique violation
      return { error: '프로필 생성 중 오류가 발생했슈.' }
    }
  }

  // 4. 유저 권한(role)을 creator로 승급
  const { error: roleError } = await supabase
    .from('users')
    .update({ role: 'creator' })
    .eq('id', user.id)

  if (roleError) {
    console.error('Role update error:', roleError)
    return { error: '권한 부여 중 오류가 발생했슈.' }
  }

  // 5. 성공 처리
  return { success: true, message: '제빵사 인증 완료! 환영해유!' }
}
