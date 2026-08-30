"use client";

import { useState } from "react";
import Link from "next/link";
import { Widget } from "@/utils/firebase/types";

export default function WidgetDetailClient({ 
  widget, 
  initialIsFavorited,
  userId,
  canEdit = false
}: { 
  widget: Widget;
  initialIsFavorited: boolean;
  userId?: string;
  canEdit?: boolean;
}) {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("노션에 담을 준비가 됐슈! 🍕");
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [copyCount, setCopyCount] = useState(widget.copy_count || 0);
  const [isFavPending, setIsFavPending] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const handleCopyLink = async () => {
    const embedUrl = widget.embed_url || `${window.location.origin}/embed/${widget.id}`;
    
    try {
      await navigator.clipboard.writeText(embedUrl);
      showToast("노션에 담을 링크를 복사했슈! 🍕");

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
      alert('관심 위젯을 저장하려면 구글 로그인이 필요해요! 🍕');
      return;
    }

    if (isFavPending) return;

    const newStatus = !isFavorited;
    setIsFavorited(newStatus); // Optimistic update
    setIsFavPending(true);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetId: widget.id, isFavorited: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await res.json();
      showToast(data.message || (newStatus ? "내가 찜한 피자에 담았슈! 🍕" : "찜 목록에서 제외했슈."));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorited(!newStatus); // Revert on failure
      showToast("찜하기 처리에 실패했슈.");
    } finally {
      setIsFavPending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-24 lg:pb-8">
      {/* 1. 좌측 영역: 실시간 위젯 미리보기 */}
      <div className="flex-1 flex flex-col">
        <Link href="/widgets" className="text-forest-green font-bold mb-4 hover:underline inline-flex items-center gap-2">
          ← 위젯 진열대로 돌아가기
        </Link>
        <div className="bg-white rounded-[24px] border border-toast-brown/30 flex-1 min-h-[420px] flex items-center justify-center relative overflow-hidden shadow-sm">
          {/* 장식용 텍스쳐 */}
          <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>
          
          {/* 위젯 실제 렌더링 / 임베드 iframe 또는 미리보기 시뮬레이션 */}
          {widget.thumbnail_url ? (
            <div className="w-full h-full p-6 flex items-center justify-center">
              <img 
                src={widget.thumbnail_url} 
                alt={widget.name} 
                className="max-h-[360px] object-contain rounded-2xl shadow-sm border border-toast-brown/20" 
              />
            </div>
          ) : (
            <div className="p-8 rounded-[20px] shadow-md border border-toast-brown/20 bg-bakery-beige/80 backdrop-blur-sm z-10 text-center max-w-sm">
              <img src="/pizza_icon.png" alt="피자" className="w-16 h-16 mx-auto object-contain mb-3" />
              <h3 className="text-xl font-bold text-ink mb-2">{widget.name}</h3>
              <p className="text-sm text-ink/70 font-medium mb-4">{widget.short_description}</p>
              <div className="inline-block bg-forest-green text-white text-xs font-bold px-3 py-1 rounded-full">
                {widget.categories?.name || '개발했슈 1기'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 우측 영역: 상세 정보 패널 */}
      <div className="w-full lg:w-[420px] flex flex-col gap-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-[24px] border border-toast-brown/30 p-6 sm:p-8 shadow-sm flex flex-col justify-between flex-1">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block bg-forest-green/10 text-forest-green text-xs font-bold px-3 py-1 rounded-full mb-2">
                  {widget.categories?.name || '개발했슈 1기'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{widget.name}</h1>
              </div>
              <button 
                onClick={handleToggleFavorite}
                className={`text-3xl hover:scale-125 transition-transform ${isFavorited ? 'text-strawberry-pink' : 'text-gray-300 hover:text-strawberry-pink'}`}
                title={isFavorited ? '찜 취소' : '관심 위젯으로 찜하기'}
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-ink font-medium mb-6 pb-5 border-b border-toast-brown/20">
              {widget.creator_profiles?.character_image_url ? (
                <img 
                  src={widget.creator_profiles.character_image_url} 
                  alt={widget.creator_profiles?.nickname || '제빵사'} 
                  className="w-10 h-10 rounded-full object-cover border border-toast-brown/20"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-custard-cream flex items-center justify-center text-lg">🧑‍🍳</span>
              )}
              <div>
                <Link href={`/creators/${widget.creator_profiles?.nickname || ''}`} className="font-bold text-ink hover:underline hover:text-forest-green block">
                  {widget.creator_profiles?.nickname || '익명의 제빵사'}
                </Link>
                <span className="text-xs text-ink/50">개발했슈 1기 제작자</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-xs font-bold text-toast-brown uppercase tracking-wider mb-1">소개</h3>
                <p className="text-ink/80 text-sm leading-relaxed whitespace-pre-line">
                  {widget.long_description || widget.short_description}
                </p>
              </div>

              {widget.creator_comment && (
                <div className="bg-bakery-beige/60 p-4 rounded-xl border border-toast-brown/20">
                  <h4 className="text-xs font-bold text-forest-green mb-1">💬 제작자의 한 마디</h4>
                  <p className="text-xs text-ink/80">{widget.creator_comment}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold text-ink/60 bg-bakery-beige px-4 py-3 rounded-xl mb-6">
              <span title="조회수">👀 조회수 {widget.view_count || 0}</span>
              <span title="복사수">📋 복사 {copyCount}</span>
              <span title="좋아요 수">❤️ 찜 {widget.like_count || (isFavorited ? 1 : 0)}</span>
            </div>
          </div>

          {/* 노션에 담기 / 링크 복사 버튼 & 수정 버튼 */}
          <div className="pt-4 border-t border-toast-brown/20 flex flex-col gap-3">
            {canEdit && (
              <Link
                href={`/creators/widgets/${widget.id}/edit`}
                className="w-full py-3 rounded-xl bg-white border-2 border-forest-green text-forest-green font-bold text-center hover:bg-forest-green/5 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span>✏️</span> 위젯 정보 수정하기
              </Link>
            )}
            <button 
              onClick={handleCopyLink}
              className="w-full bg-forest-green text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-forest-green/90 transition-all shadow-[0_3px_0_#1c452b] active:shadow-none active:translate-y-[3px] flex items-center justify-center gap-2"
            >
              <span>📋</span> 노션에 담기 · 링크 복사
            </button>
            <p className="text-center text-xs text-ink/50 mt-1">
              복사한 링크를 노션 페이지에 붙여넣고 [임베드 생성]을 누르면 바로 작동해요! 🍕
            </p>
          </div>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {isToastVisible && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-ink text-white px-6 py-3.5 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-bounce z-50">
          <span>🍕</span> {toastMessage}
        </div>
      )}
    </div>
  );
}

