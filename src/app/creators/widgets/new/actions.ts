'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 카테고리 목록을 가져오는 함수 (폼 렌더링용)
export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  return data
}

// 폼 데이터를 받아 위젯을 등록하는 함수
export async function createWidget(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const category_id = formData.get('category_id') as string
  const short_description = formData.get('short_description') as string
  const embed_url = formData.get('embed_url') as string
  const tagsString = formData.get('tags') as string

  // 필수 값 검증
  if (!name || !slug || !category_id || !short_description || !embed_url) {
    return { error: '필수 항목을 모두 입력해 주세유!' }
  }

  const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : []

  const supabase = await createClient()

  try {
    // 1. 로그인 유저 확인 및 제빵사(Creator) 프로필 조회
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '먼저 로그인을 진행해주세유!' }
    }

    const { data: creatorProfile, error: profileError } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !creatorProfile) {
      return { error: '제빵사 인증을 아직 안 하셨슈. 인증을 먼저 진행해주세유!' }
    }

    // 2. 위젯 DB에 삽입 (status는 임시로 즉시 배포인 'published' 사용)
    const { data: newWidget, error: insertError } = await supabase
      .from('widgets')
      .insert({
        name,
        slug,
        category_id,
        creator_profile_id: creatorProfile.id,
        short_description,
        embed_url,
        tags,
        status: 'published',
      })
      .select()
      .single()

    if (insertError) {
      // UNIQUE 제약 조건(slug 중복 등) 에러 처리
      if (insertError.code === '23505') {
        return { error: '이미 사용 중인 주소(Slug)에유. 다른 주소를 입력해주세유!' }
      }
      console.error('Error inserting widget:', insertError)
      return { error: '빵을 굽는 중 에러가 났슈 🥲 관리자에게 문의해주세유.' }
    }

    // 3. 메인 홈 진열대(목록) 갱신
    revalidatePath('/')

    return { success: true, slug: newWidget.slug }

  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: '알 수 없는 오류가 발생했슈.' }
  }
}
