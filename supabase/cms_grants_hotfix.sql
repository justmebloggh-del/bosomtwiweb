-- Hotfix #2: tables created directly via the SQL editor (rather than
-- Supabase's table-creation UI) don't automatically get the base
-- table-level GRANTs that UI-created tables get. RLS policies only
-- filter *rows* within whatever base privileges already exist — with
-- no GRANT at all, anon/authenticated have no access to the table
-- regardless of how correct the RLS policy is, and Postgres reports
-- that as the same 42501 "insufficient_privilege" error RLS violations
-- use, which is what made this look like an RLS problem.
--
-- Safe to run repeatedly; GRANT is idempotent by nature.

GRANT SELECT, INSERT ON public.contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO authenticated;

GRANT SELECT, INSERT ON public.story_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_submissions TO authenticated;

GRANT SELECT, INSERT ON public.career_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_applications TO authenticated;

-- Same risk applies to every other out-of-band table this fix pass
-- touches — covering them now rather than finding each one broken
-- one at a time.
GRANT SELECT ON public.community_jobs, public.community_events, public.community_scholarships, public.community_polls TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_jobs, public.community_events, public.community_scholarships, public.community_polls TO authenticated;

GRANT SELECT ON public.podcasts, public.live_ads, public.site_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcasts, public.live_ads, public.site_config TO authenticated;

GRANT INSERT ON public.ad_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_enquiries TO authenticated;

GRANT SELECT, UPDATE, DELETE ON public.comments TO authenticated;

-- community_polls needs UPDATE too, since increment_poll_vote() runs as
-- SECURITY DEFINER but still executes as the function owner, not anon —
-- confirming this explicitly rather than assuming the function's
-- privileges cover it.
GRANT UPDATE ON public.community_polls TO authenticated;

-- Confirm what's actually grantable now (the only part of this script
-- that returns rows).
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'contact_submissions', 'story_submissions', 'career_applications',
    'community_jobs', 'community_events', 'community_scholarships', 'community_polls',
    'podcasts', 'live_ads', 'site_config', 'ad_enquiries', 'comments'
  )
  AND grantee IN ('anon', 'authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
