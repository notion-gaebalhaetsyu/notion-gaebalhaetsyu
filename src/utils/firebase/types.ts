export type UserRole = 'general' | 'creator' | 'admin';
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
  id: string; // Document ID (usually same as user_id or unique ID)
  user_id: string;
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
}

export interface Widget {
  id: string;
  creator_profile_id: string;
  category_id: string;
  name: string;
  slug: string;
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
  };
  creator_profiles?: {
    id?: string;
    nickname: string;
    character_image_url?: string;
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
  is_used: boolean;
  used_by?: string | null;
  used_at?: string | null;
  created_at?: string;
}
