import { adminDb } from './admin';
import { db } from './client';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

export const INITIAL_CATEGORIES = [
  { id: 'cat_cohort_1', name: '개발했슈 1기', slug: 'cohort-1', display_order: 1 },
];

export const INITIAL_CREATORS = [
  {
    id: 'creator_baker_master',
    user_id: 'sample_user_1',
    nickname: '우주피자장인',
    bio_short: '노션을 따뜻하고 맛있게 만드는 위젯 피자 장인입니다 🍕',
    bio_long: '안녕하세요! 개발했슈 1기 제빵사 우주피자장인입니다. 심플하면서도 감성적인 노션 위젯을 연구하고 굽고 있습니다.',
    character_image_url: '',
    skills: ['React', 'Next.js', 'UI/UX', 'Notion API'],
    links: { github: 'https://github.com', notion: 'https://notion.so' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_WIDGETS = [
  {
    id: 'widget_minimal_flip_clock',
    creator_profile_id: 'creator_baker_master',
    category_id: 'cat_clock',
    name: '미니멀 플립 시계',
    slug: 'minimal-flip-clock',
    short_description: '노션 페이지에 잘 어울리는 깔끔한 플립 시계 위젯입니다.',
    long_description: '레트로 감성의 플립 애니메이션과 함께 현재 시간을 깔끔하게 보여주는 시계 위젯입니다. 다크모드 및 다양한 테마 컬러를 지원합니다.',
    creator_comment: '대시보드 상단에 배치하면 집중력이 올라가요!',
    tags: ['미니멀', '시계', '다크모드', '인기'],
    thumbnail_url: '',
    preview_url: '',
    embed_url: '',
    config_schema: { themeColor: 'string', fontSize: 'string' },
    default_config: { themeColor: '#F6A9B8', fontSize: 'medium' },
    responsive_supported: true,
    uses_notion_api: false,
    status: 'published',
    view_count: 1024,
    copy_count: 256,
    like_count: 88,
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
  {
    id: 'widget_cozy_weather_icon',
    creator_profile_id: 'creator_baker_master',
    category_id: 'cat_weather',
    name: '따뜻한 날씨 아이콘',
    slug: 'cozy-weather-icon',
    short_description: '현재 위치의 날씨를 귀여운 일러스트 아이콘으로 보여줘요.',
    long_description: '오늘의 기온, 습도, 날씨 상태를 따뜻한 빵집 테마의 그래픽으로 실시간 확인할 수 있는 날씨 위젯입니다.',
    creator_comment: '출근/등교 전 날씨 확인용으로 추천드려요.',
    tags: ['날씨', '귀여운', '일러스트'],
    thumbnail_url: '',
    preview_url: '',
    embed_url: '',
    config_schema: { themeColor: 'string', fontSize: 'string' },
    default_config: { themeColor: '#FFF2C7', fontSize: 'medium' },
    responsive_supported: true,
    uses_notion_api: false,
    status: 'published',
    view_count: 850,
    copy_count: 120,
    like_count: 42,
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
  {
    id: 'widget_d_day_calendar',
    creator_profile_id: 'creator_baker_master',
    category_id: 'cat_calendar',
    name: '디데이 달력',
    slug: 'd-day-calendar',
    short_description: '중요한 목표일이나 기념일을 잊지 않게 챙겨주는 디데이 위젯.',
    long_description: '시험, 프로젝트 마감, 기념일까지 남은 날짜(D-day)를 직관적인 프로그레스 바와 함께 카운트다운해 줍니다.',
    creator_comment: '목표 달성을 위한 동기부여에 딱입니다.',
    tags: ['디데이', '달력', '생산성', '카운트다운'],
    thumbnail_url: '',
    preview_url: '',
    embed_url: '',
    config_schema: { themeColor: 'string', fontSize: 'string' },
    default_config: { themeColor: '#285C3A', fontSize: 'medium' },
    responsive_supported: true,
    uses_notion_api: false,
    status: 'published',
    view_count: 3420,
    copy_count: 1150,
    like_count: 310,
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 1).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
];

export const INITIAL_INVITES = [
  {
    id: 'invite_sample_1',
    email: 'kdj9502@naver.com',
    nickname: '우주피자장인',
    code: 'dev1_8f9c2a',
    cohort: '개발했슈 1기',
    is_used: false,
    used_by: null,
    used_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'invite_sample_2',
    email: 'creator1@gmail.com',
    nickname: '바이브코딩러버',
    code: 'dev1_pizza101',
    cohort: '개발했슈 1기',
    is_used: false,
    used_by: null,
    used_at: null,
    created_at: new Date().toISOString(),
  },
];

export async function seedInitialData(): Promise<{ success: boolean; message: string }> {
  try {
    if (adminDb) {
      // 1. Categories
      for (const cat of INITIAL_CATEGORIES) {
        await adminDb.collection('categories').doc(cat.id).set(cat, { merge: true });
      }

      // 2. Creators
      for (const creator of INITIAL_CREATORS) {
        await adminDb.collection('creator_profiles').doc(creator.id).set(creator, { merge: true });
      }

      // 3. Widgets
      for (const widget of INITIAL_WIDGETS) {
        await adminDb.collection('widgets').doc(widget.id).set(widget, { merge: true });
      }

      // 4. Cohort Invites
      for (const invite of INITIAL_INVITES) {
        await adminDb.collection('cohort_invites').doc(invite.id).set(invite, { merge: true });
      }
    } else {
      // Client Firestore fallback
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }

      for (const creator of INITIAL_CREATORS) {
        await setDoc(doc(db, 'creator_profiles', creator.id), creator, { merge: true });
      }

      for (const widget of INITIAL_WIDGETS) {
        await setDoc(doc(db, 'widgets', widget.id), widget, { merge: true });
      }

      for (const invite of INITIAL_INVITES) {
        await setDoc(doc(db, 'cohort_invites', invite.id), invite, { merge: true });
      }
    }

    return { success: true, message: '초기 데이터(카테고리, 위젯, 제작자, 1기 초대코드) 시딩이 완료되었습니다.' };
  } catch (error: any) {
    console.error('seedInitialData error:', error);
    return { success: false, message: error.message || '시딩 중 에러가 발생했습니다.' };
  }
}

