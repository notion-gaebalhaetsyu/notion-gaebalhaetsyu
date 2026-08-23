'use client'

import { useState } from 'react'
import { verifyJoinCode } from './actions'

export default function CreatorJoinPage() {
  const [isPending, setIsPending] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setToastMessage(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await verifyJoinCode(formData)
      
      if (result?.error) {
        setToastMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        setToastMessage({ type: 'success', text: result.message! })
        // 성공 시 페이지 이동 (추후 라우터 푸시 로직 추가)
      }
    } catch (error) {
      setToastMessage({ type: 'error', text: '오류가 발생했슈. 잠시 후 다시 시도해주세유!' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 pb-24">
      <div className="bg-white rounded-[24px] border border-toast-brown/30 p-8 shadow-sm relative overflow-hidden">
        {/* 장식용 텍스쳐 */}
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧑‍🍳</div>
            <h1 className="text-2xl font-bold text-ink mb-2">제빵사로 인증하기</h1>
            <p className="text-sm text-ink/70">
              개발했슈 참여 기수와 발급받은 가입 코드를 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cohort" className="block text-sm font-bold text-ink mb-2">참여 기수</label>
              <div className="relative">
                <select 
                  id="cohort" 
                  name="cohort" 
                  required
                  className="w-full appearance-none bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 font-medium"
                >
                  <option value="개발했슈 1기">개발했슈 1기</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-toast-brown">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-bold text-ink mb-2">가입 해시 코드</label>
              <input 
                type="text" 
                id="code" 
                name="code" 
                placeholder="사전 공유받은 1기 코드를 입력하세요 (예: dev1234)"
                required
                className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-forest-green text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-forest-green/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
            >
              {isPending ? (
                <>
                  <span className="animate-spin text-xl">⏳</span> 오븐에서 굽는 중...
                </>
              ) : (
                <>
                  <span>🍕</span> 1기 제빵사 인증하기
                </>
              )}
            </button>
          </form>

          {/* 에러/성공 토스트(또는 인라인) 메시지 */}
          {toastMessage && (
            <div className={`mt-6 p-4 rounded-xl text-center font-bold text-sm ${toastMessage.type === 'error' ? 'bg-strawberry-pink/20 text-strawberry-pink' : 'bg-forest-green/20 text-forest-green'}`}>
              {toastMessage.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
