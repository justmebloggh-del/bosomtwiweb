-- Read-only diagnostic — no changes. Shows the actual policy logic
-- (not just names) and whether RLS is even enabled/forced on these
-- tables, so the next fix is based on evidence instead of a guess.
SELECT tablename, policyname, permissive, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('contact_submissions', 'story_submissions', 'career_applications')
ORDER BY tablename, cmd;

SELECT relname, relrowsecurity AS rls_enabled, relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname IN ('contact_submissions', 'story_submissions', 'career_applications');
