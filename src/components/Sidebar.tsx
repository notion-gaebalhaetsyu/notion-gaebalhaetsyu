import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signInWithGoogle, signOut } from '@/app/auth/actions';

export default async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role = 'general';
  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (userData) {
      role = userData.role;
    }
  }

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-toast-brown/30 flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-forest-green flex items-center gap-2">
          <span>🥐</span> 개발했슈
        </h1>
        <p className="text-xs text-toast-brown mt-1">위젯 제빵소</p>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2">
        <Link href="/" className="px-4 py-3 rounded-xl hover:bg-bakery-beige text-ink font-medium flex items-center gap-2 transition-colors">
          🏠 홈
        </Link>
        <Link href="/widgets" className="px-4 py-3 rounded-xl hover:bg-bakery-beige text-ink font-medium flex items-center gap-2 transition-colors">
          🍞 위젯 진열대
        </Link>
        <Link href="/creators" className="px-4 py-3 rounded-xl hover:bg-bakery-beige text-ink font-medium flex items-center gap-2 transition-colors">
          🧑‍🍳 제작자 소개
        </Link>
        <Link href="/about" className="px-4 py-3 rounded-xl hover:bg-bakery-beige text-ink font-medium flex items-center gap-2 transition-colors">
          🏢 개발했슈 소개
        </Link>
        <Link href="/guide" className="px-4 py-3 rounded-xl hover:bg-bakery-beige text-ink font-medium flex items-center gap-2 transition-colors">
          📖 설치 방법
        </Link>
      </nav>

      <div className="p-4 border-t border-toast-brown/30 flex flex-col gap-2">
        {user ? (
          <>
            {(role === 'creator' || role === 'admin') && (
              <Link href="/creators/widgets/new" className="w-full text-center py-3 rounded-xl bg-forest-green text-white font-bold hover:bg-forest-green/90 transition-colors">
                🍞 새 위젯 굽기
              </Link>
            )}
            {role === 'admin' && (
              <Link href="/admin" className="w-full text-center py-3 rounded-xl bg-toast-brown text-white font-bold hover:bg-toast-brown/90 transition-colors">
                🛠️ 관리자 페이지
              </Link>
            )}
            <Link href="/mypage" className="w-full text-center py-3 rounded-xl border-2 border-forest-green text-forest-green font-bold hover:bg-forest-green/5 transition-colors">
              내 작업대 (마이페이지)
            </Link>
            <form action={signOut}>
              <button className="w-full py-2 text-sm text-toast-brown font-medium hover:text-ink transition-colors">
                로그아웃
              </button>
            </form>
          </>
        ) : (
          <form action={signInWithGoogle}>
            <button className="w-full py-3 rounded-xl bg-white border-2 border-forest-green text-forest-green font-bold flex items-center justify-center gap-2 hover:bg-forest-green/5 transition-colors">
              <span className="text-lg">G</span> 구글로 시작하기
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
