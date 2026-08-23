import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import { getCreatorProfileByUserId } from '@/utils/firebase/db'
import ProfileEditForm from '@/components/ProfileEditForm'

export const dynamic = 'force-dynamic'

export default async function ProfileEditPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  const profile = await getCreatorProfileByUserId(user.id)

  return (
    <div className="max-w-2xl mx-auto py-8">
      <ProfileEditForm userId={user.id} initialProfile={profile} />
    </div>
  )
}
