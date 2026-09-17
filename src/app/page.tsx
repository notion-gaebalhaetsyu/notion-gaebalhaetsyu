import Link from 'next/link'
import { getWidgets, getUserFavorites } from '@/utils/firebase/db'
import { getVisitorStats } from '@/utils/firebase/visitor-db'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import WidgetCard from '@/components/WidgetCard'
import HeroBanner from '@/components/HeroBanner'
import HowToUse from '@/components/HowToUse'
import VisitorCounter from '@/components/VisitorCounter'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await getCurrentUser()
  
  // 홈 화면은 발행된 최신 위젯 최대 8개 및 방문자 통계 표시
  const [widgets, favoriteWidgets, visitorStats] = await Promise.all([
    getWidgets({
      status: 'published',
      sortBy: 'latest',
      limitCount: 8,
    }),
    user ? getUserFavorites(user.id) : Promise.resolve([]),
    getVisitorStats(),
  ])

  const favoriteIds = new Set(favoriteWidgets.map(f => f.id))

  return (
    <div className="pb-24">
      {/* 상단 헤더 영역 (방문자 카운터 및 상단 여백 확보) */}
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-toast-brown/85 bg-white/60 px-3.5 py-1.5 rounded-full border border-toast-brown/15 shadow-2xs">
          <span>🍕</span>
          <span>노션에 필요한 기능, 우리가 직접 구웠슈!</span>
        </div>
        <div className="ml-auto">
          <VisitorCounter initialStats={visitorStats} />
        </div>
      </div>

      {/* 히어로 배너 */}
      <HeroBanner />

      {/* 위젯 진열대 (Grid) */}
      <section id="widgets">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2">
              <span>갓 구운 위젯</span>
              <img src="/pizza_icon.png" alt="피자" className="w-6 h-6 object-contain" />
            </h2>
            <p className="text-ink/60 font-medium">따끈따끈하게 갓 구워진 개발했슈 위젯을 맛보세요.</p>
          </div>
          <Link href="/widgets" className="text-forest-green font-bold text-sm hover:underline">
            전체보기 →
          </Link>
        </div>

        {!widgets || widgets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-toast-brown/20 shadow-sm">
            <img src="/pizza_icon.png" alt="피자" className="w-16 h-16 mx-auto object-contain mb-3 opacity-60" />
            <h3 className="text-xl font-bold text-ink mb-2">아직 진열된 피자가 없슈!</h3>
            <p className="text-ink/60 font-medium">
              첫 번째 위젯 제작자가 되어 위젯을 구워보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {widgets.map((widget) => (
              <WidgetCard 
                key={widget.id} 
                widget={widget} 
                initialIsFavorited={favoriteIds.has(widget.id)}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* 이용 방법 안내 */}
      <HowToUse />
    </div>
  )
}

