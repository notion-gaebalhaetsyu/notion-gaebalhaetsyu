export default function Loading() {
  return (
    <div className="pb-24 animate-pulse">
      {/* 히어로 배너 스켈레톤 */}
      <section className="bg-bakery-beige/50 rounded-[32px] p-8 sm:p-12 mb-12 h-[350px] w-full"></section>

      {/* 위젯 진열대 (Grid) 스켈레톤 */}
      <section>
        <div className="mb-8">
          <div className="h-8 bg-toast-brown/10 rounded w-48 mb-2"></div>
          <div className="h-4 bg-toast-brown/10 rounded w-64"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-[24px] border border-toast-brown/10 overflow-hidden h-[340px]">
              <div className="aspect-[4/3] bg-toast-brown/5"></div>
              <div className="p-5">
                <div className="h-6 bg-toast-brown/10 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-toast-brown/10 rounded w-full mb-1"></div>
                <div className="h-4 bg-toast-brown/10 rounded w-5/6 mb-6"></div>
                <div className="h-10 border-t border-toast-brown/5 pt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
