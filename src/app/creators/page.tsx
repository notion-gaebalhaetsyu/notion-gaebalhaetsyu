import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function CreatorsPage() {
  const supabase = await createClient()
  
  // 제빵사 프로필 목록 가져오기
  const { data: creators, error } = await supabase
    .from('creator_profiles')
    .select(`
      *,
      users ( email, created_at ),
      widgets ( id )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="pb-24">
      {/* 헤더 영역 */}
      <section className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
          👨‍🍳 개발했슈 1기, 2기 제작자들
        </h1>
        <p className="text-lg text-ink/70 font-medium max-w-2xl mx-auto">
          노션을 더 따뜻하게 만들어주는 위젯 제작자들을 소개합니다.
          각 제작자의 작업대에 방문해서 어떤 위젯을 구웠는지 확인해보세요.
        </p>
      </section>

      {error ? (
        <div className="text-center py-20 bg-strawberry-pink/10 rounded-2xl border border-strawberry-pink/20">
          <p className="text-strawberry-pink font-bold text-lg">앗! 데이터를 불러오는 중 문제가 발생했슈.</p>
        </div>
      ) : !creators || creators.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-toast-brown/20 shadow-sm">
          <div className="text-6xl mb-4">🧑‍🍳</div>
          <h3 className="text-xl font-bold text-ink mb-2">아직 등록된 제작자가 없슈!</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <Link 
              key={creator.id} 
              href={`/creators/${creator.nickname}`}
              className="bg-white rounded-3xl p-6 border border-toast-brown/20 shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-bakery-beige rounded-full border-4 border-white shadow-sm flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                {creator.character_image_url ? (
                  <img src={creator.character_image_url} alt={creator.nickname} className="w-full h-full object-cover rounded-full" />
                ) : (
                  '🧑‍🍳'
                )}
              </div>
              <h3 className="text-xl font-bold text-ink mb-1 group-hover:text-forest-green transition-colors">
                {creator.nickname}
              </h3>
              <p className="text-sm text-ink/60 font-medium mb-4 line-clamp-2 min-h-[40px]">
                {creator.bio_short || '아직 자기소개가 없슈.'}
              </p>
              <div className="mt-auto pt-4 border-t border-toast-brown/10 w-full flex justify-center gap-4 text-sm font-bold text-forest-green">
                <span>구워낸 위젯 {creator.widgets?.length || 0}개</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
