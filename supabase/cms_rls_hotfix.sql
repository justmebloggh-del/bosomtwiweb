-- Hotfix: enabling RLS on contact_submissions/story_submissions/
-- career_applications (first time RLS was ever turned on for the first
-- two) left anonymous visitors unable to submit the Contact, Submit a
-- Story, and Careers forms — a regression, since Contact/Story
-- submission worked (with RLS effectively off) before this fix pass.
-- This drops and recreates the three public INSERT policies with an
-- explicit `TO anon, authenticated` instead of the implicit PUBLIC
-- targeting, and is safe to run even if the previous ones are fine.

DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_submissions;
CREATE POLICY "Public can submit contact messages" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit stories" ON public.story_submissions;
CREATE POLICY "Public can submit stories" ON public.story_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit applications" ON public.career_applications;
CREATE POLICY "Public can submit applications" ON public.career_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Sanity check: list every policy on these three tables so we can see
-- exactly what's active afterward (this SELECT is the only part of
-- this script that returns rows).
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('contact_submissions', 'story_submissions', 'career_applications')
ORDER BY tablename, cmd;
