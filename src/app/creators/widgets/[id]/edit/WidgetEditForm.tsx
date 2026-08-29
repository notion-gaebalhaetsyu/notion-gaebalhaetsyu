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
}

export default function WidgetEditForm({ 
  widget, 
  categories 
}: { 
  widget: Widget
  categories: Category[] 
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    widget.category_id || (categories.length > 0 ? categories[0]!.id : '__new__')
  )
  const [newCategoryName, setNewCategoryName] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setToastMessage(null)

    const formData = new FormData(e.currentTarget)
    
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

        {/* 2. 주소 (Slug) 안내 */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">위젯 URL 주소</label>
          <div className="flex items-center">
            <span className="bg-gray-100 border border-toast-brown/30 text-ink/60 rounded-xl px-4 py-3 font-mono text-sm w-full">
              /widgets/{widget.slug}
            </span>
          </div>
          <p className="text-xs text-ink/50 mt-1">고유 링크 주소는 안정적인 노션 임베드를 위해 변경할 수 없습니다.</p>
        </div>

        {/* 3. 카테고리 */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-bold text-ink mb-2">종류 (카테고리) <span className="text-strawberry-pink">*</span></label>
          <div className="relative">
            <select 
              id="category_id" 
              name="category_id" 
              required
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 font-medium"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="__new__">➕ 새로운 카테고리 직접 등록</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-toast-brown">
              ▼
            </div>
          </div>

          {selectedCategory === '__new__' && (
            <div className="mt-3">
              <input 
                type="text" 
                name="new_category_name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="새로운 카테고리 이름을 입력하세요 (예: 개발했슈 1기, 생산성, 미니게임)"
                required={selectedCategory === '__new__'}
                className="w-full bg-white border-2 border-forest-green text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
              />
            </div>
          )}
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
