import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import WidgetCard from '@/components/WidgetCard'
import HeroBanner from '@/components/HeroBanner'
import HowToUse from '@/components/HowToUse'

export default async function Home() {
  const supabase = await createClient()

  // 위젯과 해당 카테고리, 제작자 프로필을 조인해서 가져옵니다.
  const { data: widgets, error } = await supabase
    .from('widgets')
    .select(`
      *,
      categories ( name ),
      creator_profiles ( nickname, character_image_url )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(8) // 홈 화면은 최대 8개까지만 표시

  return (
    <div className="pb-24">
      {/* 히어로 배너 */}
      <HeroBanner />

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

      {/* 이용 방법 안내 */}
      <HowToUse />
    </div>
  )
}
