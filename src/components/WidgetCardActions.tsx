"use client";

import React, { useState } from 'react';
import { useToast } from './Toast';

export function WidgetCardHeart({ 
  widget, 
  initialIsFavorited = false, 
  userId 
}: { 
  widget: any;
  initialIsFavorited?: boolean;
  userId?: string;
}) {
  const { showToast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, setIsPending] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!userId) {
      showToast("관심 위젯을 찜하려면 로그인이 필요해유! 🍕");
      return;
    }

    if (isPending) return;

    const nextState = !isFavorited;
    setIsFavorited(nextState); // Optimistic UI
    setIsPending(true);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: widget.id,
          isFavorited: nextState,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update favorite');
      }

      const data = await res.json();
      showToast(data.message || (nextState ? "내가 찜한 피자에 담았슈! 🍕" : "찜 목록에서 제외했슈."));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setIsFavorited(!nextState); // Revert on failure
      showToast("찜하기 처리에 실패했슈. 다시 시도해주세유.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      className={`absolute right-3 top-3 text-2xl z-20 transition-transform hover:scale-125 ${
        isFavorited ? 'text-strawberry-pink drop-shadow-sm' : 'text-toast-brown/40 hover:text-strawberry-pink drop-shadow-sm'
      }`}
      onClick={handleFavorite}
      aria-label="관심 위젯 찜하기"
      title={isFavorited ? "찜 취소" : "관심 피자로 찜하기"}
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  );
}

export function WidgetCardCopy({ widget }: { widget: any }) {
  const { showToast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const embedUrl = widget.embed_url || `${window.location.origin}/embed/${widget.id}`;
    navigator.clipboard.writeText(embedUrl).then(() => {
      showToast("노션에 담을 링크를 복사했슈! 🍕");
    }).catch(() => {
      showToast("링크 복사에 실패했슈.");
    });
  };

  return (
    <button 
      className="flex items-center gap-1.5 text-[11px] font-bold text-forest-green hover:underline z-10"
      onClick={handleCopy}
      title="노션 임베드 링크 복사"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      링크 복사
    </button>
  );
}

