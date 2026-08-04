-- 개발했슈 (위젯 제빵소) Supabase 스키마 (초안)
-- Postgres 15+

-- 열거형(Enum) 타입 정의
CREATE TYPE user_role AS ENUM ('general', 'creator', 'admin');
CREATE TYPE widget_status AS ENUM ('draft', 'pending', 'published', 'hidden');
CREATE TYPE report_type AS ENUM ('bug', 'idea');
CREATE TYPE report_status AS ENUM ('new', 'reviewing', 'resolved', 'closed');
CREATE TYPE event_type AS ENUM ('view', 'copy_embed', 'copy_share', 'like', 'unlike');

-- 1. users 테이블 (Supabase Auth와 연동되지만, 애플리케이션용 확장 프로필)
-- 참고: 보통 auth.users와 1:1 매칭합니다.
CREATE TABLE users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text,
  avatar_url text,
  role user_role DEFAULT 'general' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. cohorts (기수) 테이블
CREATE TABLE cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. join_codes (가입 코드) 테이블
CREATE TABLE join_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. creator_profiles (제작자 프로필) 테이블
CREATE TABLE creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nickname text NOT NULL UNIQUE,
  bio_short text,
  bio_long text,
  character_image_url text,
  skills text[],
  links jsonb, -- { github: '...', notion: '...' }
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. creator_cohorts (제작자-기수 연결) 테이블
CREATE TABLE creator_cohorts (
  creator_profile_id uuid REFERENCES creator_profiles(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
  verified_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (creator_profile_id, cohort_id)
);

-- 6. categories (카테고리) 테이블
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  display_order integer DEFAULT 0 NOT NULL
);

-- 7. widgets (위젯) 테이블
CREATE TABLE widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id uuid REFERENCES creator_profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  long_description text,
  creator_comment text,
  tags text[],
  thumbnail_url text,
  preview_url text,
  embed_url text,
  config_schema jsonb, -- 위젯별 설정 스키마
  default_config jsonb, -- 기본 설정값
  responsive_supported boolean DEFAULT true NOT NULL,
  uses_notion_api boolean DEFAULT false NOT NULL,
  status widget_status DEFAULT 'draft' NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  copy_count integer DEFAULT 0 NOT NULL,
  like_count integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  published_at timestamp with time zone
);

-- 8. favorites (관심 위젯) 테이블
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  widget_id uuid REFERENCES widgets(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, widget_id)
);

-- 9. widget_events (통계/로그) 테이블
CREATE TABLE widget_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid REFERENCES widgets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL, -- 비로그인자도 있으므로 nullable
  session_id text, -- 익명 사용자 세션 (로컬 스토리지 등)
  event_type event_type NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 10. reports (버그 및 제보) 테이블
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid REFERENCES widgets(id) ON DELETE SET NULL,
  type report_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  reference_url text,
  contact text,
  status report_status DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 업데이트 시 updated_at 변경을 위한 트리거 함수 예시
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 연결
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON creator_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_widgets_updated_at BEFORE UPDATE ON widgets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
