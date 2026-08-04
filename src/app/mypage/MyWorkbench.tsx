'use client'

import { useState } from 'react'
import Link from 'next/link'

type Widget = {
  id: string
  name: string
  slug: string
  short_description: string
  status: string
  categories?: { name: string }
  view_count: number
  copy_count: number
}

interface MyWorkbenchProps {
  bakedWidgets: Widget[]
  favoriteWidgets: Widget[]
}

export default function MyWorkbench({ bakedWidgets, favoriteWidgets }: MyWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'baked'>('favorites')

  // 위젯 카드 렌더링 함수
  const renderWidgetCard = (widget: Widget, isBaked: boolean = false) => (
    <Link 
      key={widget.id} 
      href={`/widgets/${widget.slug}`}
      className="group block bg-white rounded-[24px] border border-toast-brown/20 overflow-hidden shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all relative"
    >
      {isBaked && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
            widget.status === 'published' ? 'bg-forest-green text-white' : 'bg-toast-brown/20 text-toast-brown'
          }`}>
            {widget.status === 'published' ? '배포됨' : '대기중'}
          </span>
        </div>
      )}
      
      <div className="aspect-[4/3] bg-bakery-beige flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full h-full bg-white/50 rounded-xl border-2 border-toast-brown/10 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
          {widget.categories?.name === '시계' ? '⏰' : 
           widget.categories?.name === '날씨' ? '🌤️' : '🍞'}
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-forest-green rounded-full shadow-sm">
          {widget.categories?.name || '기타'}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-forest-green transition-colors line-clamp-1">
          {widget.name}
        </h3>
        <p className="text-sm text-ink/60 mb-4 line-clamp-2 min-h-[40px]">
          {widget.short_description}
        </p>
        <div className="flex items-center gap-3 text-xs font-medium text-ink/50 pt-4 border-t border-toast-brown/10">
          <span className="flex items-center gap-1">👀 {widget.view_count || 0}</span>
          <span className="flex items-center gap-1">📋 {widget.copy_count || 0}</span>
        </div>
      </div>
    </Link>
  )

  return (
    <section>
      {/* 탭 네비게이션 */}
      <div className="flex gap-4 mb-8 border-b border-toast-brown/20 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap ${
            activeTab === 'favorites' 
              ? 'bg-ink text-white shadow-md' 
              : 'bg-white text-ink/60 hover:bg-bakery-beige'
          }`}
        >
          🧺 내가 찜한 빵 <span className="ml-1 opacity-70">({favoriteWidgets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('baked')}
          className={`px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap ${
            activeTab === 'baked' 
              ? 'bg-ink text-white shadow-md' 
              : 'bg-white text-ink/60 hover:bg-bakery-beige'
          }`}
        >
          🧑‍🍳 내가 구운 빵 <span className="ml-1 opacity-70">({bakedWidgets.length})</span>
        </button>
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div>
        {activeTab === 'favorites' && (
          <div>
            {favoriteWidgets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-toast-brown/20 shadow-sm border-dashed">
                <div className="text-5xl mb-4 opacity-50">🛒</div>
                <h3 className="text-xl font-bold text-ink mb-2">아직 바구니에 담은 빵이 없슈!</h3>
                <p className="text-ink/60 font-medium mb-6">마음에 드는 위젯을 찾아 하트를 눌러보세요.</p>
                <Link href="/" className="inline-block bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-colors">
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
            {bakedWidgets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-toast-brown/20 shadow-sm border-dashed">
                <div className="text-5xl mb-4 opacity-50">🥣</div>
                <h3 className="text-xl font-bold text-ink mb-2">아직 구워낸 빵이 없네유.</h3>
                <p className="text-ink/60 font-medium mb-6">첫 위젯을 만들어 세상에 공유해 보세요!</p>
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
