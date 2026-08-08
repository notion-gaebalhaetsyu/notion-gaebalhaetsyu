import Link from 'next/link';
import { WidgetCardHeart, WidgetCardCopy } from './WidgetCardActions';

export default function WidgetCard({ widget }: { widget: any }) {
  return (
    <Link 
      href={`/widgets/${widget.slug}`}
      className="group block bg-white rounded-[24px] border border-toast-brown/20 overflow-hidden shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all flex flex-col h-full relative"
    >
      {/* 썸네일 영역 */}
      <div className="aspect-[4/3] bg-bakery-beige flex items-center justify-center p-6 relative overflow-hidden flex-shrink-0">
        <WidgetCardHeart widget={widget} />
        
        <div className="w-full h-full bg-white/50 rounded-xl border-2 border-toast-brown/10 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
          {widget.thumbnail_url ? (
            <img src={widget.thumbnail_url} alt={widget.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            widget.categories?.name === '시계' ? '⏰' : 
            widget.categories?.name === '일정·D-Day' ? '🗓️' :
            widget.categories?.name === '공부·집중' ? '🔥' :
            widget.categories?.name === '기록' ? '✏️' :
            widget.categories?.name === '꾸미기' ? '✨' :
            widget.categories?.name === '생활' ? '🪴' :
            widget.categories?.name === '재미' ? '🎲' : '🍞'
          )}
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-forest-green rounded-full shadow-sm z-10">
          {widget.categories?.name || '기타'}
        </div>
      </div>
      
      {/* 메타 정보 영역 */}
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-white">
        <h3 className="font-bold text-lg text-ink mb-1 group-hover:text-forest-green transition-colors line-clamp-1">
          {widget.name}
        </h3>
        <p className="text-sm text-ink/60 mb-4 line-clamp-2 min-h-[40px] flex-1">
          {widget.short_description}
        </p>
        
        <div className="flex items-center justify-between text-xs font-medium text-ink/50 pt-4 border-t border-toast-brown/10 mt-auto">
          <div className="flex items-center gap-1.5">
            {widget.creator_profiles?.character_image_url ? (
              <img 
                src={widget.creator_profiles.character_image_url} 
                alt={widget.creator_profiles?.nickname || '제빵사'} 
                className="w-5 h-5 rounded-full object-cover border border-toast-brown/20"
              />
            ) : (
              <span className="text-base">🧑‍🍳</span>
            )}
            <span className="line-clamp-1">{widget.creator_profiles?.nickname || '익명의 제빵사'}</span>
          </div>
          <WidgetCardCopy widget={widget} />
        </div>
      </div>
    </Link>
  );
}
