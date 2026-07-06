-- ─────────────────────────────────────────────────────────────────
-- RLS HARDENING (run in Supabase SQL Editor)
--
-- Closes a privilege-escalation gap in the original schema.sql:
-- the old policies only checked "is this user authenticated at all",
-- not their role, and let any authenticated user write their own
-- `role` column. Combined with a Login.tsx bug that auto-created a
-- 'journalist' row for any first-time signer-in, this meant anyone
-- who could create a Supabase account got full publish/delete access
-- to every article. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────

-- Helper: is the currently-authenticated user an admin?
-- SECURITY DEFINER so it can read public.users regardless of the
-- caller's own RLS visibility (mirrors increment_site_visits() below).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('journalist', 'admin')
  );
$$;

-- ── users: replace self-service policies with role-gated ones ───
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Only admins can create new user rows (matches the "Add Author" flow
-- in AdminDashboard.tsx — self-registration should never grant access).
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Users may update their own name, but not their own role.
CREATE POLICY "Users can update own profile except role" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
  );

-- Admins can update any user, including role changes.
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── articles: require an actual journalist/admin role, not just "logged in" ──
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON public.articles;

CREATE POLICY "Journalists and admins can insert articles" ON public.articles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "Journalists and admins can update articles" ON public.articles
  FOR UPDATE TO authenticated
  USING (public.is_staff());

CREATE POLICY "Journalists and admins can delete articles" ON public.articles
  FOR DELETE TO authenticated
  USING (public.is_staff());

-- ── storage: restrict article image uploads to staff ────────────
DROP POLICY IF EXISTS "Auth users can upload article images" ON storage.objects;

CREATE POLICY "Staff can upload article images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'article-images'
    AND public.is_staff()
  );

-- File-size/type limits belong on the bucket itself, not the RLS check
-- (object metadata isn't reliably populated yet when an INSERT policy
-- runs). 10MB cap, images only.
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'article-images';
