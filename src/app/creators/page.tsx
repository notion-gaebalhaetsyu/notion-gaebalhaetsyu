import Link from 'next/link'
import { getAllCreatorProfiles, getWidgets } from '@/utils/firebase/db'

export const dynamic = 'force-dynamic'

export default async function CreatorsPage() {
  const [creators, allWidgets] = await Promise.all([
    getAllCreatorProfiles(),
    getWidgets({ status: 'all' })
  ]);

  // 각 제작자별 위젯 개수 집계 (ID, user_id, email 다각도 매칭)
  const getWidgetCountForCreator = (creator: any) => {
    return allWidgets.filter((w) => {
      const cId = w.creator_profile_id;
      return (
        cId === creator.id ||
        (creator.user_id && cId === creator.user_id) ||
        (creator.email && cId === creator.email.toLowerCase().trim()) ||
        (w.creator_profiles && (w.creator_profiles.id === creator.id || w.creator_profiles.nickname === creator.nickname))
      );
    }).length;
  };

  // 위젯을 1개 이상 등록한 제작자만 노출
  const activeCreators = creators.filter((creator) => {
    return getWidgetCountForCreator(creator) > 0;
  });

  return (
    <div className="pb-24">
      {/* 헤더 영역 */}
      <section className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4 flex items-center justify-center gap-2">
          <span>👨‍🍳</span> 개발했슈 1기 제작자들
        </h1>
        <p className="text-lg text-ink/70 font-medium max-w-2xl mx-auto leading-relaxed">
          노션을 더 따뜻하게 만들어주는 위젯 제작자들을 소개합니다.<br />
          각 제작자의 작업대에 방문해서 어떤 위젯을 구웠는지 확인해보세요.
        </p>
      </section>

      {!activeCreators || activeCreators.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-toast-brown/20 shadow-sm">
          <img src="/pizza_icon.png" alt="피자" className="w-16 h-16 mx-auto object-contain mb-3" />
          <h3 className="text-xl font-bold text-ink mb-2">아직 위젯을 진열한 제작자가 없슈!</h3>
          <p className="text-ink/60 font-medium">첫 번째 위젯을 등록해 제작자 진열대에 이름을 올려보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCreators.map((creator) => {
            const widgetCount = getWidgetCountForCreator(creator);
            return (
              <Link
                key={creator.id}
                href={`/creators/${encodeURIComponent(creator.nickname)}`}
                className="bg-white rounded-3xl p-6 border border-toast-brown/20 shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-bakery-beige rounded-full border-4 border-white shadow-sm flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform overflow-hidden">
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
                  <span>구워낸 위젯 {widgetCount}개</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  )
}

