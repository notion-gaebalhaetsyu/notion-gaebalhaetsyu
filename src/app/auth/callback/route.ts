import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next 파라미터가 있으면 거기로, 없으면 홈으로
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 인증 성공 시 next 경로로 리다이렉트
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth callback error:', error)
    }
  }

  // 코드가 없거나 에러 발생 시 로그인 실패 페이지 또는 메인(알림 포함)으로 리다이렉트
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}
