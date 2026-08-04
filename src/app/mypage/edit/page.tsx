import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProfileEditForm from '@/components/ProfileEditForm'

export default async function MyPageEdit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/?auth_error=true')
  }

  // 기존 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <section className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink mb-2">✏️ 프로필 수정</h1>
        <p className="text-ink/60 font-medium">나만의 개성있는 제빵사 프로필을 꾸며보세요.</p>
      </section>
      
      <ProfileEditForm userId={user.id} initialProfile={profile} />
    </div>
  )
}
