import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import WidgetCard from '@/components/WidgetCard'

export default async function Home() {
  const supabase = await createClient()
  
  // 위젯과 해당 카테고리, 제작자 프로필을 조인해서 가져옵니다.
  const { data: widgets, error } = await supabase
    .from('widgets')
    .select(`
      *,
      categories ( name ),
      creator_profiles ( nickname )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(8) // 홈 화면은 최대 8개까지만 표시

  return (
    <div className="pb-24">
      {/* 히어로 배너 */}
      <section className="bg-bakery-beige rounded-[32px] p-8 sm:p-12 mb-12 shadow-sm border border-toast-brown/10 relative overflow-hidden">
        {/* 장식용 종이 질감 */}
        <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-forest-green text-white text-xs font-bold px-3 py-1 rounded-full mb-6">
            ✨ 새로운 위젯 업데이트
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink mb-6 leading-tight">
            내 노션을 더 따뜻하게<br />
            구워낸 귀여운 위젯들
          </h1>
          <p className="text-lg text-ink/80 mb-8 font-medium">
            개발했슈 1기, 2기 제작자들이 갓 구워낸 위젯들을 만나보세요.<br />
            로그인 없이 누구나 무료로 가져갈 수 있어요!
          </p>
          <div className="flex gap-4">
            <Link 
              href="/widgets"
              className="bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-colors shadow-sm"
            >
              진열대 둘러보기 🥐
            </Link>
            <Link 
              href="/creators/join"
              className="bg-white text-forest-green border-2 border-forest-green font-bold py-3 px-6 rounded-xl hover:bg-forest-green/5 transition-colors"
            >
              위젯 제작자로 참여하기
            </Link>
          </div>
        </div>
        
        {/* 장식용 그래픽 요소 (우측 하단) */}
        <div className="absolute right-[-20px] bottom-[-20px] text-[150px] opacity-20 transform rotate-[-15deg] pointer-events-none">
          🥨
        </div>
      </section>

      {/* 위젯 진열대 (Grid) */}
      <section id="widgets">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ink mb-2">갓 구운 위젯 🍞</h2>
            <p className="text-ink/60 font-medium">따끈따끈하게 갓 구워진 최신 위젯을 맛보세요.</p>
          </div>
          <Link href="/widgets" className="text-forest-green font-bold text-sm hover:underline">
            전체보기 →
          </Link>
        </div>

        {error ? (
          <div className="text-center py-20 bg-strawberry-pink/10 rounded-2xl border border-strawberry-pink/20">
            <p className="text-strawberry-pink font-bold text-lg">앗! 데이터를 불러오는 중 문제가 발생했슈.</p>
          </div>
        ) : !widgets || widgets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-toast-brown/20 shadow-sm">
            <div className="text-6xl mb-4">🧺</div>
            <h3 className="text-xl font-bold text-ink mb-2">아직 진열된 빵이 없슈!</h3>
            <p className="text-ink/60 font-medium">
              첫 번째 위젯 제작자가 되어 위젯을 구워보세요.
            </p>
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
