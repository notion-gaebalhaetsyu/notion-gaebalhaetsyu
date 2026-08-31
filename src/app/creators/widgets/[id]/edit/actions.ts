'use server'

import { getCategories as fetchCategories, getCreatorProfileByUserId, getWidgetById, deleteWidget } from '@/utils/firebase/db'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import { adminDb } from '@/utils/firebase/admin'
import { db } from '@/utils/firebase/client'
import { doc, updateDoc, setDoc } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  return await fetchCategories()
}

export async function updateWidget(widgetId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const github_url = (formData.get('github_url') as string)?.trim() || ''
  const category_ids_raw = (formData.get('category_ids') as string)?.trim()
  const category_id_raw = (formData.get('category_id') as string)?.trim()
  const cohort = (formData.get('cohort') as string)?.trim()
  const short_description = (formData.get('short_description') as string)?.trim()
  const long_description = (formData.get('long_description') as string)?.trim()
  const creator_comment = (formData.get('creator_comment') as string)?.trim()
  const embed_url = (formData.get('embed_url') as string)?.trim()
  const tagsString = (formData.get('tags') as string)?.trim()
  const thumbnail_url = (formData.get('thumbnail_url') as string)?.trim() || ''

  // 필수 값 검증
  if (!name || !short_description || !embed_url) {
    return { error: '필수 항목(위젯 이름, 한 줄 소개, 임베드 링크)을 모두 입력해 주세유!' }
  }

  try {
    // 1. 유저 인증 및 권한 확인
    const user = await getCurrentUser()
    if (!user) {
      return { error: '먼저 로그인을 진행해주세유!' }
    }

    if (user.role !== 'provider' && user.role !== 'creator' && user.role !== 'admin') {
      return { error: '위젯 수정 권한이 없습니다.' }
    }

    // 2. 위젯 데이터 조회 및 소유자 확인
    const widget = await getWidgetById(widgetId)
    if (!widget) {
      return { error: '수정하려는 위젯을 찾을 수 없슈.' }
    }

    const creatorProfile = await getCreatorProfileByUserId(user.id)
    const isOwner = 
      widget.creator_profile_id === user.id || 
      (creatorProfile && widget.creator_profile_id === creatorProfile.id) ||
      (user.email && widget.creator_profile_id === user.email.toLowerCase().trim())
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { error: '직접 등록한 위젯만 수정할 수 있슈! (관리자 제외)' }
    }

    // 3. 카테고리 파싱 (다중 선택 지원)
    let category_ids: string[] = []
    if (category_ids_raw) {
      category_ids = category_ids_raw.split(',').map(s => s.trim()).filter(Boolean)
    }
    if (category_ids.length === 0 && category_id_raw) {
      category_ids = [category_id_raw]
    }
    if (category_ids.length === 0) {
      category_ids = widget.category_ids || (widget.category_id ? [widget.category_id] : ['cat_clock'])
    }
    const finalCategoryId = category_ids[0] || widget.category_id || 'cat_clock'

    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : []
    const now = new Date().toISOString()
    const finalCohort = cohort || widget.cohort || creatorProfile?.cohort || (user.role === 'admin' ? '운영진' : '개발했슈 1기')

    const updateData: any = {
      name,
      github_url,
      category_id: finalCategoryId,
      category_ids: category_ids,
      cohort: finalCohort,
      short_description,
      long_description: long_description || '',
      creator_comment: creator_comment || '',
      embed_url,
      thumbnail_url,
      tags,
      updated_at: now,
    }

    // 4. Firestore 업데이트
    if (adminDb) {
      await adminDb.collection('widgets').doc(widget.id).update(updateData)
    } else {
      await updateDoc(doc(db, 'widgets', widget.id), updateData)
    }

    // 5. 캐시 갱신
    revalidatePath('/')
    revalidatePath('/widgets')
    revalidatePath(`/widgets/${widget.slug}`)
    revalidatePath('/mypage')
    revalidatePath('/creators')
    revalidatePath('/admin')

    return { success: true, slug: widget.slug }
  } catch (error: any) {
    console.error('updateWidget error:', error)
    return { error: error.message || '위젯 수정 중 문제가 발생했습니다.' }
  }
}

// 위젯 삭제 액션
export async function deleteWidgetAction(widgetId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: '먼저 로그인을 진행해주세유!' }
    }

    const widget = await getWidgetById(widgetId)
    if (!widget) {
      return { error: '삭제하려는 위젯을 찾을 수 없슈.' }
    }

    const creatorProfile = await getCreatorProfileByUserId(user.id)
    const isOwner = 
      widget.creator_profile_id === user.id || 
      (creatorProfile && widget.creator_profile_id === creatorProfile.id) ||
      (user.email && widget.creator_profile_id === user.email.toLowerCase().trim())
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return { error: '직접 등록한 위젯만 삭제할 수 있슈! (관리자 제외)' }
    }

    const success = await deleteWidget(widget.id)
    if (!success) {
      return { error: '위젯 삭제에 실패했습니다.' }
    }

    revalidatePath('/')
    revalidatePath('/widgets')
    revalidatePath('/mypage')
    revalidatePath('/creators')
    revalidatePath('/admin')

    return { success: true }
  } catch (error: any) {
    console.error('deleteWidgetAction error:', error)
    return { error: error.message || '위젯 삭제 중 오류가 발생했슈.' }
  }
}
