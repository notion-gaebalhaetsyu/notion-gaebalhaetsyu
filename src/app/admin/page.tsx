import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/utils/firebase/server-auth'
import { getWidgets, getAllUsers, getAllCohortInvites } from '@/utils/firebase/db'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // 1. 유저 로그인 및 권한(Admin) 체크
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  if (user.role !== 'admin') {
    // 관리자 권한이 없으면 메인으로 리다이렉트
    redirect('/')
  }

  // 2. 전체 위젯 데이터 가져오기 (가장 최신순)
  const widgets = await getWidgets({
    status: 'all',
    sortBy: 'latest',
  })

  // 3. 전체 유저 데이터 가져오기
  const users = await getAllUsers()

  // 4. 발급된 초대 코드 목록 가져오기
  const invites = await getAllCohortInvites()

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* 헤더 */}
      <section className="bg-toast-brown rounded-[32px] p-8 sm:p-12 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-3">
            <span>🛠️</span> 관리자 대시보드 (Admin Studio)
          </h1>
          <p className="text-white/80 font-medium text-sm sm:text-base">
            1기 참가자 초대 코드 발급, 가입 회원 권한 제어, 위젯 공개 승인을 관리하는 통합 센터입니다.
          </p>
        </div>
      </section>

      {/* 대시보드 탭 통합 클라이언트 컴포넌트 */}
      <AdminDashboardClient 
        widgets={widgets || []} 
        users={users || []} 
        invites={invites || []} 
      />
    </div>
  )
}
