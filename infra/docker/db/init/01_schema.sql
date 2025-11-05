-- Supabase schema (public + auth references) for mock/in-memory compatibility
-- Provided by user; included as-is to keep source-of-truth committed.

-- NOTE: In mock mode there is no real auth.users table. These FKs are kept
-- only for reference and do not enforce without a real Postgres.

create table if not exists public.user_profile (
  user_id uuid not null,
  bio character varying(200) null,
  constraint user_profile_pkey primary key (user_id)
  -- constraint user_profile_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
);

create table if not exists public.sessions (
  id uuid not null,
  user_id uuid not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone null,
  date date not null default CURRENT_DATE,
  subject text not null,
  session_type numeric not null,
  inserted_at timestamp with time zone null,
  updated_at timestamp with time zone null,
  session_goal text null,
  total_time numeric null,
  constraint sessions_pkey primary key (id)
  -- constraint sessions_user_id_fkey foreign KEY (user_id) references auth.users (id),
  -- constraint sessions_session_type_check check ((session_type > (0)::numeric))
);

create table if not exists public.badge (
  badge_id uuid not null,
  name text not null,
  description text null,
  icon_url text null,
  category text not null,
  criteria_type text not null,
  threshold numeric null,
  created_at timestamp with time zone null,
  constraint badge_pkey primary key (badge_id)
);

create table if not exists public.user_badge (
  badge_id uuid not null,
  user_id uuid not null,
  earned_at timestamp with time zone not null,
  constraint user_badge_pkey primary key (badge_id, user_id)
  -- constraint fk_badge foreign KEY (badge_id) references badge (badge_id),
  -- constraint fk_user foreign KEY (user_id) references auth.users (id)
);

