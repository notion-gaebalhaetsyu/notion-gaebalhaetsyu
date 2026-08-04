'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWidget } from './actions'

type Category = {
  id: string
  name: string
}

export default function WidgetForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setToastMessage(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await createWidget(formData)
      
      if (result?.error) {
        setToastMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        setToastMessage({ type: 'success', text: '진열대에 빵을 무사히 올렸슈! 🥐' })
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

      {/* 2. 고유 주소 (Slug) */}
      <div>
        <label htmlFor="slug" className="block text-sm font-bold text-ink mb-2">URL 주소 (영문/숫자/하이픈) <span className="text-strawberry-pink">*</span></label>
        <div className="flex items-center">
          <span className="bg-bakery-beige border border-r-0 border-toast-brown/30 text-ink/50 rounded-l-xl px-4 py-3 font-medium">/widgets/</span>
          <input 
            type="text" 
            id="slug" 
            name="slug" 
            placeholder="my-cute-timer"
            required
            pattern="[a-z0-9\-]+"
            title="영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다."
            className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-r-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
          />
        </div>
      </div>

      {/* 3. 카테고리 */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-bold text-ink mb-2">종류 (카테고리) <span className="text-strawberry-pink">*</span></label>
        <div className="relative">
          <select 
            id="category_id" 
            name="category_id" 
            required
            className="w-full appearance-none bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 font-medium"
          >
            <option value="">카테고리를 선택해 주세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-toast-brown">
            ▼
          </div>
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

      {/* 5. 임베드 URL */}
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

      {/* 6. 태그 */}
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
              <span>🥐</span> 진열대에 내놓기
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
