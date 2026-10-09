-- Run this once in the Supabase SQL Editor for the shared music catalog.
create table if not exists public.user_tracks (
  id uuid primary key,
  telegram_user_id text not null,
  title text not null,
  artist text not null default 'User upload',
  audio_path text not null unique,
  uploader_username text,
  uploader_first_name text not null,
  duration integer not null default 0,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(artist, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(uploader_username, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(uploader_first_name, '')), 'D')
  ) stored,
  created_at timestamptz not null default now()
);

create index if not exists user_tracks_search_vector_idx on public.user_tracks using gin (search_vector);

alter table public.user_tracks enable row level security;
grant select, insert, update, delete on table public.user_tracks to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-tracks',
  'user-tracks',
  true,
  52428800,
  array['audio/mpeg','audio/mp4','audio/aac','audio/ogg','audio/wav','audio/flac','audio/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
