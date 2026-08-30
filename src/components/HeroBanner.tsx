"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export const homeBanners = [
  {
    id: "new-widgets",
    type: "image-banner",
    image: "/banner_widgets.jpg",
    alt: "노션에 필요한 기능, 우리가 직접 구웠슈!",
    href: "/widgets",
    badge: "✦ 개발했슈 1기 갓 구운 위젯",
    title: "새로운 위젯이 도착했어요 🍕",
    desc: "개발했슈 1기 제빵사들의 톡톡 튀는 아이디어 위젯을 만나보세요.",
    btnText: "위젯 진열대 바로가기",
  },
  {
    id: "hero",
    type: "hero",
    label: "DEVELOPED BY 개발했슈 ✦ FREE NOTION WIDGETS",
    title: "노션에 필요한 기능,",
    titleHighlight: "우리가 직접 구웠슈! 🍕",
    desc: "개발했슈 1기 제빵사들이 바이브코딩으로 정성껏 구운\n무료 노션 위젯을 구경하고 내 노션에 바로 담아보세요.",
    btnText: "갓 구운 위젯 진열대 구경하기",
    href: "/widgets",
    mascotImg: "/pizza_slice_chef.jpg",
  },
  {
    id: "creators",
    type: "creators",
    label: "MEET THE BAKERS 🧑‍🍳",
    title: "아이디어를 함께 구워요",
    titleHighlight: "1기 제빵사들의 이야기",
    desc: "직접 노션 위젯을 기획하고 구워낸 제빵사들의\n프로필과 작업 비하인드를 확인해보세요.",
    btnText: "제작자 소개 보러가기",
    href: "/creators",
  },
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % homeBanners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + homeBanners.length) % homeBanners.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative w-full mb-14 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Carousel Container */}
      <div className="relative w-full min-h-[380px] sm:min-h-[420px] lg:h-[460px] rounded-[32px] overflow-hidden border border-toast-brown/15 shadow-sm bg-bakery-beige">
        {homeBanners.map((slide, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* SLIDE 1: Hero Banner (Default) */}
              {slide.type === "hero" && (
                <div className="w-full h-full relative flex flex-col-reverse lg:flex-row items-center justify-between gap-6 lg:gap-12 px-6 sm:px-10 lg:px-14 py-8 lg:py-10 bg-[radial-gradient(ellipse_at_top_left,#fff8eb_0%,#f7f1e8_55%,#eddcc7_100%)] overflow-hidden">
                  {/* Subtle decorative elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-custard-cream/60 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-strawberry-pink/15 rounded-full blur-2xl pointer-events-none" />

                  {/* Left Content */}
                  <div className="flex-1 relative z-10 min-w-0 flex flex-col items-start justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-toast-brown/20 shadow-xs mb-3.5">
                      <span className="font-mono text-xs font-bold tracking-[1px] text-toast-brown">
                        {slide.label}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-[clamp(32px,2.8vw,48px)] font-extrabold text-ink mb-3.5 leading-[1.25] tracking-[-1px] break-keep">
                      {slide.title} <br className="hidden sm:inline" />
                      <span className="text-forest-green font-normal italic">
                        {slide.titleHighlight}
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base lg:text-lg text-ink/75 mb-6 font-medium leading-[1.65] whitespace-pre-line break-keep">
                      {slide.desc}
                    </p>

                    <div>
                      <Link
                        href={slide.href}
                        className="inline-flex items-center gap-2.5 bg-forest-green text-white font-bold py-3 px-6 rounded-xl hover:bg-forest-green/90 transition-all shadow-[0_3px_0_#1c452b] active:shadow-none active:translate-y-[3px] text-sm sm:text-base group"
                      >
                        <span>{slide.btnText}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>

                  {/* Right Mascot */}
                  <div className="relative w-[180px] sm:w-[240px] lg:w-[320px] aspect-square flex-shrink-0 z-10">
                    <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white relative group">
                      <img
                        src={slide.mascotImg}
                        alt="개발했슈 피자 마스코트"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-[#f9dce2] text-[#a95368] font-bold px-2.5 py-0.5 text-xs rounded-full shadow-xs">
                        100% 무료! 🍕
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-custard-cream/95 text-toast-brown font-extrabold px-2.5 py-1 text-[11px] sm:text-xs rounded-xl shadow-md border border-toast-brown/20 text-center leading-tight">
                        오늘도 따끈하게<br />
                        <span className="text-forest-green text-xs sm:text-sm">구워냈슈!</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: Image Banner */}
              {slide.type === "image-banner" && (
                <div className="w-full h-full relative">
                  <img
                    src={slide.image}
                    alt={slide.alt || "배너 이미지"}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-end sm:items-center p-6 sm:p-12 lg:p-16">
                    <div className="text-white max-w-xl">
                      <span className="inline-block bg-forest-green text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-xs">
                        {slide.badge}
                      </span>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2.5 drop-shadow-md">
                        {slide.title}
                      </h2>
                      <p className="text-sm sm:text-base text-white/90 font-medium mb-6 leading-relaxed">
                        {slide.desc}
                      </p>
                      <Link
                        href={slide.href || "/widgets"}
                        className="inline-flex items-center gap-2 bg-white text-ink font-bold py-2.5 px-5 rounded-xl hover:bg-white/90 transition-all shadow-md text-sm sm:text-base group"
                      >
                        <span>{slide.btnText}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: Meet the Bakers Banner */}
              {slide.type === "creators" && (
                <div className="w-full h-full relative flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 bg-[radial-gradient(ellipse_at_bottom_right,#fff2c7_0%,#fbf6ee_50%,#f0e3d2_100%)] overflow-hidden">
                  {/* Decorative Circles */}
                  <div className="absolute -top-12 -right-12 w-64 h-64 border-4 border-strawberry-pink/30 rounded-full blur-[1px] pointer-events-none" />
                  <div className="absolute bottom-6 right-1/4 w-48 h-48 border-4 border-forest-green/20 rounded-full blur-[1px] pointer-events-none" />

                  <div className="relative z-10 max-w-xl">
                    <span className="font-mono text-xs font-bold tracking-[1.5px] text-toast-brown/80 mb-2 inline-block">
                      {slide.label}
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-green mb-1.5 leading-tight">
                      {slide.title}
                    </h2>
                    <h3 className="text-xl sm:text-2xl font-bold text-ink mb-3">
                      {slide.titleHighlight}
                    </h3>
                    <p className="text-sm sm:text-base text-toast-brown font-medium mb-6 whitespace-pre-line leading-relaxed">
                      {slide.desc}
                    </p>
                    <Link
                      href={slide.href || "/creators"}
                      className="inline-flex items-center gap-2 bg-toast-brown text-white font-bold py-3 px-6 rounded-xl hover:bg-toast-brown/90 transition-all shadow-[0_3px_0_#5e3c23] active:shadow-none active:translate-y-[3px] text-sm sm:text-base group"
                    >
                      <span>{slide.btnText}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Left / Right Arrow Controls */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="이전 슬라이드"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-ink/80 hover:text-ink shadow-md flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="다음 슬라이드"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-ink/80 hover:text-ink shadow-md flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom Pagination Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {homeBanners.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-7 bg-white shadow-xs"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}번째 슬라이드로 이동`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

