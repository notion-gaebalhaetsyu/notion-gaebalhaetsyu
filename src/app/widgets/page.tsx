import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import WidgetCard from '@/components/WidgetCard'

export default async function WidgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, q?: string, sort?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams;
  
  const categoryFilter = params.category || 'all';
  const searchQuery = params.q || '';
  const sortBy = params.sort || 'latest';

  // 1. 카테고리 목록 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  // 2. 위젯 데이터 가져오기
  let query = supabase
    .from('widgets')
    .select(`
      *,
      categories!inner ( id, name, slug ),
      creator_profiles ( nickname )
    `)
    .eq('status', 'published')

  // 카테고리 필터
  if (categoryFilter !== 'all') {
    query = query.eq('categories.slug', categoryFilter)
  }

  // 검색어 필터
  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  // 정렬
  if (sortBy === 'popular') {
    query = query.order('like_count', { ascending: false }).order('copy_count', { ascending: false })
  } else {
    // latest
    query = query.order('created_at', { ascending: false })
  }

  const { data: widgets, error } = await query

  return (
    <div className="pb-24">
      {/* 헤더 영역 */}
      <section className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink mb-2">🍞 위젯 진열대</h1>
        <p className="text-ink/60 font-medium">
          내 노션을 다채롭게 꾸며줄 다양한 위젯들을 만나보세요.
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
        {error ? (
          <div className="text-center py-20 bg-strawberry-pink/10 rounded-2xl border border-strawberry-pink/20">
            <p className="text-strawberry-pink font-bold text-lg">앗! 데이터를 불러오는 중 문제가 발생했슈.</p>
          </div>
        ) : !widgets || widgets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-toast-brown/20 shadow-sm">
            <div className="text-6xl mb-4">🧺</div>
            <h3 className="text-xl font-bold text-ink mb-2">조건에 맞는 빵이 없슈!</h3>
            <p className="text-ink/60 font-medium">
              다른 카테고리를 선택하거나 검색어를 바꿔보세요.
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
