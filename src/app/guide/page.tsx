import React from 'react'
import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="pb-24 max-w-4xl mx-auto space-y-12">
      {/* 헤더 */}
      <section className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-extrabold text-ink mb-4 flex items-center justify-center gap-3">
          <img src="/pizza_icon.png" alt="피자" className="w-9 h-9 object-contain" />
          <span>노션에 위젯 굽는 방법 (설치 가이드)</span>
        </h1>
        <p className="text-lg text-ink/70 font-medium max-w-2xl mx-auto leading-relaxed">
          노션을 처음 쓰시는 분들도 1분 만에 따라 할 수 있을 만큼 아주 쉬워요!<br/>
          아래 순서대로 차근차근 따라 해보세요. 🍕
        </p>
      </section>

      {/* 가이드 스텝 */}
      <div className="space-y-8">
        
        {/* Step 1 */}
        <section className="bg-white rounded-[32px] p-8 md:p-10 border border-toast-brown/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-forest-green text-white rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-md">
            1
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-ink mb-3">마음에 드는 피자(위젯) 고르기</h2>
            <p className="text-ink/80 font-medium leading-relaxed mb-4">
              먼저 <Link href="/widgets" className="text-forest-green font-bold hover:underline">위젯 진열대</Link>에 가서 내 노션에 어울릴 만한 위젯을 선택해 주세요.<br/>
              개발했슈 1기 제작자들이 구워낸 다양한 피자 위젯들이 기다리고 있슈!
            </p>
            <Link href="/widgets" className="inline-block bg-bakery-beige text-ink font-bold px-5 py-2.5 rounded-xl hover:bg-toast-brown/20 transition-colors">
              진열대 구경가기 🏃‍♀️
            </Link>
          </div>
        </section>

        {/* Step 2 */}
        <section className="bg-white rounded-[32px] p-8 md:p-10 border border-toast-brown/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row-reverse gap-8 items-center">
          <div className="w-20 h-20 bg-toast-brown text-white rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-md">
            2
          </div>
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-2xl font-bold text-ink mb-3">위젯 링크 복사하기</h2>
            <p className="text-ink/80 font-medium leading-relaxed">
              위젯 상세 페이지에서 <strong className="text-forest-green bg-forest-green/10 px-2.5 py-1 rounded-lg">📋 노션에 담기 · 링크 복사</strong> 버튼을 눌러주세요.<br/>
              노션에 바로 삽입할 수 있는 위젯 링크가 클립보드에 복사됩니다.
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="bg-white rounded-[32px] p-8 md:p-10 border border-toast-brown/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-forest-green text-white rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-md">
            3
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-ink mb-3">노션 페이지에 붙여넣기</h2>
            <p className="text-ink/80 font-medium leading-relaxed">
              내 노션(Notion) 페이지를 열고, 위젯을 넣고 싶은 위치를 클릭한 뒤<br/>
              방금 복사한 링크를 그대로 붙여넣기 해주세요! (단축키: <code>Ctrl + V</code> 또는 <code>Cmd + V</code>)
            </p>
          </div>
        </section>

        {/* Step 4 */}
        <section className="bg-white rounded-[32px] p-8 md:p-10 border border-toast-brown/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row-reverse gap-8 items-center">
          <div className="w-20 h-20 bg-toast-brown text-white rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-md">
            4
          </div>
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-2xl font-bold text-ink mb-3">'임베드 생성' 클릭하기</h2>
            <p className="text-ink/80 font-medium leading-relaxed mb-4">
              링크를 붙여넣으면 노션 화면에 세 가지 메뉴가 나타납니다.<br/>
              그중에서 <strong className="text-forest-green font-bold">'임베드 생성(Create embed)'</strong>을 클릭해 주세요.
            </p>
            <div className="inline-block bg-gray-100 text-ink/70 font-bold px-4 py-3 rounded-lg text-sm border border-gray-200">
              <span className="opacity-50">해제</span> / <span className="opacity-50">북마크 생성</span> / <strong className="text-forest-green">임베드 생성</strong>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="bg-white rounded-[32px] p-8 md:p-10 border border-toast-brown/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-forest-green text-white rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-md">
            5
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-ink mb-3">크기 조절하면 끝! 🎉</h2>
            <p className="text-ink/80 font-medium leading-relaxed">
              잠시 기다리면 예쁜 피자 위젯이 노션에 나타납니다.<br/>
              위젯 가장자리 테두리를 마우스로 드래그하여 원하는 크기로 조절하면 완성입니다! 참 쉽죠?
            </p>
          </div>
        </section>
      </div>

      {/* 도움말 박스 */}
      <section className="bg-custard-cream/30 border-2 border-dashed border-toast-brown/30 rounded-3xl p-8 text-center mt-12">
        <h3 className="text-xl font-bold text-ink mb-3 flex items-center justify-center gap-2">
          <span>💡</span> 혹시 잘 안 되시나요?
        </h3>
        <p className="text-ink/80 font-medium leading-relaxed">
          위젯이 안 보이거나 에러가 뜬다면, <code>Ctrl + R</code>(또는 <code>Cmd + R</code>)을 눌러<br/>
          노션 페이지를 새로고침 해보세요! 대부분의 문제가 해결됩니다.
        </p>
      </section>
    </div>
  )
}

