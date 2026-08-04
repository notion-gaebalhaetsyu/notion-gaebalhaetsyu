"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ProfileEditForm({ userId, initialProfile }: { userId: string, initialProfile: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nickname: initialProfile?.nickname || '',
    bio_short: initialProfile?.bio_short || '',
    bio_long: initialProfile?.bio_long || '',
    character_image_url: initialProfile?.character_image_url || '',
    skills: initialProfile?.skills?.join(', ') || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')

      const dataToSave = {
        user_id: userId,
        nickname: formData.nickname,
        bio_short: formData.bio_short,
        bio_long: formData.bio_long,
        character_image_url: formData.character_image_url,
        skills: skillsArray,
        updated_at: new Date().toISOString()
      }

      if (initialProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('creator_profiles')
          .update(dataToSave)
          .eq('id', initialProfile.id)
        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase
          .from('creator_profiles')
          .insert([dataToSave])
        if (error) throw error
      }

      alert('프로필이 성공적으로 저장되었슈! 🍞')
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
      <div>
        <label className="block text-ink font-bold mb-2">닉네임 <span className="text-strawberry-pink">*</span></label>
        <input 
          type="text" 
          name="nickname"
          required
          value={formData.nickname}
          onChange={handleChange}
          className="w-full border border-toast-brown/30 rounded-xl px-4 py-3 bg-bakery-beige/30 focus:outline-none focus:border-forest-green"
          placeholder="예: 우주제빵사"
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
          placeholder="예: 귀여운 걸 굽는 제빵사입니다."
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

      <div>
        <label className="block text-ink font-bold mb-2">프로필 이미지 URL</label>
        <input 
          type="url" 
          name="character_image_url"
          value={formData.character_image_url}
          onChange={handleChange}
          className="w-full border border-toast-brown/30 rounded-xl px-4 py-3 bg-bakery-beige/30 focus:outline-none focus:border-forest-green"
          placeholder="https://..."
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
          disabled={isSubmitting}
          className="flex-1 bg-forest-green text-white font-bold py-3 rounded-xl hover:bg-forest-green/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? '굽는 중...' : '저장하기 🍞'}
        </button>
      </div>
    </form>
  )
}
