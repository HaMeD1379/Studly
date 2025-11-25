-- ============================================================================
-- Studly local schema (public schema only)
--
-- Source: Supabase public schema exported for local Postgres dev and mock mode.
-- Notes:
--   - In mock/in-memory mode there is no real auth.users table; all FKs that
--     reference auth.users are kept as comments for documentation only.
--   - Extension-specific bits (e.g. extensions.uuid_generate_v4, TABLESPACE)
--     are omitted so this file is portable across local Postgres instances.
--   - This file is safe to mount into Postgres via docker-entrypoint-initdb.d.
-- ============================================================================

-- user_profile: basic profile info keyed by Supabase auth user id
create table if not exists public.user_profile (
  user_id uuid not null,
  email character varying(255) not null,
  full_name character varying(255) not null,
  bio character varying(200) null,
  constraint user_profile_pkey primary key (user_id)
  -- Real Supabase FK (disabled in local/mock):
  -- constraint user_profile_user_id_fkey foreign key (user_id)
  --   references auth.users (id) on delete cascade
);

-- sessions: study sessions for a given user
create table if not exists public.sessions (
  id uuid not null,
  -- Supabase version uses: default extensions.uuid_generate_v4()
  -- For local dev you can add a default if the extension exists, e.g.:
  --   id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone null,
  date date not null default current_date,
  subject text not null,
  session_type numeric not null,
  inserted_at timestamp with time zone null,
  -- Supabase version uses: default now()
  -- inserted_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null,
  -- Supabase version uses: default now()
  -- updated_at timestamp with time zone null default now(),
  session_goal text null,
  total_time numeric null,
  constraint sessions_pkey primary key (id)
  -- Real Supabase FK and check (disabled in local/mock):
  -- constraint sessions_user_id_fkey foreign key (user_id)
  --   references auth.users (id),
  -- constraint sessions_session_type_check check ((session_type > (0)::numeric))
);

-- badge: catalog of badges that can be earned
create table if not exists public.badge (
  badge_id uuid not null,
  -- Supabase version uses: default gen_random_uuid()
  -- badge_id uuid not null default gen_random_uuid(),
  name text not null,
  description text null,
  icon_url text null,
  category text not null,
  criteria_type text not null,
  threshold numeric null,
  created_at timestamp with time zone null,
  -- Supabase version uses: default now()
  -- created_at timestamp with time zone null default now(),
  constraint badge_pkey primary key (badge_id)
);

-- user_badge: join table between users and badges they have earned
create table if not exists public.user_badge (
  badge_id uuid not null,
  user_id uuid not null,
  earned_at timestamp with time zone not null,
  -- Supabase version uses: default now()
  -- earned_at timestamp with time zone not null default now(),
  constraint user_badge_pkey primary key (badge_id, user_id)
  -- Real Supabase FKs (disabled in local/mock):
  -- constraint fk_badge foreign key (badge_id) references badge (badge_id),
  -- constraint fk_user foreign key (user_id) references auth.users (id)
);

-- friends: friend relationships between users
create table if not exists public.friends (
  id uuid not null,
  -- Supabase version uses: default gen_random_uuid()
  -- id uuid not null default gen_random_uuid(),
  from_user uuid not null,
  to_user uuid not null,
  status smallint not null,
  updated_at timestamp with time zone not null,
  -- Supabase version uses: default now()
  -- updated_at timestamp with time zone not null default now(),
  constraint friends_pkey primary key (id),
  constraint friends_from_user_to_user_key unique (from_user, to_user)
  -- Real Supabase FKs and check (disabled in local/mock):
  -- constraint friends_from_user_fkey foreign key (from_user)
  --   references auth.users (id) on delete cascade,
  -- constraint friends_to_user_fkey foreign key (to_user)
  --   references auth.users (id) on delete cascade,
  -- constraint friends_status_check check ((status = any (array[1, 2, 3])))
);
