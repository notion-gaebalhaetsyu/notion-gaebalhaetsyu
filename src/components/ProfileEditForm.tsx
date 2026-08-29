"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/utils/firebase/client'
import { doc, setDoc, updateDoc } from 'firebase/firestore'

export default function ProfileEditForm({ 
  userId, 
  initialProfile 
}: { 
  userId: string; 
  initialProfile: any;
}) {
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: initialProfile?.nickname || '',
    bio_short: initialProfile?.bio_short || '',
    bio_long: initialProfile?.bio_long || '',
    character_image_url: initialProfile?.character_image_url || '',
    skills: initialProfile?.skills?.join(', ') || '',
    cohort_code: initialProfile?.cohort === '개발했슈 1기' ? '개발했슈 1기 인증됨' : '',
  })

  const [is1stGen, setIs1stGen] = useState(initialProfile?.cohort === '개발했슈 1기')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFormData(prev => ({ ...prev, character_image_url: base64String }))
        setIsUploading(false)
      }
      
      reader.onerror = () => {
        throw new Error('파일을 읽는 중 오류가 발생했습니다.')
      }

      reader.readAsDataURL(file)
    } catch (error: any) {
      console.error('Error reading image:', error)
      alert(error.message || '이미지 처리에 실패했습니다.')
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s !== '')

      const docId = initialProfile?.id || userId
      const now = new Date().toISOString()

      // 1기 해시코드 확인
      const trimmedCode = formData.cohort_code.trim()
      const validCodes = ['dev1234', '개발했슈1기', 'gaebalhatsyu1', '1기', '개발했슈 1기 인증됨']
      const isCodeValid = validCodes.includes(trimmedCode) || is1stGen

      const dataToSave: any = {
        id: docId,
        user_id: userId,
        nickname: formData.nickname,
        bio_short: formData.bio_short,
        bio_long: formData.bio_long,
        character_image_url: formData.character_image_url,
        skills: skillsArray,
        updated_at: now,
        created_at: initialProfile?.created_at || now,
      }

      if (isCodeValid) {
        dataToSave.cohort = '개발했슈 1기'
      }

      await setDoc(doc(db, 'creator_profiles', docId), dataToSave, { merge: true })

      // 1기 코드가 유효할 경우 user role을 creator로 승급
      if (isCodeValid) {
        try {
          await updateDoc(doc(db, 'users', userId), {
            role: 'creator',
            updated_at: now,
          })
        } catch (e) {
          console.warn('Could not update user role client-side:', e)
        }
      }

      alert('프로필이 성공적으로 저장되었슈! 🍕')
      router.push('/mypage')
      router.refresh()
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      alert(error.message || '프로필 저장 중 오류가 발생했슈.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-toast-brown/20 shadow-sm flex flex-col gap-6">
      
      <div className="flex flex-col items-center mb-2">
        <h2 className="text-2xl font-black text-ink mb-6">프로필 설정하기</h2>
        
        {/* Image Preview */}
        <div className="w-32 h-32 rounded-full bg-bakery-beige border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-4xl mb-4 relative">
          {formData.character_image_url ? (
            <img src={formData.character_image_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            '🧑‍🍳'
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-sm font-bold text-ink">업로드 중...</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleImageClick}
          disabled={isUploading}
          className="bg-forest-green/10 text-forest-green font-bold px-4 py-2 rounded-full hover:bg-forest-green/20 transition-colors text-sm"
        >
          프로필 사진 변경
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageChange}
          accept=".jpg, .jpeg, .png"
          className="hidden"
        />
      </div>

      {/* 1기 해시코드 인증 영역 */}
      <div className="bg-bakery-beige/60 p-5 rounded-2xl border border-toast-brown/20">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-ink font-bold text-sm flex items-center gap-1.5">
            <span>🍕</span> 개발했슈 1기 해시 코드 (인증 번호)
          </label>
          {is1stGen && (
            <span className="bg-forest-green text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              1기 제빵사 인증됨 ✔
            </span>
          )}
        </div>
        <input 
          type="text" 
          name="cohort_code"
          value={formData.cohort_code}
          onChange={handleChange}
          disabled={is1stGen}
          className="w-full border border-toast-brown/30 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-forest-green font-mono text-sm disabled:bg-gray-100"
          placeholder="사전 공유받은 1기 해시 코드를 입력하세요 (예: dev1234)"
        />
        <p className="text-xs text-ink/60 mt-1.5">
          개발했슈 1기 참가자분들은 사전에 공유된 코드를 입력하시면 1기 제작자 권한이 부여됩니다.
        </p>
      </div>

      <div>
        <label className="block text-ink font-bold mb-2">닉네임 <span className="text-strawberry-pink">*</span></label>
        <input 
          type="text" 
          name="nickname"
          required
          value={formData.nickname}
          onChange={handleChange}
          className="w-full border border-toast-brown/30 rounded-xl px-4 py-3 bg-bakery-beige/30 focus:outline-none focus:border-forest-green"
          placeholder="예: 우주피자장인"
        />
        <p className="text-xs text-ink/50 mt-1">프로필 URL과 위젯 제작자 이름으로 사용됩니다.</p>
      </div>

      <div>
        <label className="block text-ink font-bold mb-2">한 줄 소개</label>
        <input 
          type="text" 
          name="bio_short"
          value={formData.bio_short}
          onChange={handleChange}
          className="w-full border border-toast-brown/30 rounded-xl px-4 py-3 bg-bakery-beige/30 focus:outline-none focus:border-forest-green"
          placeholder="예: 귀여운 위젯 피자를 굽는 제빵사입니다."
        />
      </div>

      <div>
        <label className="block text-ink font-bold mb-2">상세 소개</label>
        <textarea 
          name="bio_long"
          value={formData.bio_long}
          onChange={handleChange}
          rows={4}
          className="w-full border border-toast-brown/30 rounded-xl px-4 py-3 bg-bakery-beige/30 focus:outline-none focus:border-forest-green resize-none"
          placeholder="나만의 위젯 철학이나 작업 방식을 적어주세요."
        />
      </div>

      <div>
        <label className="block text-ink font-bold mb-2">스킬 태그 (쉼표로 구분)</label>
        <input 
          type="text" 
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full border border-toast-brown/30 rounded-xl px-4 py-3 bg-bakery-beige/30 focus:outline-none focus:border-forest-green"
          placeholder="예: React, Next.js, UI/UX"
        />
      </div>

      <div className="flex gap-4 pt-4 mt-2 border-t border-toast-brown/10">
        <button 
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-bakery-beige text-ink/80 font-bold py-3 rounded-xl hover:bg-toast-brown/20 transition-colors"
        >
          취소
        </button>
        <button 
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 bg-forest-green text-white font-bold py-3 rounded-xl hover:bg-forest-green/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '저장하기 🍕'}
        </button>
      </div>
    </form>
  )
}

