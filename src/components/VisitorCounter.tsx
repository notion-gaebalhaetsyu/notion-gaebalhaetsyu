"use client";

import React, { useEffect, useState } from 'react';

interface VisitorCounterProps {
  initialStats?: {
    todayCount: number;
    totalCount: number;
  };
}

export default function VisitorCounter({ initialStats }: VisitorCounterProps) {
  const [stats, setStats] = useState(
    initialStats || { todayCount: 0, totalCount: 0 }
  );
  const [isLoading, setIsLoading] = useState(!initialStats);

  useEffect(() => {
    let isMounted = true;

    async function recordVisit() {
      try {
        const res = await fetch('/api/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && (typeof data.todayCount === 'number' || typeof data.totalCount === 'number')) {
            setStats({
              todayCount: data.todayCount ?? 0,
              totalCount: data.totalCount ?? 0,
            });
          }
        }
      } catch (error) {
        console.error('Failed to record visit:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    recordVisit();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative inline-flex items-center">
      <div 
        className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full border border-toast-brown/20 shadow-xs hover:shadow-sm hover:border-toast-brown/40 transition-all duration-200 cursor-default select-none"
        aria-label={`오늘 방문자 ${stats.todayCount}명, 전체 방문자 ${stats.totalCount}명`}
      >
        {/* 실시간 펄스 인디케이터 */}
        <span className="relative flex h-2 w-2 flex-shrink-0" title="실시간 집계 중">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        {/* 방문자 아이콘 */}
        <span className="text-xs text-toast-brown flex-shrink-0" aria-hidden="true">
          👥
        </span>

        {/* 오늘 방문자 */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-ink/65">
            오늘
          </span>
          <span className="text-xs sm:text-sm font-bold text-forest-green tracking-tight font-mono">
            {isLoading ? '...' : stats.todayCount.toLocaleString('ko-KR')}
          </span>
        </div>

        {/* 구분선 */}
        <span className="w-px h-3 bg-toast-brown/25 inline-block" aria-hidden="true" />

        {/* 전체 누적 방문자 */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-ink/65">
            전체
          </span>
          <span className="text-xs sm:text-sm font-bold text-ink tracking-tight font-mono">
            {isLoading ? '...' : stats.totalCount.toLocaleString('ko-KR')}
          </span>
        </div>
      </div>
    </div>
  );
}
