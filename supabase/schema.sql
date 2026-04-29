-- Run this once in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ── Articles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  category    TEXT NOT NULL,
  author      TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  excerpt     TEXT DEFAULT '',
  content     TEXT DEFAULT '',
  image       TEXT DEFAULT '',
  video_url   TEXT DEFAULT '',
  status      TEXT DEFAULT 'published'
);

-- ── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role     TEXT DEFAULT 'journalist'
           CHECK (role IN ('admin', 'editor', 'journalist'))
);

-- ── Disable Row Level Security ───────────────────────────────────
-- The API layer (Express + JWT) handles access control.
-- You can re-enable RLS later and add policies for extra hardening.
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users    DISABLE ROW LEVEL SECURITY;
