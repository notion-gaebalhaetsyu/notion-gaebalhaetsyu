import Link from 'next/link'
import { getCategories, getWidgets, getUserFavorites } from '@/utils/firebase/db'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import WidgetCard from '@/components/WidgetCard'

export const dynamic = 'force-dynamic'

export default async function WidgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}) {
  const params = await searchParams;
  
  const categoryFilter = params.category || 'all';
  const searchQuery = params.q || '';
  const sortBy = (params.sort === 'popular' ? 'popular' : 'latest') as 'popular' | 'latest';

  const user = await getCurrentUser();

  // 1. 카테고리, 위젯, 관심 위젯 동시 가져오기
  const [categories, widgets, favoriteWidgets] = await Promise.all([
    getCategories(),
    getWidgets({
      status: 'published',
      categorySlug: categoryFilter,
      searchQuery,
      sortBy,
    }),
    user ? getUserFavorites(user.id) : Promise.resolve([])
  ]);

  const favoriteIds = new Set(favoriteWidgets.map(f => f.id));

  return (
    <div className="pb-24">
      {/* 헤더 영역 */}
      <section className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink mb-2 flex items-center gap-2">
          <img src="/pizza_icon.png" alt="피자" className="w-8 h-8 object-contain" />
          <span>위젯 진열대</span>
        </h1>
        <p className="text-ink/60 font-medium">
          내 노션을 다채롭게 꾸며줄 개발했슈 위젯들을 만나보세요.
        </p>
      </section>

      {/* 필터 및 검색 바 */}
      <section className="bg-white rounded-2xl p-4 border border-toast-brown/20 shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Link 
            href={`/widgets?category=all&sort=${sortBy}${searchQuery ? `&q=${searchQuery}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${categoryFilter === 'all' ? 'bg-forest-green text-white shadow-sm' : 'bg-bakery-beige text-ink/70 hover:bg-forest-green/10 hover:text-forest-green'}`}
          >
            전체
          </Link>
          {categories?.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/widgets?category=${cat.slug}&sort=${sortBy}${searchQuery ? `&q=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${categoryFilter === cat.slug ? 'bg-forest-green text-white shadow-sm' : 'bg-bakery-beige text-ink/70 hover:bg-forest-green/10 hover:text-forest-green'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* 정렬 옵션 */}
        <div className="flex gap-2 w-full md:w-auto">
          <Link 
            href={`/widgets?category=${categoryFilter}&sort=latest${searchQuery ? `&q=${searchQuery}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${sortBy === 'latest' ? 'text-forest-green underline decoration-2 underline-offset-4' : 'text-ink/50 hover:text-ink'}`}
          >
            최신순
          </Link>
          <Link 
            href={`/widgets?category=${categoryFilter}&sort=popular${searchQuery ? `&q=${searchQuery}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${sortBy === 'popular' ? 'text-forest-green underline decoration-2 underline-offset-4' : 'text-ink/50 hover:text-ink'}`}
          >
            인기순
          </Link>
        </div>
      </section>

      {/* 위젯 리스트 */}
      <section>
        {!widgets || widgets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-toast-brown/20 shadow-sm">
            <div className="text-6xl mb-4">🍕</div>
            <h3 className="text-xl font-bold text-ink mb-2">조건에 맞는 피자가 없슈!</h3>
            <p className="text-ink/60 font-medium">
              다른 카테고리를 선택하거나 검색어를 바꿔보세요.
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
    </div>
  )
}

