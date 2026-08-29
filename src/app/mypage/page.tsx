import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import { getCreatorProfileByUserId, getWidgets, getUserFavorites } from '@/utils/firebase/db'
import MyWorkbench from './MyWorkbench'

export const dynamic = 'force-dynamic'

export default async function MyPage() {
  // 1. 로그인 유저 확인
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  // 2. 제빵사 프로필 가져오기
  const creatorProfile = await getCreatorProfileByUserId(user.id)

  // 3. "내가 구운 빵" (제작한 위젯) 데이터 가져오기
  let bakedWidgets: any[] = []
  if (creatorProfile) {
    bakedWidgets = await getWidgets({
      creatorProfileId: creatorProfile.id,
      status: 'all',
      sortBy: 'latest',
    })
  }

  // 4. "내가 찜한 빵" (관심 위젯) 데이터 가져오기
  const favoriteWidgets = await getUserFavorites(user.id)

  // 프로필 정보 세팅
  const isCreator = user.role === 'creator' || creatorProfile?.cohort === '개발했슈 1기'
  const profile = {
    nickname: creatorProfile?.nickname || user.name || user.email?.split('@')[0] || '익명의 제빵사',
    role: user.role === 'admin' ? '촌장 (관리자)' : isCreator ? '개발했슈 1기 제빵사 🍕' : '일반 손님',
    bio: creatorProfile?.bio_short || '아직 자기소개가 없슈.',
  }

  return (
    <div className="pb-24">
      {/* 상단 프로필 헤더 */}
      <section className="bg-white rounded-[32px] p-8 sm:p-12 mb-8 shadow-sm border border-toast-brown/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 w-32 h-32 bg-bakery-beige rounded-full border-4 border-white shadow-md flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
          {creatorProfile?.character_image_url || user.avatar_url ? (
            <img 
              src={creatorProfile?.character_image_url || user.avatar_url} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            '🧑‍🍳'
          )}
        </div>
        
        <div className="relative z-10 text-center md:text-left flex-1">
          <div className="inline-block bg-forest-green/10 text-forest-green text-sm font-bold px-3 py-1 rounded-full mb-3">
            {profile.role}
          </div>
          <h1 className="text-3xl font-extrabold text-ink mb-2">
            {profile.nickname}의 작업대
          </h1>
          <p className="text-ink/70 font-medium">
            {profile.bio}
          </p>
        </div>

        <div className="relative z-10">
          <Link 
            href="/mypage/edit"
            className="inline-block bg-white border-2 border-toast-brown/20 text-ink font-bold py-2 px-6 rounded-xl hover:bg-toast-brown/5 transition-colors"
          >
            프로필 수정
          </Link>
        </div>
      </section>

      {/* 탭 기반 작업대 (클라이언트 컴포넌트) */}
      <MyWorkbench 
        bakedWidgets={bakedWidgets} 
        favoriteWidgets={favoriteWidgets} 
        role={user.role}
      />
    </div>
  )
}
