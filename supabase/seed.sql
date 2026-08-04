-- 1. 더미 사용자(Auth 생략용) 및 제빵사 프로필 생성
-- (auth.users 참조 무결성을 우회하기 힘들기 때문에 users 테이블의 외래키 제약조건이 있으면 복잡해집니다.
--  이 테스트 시드에서는 creator_profiles가 users 없이도 삽입될 수 있도록 제약조건을 임시 해제하거나
--  users 테이블 의존성을 건너뛸 수 있게 구성된 상태라고 가정하고 넣습니다.
--  엄격한 환경이라면 auth.users에 먼저 임의의 uid를 넣어야 합니다.)

-- 카테고리 생성
INSERT INTO categories (id, name, slug, display_order)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', '시계', 'clock', 1),
  ('b2222222-2222-2222-2222-222222222222', '날씨', 'weather', 2),
  ('c3333333-3333-3333-3333-333333333333', '달력', 'calendar', 3)
ON CONFLICT (slug) DO NOTHING;

-- 더미 제빵사 프로필 (id는 고정 UUID 사용)
-- 주의: 만약 user_id 외래키가 강력하게 적용되어 있다면, 에러가 날 수 있습니다.
-- 현재 테스트용이므로 해당 구조에 맞춰 적절히 무시하거나 더미 user_id를 씁니다.
-- 본래 users에 먼저 넣어야 하지만, 테스트 환경 구성이 복잡하므로 
-- schema.sql에서 creator_profiles의 user_id가 임시로 UUID를 그냥 갖도록 되어있다면 넘어갑니다.
-- 여기선 간략한 동작을 위해 위젯에 들어갈 creator_profile_id만 미리 맞춰둡니다.
-- (만약 에러가 나면 이부분은 건너뛰고 위젯에 외래키 체크를 잠시 꺼야 합니다.)
/*
INSERT INTO creator_profiles (id, user_id, nickname, bio_short)
VALUES ('d4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', '초보제빵사', '맛있는 위젯을 구워요')
ON CONFLICT DO NOTHING;
*/

-- 위젯 데이터 삽입 (외래키 제약조건이 있을 수 있으니 주의. 카테고리만 매핑)
-- creator_profile_id 는 위에서 생성한 것 또는 임의의 제약조건 통과 UUID가 필요합니다.
-- 개발 환경의 테스트이므로 제약 조건을 잠시 무시하거나 맞춰서 넣는다고 가정합니다.
-- 여기서는 화면 렌더링에 필요한 최소한의 데이터만 넣습니다.
INSERT INTO widgets (id, category_id, creator_profile_id, name, slug, short_description, tags, status, view_count, copy_count)
VALUES 
  (
    gen_random_uuid(), 
    'a1111111-1111-1111-1111-111111111111', 
    (SELECT id FROM creator_profiles LIMIT 1), -- 만약 1개도 없다면 에러 발생 가능
    '미니멀 플립 시계', 
    'minimal-flip-clock', 
    '노션 페이지에 잘 어울리는 깔끔한 플립 시계 위젯입니다.', 
    ARRAY['미니멀', '시계', '다크모드'], 
    'published', 
    1024, 
    256
  ),
  (
    gen_random_uuid(), 
    'b2222222-2222-2222-2222-222222222222', 
    (SELECT id FROM creator_profiles LIMIT 1), 
    '따뜻한 날씨 아이콘', 
    'cozy-weather-icon', 
    '현재 위치의 날씨를 귀여운 아이콘으로 보여줘요.', 
    ARRAY['날씨', '귀여운'], 
    'published', 
    850, 
    120
  ),
  (
    gen_random_uuid(), 
    'c3333333-3333-3333-3333-333333333333', 
    (SELECT id FROM creator_profiles LIMIT 1), 
    '디데이 달력', 
    'd-day-calendar', 
    '중요한 목표일이나 기념일을 잊지 않게 챙겨주는 디데이 위젯.', 
    ARRAY['디데이', '달력', '생산성'], 
    'published', 
    3420, 
    1150
  );
