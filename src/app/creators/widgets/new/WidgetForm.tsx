'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWidget } from './actions'
import ThumbnailUploadInput from '@/components/ThumbnailUploadInput'

type Category = {
  id: string
  name: string
  slug?: string
  icon?: string
}

const DEFAULT_CATEGORY_OPTIONS: Category[] = [
  { id: 'cat_clock', name: '시계', icon: '⏰' },
  { id: 'cat_calendar', name: '달력', icon: '📅' },
  { id: 'cat_weather', name: '날씨', icon: '⛅' },
  { id: 'cat_schedule', name: '일정', icon: '📌' },
  { id: 'cat_memo', name: '메모', icon: '📝' },
  { id: 'cat_music', name: '음악', icon: '🎵' },
  { id: 'cat_todo', name: 'To-Do List', icon: '✅' },
  { id: 'cat_productivity', name: '생산성', icon: '⚡' },
]

const CATEGORY_ICONS: Record<string, string> = {
  시계: '⏰',
  달력: '📅',
  날씨: '⛅',
  일정: '📌',
  메모: '📝',
  음악: '🎵',
  'To-Do List': '✅',
  'to-do list': '✅',
  '투두': '✅',
  'todo': '✅',
  생산성: '⚡',
}

export default function WidgetForm({ 
  categories, 
  userCohort = '개발했슈 1기' 
}: { 
  categories?: Category[]
  userCohort?: string
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  // 카테고리 옵션 병합 (이름 기준 중복 완전 방지)
  const categoryOptions = (() => {
    const nameMap = new Map<string, Category>()
    for (const def of DEFAULT_CATEGORY_OPTIONS) {
      nameMap.set(def.name.trim().toLowerCase(), { ...def })
    }
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        if (cat.id === 'cat_cohort_1' || cat.name === '개발했슈 1기') continue
        const normName = (cat.name || '').trim().toLowerCase()
        if (!normName) continue

        if (nameMap.has(normName)) {
          const existing = nameMap.get(normName)!
          nameMap.set(normName, {
            ...existing,
            ...cat,
            id: existing.id,
            name: existing.name,
            icon: cat.icon || existing.icon || CATEGORY_ICONS[existing.name] || '🏷️',
          })
        } else {
          nameMap.set(normName, {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon || CATEGORY_ICONS[cat.name] || '🏷️',
          })
        }
      }
    }
    return Array.from(nameMap.values())
  })()

  // 다중 카테고리 선택 상태 (선택 사항이므로 기본 빈 배열 허용)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setToastMessage(null)

    const formData = new FormData(e.currentTarget)
    formData.set('category_ids', selectedCategoryIds.join(','))
    formData.set('category_id', selectedCategoryIds[0] || '')
    formData.set('cohort', userCohort)
    
    try {
      const result = await createWidget(formData)
      
      if (result?.error) {
        setToastMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        setToastMessage({ type: 'success', text: '진열대에 피자를 무사히 올렸슈! 🍕' })
        // 성공 시 방금 등록한 위젯 상세 페이지로 이동
        setTimeout(() => {
          router.push(`/widgets/${result.slug}`)
        }, 1500)
      }
    } catch (error) {
      setToastMessage({ type: 'error', text: '오류가 발생했슈. 잠시 후 다시 시도해주세유!' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 0. 활동 기수 */}
      <div className="bg-bakery-beige/50 border border-toast-brown/20 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-ink">활동 기수</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-green text-white text-xs font-bold rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-custard-cream animate-pulse"></span>
              {userCohort} 인증됨 ✔
            </span>
          </div>
        </div>
        <p className="text-xs text-ink/60 mt-1.5">
          인증된 활동 기수({userCohort})로 위젯이 진열대에 등록됩니다.
        </p>
        <input type="hidden" name="cohort" value={userCohort} />
      </div>

      {/* 1. 위젯 이름 */}
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-ink mb-2">위젯 이름 <span className="text-strawberry-pink">*</span></label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          placeholder="예: 말랑말랑 포모도로 타이머"
          required
          maxLength={50}
          className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
        />
      </div>

      {/* 2. 위젯 저장소 링크 (깃허브) */}
      <div>
        <label htmlFor="github_url" className="block text-sm font-bold text-ink mb-2">
          위젯 저장소 링크 (깃허브) <span className="text-strawberry-pink">*</span>
        </label>
        <input 
          type="url" 
          id="github_url" 
          name="github_url" 
          placeholder="https://github.com/username/my-widget-repo"
          required
          className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
        />
        <p className="text-xs text-ink/50 mt-1">위젯 코드가 관리되는 GitHub 저장소 전체 URL을 입력해 주세요.</p>
      </div>

      {/* 3. 종류 (카테고리) - 다중 선택 칩 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-ink">
            종류 (카테고리) <span className="text-ink/40 text-xs font-normal">(선택)</span>
          </label>
          <span className="text-xs font-medium text-forest-green">다중 선택 가능</span>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {categoryOptions.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id)
            const icon = cat.icon || CATEGORY_ICONS[cat.name] || '🏷️'
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-forest-green text-white border-forest-green shadow-xs scale-[1.02]'
                    : 'bg-bakery-beige/70 text-ink/75 border-toast-brown/20 hover:bg-forest-green/10 hover:border-forest-green/40 hover:text-forest-green'
                }`}
              >
                <span>{icon}</span>
                <span>{cat.name}</span>
                {isSelected && <span className="ml-0.5 text-xs opacity-90">✔</span>}
              </button>
            )
          })}
        </div>
        
        <input type="hidden" name="category_ids" value={selectedCategoryIds.join(',')} />
        <input type="hidden" name="category_id" value={selectedCategoryIds[0] || ''} />
        <div className="space-y-1 mt-2.5">
          <p className="text-xs text-ink/60">위젯의 기능에 해당하는 카테고리를 1개 이상 클릭하여 선택해 주세요.</p>
          <p className="text-xs text-toast-brown font-medium">💡 옵션에 없는 경우, 필버트 제빵사에게 요청해 주세요.</p>
        </div>
      </div>

      {/* 4. 짧은 설명 */}
      <div>
        <label htmlFor="short_description" className="block text-sm font-bold text-ink mb-2">한 줄 소개 <span className="text-strawberry-pink">*</span></label>
        <input 
          type="text" 
          id="short_description" 
          name="short_description" 
          placeholder="위젯을 짧게 소개해주세요. (최대 100자)"
          required
          maxLength={100}
          className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
        />
      </div>

      {/* 5. 썸네일 이미지 업로드 */}
      <ThumbnailUploadInput />

      {/* 6. 임베드 URL */}
      <div>
        <label htmlFor="embed_url" className="block text-sm font-bold text-ink mb-2">임베드용 URL (배포 주소) <span className="text-strawberry-pink">*</span></label>
        <input 
          type="url" 
          id="embed_url" 
          name="embed_url" 
          placeholder="https://my-widget-domain.com/embed"
          required
          className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
        />
        <p className="text-xs text-ink/60 mt-2">
          사용자가 노션에 복사하여 붙여넣을 때 사용될 실제 뷰어(배포) URL입니다.
        </p>
      </div>

      {/* 7. 태그 */}
      <div>
        <label htmlFor="tags" className="block text-sm font-bold text-ink mb-2">태그 (선택)</label>
        <input 
          type="text" 
          id="tags" 
          name="tags" 
          placeholder="예: 귀여운, 타이머, 다크모드 (쉼표로 구분)"
          className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
        />
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-forest-green text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-forest-green/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isPending ? (
            <>
              <span className="animate-spin text-xl">⏳</span> 오븐에서 굽는 중...
            </>
          ) : (
            <>
              <span>🍕</span> 진열대에 내놓기
            </>
          )}
        </button>
      </div>

      {/* 에러/성공 토스트(또는 인라인) 메시지 */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-center font-bold text-sm ${toastMessage.type === 'error' ? 'bg-strawberry-pink/20 text-strawberry-pink' : 'bg-forest-green/20 text-forest-green'}`}>
          {toastMessage.text}
        </div>
      )}
    </form>
  )
}

