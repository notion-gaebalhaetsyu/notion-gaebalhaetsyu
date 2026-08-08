"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function WidgetDetailClient({ 
  widget, 
  initialIsFavorited,
  userId
}: { 
  widget: any;
  initialIsFavorited: boolean;
  userId?: string;
}) {
  const supabase = createClient();
  const [themeColor, setThemeColor] = useState(widget.default_config?.themeColor || "#F6A9B8");
  const [fontSize, setFontSize] = useState(widget.default_config?.fontSize || "medium");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [copyCount, setCopyCount] = useState(widget.copy_count || 0);

  const handleCopyLink = async () => {
    // 임베드 링크 생성 (쿼리 파라미터로 설정값 전달)
    const baseUrl = widget.embed_url || `${window.location.origin}/embed/${widget.id}`;
    const embedUrl = `${baseUrl}?theme=${encodeURIComponent(themeColor)}&size=${fontSize}`;
    
    try {
      await navigator.clipboard.writeText(embedUrl);
      setIsToastVisible(true);
      setTimeout(() => setIsToastVisible(false), 3000);

      // 복사수 통계 증가 API 호출
      const res = await fetch(`/api/widgets/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetId: widget.id })
      });
      if (res.ok) {
        setCopyCount((prev: number) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to copy', err);
      alert('링크 복사에 실패했습니다. 직접 복사해주세요: ' + embedUrl);
    }
  };

  const handleToggleFavorite = async () => {
    if (!userId) {
      alert('관심 위젯을 저장하려면 구글 로그인이 필요해요!');
      return;
    }

    const newStatus = !isFavorited;
    setIsFavorited(newStatus); // Optimistic update

    if (newStatus) {
      await supabase.from('favorites').insert({ user_id: userId, widget_id: widget.id });
      await supabase.from('widgets').update({ like_count: (widget.like_count || 0) + 1 }).eq('id', widget.id);
    } else {
      await supabase.from('favorites').delete().match({ user_id: userId, widget_id: widget.id });
      await supabase.from('widgets').update({ like_count: Math.max(0, (widget.like_count || 0) - 1) }).eq('id', widget.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-24 lg:pb-8">
      {/* 1. 좌측 영역: 실시간 위젯 미리보기 */}
      <div className="flex-1 flex flex-col">
        <Link href="/widgets" className="text-forest-green font-bold mb-4 hover:underline inline-flex items-center gap-2">
          ← 위젯 진열대로 돌아가기
        </Link>
        <div className="bg-white rounded-[24px] border border-toast-brown/30 flex-1 min-h-[400px] flex items-center justify-center relative overflow-hidden shadow-sm">
          {/* 장식용 텍스쳐 */}
          <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>
          
          {/* 위젯 실제 렌더링 시뮬레이션 (MVP에서는 div로 모의 렌더링) */}
          <div 
            className="p-8 rounded-[18px] shadow-md border border-toast-brown/20 transition-all duration-300 z-10"
            style={{ 
              backgroundColor: themeColor,
              transform: fontSize === "small" ? "scale(0.8)" : fontSize === "large" ? "scale(1.2)" : "scale(1)"
            }}
          >
            <div className="text-center font-bold text-ink bg-white/80 px-6 py-4 rounded-xl backdrop-blur-sm">
              <span className="block text-sm opacity-70 mb-1">{widget.name} 미리보기</span>
              <span className="text-3xl">D - 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 우측 영역: 상세 정보 및 커스터마이저 패널 */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-[24px] border border-toast-brown/30 p-6 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-ink">{widget.name}</h1>
            <button 
              onClick={handleToggleFavorite}
              className={`text-2xl hover:scale-110 transition-transform ${isFavorited ? 'text-strawberry-pink' : 'text-gray-300'}`}
              title={isFavorited ? '관심 취소' : '관심 위젯으로 저장'}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink font-medium mb-4 pb-4 border-b border-toast-brown/20">
            {widget.creator_profiles?.character_image_url ? (
              <img 
                src={widget.creator_profiles.character_image_url} 
                alt={widget.creator_profiles?.nickname || '제빵사'} 
                className="w-8 h-8 rounded-full object-cover border border-toast-brown/20"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-custard-cream flex items-center justify-center text-sm">👨‍🍳</span>
            )}
            <Link href={`/creators/${widget.creator_profiles?.nickname}`} className="hover:underline hover:text-forest-green">
              {widget.creator_profiles?.nickname || '익명의 제빵사'}의 작업대
            </Link>
          </div>
          <p className="text-ink/80 text-sm leading-relaxed mb-4">
            {widget.long_description || widget.short_description}
          </p>
          
          <div className="flex items-center gap-4 text-xs font-bold text-ink/50 bg-bakery-beige px-4 py-2 rounded-xl">
            <span title="조회수">👀 {widget.view_count || 0}</span>
            <span title="복사수">📋 {copyCount}</span>
            <span title="좋아요 수">❤️ {widget.like_count || (isFavorited ? 1 : 0)}</span>
          </div>
        </div>

        {/* 설정 패널 */}
        <div className="bg-white rounded-[24px] border border-toast-brown/30 p-6 shadow-sm flex-1">
          <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <span>🎨</span> 위젯 입맛대로 꾸미기
          </h2>
          
          <div className="space-y-6">
            {/* 테마 색상 */}
            <div>
              <label className="block text-sm font-bold text-ink mb-2">배경 테마 색상</label>
              <div className="flex gap-3">
                {['#F6A9B8', '#FFF2C7', '#285C3A', '#8B5E3C', '#F7F1E8'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${themeColor === color ? 'border-ink scale-110' : 'border-transparent shadow-sm'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* 크기 설정 */}
            <div>
              <label className="block text-sm font-bold text-ink mb-2">위젯 크기</label>
              <div className="flex gap-2 bg-bakery-beige p-1 rounded-xl border border-toast-brown/20">
                {['small', 'medium', 'large'].map(size => (
                  <button 
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${fontSize === size ? 'bg-white text-forest-green shadow-sm' : 'text-ink/60 hover:text-ink'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 초기화 버튼 */}
            <div className="pt-4 border-t border-toast-brown/20">
              <button 
                onClick={() => { setThemeColor('#F6A9B8'); setFontSize('medium'); }}
                className="text-sm font-bold text-toast-brown hover:underline"
              >
                🔄 설정 초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 모바일 하단 고정 & 데스크톱 우측 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-toast-brown/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:relative lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none z-50">
        <button 
          onClick={handleCopyLink}
          className="w-full bg-forest-green text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-forest-green/90 transition-colors flex items-center justify-center gap-2"
        >
          <span>📋</span> 노션에 담기 · 링크 복사
        </button>
      </div>

      {/* 4. 토스트 메시지 */}
      {isToastVisible && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-ink text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-3 animate-bounce z-50">
          <span>🍞</span> 노션에 담을 준비가 됐슈!
        </div>
      )}
    </div>
  );
}
