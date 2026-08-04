import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import WidgetDetailClient from "@/components/WidgetDetailClient";

export default async function WidgetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. 위젯 데이터 가져오기 (제작자 프로필 포함)
  const { data: widget, error } = await supabase
    .from('widgets')
    .select(`
      *,
      creator_profiles ( nickname )
    `)
    .eq('slug', slug)
    .single();

  if (error || !widget) {
    notFound();
  }

  // 2. 조회수 증가 (단순 업데이트)
  // 실제 프로덕션에서는 RPC나 서버 액션을 쓰는 것이 안전하지만, MVP를 위해 직접 update
  await supabase
    .from('widgets')
    .update({ view_count: (widget.view_count || 0) + 1 })
    .eq('id', widget.id);

  // 3. 현재 유저 확인 및 관심 위젯 여부 조회
  const { data: { user } } = await supabase.auth.getUser();
  let isFavorited = false;
  
  if (user) {
    const { data: favData } = await supabase
      .from('favorites')
      .select('id')
      .match({ user_id: user.id, widget_id: widget.id })
      .single();
    
    if (favData) {
      isFavorited = true;
    }
  }

  return (
    <WidgetDetailClient 
      widget={widget} 
      initialIsFavorited={isFavorited} 
      userId={user?.id} 
    />
  );
}
