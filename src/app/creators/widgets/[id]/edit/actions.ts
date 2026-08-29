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
  const category_id = (formData.get('category_id') as string)?.trim()
  const new_category_name = (formData.get('new_category_name') as string)?.trim()
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

    // 3. 신규 카테고리 처리
    let finalCategoryId = category_id
    if (category_id === '__new__' && new_category_name) {
      const catDocId = `cat_${Date.now()}`
      const newCat = {
        id: catDocId,
        name: new_category_name,
        slug: new_category_name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-'),
        display_order: 10,
      }
      if (adminDb) {
        await adminDb.collection('categories').doc(catDocId).set(newCat)
      } else {
        await setDoc(doc(db, 'categories', catDocId), newCat)
      }
      finalCategoryId = catDocId
    }

    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : []
    const now = new Date().toISOString()

    const updateData: any = {
      name,
      category_id: finalCategoryId || widget.category_id,
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
      await adminDb.collection('widgets').doc(widgetId).update(updateData)
    } else {
      await updateDoc(doc(db, 'widgets', widgetId), updateData)
    }

    // 5. 캐시 갱신
    revalidatePath('/')
    revalidatePath('/widgets')
    revalidatePath(`/widgets/${widget.slug}`)
    revalidatePath('/mypage')
    revalidatePath('/creators')

    return { success: true, slug: widget.slug }
  } catch (error: any) {
    console.error('Error updating widget:', error)
    return { error: error.message || '위젯 수정 중 오류가 발생했슈.' }
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

    const success = await deleteWidget(widgetId)
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
