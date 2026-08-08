"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const homeBanners = [
  {
    image: "", // Use fallback UI
    alt: "새로운 위젯이 도착했어요",
    href: "/widgets",
    label: "NEW WIDGETS FROM 개발했슈",
    title: "새로운 위젯이 도착했어요",
    text: "개발했슈 제빵사들의 소식을 만나보세요",
  },
  {
    image: "",
    alt: "무료 노션 위젯 모음",
    href: "/widgets",
    label: "FREE NOTION WIDGETS",
    title: "노션에 바로 담아보세요",
    text: "필요한 기능을 골라 링크 하나로 시작해요",
  },
  {
    image: "",
    alt: "개발했슈 제빵사 이야기",
    href: "/creators",
    label: "MEET THE BAKERS",
    title: "아이디어를 함께 구워요",
    text: "개발했슈 제빵사들의 작품을 만나보세요",
  },
];

export default function HeroBanner() {
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((current) => (current + 1) % homeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = homeBanners[bannerIndex];

  return (
    <div className="w-full flex flex-col gap-12 mb-16">
      {/* 1. News Banner (Rolling) */}
      <div className="relative w-full h-[400px] md:h-[480px] rounded-[24px] border border-toast-brown/20 overflow-hidden bg-[radial-gradient(circle_at_72%_50%,#fff2c7_0%,#fffaf1_28%,#ffffff_62%)] shadow-sm">
        {banner.image ? (
          <Link href={banner.href} aria-label={banner.alt} className="block w-full h-full">
            <img src={banner.image} alt={banner.alt} className="w-full h-full object-contain" />
          </Link>
        ) : (
          <Link href={banner.href} className="block w-full h-full relative group">
            {/* Orbits */}
            <div className="absolute top-[12%] left-[8%] w-[140px] md:w-[240px] h-[70px] md:h-[120px] border-[3px] border-strawberry-pink rounded-[50%] opacity-40 blur-[1px] -rotate-[25deg] transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute bottom-[10%] left-[28%] w-[120px] md:w-[200px] h-[60px] md:h-[100px] border-[3px] border-strawberry-pink rounded-[50%] opacity-40 blur-[1px] rotate-[20deg] transition-transform duration-700 group-hover:scale-105" />
            
            {/* Copy */}
            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col gap-3 text-left z-10 w-[60%] max-w-lg">
              <span className="font-mono text-xs md:text-sm tracking-[1.5px] text-toast-brown/80 font-bold">{banner.label}</span>
              <h2 className="text-3xl md:text-[clamp(25px,4vw,58px)] font-extrabold text-forest-green tracking-tight leading-tight">{banner.title}</h2>
              <span className="text-sm md:text-lg text-toast-brown font-medium">{banner.text} →</span>
            </div>
          </Link>
        )}

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {homeBanners.map((item, index) => (
            <button
              key={item.alt}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === bannerIndex ? "w-8 bg-forest-green" : "w-2.5 bg-toast-brown/30 hover:bg-toast-brown/50"
              }`}
              onClick={() => setBannerIndex(index)}
              aria-label={`${index + 1}번째 배너`}
            />
          ))}
        </div>
      </div>

      {/* 2. Main Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-24 px-8 lg:px-16 py-12 lg:py-16 bg-bakery-beige rounded-[32px] border border-toast-brown/10 relative overflow-hidden shadow-sm">
        {/* 장식용 종이 질감 */}
        <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none"></div>
        
        <div className="flex-1 relative z-10 min-w-0">
          <div className="flex items-center gap-4 text-xs font-bold tracking-[1.2px] text-toast-brown/80 font-mono mb-6">
            <span>DEVELOPED BY 개발했슈</span>
            <span>✦ FREE NOTION WIDGETS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[clamp(40px,3.5vw,58px)] font-extrabold text-ink mb-6 leading-[1.25] tracking-[-1.3px] break-keep">
            노션에 필요한 기능,<br />
            <span className="text-forest-green font-normal italic">우리가 직접 구웠슈!</span>
          </h1>
          <p className="text-base sm:text-lg text-ink/80 mb-8 font-medium leading-[1.8]">
            개발했슈 제빵사들이 바이브코딩으로 만든<br className="hidden sm:block" />
            무료 위젯을 구경하고 바로 내 노션에 담아보세요.
          </p>
          <div className="flex gap-4">
            <Link
              href="/widgets"
              className="bg-forest-green text-white font-bold py-3.5 px-6 rounded-lg hover:bg-forest-green/90 transition-all shadow-[0_3px_0_#1c452b] active:shadow-none active:translate-y-[3px] flex items-center gap-2"
            >
              갓 구운 위젯 구경하기 <span className="text-xl">→</span>
            </Link>
          </div>
        </div>

        {/* Hero Art */}
        <div className="relative w-[300px] sm:w-[380px] h-[300px] flex-shrink-0 z-10 hidden md:block">
          <div className="absolute top-2 left-20 text-3xl text-toast-brown/60 tracking-widest">〰　〰</div>
          <div className="text-[142px] drop-shadow-[0_15px_2px_#dfd0bd] mt-10 -rotate-[8deg] text-center transition-transform hover:rotate-0 duration-300 cursor-default">🍞</div>
          
          <div className="absolute top-[100px] right-[22px] bg-custard-cream border-2 border-toast-brown rounded-full w-[135px] h-[135px] flex items-center justify-center rotate-[8deg] text-toast-brown font-bold text-center text-sm shadow-[inset_0_0_0_8px_#fae9b1] leading-[1.4]">
            <div className="pt-2">오늘도<br /><span className="text-[20px] font-extrabold">천천히</span><br />구워요</div>
          </div>

          <span className="absolute top-[73px] left-[21px] bg-[#f9dce2] text-[#a95368] font-bold px-2.5 py-1.5 text-[11px] rounded-[3px] -rotate-[8deg]">
            무료예요!
          </span>
          <span className="absolute bottom-[28px] right-[5px] bg-[#dce9d6] text-forest-green font-bold px-2.5 py-1.5 text-[11px] rounded-[3px] rotate-[8deg] text-left leading-[1.4]">
            made with<br />바이브코딩
          </span>
        </div>
      </section>
    </div>
  );
}
