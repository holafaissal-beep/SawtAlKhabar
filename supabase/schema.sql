create extension if not exists pgcrypto;

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('morocco','spain','france','international','sports','economy')),
  status text not null default 'draft' check (status in ('draft','review','published','rejected')),
  confidence numeric(4,3) not null default 0,
  is_sensitive boolean not null default false,
  translations jsonb not null,
  original_published_at timestamptz,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.news_articles(id) on delete cascade,
  name text not null,
  url text not null unique,
  source_language text,
  source_published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists news_articles_status_created_idx on public.news_articles(status, created_at desc);
create index if not exists news_articles_published_idx on public.news_articles(published_at desc) where status='published';
create index if not exists news_sources_article_idx on public.news_sources(article_id);

alter table public.news_articles enable row level security;
alter table public.news_sources enable row level security;

-- Public visitors can read only published stories and their source links.
create policy "public read published articles" on public.news_articles
for select to anon, authenticated using (status='published');

create policy "public read sources of published articles" on public.news_sources
for select to anon, authenticated using (
  exists (select 1 from public.news_articles a where a.id=article_id and a.status='published')
);

-- Writes are performed only by the server using SUPABASE_SERVICE_ROLE_KEY.
-- Never expose the service role key in browser code.
