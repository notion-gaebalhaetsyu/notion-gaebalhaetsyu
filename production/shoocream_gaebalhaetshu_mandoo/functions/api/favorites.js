export async function onRequestPost({ request }) {
  // Production: validate the Google session server-side, then insert into favorites with a unique constraint.
  return Response.json(
    { error: "로그인이 필요한 기능입니다.", code: "AUTH_REQUIRED" },
    { status: 401 },
  );
}
