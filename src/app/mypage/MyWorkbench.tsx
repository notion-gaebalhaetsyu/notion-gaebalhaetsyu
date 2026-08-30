'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Widget, UserRole } from '@/utils/firebase/types'

interface MyWorkbenchProps {
  bakedWidgets: Widget[]
  favoriteWidgets: Widget[]
  role?: UserRole
}

export default function MyWorkbench({ bakedWidgets, favoriteWidgets, role = 'visitor' }: MyWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'baked'>('favorites')
  const isCreatorOrAdmin = role === 'provider' || role === 'creator' || role === 'admin'

  // 위젯 카드 렌더링 함수
  const renderWidgetCard = (widget: Widget, isBaked: boolean = false) => (
    <div 
      key={widget.id} 
      className="group block bg-white rounded-[24px] border border-toast-brown/20 overflow-hidden shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all relative flex flex-col justify-between"
    >
      <div>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {isBaked && isCreatorOrAdmin && (
            <Link
              href={`/creators/widgets/${widget.id}/edit`}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/90 backdrop-blur-sm text-forest-green border border-forest-green/30 hover:bg-forest-green hover:text-white transition-colors shadow-sm"
              title="위젯 정보 수정하기"
            >
              ✏️ 수정
            </Link>
          )}
          {isBaked && (
            <span className={`px-2 py-1 text-[10px] font-bold rounded-md flex items-center ${
              widget.status === 'published' ? 'bg-forest-green text-white' : 'bg-toast-brown/20 text-toast-brown'
            }`}>
              {widget.status === 'published' ? '배포됨' : '대기중'}
            </span>
          )}
        </div>
        
        <Link href={`/widgets/${widget.slug}`} className="block">
          <div className="aspect-[4/3] bg-bakery-beige flex items-center justify-center p-6 relative overflow-hidden">
            <div className="w-full h-full bg-white/50 rounded-xl border-2 border-toast-brown/10 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
              {widget.thumbnail_url ? (
                <img src={widget.thumbnail_url} alt={widget.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <img src="/pizza_icon.png" alt="피자" className="w-14 h-14 object-contain" />
              )}
            </div>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-forest-green rounded-full shadow-sm">
              {widget.categories?.name || '개발했슈 1기'}
            </div>
          </div>
          
          <div className="p-5 pb-2">
            <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-forest-green transition-colors line-clamp-1">
              {widget.name}
            </h3>
            <p className="text-sm text-ink/60 mb-2 line-clamp-2 min-h-[40px]">
              {widget.short_description}
            </p>
          </div>
        </Link>
      </div>

      <div className="px-5 pb-4 pt-2 flex items-center justify-between text-xs font-medium text-ink/50 border-t border-toast-brown/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">👀 {widget.view_count || 0}</span>
          <span className="flex items-center gap-1">📋 {widget.copy_count || 0}</span>
          <span className="flex items-center gap-1">❤️ {widget.like_count || 0}</span>
        </div>
        {isBaked && isCreatorOrAdmin && (
          <Link
            href={`/creators/widgets/${widget.id}/edit`}
            className="text-forest-green font-bold hover:underline"
          >
            수정하기 →
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <section>
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 mb-8 border-b border-toast-brown/20 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'favorites' 
              ? 'bg-ink text-white shadow-md' 
              : 'bg-white text-ink/60 hover:bg-bakery-beige'
          }`}
        >
          <img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain" />
          <span>내가 찜한 피자</span>
          <span className="ml-1 opacity-70">({favoriteWidgets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('baked')}
          className={`px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap ${
            activeTab === 'baked' 
              ? 'bg-ink text-white shadow-md' 
              : 'bg-white text-ink/60 hover:bg-bakery-beige'
          }`}
        >
          🧑‍🍳 내가 구운 피자 <span className="ml-1 opacity-70">({bakedWidgets.length})</span>
        </button>
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div>
        {activeTab === 'favorites' && (
          <div>
            {favoriteWidgets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-toast-brown/20 shadow-sm border-dashed">
                <img src="/pizza_icon.png" alt="피자" className="w-16 h-16 mx-auto object-contain mb-3 opacity-60" />
                <h3 className="text-xl font-bold text-ink mb-2">아직 찜한 피자가 없슈!</h3>
                <p className="text-ink/60 font-medium mb-6">마음에 드는 위젯을 찾아 하트(❤️)를 눌러보세요.</p>
                <Link href="/widgets" className="inline-block bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-colors">
                  진열대 구경가기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteWidgets.map(w => renderWidgetCard(w))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'baked' && (
          <div>
            {!isCreatorOrAdmin ? (
              <div className="text-center py-16 px-6 bg-white rounded-3xl border border-toast-brown/20 shadow-sm max-w-lg mx-auto">
                <div className="text-5xl mb-4">☕</div>
                <h3 className="text-xl font-bold text-ink mb-2">일반 손님 계정입니다</h3>
                <p className="text-sm text-ink/70 font-medium mb-6 leading-relaxed">
                  현재는 위젯을 자유롭게 둘러보고 노션에 다운로드(복사)할 수 있습니다.<br />
                  직접 위젯을 등록하고 관리하려면 <strong>1기 제작자 인증</strong>을 진행해 주세요.
                </p>
                <Link 
                  href="/creators/join" 
                  className="inline-flex items-center gap-2 bg-forest-green text-white font-bold py-3.5 px-8 rounded-xl hover:bg-forest-green/90 transition-colors shadow-md text-base"
                >
                  <span>🧑‍🍳</span> 1기 제작자 인증하러 가기
                </Link>
              </div>
            ) : bakedWidgets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-toast-brown/20 shadow-sm border-dashed">
                <img src="/pizza_icon.png" alt="피자" className="w-16 h-16 mx-auto object-contain mb-3 opacity-60" />
                <h3 className="text-xl font-bold text-ink mb-2">아직 구워낸 피자 위젯이 없네유.</h3>
                <p className="text-ink/60 font-medium mb-6">첫 위젯을 만들어 개발했슈 진열대에 공유해 보세요!</p>
                <Link href="/creators/widgets/new" className="inline-block bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-colors">
                  새 위젯 굽기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* 첫 번째 카드는 새 위젯 만들기 버튼 */}
                <Link 
                  href="/creators/widgets/new"
                  className="group flex flex-col items-center justify-center bg-bakery-beige/50 rounded-[24px] border-2 border-dashed border-toast-brown/30 h-full min-h-[340px] hover:border-forest-green hover:bg-forest-green/5 transition-all"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <span className="font-bold text-ink group-hover:text-forest-green">새 위젯 굽기</span>
                </Link>
                {bakedWidgets.map(w => renderWidgetCard(w, true))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}


