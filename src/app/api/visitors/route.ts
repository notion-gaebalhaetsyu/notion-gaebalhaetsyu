import { NextResponse } from 'next/server';
import { getVisitorStats, recordVisitorVisit } from '@/utils/firebase/visitor-db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/visitors
 * 현재 방문자 통계(오늘 및 전체 누적) 조회 (카운트 증가 없음)
 */
export async function GET() {
  try {
    const stats = await getVisitorStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('GET /api/visitors error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch visitor stats', todayCount: 0, totalCount: 0 },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visitors
 * 방문 기록 처리:
 * 동일 IP 1시간 내 재접속 시 카운트 증가 방지 및 최신 통계 반환
 */
export async function POST(request: Request) {
  try {
    // 클라이언트 IP 추출 (프록시/Vercel/Cloudflare 헤더 우선 탐색)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    let clientIp = '127.0.0.1';
    if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0]?.trim() || clientIp;
    } else if (realIp) {
      clientIp = realIp.trim();
    } else if (cfConnectingIp) {
      clientIp = cfConnectingIp.trim();
    }

    const userAgent = request.headers.get('user-agent') || undefined;

    // 방문 집계 실행 (1시간 중복 방지 및 일별/시간대별 DB 기록)
    const result = await recordVisitorVisit(clientIp, userAgent);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('POST /api/visitors error:', error);
    const fallbackStats = await getVisitorStats();
    return NextResponse.json(
      { success: false, counted: false, ...fallbackStats, error: error.message },
      { status: 500 }
    );
  }
}
