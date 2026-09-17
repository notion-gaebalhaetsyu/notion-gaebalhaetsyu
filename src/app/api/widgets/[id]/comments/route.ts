import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/utils/firebase/server-auth';
import { addWidgetComment, deleteWidgetComment } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '구글 로그인 후 댓글을 작성할 수 있습니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const widgetId = decodeURIComponent(id || '');

    const body = await request.json();
    const content = (body.content || '').trim();

    if (!content) {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: '댓글은 최대 500자까지 작성할 수 있습니다.' },
        { status: 400 }
      );
    }

    const nickname = user.name?.trim() || user.email.split('@')[0] || '익명';
    const email = user.email.trim();
    const user_avatar = user.avatar_url || '';

    const result = await addWidgetComment(widgetId, {
      user_id: user.id,
      nickname,
      email,
      user_avatar,
      content,
    });

    if (!result.success || !result.comment) {
      return NextResponse.json(
        { error: result.error || '댓글 등록에 실패했습니다.' },
        { status: 500 }
      );
    }

    revalidatePath(`/widgets/${widgetId}`);

    return NextResponse.json({
      success: true,
      comment: result.comment,
    });
  } catch (error: any) {
    console.error('POST /api/widgets/[id]/comments error:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const widgetId = decodeURIComponent(id || '');

    const url = new URL(request.url);
    let commentId = url.searchParams.get('commentId');

    if (!commentId) {
      try {
        const body = await request.json();
        commentId = body.commentId;
      } catch {}
    }

    if (!commentId) {
      return NextResponse.json(
        { error: '삭제할 댓글 ID가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await deleteWidgetComment(
      widgetId,
      commentId,
      user.id,
      user.role === 'admin'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '댓글 삭제에 실패했습니다.' },
        { status: 400 }
      );
    }

    revalidatePath(`/widgets/${widgetId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/widgets/[id]/comments error:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
