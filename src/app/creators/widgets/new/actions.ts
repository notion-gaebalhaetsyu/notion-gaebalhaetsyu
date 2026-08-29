'use server'

import { getCategories as fetchCategories, getCreatorProfileByUserId } from '@/utils/firebase/db'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import { adminDb } from '@/utils/firebase/admin'
import { db } from '@/utils/firebase/client'
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'

// 카테고리 목록을 가져오는 함수 (폼 렌더링용)
export async function getCategories() {
  return await fetchCategories()
}

// 폼 데이터를 받아 위젯을 등록하는 함수
export async function createWidget(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const category_id = formData.get('category_id') as string
  const new_category_name = formData.get('new_category_name') as string
  const short_description = formData.get('short_description') as string
  const embed_url = formData.get('embed_url') as string
  const tagsString = formData.get('tags') as string

  // 필수 값 검증
  if (!name || !slug || !short_description || !embed_url) {
    return { error: '필수 항목을 모두 입력해 주세유!' }
  }

  if (!category_id && !new_category_name) {
    return { error: '카테고리를 선택하거나 새로 입력해 주세유!' }
  }

  const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : []

  try {
    // 1. 로그인 유저 확인 및 제작자/관리자 권한 검증
    const user = await getCurrentUser()
    if (!user) {
      return { error: '먼저 로그인을 진행해주세유!' }
    }

    if (user.role !== 'provider' && user.role !== 'creator' && user.role !== 'admin') {
      return { error: '위젯을 등록할 수 있는 제작자(provider) 권한이 없슈! 먼저 제작자 인증을 진행해 주세유.' }
    }

    let creatorProfile = await getCreatorProfileByUserId(user.id)
    const now = new Date().toISOString()

    // 프로필이 없는 경우 기본 프로필 생성 (문서 ID: 이메일)
    if (!creatorProfile) {
      const userEmail = user.email.toLowerCase().trim()
      const defaultProfile = {
        id: userEmail,
        user_id: user.id,
        email: userEmail,
        nickname: user.name || (user.email ? user.email.split('@')[0] : `제빵사_${user.id.slice(0, 4)}`),
        bio_short: '개발했슈 1기 제빵사입니다 🍕',
        cohort: '개발했슈 1기',
        created_at: now,
        updated_at: now,
      }
      if (adminDb) {
        await adminDb.collection('creator_profiles').doc(userEmail).set(defaultProfile, { merge: true })
      } else {
        await setDoc(doc(db, 'creator_profiles', userEmail), defaultProfile, { merge: true })
      }
      creatorProfile = defaultProfile as any
    }

    // 2. 신규 카테고리 등록 처리
    let finalCategoryId = category_id
    if (category_id === '__new__' && new_category_name && new_category_name.trim()) {
      const trimmedName = new_category_name.trim()
      const catDocId = `cat_${Date.now()}`
      const newCat = {
        id: catDocId,
        name: trimmedName,
        slug: trimmedName.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-'),
        display_order: 10,
      }

      if (adminDb) {
        await adminDb.collection('categories').doc(catDocId).set(newCat)
      } else {
        await setDoc(doc(db, 'categories', catDocId), newCat)
      }
      finalCategoryId = catDocId
    }

    const widgetData = {
      name,
      slug,
      category_id: finalCategoryId || 'cat_cohort_1',
      creator_profile_id: creatorProfile?.id || user.id,
      short_description,
      embed_url,
      tags,
      status: 'published', // 기본 즉시 발행
      view_count: 0,
      copy_count: 0,
      like_count: 0,
      created_at: now,
      updated_at: now,
      published_at: now,
    }

    // 3. 위젯 Firestore에 저장
    if (adminDb) {
      // Slug 중복 체크
      const existing = await adminDb.collection('widgets').where('slug', '==', slug).get()
      if (!existing.empty) {
        return { error: '이미 사용 중인 주소(Slug)에유. 다른 주소를 입력해주세유!' }
      }
      await adminDb.collection('widgets').add(widgetData)
    } else {
      await addDoc(collection(db, 'widgets'), widgetData)
    }

    // 4. 메인 홈 진열대(목록) 갱신
    revalidatePath('/')
    revalidatePath('/widgets')
    revalidatePath('/creators')

    return { success: true, slug }

  } catch (error: any) {
    console.error('Error creating widget:', error)
    return { error: error.message || '피자 위젯을 굽는 중 에러가 났슈 🥲 관리자에게 문의해주세유.' }
  }
}

