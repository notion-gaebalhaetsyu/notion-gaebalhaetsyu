'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateWidget, deleteWidgetAction } from './actions'
import { Widget } from '@/utils/firebase/types'
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
]

const CATEGORY_ICONS: Record<string, string> = {
  시계: '⏰',
  달력: '📅',
  날씨: '⛅',
  일정: '📌',
  메모: '📝',
  음악: '🎵',
}

export default function WidgetEditForm({ 
  widget, 
  categories,
  userCohort = '개발했슈 1기'
}: { 
  widget: Widget
  categories?: Category[] 
  userCohort?: string
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  // 카테고리 옵션 병합 (기본 6개는 항상 보장되고, 추가 카테고리도 병합)
  const categoryOptions = (() => {
    const map = new Map<string, Category>()
    for (const def of DEFAULT_CATEGORY_OPTIONS) {
      map.set(def.id, { ...def })
    }
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        if (cat.id === 'cat_cohort_1' || cat.name === '개발했슈 1기') continue
        const existing = map.get(cat.id)
        map.set(cat.id, {
          id: cat.id,
          name: cat.name,
          slug: cat.slug || existing?.slug,
          icon: cat.icon || existing?.icon || CATEGORY_ICONS[cat.name] || '🏷️',
        })
      }
    }
    return Array.from(map.values())
  })()

  // 다중 카테고리 초기값
  const initialCategoryIds = (widget.category_ids && widget.category_ids.length > 0)
    ? widget.category_ids.filter(id => id !== 'cat_cohort_1')
    : (widget.category_id && widget.category_id !== 'cat_cohort_1' ? [widget.category_id] : ['cat_clock'])

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialCategoryIds.length > 0 ? initialCategoryIds : ['cat_clock']
  )

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev // 최소 1개 유지
        return prev.filter(c => c !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setToastMessage(null)

    const formData = new FormData(e.currentTarget)
    formData.set('category_ids', selectedCategoryIds.join(','))
    formData.set('category_id', selectedCategoryIds[0] || 'cat_clock')
    formData.set('cohort', userCohort)
    
    try {
      const result = await updateWidget(widget.id, formData)
      
      if (result?.error) {
        setToastMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        setToastMessage({ type: 'success', text: '위젯 정보를 성공적으로 수정했슈! 🍕' })
        setTimeout(() => {
          router.push(`/widgets/${result.slug}`)
          router.refresh()
        }, 1200)
      }
    } catch (error: any) {
      setToastMessage({ type: 'error', text: error?.message || '오류가 발생했슈. 잠시 후 다시 시도해주세유!' })
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setToastMessage(null)

    try {
      const result = await deleteWidgetAction(widget.id)
      if (result?.error) {
        setToastMessage({ type: 'error', text: result.error })
        setIsDeleting(false)
        setShowDeleteConfirm(false)
      } else if (result?.success) {
        setToastMessage({ type: 'success', text: '위젯이 성공적으로 삭제되었슈.' })
        setTimeout(() => {
          router.push('/mypage')
          router.refresh()
        }, 1000)
      }
    } catch (error: any) {
      setToastMessage({ type: 'error', text: error?.message || '위젯 삭제 중 오류가 발생했슈.' })
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="space-y-10">
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
            인증된 활동 기수({userCohort})로 등록된 위젯입니다.
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
            defaultValue={widget.name}
            placeholder="예: 말랑말랑 포모도로 타이머"
            required
            maxLength={50}
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
        </div>

        {/* 2. 위젯 저장소 링크 (깃허브) */}
        <div>
          <label htmlFor="github_url" className="block text-sm font-bold text-ink mb-2">
            위젯 저장소 링크 (깃허브)
          </label>
          <input 
            type="url" 
            id="github_url" 
            name="github_url" 
            defaultValue={widget.github_url || ''}
            placeholder="https://github.com/username/my-widget-repo"
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
          <p className="text-xs text-ink/50 mt-1">위젯 코드가 관리되는 GitHub 저장소 전체 URL을 입력해 주세요.</p>
        </div>

        {/* 3. 종류 (카테고리) - 다중 선택 칩 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-ink">
              종류 (카테고리) <span className="text-strawberry-pink">*</span>
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
          <input type="hidden" name="category_id" value={selectedCategoryIds[0] || 'cat_clock'} />
          <p className="text-xs text-ink/50 mt-2">위젯의 기능에 해당하는 카테고리를 1개 이상 클릭하여 선택해 주세요.</p>
        </div>

        {/* 4. 썸네일 이미지 업로드 & 미리보기 */}
        <ThumbnailUploadInput initialUrl={widget.thumbnail_url || ''} />

        {/* 5. 짧은 설명 */}
        <div>
          <label htmlFor="short_description" className="block text-sm font-bold text-ink mb-2">한 줄 소개 <span className="text-strawberry-pink">*</span></label>
          <input 
            type="text" 
            id="short_description" 
            name="short_description" 
            defaultValue={widget.short_description || ''}
            placeholder="위젯을 짧게 소개해주세요. (최대 100자)"
            required
            maxLength={100}
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
        </div>

        {/* 6. 상세 설명 */}
        <div>
          <label htmlFor="long_description" className="block text-sm font-bold text-ink mb-2">상세 소개 (선택)</label>
          <textarea 
            id="long_description" 
            name="long_description" 
            rows={3}
            defaultValue={widget.long_description || ''}
            placeholder="위젯의 기능이나 사용법을 자세히 작성해 주세요."
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
        </div>

        {/* 7. 제작자의 한마디 */}
        <div>
          <label htmlFor="creator_comment" className="block text-sm font-bold text-ink mb-2">💬 제작자의 한 마디 (선택)</label>
          <input 
            type="text" 
            id="creator_comment" 
            name="creator_comment" 
            defaultValue={widget.creator_comment || ''}
            placeholder="예: 귀여운 포모도로 타이머로 노션 다이어리를 채워보세요!"
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
        </div>

        {/* 8. 임베드 URL */}
        <div>
          <label htmlFor="embed_url" className="block text-sm font-bold text-ink mb-2">임베드용 URL (배포 주소) <span className="text-strawberry-pink">*</span></label>
          <input 
            type="url" 
            id="embed_url" 
            name="embed_url" 
            defaultValue={widget.embed_url || ''}
            placeholder="https://my-widget-domain.com/embed"
            required
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
        </div>

        {/* 9. 태그 */}
        <div>
          <label htmlFor="tags" className="block text-sm font-bold text-ink mb-2">태그 (선택)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags" 
            defaultValue={widget.tags?.join(', ') || ''}
            placeholder="예: 귀여운, 타이머, 다크모드 (쉼표로 구분)"
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
        </div>

        <div className="pt-4 flex gap-4">
          <Link
            href={`/widgets/${widget.slug}`}
            className="w-1/3 py-4 rounded-xl border border-toast-brown/30 text-ink font-bold text-center hover:bg-bakery-beige transition-colors"
          >
            취소
          </Link>
          <button 
            type="submit" 
            disabled={isPending || isDeleting}
            className="w-2/3 bg-forest-green text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-forest-green/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isPending ? (
              <>
                <span className="animate-spin text-xl">⏳</span> 수정사항 저장 중...
              </>
            ) : (
              <>
                <span>💾</span> 위젯 정보 수정 완료
              </>
            )}
          </button>
        </div>

        {/* 에러/성공 토스트 메시지 */}
        {toastMessage && (
          <div className={`p-4 rounded-xl text-center font-bold text-sm ${toastMessage.type === 'error' ? 'bg-strawberry-pink/20 text-strawberry-pink' : 'bg-forest-green/20 text-forest-green'}`}>
            {toastMessage.text}
          </div>
        )}
      </form>

      {/* ⚠️ 위젯 삭제 (Danger Zone) 섹션 */}
      <div className="pt-8 border-t border-toast-brown/20">
        <div className="bg-strawberry-pink/5 border border-strawberry-pink/30 rounded-2xl p-6">
          <h3 className="text-base font-extrabold text-strawberry-pink mb-1 flex items-center gap-2">
            <span>🗑️</span> 위젯 삭제 (Danger Zone)
          </h3>
          <p className="text-xs text-ink/70 mb-4">
            이 위젯을 삭제하면 개발했슈 진열대 및 노션 임베드 목록에서 완전히 삭제되며, 복구할 수 없습니다.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 rounded-xl border border-strawberry-pink/50 text-strawberry-pink font-bold text-sm hover:bg-strawberry-pink hover:text-white transition-colors"
            >
              위젯 영구 삭제하기
            </button>
          ) : (
            <div className="bg-white border border-strawberry-pink/40 rounded-xl p-4 space-y-3">
              <p className="text-sm font-bold text-ink">
                ⚠️ 정말로 <span className="text-strawberry-pink">[{widget.name}]</span> 위젯을 삭제하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-strawberry-pink text-white font-bold text-sm hover:bg-strawberry-pink/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? '삭제 중...' : '네, 삭제합니다'}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-ink/80 font-bold text-sm transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
