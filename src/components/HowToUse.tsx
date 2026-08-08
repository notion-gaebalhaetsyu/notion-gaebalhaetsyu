import React from 'react';

export default function HowToUse() {
  return (
    <section className="mt-20 px-8 py-12 md:p-12 flex flex-col md:flex-row justify-between gap-12 bg-[#eee2d3] rounded-[16px]">
      <div className="flex-1">
        <span className="inline-flex gap-4 font-mono text-xs tracking-[1.2px] text-[#9f866c] mb-2">
          HOW TO USE
        </span>
        <h2 className="text-[25px] leading-[1.4] font-extrabold text-toast-brown font-jua">
          마음에 드는 위젯,<br />
          세 단계면 충분해요.
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-6">
        <Step number="01" title="구경하기" desc="내게 필요한 위젯을 찾아요" />
        <Step number="02" title="미리보기" desc="내 노션에 어울리는지 써봐요" />
        <Step number="03" title="담아가기" desc="링크를 복사해 노션에 붙여요" />
      </div>
    </section>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[120px]">
      <b className="font-mono text-[11px] text-toast-brown tracking-wider">{number}</b>
      <span className="text-[17px] font-extrabold text-forest-green font-jua">{title}</span>
      <small className="text-[11px] text-[#917965] font-medium">{desc}</small>
    </div>
  );
}
