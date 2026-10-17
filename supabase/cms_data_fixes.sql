-- ─────────────────────────────────────────────────────────────────
-- CMS data fixes — run once in the Supabase SQL editor against the
-- production project.
--
-- Fixes five features that fail on every submission today because the
-- application code and the live table shapes have drifted apart
-- (confirmed empirically against the live REST API, not guessed):
--   - Admin → Post a Job            (community_jobs missing deadline/category)
--   - Admin → Post a Scholarship    (community_scholarships missing level)
--   - Admin → Post an Event         (community_events missing image_url)
--   - Admin → Podcasts upload       (podcasts missing author)
--   - Public → Careers application  (career_applications table doesn't exist)
-- Also adds real moderation support for comments (status column +
-- staff policies — the Approve/Reject buttons currently have no column
-- to write to) and staff read/update access to the three "write-only"
-- submission tables (contact_submissions, story_submissions,
-- career_applications) so the new Inbox tab can actually read them.
--
-- Entirely additive and idempotent — safe to run even if some of this
-- already exists. Nothing here removes or renames an existing column,
-- so no application code outside this repo's own fix can be broken by
-- running it.
-- ─────────────────────────────────────────────────────────────────

-- ── community_jobs: admin form collects Deadline + Category, table doesn't have them ──
ALTER TABLE public.community_jobs ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE public.community_jobs ADD COLUMN IF NOT EXISTS category TEXT;

-- ── community_scholarships: admin form collects a Level dropdown, table doesn't have it ──
ALTER TABLE public.community_scholarships ADD COLUMN IF NOT EXISTS level TEXT;

-- ── community_events: admin form collects an Image URL, table doesn't have it ──
ALTER TABLE public.community_events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── podcasts: admin form stamps the uploading staff member's name, table doesn't have it ──
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS author TEXT;

-- ── comments: give the existing Approve/Reject/Delete buttons an actual column ──
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='Staff can update comments') THEN
    CREATE POLICY "Staff can update comments" ON public.comments FOR UPDATE TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='Staff can delete comments') THEN
    CREATE POLICY "Staff can delete comments" ON public.comments FOR DELETE TO authenticated USING (public.is_staff());
  END IF;
END $$;

-- ── career_applications: didn't exist at all — every public submission has been failing ──
CREATE TABLE IF NOT EXISTS public.career_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_title    TEXT NOT NULL,
  department    TEXT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  cover_letter  TEXT,
  portfolio_url TEXT,
  status        TEXT NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='career_applications' AND policyname='Public can submit applications') THEN
    CREATE POLICY "Public can submit applications" ON public.career_applications FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='career_applications' AND policyname='Staff can read applications') THEN
    CREATE POLICY "Staff can read applications" ON public.career_applications FOR SELECT TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='career_applications' AND policyname='Staff can update applications') THEN
    CREATE POLICY "Staff can update applications" ON public.career_applications FOR UPDATE TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='career_applications' AND policyname='Staff can delete applications') THEN
    CREATE POLICY "Staff can delete applications" ON public.career_applications FOR DELETE TO authenticated USING (public.is_staff());
  END IF;
END $$;

-- ── contact_submissions / story_submissions: writable from the public site
-- already, but staff need read/update access for the new Inbox tab ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_submissions' AND policyname='Staff can read contact submissions') THEN
    CREATE POLICY "Staff can read contact submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_submissions' AND policyname='Staff can update contact submissions') THEN
    CREATE POLICY "Staff can update contact submissions" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_submissions' AND policyname='Staff can delete contact submissions') THEN
    CREATE POLICY "Staff can delete contact submissions" ON public.contact_submissions FOR DELETE TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='story_submissions' AND policyname='Staff can read story submissions') THEN
    CREATE POLICY "Staff can read story submissions" ON public.story_submissions FOR SELECT TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='story_submissions' AND policyname='Staff can update story submissions') THEN
    CREATE POLICY "Staff can update story submissions" ON public.story_submissions FOR UPDATE TO authenticated USING (public.is_staff());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='story_submissions' AND policyname='Staff can delete story submissions') THEN
    CREATE POLICY "Staff can delete story submissions" ON public.story_submissions FOR DELETE TO authenticated USING (public.is_staff());
  END IF;
END $$;

-- ── articles: add scheduled_at for Task 5 (draft/scheduled publish) ──
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- The only existing SELECT policy on articles is "Public can read
-- published articles" (status = 'published'). With no staff-specific
-- SELECT policy, introducing status='draft' would make drafts
-- invisible to EVERYONE, including the staff member who wrote them —
-- RLS grants visibility per-row if any policy matches, and none would.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='articles' AND policyname='Staff can read all articles') THEN
    CREATE POLICY "Staff can read all articles" ON public.articles FOR SELECT TO authenticated USING (public.is_staff());
  END IF;
END $$;

-- ── community_polls: real voting. A broad public UPDATE policy on the
-- whole row would let a visitor rewrite the question or any option's
-- vote count directly; this RPC instead only ever increments one
-- option's own vote count by exactly 1, same SECURITY DEFINER pattern
-- as increment_article_views/increment_site_visits above.
CREATE OR REPLACE FUNCTION public.increment_poll_vote(p_poll_id UUID, p_option_index INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.community_polls
  SET options = jsonb_set(
    options,
    ARRAY[p_option_index::text, 'votes'],
    to_jsonb(COALESCE((options->p_option_index->>'votes')::int, 0) + 1)
  )
  WHERE id = p_poll_id AND p_option_index >= 0 AND p_option_index < jsonb_array_length(options);
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_poll_vote(UUID, INT) TO anon, authenticated;
