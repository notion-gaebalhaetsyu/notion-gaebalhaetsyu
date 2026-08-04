import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { widgetId } = await request.json();

    if (!widgetId) {
      return NextResponse.json({ error: 'Missing widgetId' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. widget의 copy_count 조회 및 증가 (RPC가 없으므로 간단히 쿼리로 진행)
    const { data, error } = await supabase
      .from('widgets')
      .select('copy_count')
      .eq('id', widgetId)
      .single();

    if (error) throw error;

    await supabase
      .from('widgets')
      .update({ copy_count: (data?.copy_count || 0) + 1 })
      .eq('id', widgetId);

    // 2. widget_events에 복사 이벤트 로깅 시도 (선택적)
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('widget_events').insert({
      widget_id: widgetId,
      user_id: user?.id || null,
      event_type: 'copy_embed'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing copy count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
