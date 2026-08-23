import { NextResponse } from 'next/server';
import { incrementWidgetCopyCount } from '@/utils/firebase/db';
import { getCurrentUser } from '@/utils/firebase/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { widgetId } = await request.json();

    if (!widgetId) {
      return NextResponse.json({ error: 'Missing widgetId' }, { status: 400 });
    }

    const user = await getCurrentUser();
    await incrementWidgetCopyCount(widgetId, user?.id || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing copy count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
