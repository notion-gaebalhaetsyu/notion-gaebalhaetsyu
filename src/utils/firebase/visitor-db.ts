import crypto from 'crypto';
import { adminDb } from './admin';
import { db } from './client';
import { 
  doc, 
  getDoc, 
  setDoc, 
  increment as firestoreIncrement 
} from 'firebase/firestore';
import * as admin from 'firebase-admin';
import { VisitorSummary, VisitorDailyStat, VisitorHourlyStat, VisitorIpSession } from './types';

// 1시간 밀리초 상수 (동일 IP 중복 집계 방지 시간)
const ONE_HOUR_MS = 60 * 60 * 1000;

// 컬렉션 명칭 상수 (별도 전용 컬렉션)
const COLL_SUMMARY = 'visitor_summary';
const COLL_DAILY = 'visitor_daily_stats';
const COLL_HOURLY = 'visitor_hourly_stats';
const COLL_IPS = 'visitor_ips';
const DOC_OVERVIEW = 'overview';

/**
 * 한국 표준시(KST, Asia/Seoul, UTC+9) 기준 날짜 및 시간 계산
 */
export function getKstDateInfo(date: Date = new Date()) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstTime = new Date(date.getTime() + kstOffsetMs);

  const year = kstTime.getUTCFullYear();
  const month = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kstTime.getUTCDate()).padStart(2, '0');
  const hour = String(kstTime.getUTCHours()).padStart(2, '0');

  const dateKey = `${year}-${month}-${day}`; // 예: "2026-09-17"
  const hourKey = `${dateKey}_${hour}`;     // 예: "2026-09-17_17"

  return {
    dateKey,
    hourKey,
    hourNum: parseInt(hour, 10),
    kstIsoString: kstTime.toISOString(),
  };
}

/**
 * IP 주소 SHA-256 단방향 해시 생성 (개인정보 보호 및 고유 문서 ID 안전성 확보)
 */
export function hashIp(ip: string): string {
  const sanitized = (ip || '127.0.0.1').trim().toLowerCase();
  return crypto.createHash('sha256').update(sanitized).digest('hex');
}

/**
 * 현재 방문자 통계 요약(오늘 및 전체) 조회
 */
export async function getVisitorStats(): Promise<{ todayCount: number; totalCount: number }> {
  const { dateKey } = getKstDateInfo();

  try {
    if (adminDb) {
      // 1. 전체 요약 문서 조회
      const summaryDoc = await adminDb.collection(COLL_SUMMARY).doc(DOC_OVERVIEW).get();
      // 2. 오늘 일별 통계 문서 조회
      const dailyDoc = await adminDb.collection(COLL_DAILY).doc(dateKey).get();

      const totalCount = summaryDoc.exists ? (summaryDoc.data()?.total_count || 0) : 0;
      const todayCount = dailyDoc.exists ? (dailyDoc.data()?.count || 0) : 0;

      return { todayCount, totalCount };
    } else {
      // Modular Client SDK 조회
      const summaryRef = doc(db, COLL_SUMMARY, DOC_OVERVIEW);
      const dailyRef = doc(db, COLL_DAILY, dateKey);

      const [summarySnap, dailySnap] = await Promise.all([
        getDoc(summaryRef),
        getDoc(dailyRef),
      ]);

      const totalCount = summarySnap.exists() ? (summarySnap.data()?.total_count || 0) : 0;
      const todayCount = dailySnap.exists() ? (dailySnap.data()?.count || 0) : 0;

      return { todayCount, totalCount };
    }
  } catch (error) {
    console.error('getVisitorStats error:', error);
    return { todayCount: 0, totalCount: 0 };
  }
}

/**
 * 방문 기록 처리:
 * 1. IP 해시로 최근 방문 시각 확인
 * 2. 1시간 이내 방문인 경우: 카운트 증가 없이 현재 통계 반환
 * 3. 1시간 경과 또는 첫 방문인 경우:
 *    - IP 세션 갱신
 *    - 일별 통계(visitor_daily_stats) +1
 *    - 시간별 통계(visitor_hourly_stats) +1
 *    - 전체 요약(visitor_summary) +1
 */
