-- ─────────────────────────────────────────────────────────────────
-- Article document attachments (PDF / Word / Excel / PowerPoint) and
-- in-body hyperlinks — run once in the Supabase SQL editor.
--
-- Creates a new Storage bucket the same way `article-images` already
-- works (staff-only upload, public read), but as its own bucket rather
-- than widening article-images' mime whitelist, so a 20MB document cap
-- doesn't also raise the image/video bucket's limit.
--
-- Hyperlinks need no DB change at all — `[link:URL]text[/link]` is
-- rendered client-side only, same as the existing **bold**/_italic_
-- tokens.
-- ─────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-documents',
  'article-documents',
  true,
  20971520, -- 20 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Staff can upload article documents'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Staff can upload article documents"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'article-documents' AND public.is_staff());
    $policy$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can download article documents'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public can download article documents"
        ON storage.objects FOR SELECT TO public
        USING (bucket_id = 'article-documents');
    $policy$;
  END IF;
END $$;
