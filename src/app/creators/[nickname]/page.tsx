import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import WidgetCard from '@/components/WidgetCard'

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ nickname: string }>
}) {
  const { nickname } = await params;
  const supabase = await createClient()
  
  const decodedNickname = decodeURIComponent(nickname);

  // 1. 제빵사 프로필 가져오기
  const { data: creator, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('nickname', decodedNickname)
    .single()

  if (error || !creator) {
    notFound()
  }

  // 2. 해당 제빵사가 만든 위젯 가져오기
  const { data: widgets } = await supabase
    .from('widgets')
    .select(`
      *,
      categories ( name ),
      creator_profiles ( nickname, character_image_url )
    `)
    .eq('creator_profile_id', creator.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="pb-24">
      {/* 상단 프로필 헤더 */}
      <section className="bg-white rounded-[32px] p-8 sm:p-12 mb-12 shadow-sm border border-toast-brown/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 w-32 h-32 bg-bakery-beige rounded-full border-4 border-white shadow-md flex items-center justify-center text-5xl flex-shrink-0">
          {creator.character_image_url ? (
            <img src={creator.character_image_url} alt={creator.nickname} className="w-full h-full object-cover rounded-full" />
          ) : (
            '🧑‍🍳'
          )}
        </div>
        
        <div className="relative z-10 text-center md:text-left flex-1">
          <div className="inline-block bg-forest-green/10 text-forest-green text-sm font-bold px-3 py-1 rounded-full mb-3">
            개발했슈 1기, 2기 제작자
          </div>
          <h1 className="text-3xl font-extrabold text-ink mb-2">
            {creator.nickname}의 작업대
          </h1>
          <p className="text-ink/70 font-medium whitespace-pre-wrap max-w-2xl">
            {creator.bio_long || creator.bio_short || '아직 등록된 소개가 없슈.'}
          </p>
          
          {creator.skills && creator.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {creator.skills.map((skill: string) => (
                <span key={skill} className="bg-bakery-beige text-ink/70 text-xs font-bold px-2 py-1 rounded-md border border-toast-brown/20">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 구워낸 위젯 목록 */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
          <span>🍞</span> 구워낸 위젯 <span className="text-forest-green">{widgets?.length || 0}</span>
        </h2>
        
        {!widgets || widgets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-toast-brown/20 shadow-sm">
            <div className="text-6xl mb-4">🧺</div>
            <h3 className="text-xl font-bold text-ink mb-2">아직 구워낸 빵이 없슈!</h3>
            <p className="text-ink/60 font-medium">제작자가 열심히 레시피를 연구하고 있어요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {widgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
