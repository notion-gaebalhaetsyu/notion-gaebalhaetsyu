export type UserRole = 'visitor' | 'provider' | 'admin' | 'general' | 'creator';

export type WidgetStatus = 'draft' | 'pending' | 'published' | 'hidden';
export type ReportType = 'bug' | 'idea';
export type ReportStatus = 'new' | 'reviewing' | 'resolved' | 'closed';
export type EventType = 'view' | 'copy_embed' | 'copy_share' | 'like' | 'unlike';

export interface DbUser {
  id: string; // Firebase Auth UID
  email: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CreatorProfile {
  id: string; // Document ID (email or UID)
  user_id: string;
  email?: string;
  nickname: string;
  bio_short?: string;
  bio_long?: string;
  character_image_url?: string;
  skills?: string[];
  links?: Record<string, string>;
  cohort?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  icon?: string;
}

export interface Widget {
  id: string;
  creator_profile_id: string;
  category_id: string;
  category_ids?: string[];
  cohort?: string;
  name: string;
  slug: string;
  github_url?: string;
  short_description?: string;
  long_description?: string;
  creator_comment?: string;
  tags?: string[];
  thumbnail_url?: string;
  preview_url?: string;
  embed_url?: string;
  config_schema?: Record<string, any>;
  default_config?: {
    themeColor?: string;
    fontSize?: string;
    [key: string]: any;
  };
  responsive_supported?: boolean;
  uses_notion_api?: boolean;
  status: WidgetStatus;
  view_count: number;
  copy_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;

  // Joined / Denormalized fields for convenience in UI
  categories?: {
    id?: string;
    name: string;
    slug?: string;
    icon?: string;
  };
  categories_list?: {
    id?: string;
    name: string;
    slug?: string;
    icon?: string;
  }[];
  creator_profiles?: {
    id?: string;
    nickname: string;
    character_image_url?: string;
    cohort?: string;
  };
  comments?: WidgetComment[];
}

export interface WidgetComment {
  id: string;
  user_id: string;
  nickname: string;
  email: string;
  user_avatar?: string;
  created_at: string; // YYYY-MM-DD HH:mm:ss (초 단위까지)
  updated_at?: string; // YYYY-MM-DD HH:mm:ss (수정 일시)
  content: string;
}

export interface UserCommentItem {
  comment: WidgetComment;
  widget: {
    id: string;
    slug: string;
    name: string;
    thumbnail_url?: string;
    category_name?: string;
  };
}

export interface Favorite {
  id: string;
  user_id: string;
  widget_id: string;
  created_at: string;
}

export interface WidgetEvent {
  id?: string;
  widget_id: string;
  user_id?: string | null;
  session_id?: string | null;
  event_type: EventType;
  created_at: string;
}

export interface CohortInvite {
  id?: string;
  email: string;
  nickname: string;
  code: string;
  cohort: string;
  role: UserRole; // 'visitor' | 'provider' | 'admin'
  is_used: boolean;
  used_by?: string | null;
  used_at?: string | null;
  created_at?: string;
}

export interface VisitorSummary {
  total_count: number;
  today_date: string; // YYYY-MM-DD
  today_count: number;
  updated_at: string;
}

export interface VisitorDailyStat {
  id?: string;
  date: string; // YYYY-MM-DD
  count: number;
  updated_at: string;
}

export interface VisitorHourlyStat {
  id?: string;
  date_hour: string; // YYYY-MM-DD_HH
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  count: number;
  updated_at: string;
}

export interface VisitorIpSession {
  ip_hash: string;
  last_visited_at: number; // milliseconds timestamp
  visit_count: number;
  first_visited_at: string;
  user_agent?: string;
}

