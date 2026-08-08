"use client";

import React, { useState } from 'react';
import { useToast } from './Toast';

export function WidgetCardHeart({ widget }: { widget: any }) {
  const { showToast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false); // In real app, init from props

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      showToast("관심 위젯에 담았슈!");
    }
  };

  return (
    <button
      className={`absolute right-3 top-3 text-2xl z-10 transition-transform hover:scale-110 ${isFavorited ? 'text-strawberry-pink' : 'text-toast-brown/50 hover:text-strawberry-pink drop-shadow-sm'}`}
      onClick={handleFavorite}
      aria-label="관심 위젯"
    >
      {isFavorited ? '♥' : '♡'}
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
      showToast("노션에 담을 링크를 복사했슈!");
    });
  };

  return (
    <button 
      className="flex items-center gap-1.5 text-[11px] font-bold text-forest-green hover:underline z-10"
      onClick={handleCopy}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      링크 복사
    </button>
  );
}