export async function recordVisitorVisit(
  clientIp: string,
  userAgent?: string
): Promise<{ counted: boolean; todayCount: number; totalCount: number }> {
  const ipHash = hashIp(clientIp);
  const now = new Date();
  const nowMs = now.getTime();
  const { dateKey, hourKey, hourNum } = getKstDateInfo(now);

  try {
    if (adminDb) {
      // ==========================================
      // Firebase Admin SDK 사용 (Server 환경)
      // ==========================================
      const ipRef = adminDb.collection(COLL_IPS).doc(ipHash);
      const ipDoc = await ipRef.get();

      if (ipDoc.exists) {
        const data = ipDoc.data() as VisitorIpSession;
        const lastVisitedAt = data.last_visited_at || 0;
        
        // 1시간 이내 재접속인 경우 집계하지 않음
        if (nowMs - lastVisitedAt < ONE_HOUR_MS) {
          const stats = await getVisitorStats();
          return { counted: false, ...stats };
        }
      }

      // 1시간 이상 경과 또는 신규 방문 -> 집계 실행
      const batch = adminDb.batch();

      // 1. IP 세션 기록/갱신
      batch.set(
        ipRef,
        {
          ip_hash: ipHash,
          last_visited_at: nowMs,
          visit_count: admin.firestore.FieldValue.increment(1),
          first_visited_at: ipDoc.exists ? (ipDoc.data()?.first_visited_at || now.toISOString()) : now.toISOString(),
          ...(userAgent ? { user_agent: userAgent.slice(0, 200) } : {}),
        },
        { merge: true }
      );

      // 2. 일별 통계 갱신 (visitor_daily_stats/YYYY-MM-DD)
      const dailyRef = adminDb.collection(COLL_DAILY).doc(dateKey);
      batch.set(
        dailyRef,
        {
          date: dateKey,
          count: admin.firestore.FieldValue.increment(1),
          updated_at: now.toISOString(),
        },
        { merge: true }
      );

      // 3. 시간별 통계 갱신 (visitor_hourly_stats/YYYY-MM-DD_HH)
      const hourlyRef = adminDb.collection(COLL_HOURLY).doc(hourKey);
      batch.set(
        hourlyRef,
        {
          date_hour: hourKey,
          date: dateKey,
          hour: hourNum,
          count: admin.firestore.FieldValue.increment(1),
          updated_at: now.toISOString(),
        },
        { merge: true }
      );

      // 4. 전체 요약 갱신 (visitor_summary/overview)
      const summaryRef = adminDb.collection(COLL_SUMMARY).doc(DOC_OVERVIEW);
      batch.set(
        summaryRef,
        {
          total_count: admin.firestore.FieldValue.increment(1),
          today_date: dateKey,
          updated_at: now.toISOString(),
        },
        { merge: true }
      );

      await batch.commit();

      // 최신 통계 조회 후 반환
      const stats = await getVisitorStats();
      return { counted: true, ...stats };
    } else {
      // ==========================================
      // Modular Client SDK 사용 (Admin 자격증명 미설정 로컬/대체 환경)
      // ==========================================
      const ipRef = doc(db, COLL_IPS, ipHash);
      const ipSnap = await getDoc(ipRef);

      if (ipSnap.exists()) {
        const data = ipSnap.data() as VisitorIpSession;
        const lastVisitedAt = data.last_visited_at || 0;

        if (nowMs - lastVisitedAt < ONE_HOUR_MS) {
          const stats = await getVisitorStats();
          return { counted: false, ...stats };
        }
      }

      // 1. IP 세션 기록/갱신
      await setDoc(
        ipRef,
        {
          ip_hash: ipHash,
          last_visited_at: nowMs,
          visit_count: firestoreIncrement(1),
          first_visited_at: ipSnap.exists() ? (ipSnap.data()?.first_visited_at || now.toISOString()) : now.toISOString(),
          ...(userAgent ? { user_agent: userAgent.slice(0, 200) } : {}),
        },
        { merge: true }
      );

      // 2. 일별 통계 갱신
      const dailyRef = doc(db, COLL_DAILY, dateKey);
      await setDoc(
        dailyRef,
        {
          date: dateKey,
          count: firestoreIncrement(1),
          updated_at: now.toISOString(),
        },
        { merge: true }
      );

      // 3. 시간대별 통계 갱신
      const hourlyRef = doc(db, COLL_HOURLY, hourKey);
      await setDoc(
        hourlyRef,
        {
          date_hour: hourKey,
          date: dateKey,
          hour: hourNum,
          count: firestoreIncrement(1),
          updated_at: now.toISOString(),
        },
        { merge: true }
      );

      // 4. 전체 요약 갱신
      const summaryRef = doc(db, COLL_SUMMARY, DOC_OVERVIEW);
      await setDoc(
        summaryRef,
        {
          total_count: firestoreIncrement(1),
          today_date: dateKey,
          updated_at: now.toISOString(),
        },
        { merge: true }
      );

      const stats = await getVisitorStats();
      return { counted: true, ...stats };
    }
  } catch (error) {
    console.error('recordVisitorVisit error:', error);
    // 에러 발생 시에도 안전하게 현재 통계 반환
    const stats = await getVisitorStats();
    return { counted: false, ...stats };
  }
}
