import React from 'react'

export default function AboutPage() {
  return (
    <div className="pb-24 max-w-4xl mx-auto space-y-12">
      {/* 헤더 */}
      <section className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-extrabold text-ink mb-4 flex items-center justify-center gap-3">
          <span>🏢</span> 개발했슈 소개
        </h1>
        <p className="text-lg text-ink/70 font-medium max-w-2xl mx-auto">
          노션에 필요하고 내가 만들고 싶은 기능을 <br/>실제로 구현하고 검증하는 공간, '개발했슈'를 소개합니다.
        </p>
      </section>

      {/* 1. 운영진 (관리자) 소개 */}
      <section className="bg-white rounded-[32px] p-8 border border-toast-brown/20 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-paper-texture opacity-5 pointer-events-none"></div>
        <h2 className="text-2xl font-bold text-ink mb-8 flex items-center gap-2 relative z-10">
          <span>🧑‍🍳</span> 운영진 (관리자) 소개
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          {/* 운영진 1 */}
          <div className="bg-bakery-beige/30 rounded-2xl p-6 border border-toast-brown/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-full border-2 border-forest-green flex items-center justify-center overflow-hidden shadow-sm">
                <img src="/filbert_leader.png" alt="필버트 제빵사" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-bold text-forest-green mb-1">운영진</div>
                <h3 className="text-xl font-bold text-ink">필버트 제빵사</h3>
              </div>
            </div>
            <ul className="space-y-3 text-ink/80 text-sm font-medium">
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> AI대학원 박사과정 재학 중 (수료)</li>
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> 노션 앰버서더 / 공식 템플릿 제작자</li>
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> 기술 개발 및 창업 관련 경진대회 다수 수상<br/>(한국항공우주연구원 창업 아카데미 최우수)</li>
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> 네이버 테크 분야 블로거 (지수: 최적 2+)<br/>(블로그 이웃: 2,961명)</li>
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> Microsoft 광주전남 테크 커뮤니티 회원</li>
            </ul>
          </div>

          {/* 운영진 2 */}
          <div className="bg-bakery-beige/30 rounded-2xl p-6 border border-toast-brown/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-full border-2 border-toast-brown flex items-center justify-center overflow-hidden shadow-sm">
                <img src="/mandoo_leader.png" alt="만두 제빵메이트" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-bold text-toast-brown mb-1">운영진</div>
                <h3 className="text-xl font-bold text-ink">만두 제빵메이트</h3>
              </div>
            </div>
            <ul className="space-y-3 text-ink/80 text-sm font-medium">
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> AI 엔지니어 재직중<br/>(정부부처 NLP·LLM 기반 서비스 개발 및 운영)</li>
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> 노션 공식 템플릿 제작자</li>
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> 네이버 커넥트재단, 알파코, 줄라마코리아 등<br/>코딩 교육 코치</li>
              <li className="flex gap-2.5 items-start"><img src="/pizza_icon.png" alt="피자" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" /> 네이버 커넥트재단 부스트캠프 AI Tech 7기<br/>(네이버클라우드 기업 해커톤 1위)</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 2. 활동 목적 */}
        <section className="bg-white rounded-[32px] p-8 border border-toast-brown/20 shadow-sm">
          <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
            <span>🎯</span> 활동 목적
          </h2>
          <ul className="space-y-4 text-ink/80 font-medium">
            <li className="flex gap-3 items-start">
              <span className="text-forest-green mt-1 font-bold">✔</span>
              <span className="leading-relaxed">
                노션에 필요하고 내가 만들고 싶은 기능을<br/>
                실제로 구현하고 검증하면서 실전 경험 만들기
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-forest-green mt-1 font-bold">✔</span>
              <span>노션 기능 탐구 및 커스텀 노션 위젯 생태계 확장</span>
            </li>
          </ul>
        </section>

        {/* 3. 활동 목표 */}
        <section className="bg-white rounded-[32px] p-8 border border-toast-brown/20 shadow-sm">
          <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
            <span>🚀</span> 활동 목표
          </h2>
          <ul className="space-y-4 text-ink/80 font-medium">
            <li className="flex gap-3 items-start">
              <span className="text-forest-green mt-1 font-bold">✔</span>
              <span className="leading-relaxed">
                아이디어를 기획하고 프로토타입을 거쳐<br/>
                최종 버전까지 완성/배포
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-forest-green mt-1 font-bold">✔</span>
              <span>2개월에 1회 베타테스터 피드백 5건 이상 수집해 품질 개선</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-forest-green mt-1 font-bold">✔</span>
              <span className="leading-relaxed">
                프로젝트 결과물 문서화/아카이빙<br/>
                (재사용 가능한 자산화)
              </span>
            </li>
          </ul>
        </section>
      </div>

      {/* 4. 활동 내용 */}
      <section className="bg-forest-green text-white rounded-[32px] p-8 md:p-10 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🛠️</span> 활동 내용
          </h2>
          
          <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/20">
            <h3 className="font-bold text-lg mb-2">사전 제작 워크북 기준 실전 바이브 코딩(Vibe Coding)</h3>
            <p className="text-white/90 leading-relaxed">
              사전 제작 워크북 기준으로 활동하며, 바이브 코딩을 활용해 기능을 직접 기획-개발-QA까지 전 과정을 경험합니다.<br/>
              개발한 노션 위젯은 <strong>개발했슈 전용 홈페이지</strong>에 직접 배포하여 홍보할 수 있습니다! 🍕
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">🗓️ 8주 커리큘럼 (2개월 단위)</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/20 rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="text-yellow-300 font-black text-base mb-1 tracking-wide">1~2주차</div>
                <div className="font-bold mb-2 text-white">기획 & 자료조사</div>
                <p className="text-sm text-white/80">기획서 작성<br/>레퍼런스 및 API 조사</p>
              </div>
              <div className="bg-black/20 rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="text-yellow-300 font-black text-base mb-1 tracking-wide">3~5주차</div>
                <div className="font-bold mb-2 text-white">개발 진행</div>
                <p className="text-sm text-white/80">기초 위젯 제작<br/>MVP → 최종 완성/최적화</p>
              </div>
              <div className="bg-black/20 rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="text-yellow-300 font-black text-base mb-1 tracking-wide">6~7주차</div>
                <div className="font-bold mb-2 text-white">피드백 수집</div>
                <p className="text-sm text-white/80">슬랙으로 요청/수집<br/>선별, 반영, 기록</p>
              </div>
              <div className="bg-black/20 rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="text-yellow-300 font-black text-base mb-1 tracking-wide">8주차</div>
                <div className="font-bold mb-2 text-white">배포 & 마무리</div>
                <p className="text-sm text-white/80">배포 링크 공유<br/>GitHub / 최종 레포 정리</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 피드백 루프 */}
      <section className="bg-white rounded-[32px] p-8 border border-toast-brown/20 shadow-sm">
        <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
          <span>🔄</span> 우리의 피드백 루프
        </h2>
        <p className="text-ink/80 font-medium leading-relaxed">
          Slack 스레드를 중심으로 <strong>공유 → 피드백 → 개선</strong>의 빠른 루프를 만들고, 주 1회 진행 상황을 공유합니다.<br/>
          2개월에 1회 베타테스터 피드백 5건 이상을 수집해 품질을 개선하고 결과물을 문서화/아카이빙합니다.
        </p>
      </section>

      {/* 6. 운영진의 한 마디 */}
      <section className="bg-bakery-beige rounded-[32px] p-8 md:p-12 text-center shadow-inner border-2 border-dashed border-toast-brown/30">
        <h2 className="text-xl font-bold text-toast-brown mb-4">💬 운영진의 한 마디</h2>
        <p className="text-ink font-bold text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          바이브 코딩을 해보고 싶은데 어떤 것부터 해야 할지 잘 모르는 친구들 환영!!<br/>
          노션 위젯을 직접 개발해보면서 기획과 개발 경험을 모두 해보는 건 어떨까?
        </p>
      </section>
    </div>
  )
}

