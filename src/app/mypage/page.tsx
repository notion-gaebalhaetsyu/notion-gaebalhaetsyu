import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MyWorkbench from './MyWorkbench'

export default async function MyPage() {
  const supabase = await createClient()

  // 1. 로그인 유저 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/?auth_error=true')
  }

  // 2. 유저 정보 및 제빵사 프로필 가져오기
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 3. "내가 구운 빵" (제작한 위젯) 데이터 가져오기
  let bakedWidgets: any[] = []
  if (creatorProfile) {
    const { data } = await supabase
      .from('widgets')
      .select('*, categories(name)')
      .eq('creator_profile_id', creatorProfile.id)
      .order('created_at', { ascending: false })
    
    if (data) bakedWidgets = data
  }

  // 4. "내가 찜한 빵" (관심 위젯) 데이터 가져오기
  let favoriteWidgets: any[] = []
  const { data: favData } = await supabase
    .from('favorites')
    .select('widgets(*, categories(name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    
  if (favData) {
    // favorites 배열 안에 있는 widgets 객체들을 추출
    favoriteWidgets = favData.map(f => f.widgets).filter(Boolean)
  }

  // 프로필 정보 세팅
  const profile = {
    nickname: creatorProfile?.nickname || user.user_metadata?.full_name || user.email?.split('@')[0] || '익명의 사용자',
    role: userData?.role === 'creator' ? '제빵사' : '일반 손님',
    bio: creatorProfile?.bio_short || '아직 자기소개가 없슈.',
  }

  return (
    <div className="pb-24">
      {/* 상단 프로필 헤더 */}
      <section className="bg-white rounded-[32px] p-8 sm:p-12 mb-8 shadow-sm border border-toast-brown/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 w-32 h-32 bg-bakery-beige rounded-full border-4 border-white shadow-md flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
          {creatorProfile?.character_image_url ? (
            <img src={creatorProfile.character_image_url} alt="Profile" className="w-full h-full object-cover" />
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
      <MyWorkbench bakedWidgets={bakedWidgets} favoriteWidgets={favoriteWidgets} />
    </div>
  )
}
