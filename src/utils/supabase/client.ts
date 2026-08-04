import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 클라이언트 측에서는 매번 새로운 클라이언트를 생성해도 @supabase/ssr 내부에서 브라우저 컨텍스트에 따라 캐싱을 처리합니다.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
