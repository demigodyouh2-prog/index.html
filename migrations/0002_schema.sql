-- Pulse core schema
create table if not exists profiles (
  user_id text primary key,
  handle text not null unique,
  display_name text not null,
  bio text not null default '',
  avatar_url text,
  is_seed boolean not null default false,
  posting_locked boolean not null default false,
  banned boolean not null default false,
  ban_reason text,
  ban_category text,
  banned_at timestamptz,
  strike_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists videos (
  id text primary key,
  user_id text not null,
  title text not null,
  description text not null default '',
  tags text not null default '',
  src_url text not null,
  poster_url text,
  duration_sec integer not null default 0,
  is_short boolean not null default false,
  status text not null default 'published',
  takedown_reason text,
  takedown_category text,
  view_count integer not null default 0,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists videos_user_id_idx on videos (user_id);
create index if not exists videos_status_created_idx on videos (status, created_at desc);
create index if not exists videos_short_idx on videos (is_short, status);

create table if not exists comments (
  id text primary key,
  video_id text not null,
  user_id text not null,
  body text not null,
  status text not null default 'visible',
  created_at timestamptz not null default now()
);

create index if not exists comments_video_idx on comments (video_id, created_at);

create table if not exists likes (
  user_id text not null,
  video_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table if not exists follows (
  follower_id text not null,
  creator_id text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, creator_id)
);

create table if not exists reports (
  id text primary key,
  reporter_id text not null,
  video_id text,
  comment_id text,
  reason text not null,
  details text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists moderation_events (
  id text primary key,
  user_id text,
  video_id text,
  comment_id text,
  action text not null,
  category text not null,
  severity text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists moderation_events_created_idx on moderation_events (created_at desc);
