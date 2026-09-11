"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GoogleAuthButton from "./GoogleAuthButton";
import LogoutButton from "./LogoutButton";

interface ResponsiveNavProps {
  user: any;
  role: string;
}

export default function ResponsiveNav({ user, role }: ResponsiveNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 페이지 이동 시 드로어 자동 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // 드로어 열릴 때 배경 스크롤 잠금 및 ESC 키 닫기 이벤트
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "홈", icon: "🏠" },
    {
      href: "/widgets",
      label: "위젯 진열대",
      customIcon: (
        <img
          src="/pizza_icon.png"
          alt="피자"
          className="w-4 h-4 object-contain"
        />
      ),
    },
    { href: "/creators", label: "제작자 소개", icon: "🧑‍🍳" },
    { href: "/about", label: "개발했슈 소개", icon: "🏢" },
    { href: "/guide", label: "설치 방법", icon: "📖" },
  ];

  const renderNavItems = () => (
    <nav className="flex-1 px-4 flex flex-col gap-2">
      {navLinks.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2.5 transition-colors ${
              isActive
                ? "bg-forest-green text-white font-bold shadow-xs"
                : "text-ink hover:bg-bakery-beige"
            }`}
          >
            {item.customIcon || <span>{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderUserActions = () => (
    <div className="p-4 border-t border-toast-brown/30 flex flex-col gap-2">
      {user ? (
        <>
          {role === "admin" && (
            <Link
              href="/admin"
              className="w-full text-center py-3 rounded-xl bg-toast-brown text-white font-bold hover:bg-toast-brown/90 transition-colors text-sm shadow-xs"
            >
              🛠️ 관리자 페이지
            </Link>
          )}
          {role === "provider" || role === "creator" || role === "admin" ? (
            <Link
              href="/creators/widgets/new"
              className="w-full text-center py-3 rounded-xl bg-forest-green text-white font-bold hover:bg-forest-green/90 transition-colors flex items-center justify-center gap-1.5 text-sm shadow-xs"
            >
              <img
                src="/pizza_icon.png"
                alt="피자"
                className="w-4 h-4 object-contain brightness-0 invert"
              />
              <span>새 위젯 굽기</span>
            </Link>
          ) : (
            <Link
              href="/creators/join"
              className="w-full text-center py-3 rounded-xl bg-custard-cream/60 border border-toast-brown/30 text-ink font-bold hover:bg-custard-cream transition-colors text-sm"
            >
              🧑‍🍳 1기 제작자 인증하기
            </Link>
          )}
          <Link
            href="/mypage"
            className="w-full text-center py-3 rounded-xl border-2 border-forest-green text-forest-green font-bold hover:bg-forest-green/5 transition-colors text-sm"
          >
            내 작업대 (마이페이지)
          </Link>
          <LogoutButton />
        </>
      ) : (
        <GoogleAuthButton />
      )}
    </div>
  );

  return (
    <>
      {/* 1. 모바일 상단 고정 헤더 (화면 폭 < lg: 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-toast-brown/20 px-4 h-16 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/pizza_icon.png"
            alt="개발했슈"
            className="w-7 h-7 object-contain group-hover:rotate-12 transition-transform"
          />
          <div>
            <span className="text-xl font-bold text-forest-green">개발했슈</span>
            <span className="text-[10px] text-toast-brown block -mt-1 font-medium">
              노션 바이브 코딩
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              href="/mypage"
              className="p-2 text-forest-green hover:bg-forest-green/10 rounded-xl transition-colors text-sm font-bold flex items-center gap-1"
              aria-label="마이페이지"
            >
              <span>🧑‍🍳</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-xl hover:bg-bakery-beige text-ink transition-colors focus:outline-hidden focus:ring-2 focus:ring-forest-green/30"
            aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* 2. 모바일 드로어 오버레이 백드롭 */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* 3. 모바일 슬라이드인 드로어 */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="모바일 네비게이션 메뉴"
      >
        <div className="p-5 flex items-center justify-between border-b border-toast-brown/15">
          <div>
            <h2 className="text-xl font-bold text-forest-green flex items-center gap-2">
              <img
                src="/pizza_icon.png"
                alt="개발했슈"
                className="w-6 h-6 object-contain"
              />
              <span>개발했슈</span>
            </h2>
            <p className="text-[11px] text-toast-brown mt-0.5 font-medium">
              노션 바이브 코딩 동아리
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-ink/70 hover:text-ink hover:bg-bakery-beige transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">{renderNavItems()}</div>

        {renderUserActions()}
      </aside>

      {/* 4. 데스크톱 고정 사이드바 (화면 폭 >= lg: 1024px) */}
      <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 bg-white border-r border-toast-brown/30 flex-col z-30">
        <div className="p-6">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-forest-green flex items-center gap-2">
              <img
                src="/pizza_icon.png"
                alt="개발했슈"
                className="w-7 h-7 object-contain"
              />
              <span>개발했슈</span>
            </h1>
            <p className="text-xs text-toast-brown mt-1">노션 바이브 코딩 동아리</p>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">{renderNavItems()}</div>

        {renderUserActions()}
      </aside>
    </>
  );
}
