// Cloudflare Pages/Workers API boundary. Replace the demo repository with D1 queries in production.
const demoWidgets = [
  {
    id: 1,
    status: "published",
    name: "오늘의 한 조각",
    category: "기록",
    embedUrl: "https://widgets.gaebalhaetshu.com/embed/1",
  },
  {
    id: 2,
    status: "published",
    name: "집중력 오븐 타이머",
    category: "집중",
    embedUrl: "https://widgets.gaebalhaetshu.com/embed/2",
  },
  {
    id: 3,
    status: "published",
    name: "D-Day 카운트다운",
    category: "D-Day",
    embedUrl: "https://widgets.gaebalhaetshu.com/embed/3",
  },
];

export async function onRequestGet() {
  return Response.json({
    data: demoWidgets.filter((widget) => widget.status === "published"),
    demo: true,
  });
}

export async function onRequestPost({ request }) {
  return Response.json(
    {
      error: "인증된 제작자만 위젯을 등록할 수 있습니다.",
      code: "AUTH_REQUIRED",
    },
    { status: 401 },
  );
}
