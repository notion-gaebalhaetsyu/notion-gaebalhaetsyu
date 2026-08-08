import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import WidgetManager from '@/components/admin/WidgetManager'
import UserManager from '@/components/admin/UserManager'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // 1. 유저 로그인 및 권한(Admin) 체크
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/?auth_error=true')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    // 권한이 없으면 메인으로 리다이렉트
    redirect('/')
  }

  // 2. 전체 위젯 데이터 가져오기 (가장 최신순)
  const { data: widgets } = await supabase
    .from('widgets')
    .select(`
      *,
      creator_profiles ( nickname, character_image_url ),
      categories ( name )
    `)
    .order('created_at', { ascending: false })

  // 3. 전체 유저 데이터 가져오기
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* 헤더 */}
      <section className="bg-toast-brown rounded-[32px] p-8 sm:p-12 mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-3">
            <span>🛠️</span> 마을 관리 사무소 (Admin)
          </h1>
          <p className="text-white/80 font-medium">
            위젯 공개 승인과 제빵사 권한 관리를 할 수 있는 통합 대시보드입니다.
          </p>
        </div>
      </section>

      {/* 대시보드 콘텐츠 (클라이언트 컴포넌트로 위임) */}
      <div className="flex flex-col gap-12">
        {/* 위젯 관리 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-ink">위젯 관리</h2>
            <span className="bg-bakery-beige text-ink/70 text-xs font-bold px-2 py-1 rounded-md">총 {widgets?.length || 0}개</span>
          </div>
          <WidgetManager initialWidgets={widgets || []} />
        </section>

        {/* 유저 관리 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-ink">마을 주민 관리</h2>
            <span className="bg-bakery-beige text-ink/70 text-xs font-bold px-2 py-1 rounded-md">총 {users?.length || 0}명</span>
          </div>
          <UserManager initialUsers={users || []} />
        </section>
      </div>
    </div>
  )
}
