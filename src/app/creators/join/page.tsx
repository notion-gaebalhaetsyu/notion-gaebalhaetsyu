'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { verifyJoinCode } from './actions'

export default function CreatorJoinPage() {
  const router = useRouter()
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
        setTimeout(() => {
          router.push('/mypage')
          router.refresh()
        }, 1500)
      }
    } catch (error: any) {
      setToastMessage({ type: 'error', text: error?.message || '오류가 발생했슈. 잠시 후 다시 시도해주세유!' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 pb-24">
      <div className="bg-white rounded-[24px] border border-toast-brown/30 p-8 shadow-sm relative overflow-hidden">
        {/* 장식용 텍스쳐 */}
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧑‍🍳</div>
            <h1 className="text-2xl font-bold text-ink mb-2">제작자 인증하기</h1>
            <p className="text-sm text-ink/70">
              구글 로그인 후, 사전 등록된 닉네임과 발급받은 고유 해시코드를 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="cohort" className="block text-sm font-bold text-ink mb-2">참여 기수</label>
              <div className="relative">
                <select 
                  id="cohort" 
                  name="cohort" 
                  defaultValue="개발했슈 1기"
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
              <label htmlFor="nickname" className="block text-sm font-bold text-ink mb-2">
                사전 등록 닉네임 <span className="text-strawberry-pink">*</span>
              </label>
              <input 
                type="text" 
                id="nickname" 
                name="nickname" 
                placeholder="예: 우주피자장인"
                required
                className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-medium"
              />
              <p className="text-xs text-ink/60 mt-1">
                사전 신청 시 전달해주신 닉네임과 정확히 일치해야 합니다.
              </p>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-bold text-ink mb-2">
                가입 고유 해시코드 <span className="text-strawberry-pink">*</span>
              </label>
              <input 
                type="text" 
                id="code" 
                name="code" 
                placeholder="사전 공유받은 고유 해시코드 (예: dev1_8f9c2a)"
                required
                className="w-full bg-bakery-beige border border-toast-brown/30 text-ink rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-green/50 placeholder:text-ink/40 font-mono text-sm"
              />
              <p className="text-xs text-ink/60 mt-1">
                로그인된 구글 이메일, 닉네임, 해시코드가 모두 일치해야 인증됩니다.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-forest-green text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-forest-green/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
            >
              {isPending ? (
                <>
                  <span className="animate-spin text-xl">⏳</span> 인증 확인 중...
                </>
              ) : (
                <>
                  <span>🍕</span> 제작자 권한 인증하기
                </>
              )}
            </button>
          </form>

          {/* 에러/성공 토스트 메시지 */}
          {toastMessage && (
            <div className={`mt-6 p-4 rounded-xl text-center font-bold text-sm leading-relaxed ${
              toastMessage.type === 'error' 
                ? 'bg-strawberry-pink/15 text-strawberry-pink border border-strawberry-pink/30' 
                : 'bg-forest-green/15 text-forest-green border border-forest-green/30'
            }`}>
              {toastMessage.text}
              {toastMessage.type === 'success' && (
                <div className="text-xs text-forest-green/80 mt-1 font-normal">
                  잠시 후 내 작업대(마이페이지)로 이동합니다...
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-toast-brown/20 text-center">
            <Link href="/" className="text-sm font-bold text-ink/60 hover:text-ink transition-colors">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

