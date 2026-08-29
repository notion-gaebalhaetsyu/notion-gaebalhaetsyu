import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import { getWidgetById, getCreatorProfileByUserId } from '@/utils/firebase/db'
import { getCategories } from './actions'
import WidgetEditForm from './WidgetEditForm'

export const dynamic = 'force-dynamic'

export default async function EditWidgetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  const widget = await getWidgetById(id)
  if (!widget) {
    notFound()
  }

  const creatorProfile = await getCreatorProfileByUserId(user.id)
  const isOwner = widget.creator_profile_id === user.id || (creatorProfile && widget.creator_profile_id === creatorProfile.id)
  const isAdmin = user.role === 'admin'

  // 관리자이거나 본인이 등록한 위젯인 경우만 수정 페이지 접근 가능
  if (!isOwner && !isAdmin) {
    redirect(`/widgets/${widget.slug}`)
  }

  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto mt-12 pb-24">
      <div className="bg-white rounded-[24px] border border-toast-brown/30 p-8 shadow-sm relative overflow-hidden">
        {/* 장식용 텍스쳐 */}
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-ink mb-2">✏️ 위젯 정보 수정</h1>
            <p className="text-ink/70 font-medium">
              등록된 위젯의 이름, 소개, 링크 등을 수정할 수 있습니다.
            </p>
          </div>

          <WidgetEditForm widget={widget} categories={categories} />
        </div>
      </div>
    </div>
  )
}
