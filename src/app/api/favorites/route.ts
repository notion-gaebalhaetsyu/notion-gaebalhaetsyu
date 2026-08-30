import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/utils/firebase/server-auth';
import { toggleFavorite, getUserFavorites } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await getUserFavorites(user.id);
    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error('GET /api/favorites error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { widgetId, isFavorited } = body;

    if (!widgetId || typeof isFavorited !== 'boolean') {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    await toggleFavorite(user.id, widgetId, isFavorited);

    revalidatePath('/mypage');
    revalidatePath('/widgets');
    revalidatePath(`/widgets/${widgetId}`);
    revalidatePath('/');

    return NextResponse.json({ 
      success: true, 
      isFavorited,
      message: isFavorited ? '내가 찜한 피자에 담았슈! 🍕' : '찜 목록에서 제외했슈.' 
    });
  } catch (error: any) {
    console.error('POST /api/favorites error:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle favorite' }, { status: 500 });
  }
}
