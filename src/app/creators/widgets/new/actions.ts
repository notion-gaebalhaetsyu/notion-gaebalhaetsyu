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
  const name = (formData.get('name') as string)?.trim()
  const github_url = (formData.get('github_url') as string || formData.get('slug') as string)?.trim()
  const category_id = (formData.get('category_id') as string)?.trim()
  const new_category_name = (formData.get('new_category_name') as string)?.trim()
  const short_description = (formData.get('short_description') as string)?.trim()
  const embed_url = (formData.get('embed_url') as string)?.trim()
  const tagsString = (formData.get('tags') as string)?.trim()
  const thumbnail_url = (formData.get('thumbnail_url') as string)?.trim() || ''

  // 필수 값 검증
  if (!name || !github_url || !short_description || !embed_url) {
    return { error: '필수 항목(위젯 이름, 위젯 저장소 링크, 한 줄 소개, 임베드 링크)을 모두 입력해 주세유!' }
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

    // 2. 카테고리는 개발했슈 1기로 기본 고정
    const finalCategoryId = 'cat_cohort_1'

    // 3. 고유 슬러그 및 문서 ID 생성
    let baseSlug = ''
    try {
      if (github_url.startsWith('http://') || github_url.startsWith('https://')) {
        const urlObj = new URL(github_url)
        const pathParts = urlObj.pathname.split('/').filter(Boolean)
        if (pathParts.length > 0) {
          baseSlug = pathParts[pathParts.length - 1]!.replace(/\.git$/i, '')
        }
      }
    } catch (e) {
      // ignore
    }
    if (!baseSlug) {
      baseSlug = name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `widget-${Date.now()}`
    }

    const creatorNickname = creatorProfile?.nickname || user.name || (user.email ? user.email.split('@')[0] : 'creator')
    const safeWidgetSlug = baseSlug.trim().replace(/[\/\\]/g, '-')
    const safeNickname = creatorNickname.trim().replace(/[\/\\]/g, '-')
    const widgetDocId = `${safeWidgetSlug}_${safeNickname}`

    // 슬러그 중복 방지
    let finalSlug = safeWidgetSlug
    if (adminDb) {
      const existing = await adminDb.collection('widgets').where('slug', '==', finalSlug).get()
      if (!existing.empty && existing.docs[0]!.id !== widgetDocId) {
        finalSlug = `${safeWidgetSlug}-${Date.now().toString(36)}`
      }
    }

    const widgetData = {
      id: widgetDocId,
      name,
      slug: finalSlug,
      github_url,
      category_id: finalCategoryId || 'cat_cohort_1',
      creator_profile_id: creatorProfile?.id || user.id,
      short_description,
      embed_url,
      thumbnail_url,
      tags,
      status: 'published', // 기본 즉시 발행
      view_count: 0,
      copy_count: 0,
      like_count: 0,
      created_at: now,
      updated_at: now,
      published_at: now,
    }

    // 4. 위젯 Firestore에 저장 (문서 ID: {widget}_{nickname})
    if (adminDb) {
      await adminDb.collection('widgets').doc(widgetDocId).set(widgetData, { merge: true })
    } else {
      await setDoc(doc(db, 'widgets', widgetDocId), widgetData, { merge: true })
    }

    // 5. 메인 홈 진열대(목록) 갱신
    revalidatePath('/')
    revalidatePath('/widgets')
    revalidatePath('/creators')

    return { success: true, slug: finalSlug }

  } catch (error: any) {
    console.error('Error creating widget:', error)
    return { error: error.message || '피자 위젯을 굽는 중 에러가 났슈 🥲 관리자에게 문의해주세유.' }
  }
}

