-- ─────────────────────────────────────────────────────────────────
-- FIX: admin-invited accounts fail every staff-gated RLS check
-- (image upload, article insert/update/delete) after rls_hardening.sql
--
-- AdminDashboard's "Add Author" flow pre-creates a public.users row
-- with a random placeholder id (the real id isn't known until that
-- person actually signs in for the first time). The old Login.tsx
-- code found that row by email on first login but never updated its
-- id to match the real auth.uid() — it just used the row as-is. That
-- was harmless under the old RLS policies (which only checked
-- "authenticated", never compared id), but is_admin()/is_staff() from
-- rls_hardening.sql require id to actually equal auth.uid(), so any
-- account onboarded this way now fails those checks even though
-- login itself still succeeds.
--
-- claim_user_profile() reconciles this server-side via SECURITY
-- DEFINER (RLS blocks the client from fixing its own id — the
-- "Users can update own profile" policy requires id = auth.uid() in
-- the first place, which is exactly what's broken). Safe to re-run.
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.claim_user_profile()
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid   text := auth.uid()::text;
  v_email text;
  v_name  text;
  v_row   public.users;
BEGIN
  -- Already correctly linked — the common case for every login after this fix
  SELECT * INTO v_row FROM public.users WHERE id::text = v_uid;
  IF FOUND THEN
    RETURN v_row;
  END IF;

  SELECT email, COALESCE(raw_user_meta_data->>'full_name', email)
    INTO v_email, v_name
  FROM auth.users WHERE id::text = v_uid;

  IF v_email IS NULL THEN
    RETURN NULL; -- no auth session found; shouldn't happen if auth.uid() is set
  END IF;

  -- Admin-invited placeholder row, keyed by email — claim it now
  UPDATE public.users SET id = v_uid
  WHERE email = v_email
  RETURNING * INTO v_row;
  IF FOUND THEN
    RETURN v_row;
  END IF;

  -- One-time bootstrap for the designated admin email, only if no
  -- admin exists yet (mirrors the old Login.tsx bootstrap logic)
  IF v_email = 'admin@bosomtwi.com' AND NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'admin') THEN
    INSERT INTO public.users (id, email, name, role)
    VALUES (v_uid, v_email, v_name, 'admin')
    RETURNING * INTO v_row;
    RETURN v_row;
  END IF;

  RETURN NULL; -- no admin-created row and not the bootstrap admin — access denied
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_user_profile() TO authenticated;

-- ─────────────────────────────────────────────────────────────────
-- FIX: article-images bucket limits from rls_hardening.sql blocked
-- video uploads entirely
--
-- PublishModal.tsx's handleBodyVideoUpload() uploads video files
-- (client-side capped at 50MB) to the SAME 'article-images' bucket
-- that cover/body images use. rls_hardening.sql restricted that
-- bucket to images only, 10MB max — correct for images, but it broke
-- every video upload, since bucket-level limits apply regardless of
-- RLS. Widen the bucket to cover both.
-- ─────────────────────────────────────────────────────────────────
UPDATE storage.buckets
SET file_size_limit = 52428800,  -- 50MB, matching the client-side video cap
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ]
WHERE id = 'article-images';
