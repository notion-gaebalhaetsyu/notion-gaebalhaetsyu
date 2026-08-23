import { notFound } from "next/navigation";
import { getWidgetBySlug, incrementWidgetViewCount, checkIsFavorited } from "@/utils/firebase/db";
import { getCurrentUser } from "@/utils/firebase/server-auth";
import WidgetDetailClient from "@/components/WidgetDetailClient";

export const dynamic = 'force-dynamic'

export default async function WidgetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  // 1. 위젯 데이터 가져오기 (제작자 프로필 포함)
  const widget = await getWidgetBySlug(slug);

  if (!widget) {
    notFound();
  }

  // 2. 조회수 증가 (비동기 호출)
  incrementWidgetViewCount(widget.id).catch(console.error);

  // 3. 현재 유저 확인 및 관심 위젯 여부 조회
  const user = await getCurrentUser();
  let isFavorited = false;
  
  if (user) {
    isFavorited = await checkIsFavorited(user.id, widget.id);
  }

  return (
    <WidgetDetailClient 
      widget={widget} 
      initialIsFavorited={isFavorited} 
      userId={user?.id} 
    />
  );
}
